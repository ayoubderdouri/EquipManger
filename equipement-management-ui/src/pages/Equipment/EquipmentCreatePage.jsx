import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { AddPhotoAlternateOutlined, ArrowBackOutlined, SaveOutlined } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { createEquipment, getEquipmentById, getLocations, updateEquipment } from "../../services/equipmentService";

const API_ORIGIN = "http://localhost:8080";

const STATUS_OPTIONS = [
  { value: "FUNCTIONAL", label: "Fonctionnel" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "BROKEN", label: "En panne" },
  { value: "OUT_OF_SERVICE", label: "Hors service" },
];

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function parseApiError(error) {
  const fallback = "La creation a echoue. Verifiez les champs puis reessayez.";
  const data = error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(" | ");
  }

  return fallback;
}

export default function EquipmentCreatePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    reference: "",
    type: "",
    status: "FUNCTIONAL",
    acquisitionDate: getTodayIsoDate(),
    technicalDescription: "",
    serialNumber: "",
    locationId: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getLocations(),
      isEditMode ? getEquipmentById(Number(id)) : Promise.resolve(null),
    ])
      .then(([locationsData, equipment]) => {
        if (!mounted) {
          return;
        }

        const items = Array.isArray(locationsData) ? locationsData : [];
        setLocations(items);

        if (isEditMode && equipment) {
          setForm({
            name: equipment.name || "",
            reference: equipment.reference || "",
            type: equipment.type || "",
            status: equipment.status || "FUNCTIONAL",
            acquisitionDate: equipment.acquisitionDate || getTodayIsoDate(),
            technicalDescription: equipment.technicalDescription || "",
            serialNumber: equipment.serialNumber || "",
            locationId: equipment.locationId ? String(equipment.locationId) : "",
          });

          if (equipment.photoUrl) {
            setExistingPhotoUrl(
              equipment.photoUrl.startsWith("http")
                ? equipment.photoUrl
                : `${API_ORIGIN}${equipment.photoUrl.startsWith("/") ? "" : "/"}${equipment.photoUrl}`
            );
          }
        } else if (items.length > 0) {
          setForm((current) => ({
            ...current,
            locationId: String(items[0].id),
          }));
        }
      })
      .catch((loadError) => {
        if (mounted) {
          setError(parseApiError(loadError));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingLocations(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, isEditMode]);

  const previewUrl = useMemo(() => {
    if (!photoFile) {
      return "";
    }

    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Le fichier selectionne doit etre une image.");
      return;
    }

    setError("");
    setPhotoFile(file);
  };

  const validate = () => {
    if (!form.name.trim() || !form.reference.trim() || !form.type.trim()) {
      return "Nom, reference et type sont obligatoires.";
    }

    if (!form.acquisitionDate) {
      return "La date d'acquisition est obligatoire.";
    }

    if (!form.locationId) {
      return "Selectionnez une localisation.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      reference: form.reference.trim(),
      type: form.type.trim(),
      technicalDescription: form.technicalDescription.trim() || null,
      serialNumber: form.serialNumber.trim() || null,
      locationId: Number(form.locationId),
    };

    setSubmitting(true);
    setError("");

    try {
      if (isEditMode) {
        await updateEquipment(Number(id), payload, photoFile);
      } else {
        await createEquipment(payload, photoFile);
      }

      await Swal.fire({
        icon: "success",
        title: isEditMode ? "Equipement modifie" : "Equipement cree",
        text: isEditMode
          ? "Les modifications ont ete enregistrees avec succes."
          : "Le nouvel equipement a ete enregistre avec succes.",
        confirmButtonText: "Retour a la liste",
      });
      navigate("/equipements");
    } catch (submitError) {
      setError(parseApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            background: theme.palette.background.paper,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                {isEditMode ? "Modifier equipement" : "Nouvel equipement"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackOutlined />}
                onClick={() => navigate("/equipements")}
              >
                Retour
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 2, md: 3 },
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            background: theme.palette.background.paper,
          }}
        >
          {(loadingLocations || submitting) && <LinearProgress sx={{ mb: 2 }} />}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nom"
                    value={form.name}
                    onChange={(event) => handleFieldChange("name", event.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Reference"
                    value={form.reference}
                    onChange={(event) => handleFieldChange("reference", event.target.value)}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Type"
                    value={form.type}
                    onChange={(event) => handleFieldChange("type", event.target.value)}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      label="Statut"
                      value={form.status}
                      onChange={(event) => handleFieldChange("status", event.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Date acquisition"
                    type="date"
                    value={form.acquisitionDate}
                    onChange={(event) => handleFieldChange("acquisitionDate", event.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth required disabled={loadingLocations || locations.length === 0}>
                    <InputLabel>Localisation</InputLabel>
                    <Select
                      label="Localisation"
                      value={form.locationId}
                      onChange={(event) => handleFieldChange("locationId", event.target.value)}
                    >
                      {locations.map((location) => (
                        <MenuItem key={location.id} value={String(location.id)}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Numero de serie"
                    value={form.serialNumber}
                    onChange={(event) => handleFieldChange("serialNumber", event.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Description technique"
                    value={form.technicalDescription}
                    onChange={(event) => handleFieldChange("technicalDescription", event.target.value)}
                    fullWidth
                    multiline
                    minRows={4}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      Photo
                    </Typography>

                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<AddPhotoAlternateOutlined />}
                    >
                      Choisir une image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>

                    {photoFile && (
                      <Typography variant="caption" color="text.secondary">
                        {photoFile.name}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        border: `1px dashed ${theme.palette.divider}`,
                        borderRadius: 1,
                        minHeight: 220,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        background: theme.palette.action.hover,
                      }}
                    >
                      {previewUrl ? (
                        <Box
                          component="img"
                          src={previewUrl}
                          alt="Apercu photo equipement"
                          sx={{
                            width: "100%",
                            height: 220,
                            objectFit: "cover",
                          }}
                        />
                      ) : existingPhotoUrl ? (
                        <Box
                          component="img"
                          src={existingPhotoUrl}
                          alt="Photo actuelle equipement"
                          sx={{
                            width: "100%",
                            height: 220,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 2, textAlign: "center" }}>
                          Aucune image selectionnee. L'aperu apparaitra ici.
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlined />}
              disabled={submitting || loadingLocations || locations.length === 0}
            >
              {isEditMode ? "Mettre a jour" : "Enregistrer"}
            </Button>
            <Button variant="text" onClick={() => navigate("/equipements")}>
              Annuler
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { AddOutlined, BuildCircleOutlined, CommentOutlined } from "@mui/icons-material";
import Swal from "sweetalert2";
import { getEquipments } from "../../services/equipmentService";
import { getRooms } from "../../services/roomService";
import {
  addInterventionComment,
  createIntervention,
  getInterventions,
} from "../../services/interventionService";

const URGENCY_OPTIONS = [
  { value: "LOW", label: "Faible" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Elevee" },
  { value: "CRITICAL", label: "Critique" },
];

const STATUS_META = {
  OPEN: { label: "Ouverte", color: "info" },
  IN_PROGRESS: { label: "En cours", color: "warning" },
  RESOLVED: { label: "Resolue", color: "success" },
  CANCELLED: { label: "Annulee", color: "default" },
};

const EMPTY_FORM = {
  equipmentId: "",
  locationId: "",
  description: "",
  urgencyLevel: "MEDIUM",
  imageUrl: "",
};

function parseApiError(error) {
  const fallback = "Operation impossible pour le moment. Veuillez reessayer.";
  const data = error?.response?.data;

  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors.join(" | ");

  return fallback;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTransitionOptions(status) {
  if (status === "OPEN") {
    return [{ value: "IN_PROGRESS", label: "Passer en cours" }];
  }
  if (status === "IN_PROGRESS") {
    return [
      { value: "RESOLVED", label: "Marquer resolue" },
      { value: "CANCELLED", label: "Annuler intervention" },
    ];
  }
  return [];
}

export default function InterventionsPage() {
  const theme = useTheme();
  const [interventions, setInterventions] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [targetStatus, setTargetStatus] = useState("");

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const role = user?.role;
  const isTechnician = role === "TECHNICIEN";
  const canComment = ["ADMIN", "RESPONSABLE_TECHNIQUE", "TECHNICIEN"].includes(role);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [interventionsData, equipmentsData, roomsData] = await Promise.all([
        getInterventions(),
        getEquipments(),
        getRooms(),
      ]);

      setInterventions(Array.isArray(interventionsData) ? interventionsData : []);
      setEquipments(Array.isArray(equipmentsData) ? equipmentsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (loadError) {
      setError(parseApiError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const counts = interventions.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      { total: 0, OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CANCELLED: 0 },
    );

    return counts;
  }, [interventions]);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.description.trim()) {
      setError("La description de la panne est obligatoire.");
      return;
    }

    if (!form.equipmentId && !form.locationId) {
      setError("Selectionnez un equipement ou une salle.");
      return;
    }

    const payload = {
      equipmentId: form.equipmentId ? Number(form.equipmentId) : null,
      locationId: form.locationId ? Number(form.locationId) : null,
      description: form.description.trim(),
      urgencyLevel: form.urgencyLevel,
      imageUrl: form.imageUrl.trim() || null,
    };

    setSubmitting(true);
    setError("");
    try {
      await createIntervention(payload);
      setForm(EMPTY_FORM);
      await loadData();
      await Swal.fire({
        icon: "success",
        title: "Intervention declaree",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (createError) {
      setError(parseApiError(createError));
    } finally {
      setSubmitting(false);
    }
  };

  const openCommentDialog = (intervention) => {
    const transitions = getTransitionOptions(intervention.status);
    setSelectedIntervention(intervention);
    setCommentText("");
    setTargetStatus(transitions.length > 0 ? transitions[0].value : "");
    setCommentDialogOpen(true);
  };

  const closeCommentDialog = () => {
    setCommentDialogOpen(false);
    setSelectedIntervention(null);
    setCommentText("");
    setTargetStatus("");
  };

  const handleCommentSubmit = async () => {
    if (!selectedIntervention) return;
    if (!commentText.trim()) {
      setError("Le commentaire est obligatoire.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await addInterventionComment(selectedIntervention.id, {
        comment: commentText.trim(),
        targetStatus: targetStatus || null,
      });
      closeCommentDialog();
      await loadData();
      await Swal.fire({
        icon: "success",
        title: "Commentaire ajoute",
        timer: 1200,
        showConfirmButton: false,
      });
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
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                Interventions techniques
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Declaration de pannes, suivi des tickets et traitement technique.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip label={`${stats.total} total`} color="primary" />
              <Chip label={`${stats.OPEN} ouvertes`} color="info" variant="outlined" />
              <Chip label={`${stats.IN_PROGRESS} en cours`} color="warning" variant="outlined" />
              <Chip label={`${stats.RESOLVED} resolues`} color="success" variant="outlined" />
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              elevation={0}
              component="form"
              onSubmit={handleCreate}
              sx={{
                p: { xs: 2, md: 2.5 },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                background: theme.palette.background.paper,
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BuildCircleOutlined color="primary" fontSize="small" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Declarer une panne
                  </Typography>
                </Stack>

                <FormControl fullWidth size="small">
                  <InputLabel>Equipement concerne</InputLabel>
                  <Select
                    label="Equipement concerne"
                    value={form.equipmentId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, equipmentId: event.target.value }))
                    }
                  >
                    <MenuItem value="">Aucun equipement specifique</MenuItem>
                    {equipments.map((equipment) => (
                      <MenuItem key={equipment.id} value={String(equipment.id)}>
                        {equipment.name} ({equipment.reference})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Salle / localisation</InputLabel>
                  <Select
                    label="Salle / localisation"
                    value={form.locationId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, locationId: event.target.value }))
                    }
                  >
                    <MenuItem value="">Aucune localisation</MenuItem>
                    {rooms.map((room) => (
                      <MenuItem key={room.id} value={String(room.id)}>
                        {room.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Niveau d'urgence</InputLabel>
                  <Select
                    label="Niveau d'urgence"
                    value={form.urgencyLevel}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, urgencyLevel: event.target.value }))
                    }
                  >
                    {URGENCY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Description de la panne"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  multiline
                  minRows={4}
                  required
                />

                <TextField
                  label="URL image (optionnel)"
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageUrl: event.target.value }))
                  }
                  size="small"
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={<AddOutlined />}
                >
                  Declarer l'intervention
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, md: 2 },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                background: theme.palette.background.paper,
              }}
            >
              {(loading || submitting) && <LinearProgress sx={{ mb: 2 }} />}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {isTechnician ? "Interventions assignees" : "Suivi des interventions"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isTechnician
                  ? "Ajoutez un commentaire et faites progresser le statut de vos interventions assignees."
                  : "Consultez l'etat d'avancement de vos declarations."}
              </Typography>

              {interventions.length === 0 && !loading ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Aucune intervention disponible
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Creez une demande de panne pour commencer le suivi.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Concerne</TableCell>
                        <TableCell>Urgence</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Creee le</TableCell>
                        <TableCell>Assignee a</TableCell>
                        <TableCell>Commentaires</TableCell>
                        {canComment && <TableCell align="right">Action</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interventions.map((item) => {
                        const status = STATUS_META[item.status] || {
                          label: item.status,
                          color: "default",
                        };
                        const commentsCount = Array.isArray(item.comments) ? item.comments.length : 0;
                        const lastComment = commentsCount > 0 ? item.comments[commentsCount - 1] : null;
                        const isClosed = item.status === "RESOLVED" || item.status === "CANCELLED";

                        return (
                          <TableRow key={item.id} hover>
                            <TableCell>#{item.id}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700}>
                                {item.equipmentName || item.locationName || "Non precise"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.description}
                              </Typography>
                            </TableCell>
                            <TableCell>{URGENCY_OPTIONS.find((u) => u.value === item.urgencyLevel)?.label || item.urgencyLevel}</TableCell>
                            <TableCell>
                              <Chip size="small" label={status.label} color={status.color} variant="outlined" />
                            </TableCell>
                            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                            <TableCell>{item.assignedToUsername || "Non assignee"}</TableCell>
                            <TableCell>
                              <Stack spacing={0.35}>
                                <Typography variant="caption" fontWeight={700}>
                                  {commentsCount} commentaire(s)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {lastComment ? lastComment.comment : "Aucun commentaire"}
                                </Typography>
                              </Stack>
                            </TableCell>
                            {canComment && (
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CommentOutlined fontSize="small" />}
                                  disabled={isClosed}
                                  onClick={() => openCommentDialog(item)}
                                >
                                  Commenter
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={commentDialogOpen} onClose={submitting ? undefined : closeCommentDialog} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un commentaire technique</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Commentaire"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              multiline
              minRows={4}
              required
            />

            <FormControl fullWidth size="small">
              <InputLabel>Transition de statut</InputLabel>
              <Select
                label="Transition de statut"
                value={targetStatus}
                onChange={(event) => setTargetStatus(event.target.value)}
              >
                <MenuItem value="">Aucun changement</MenuItem>
                {getTransitionOptions(selectedIntervention?.status).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCommentDialog} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleCommentSubmit} variant="contained" disabled={submitting}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
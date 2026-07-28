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
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AddOutlined,
  DeleteOutline,
  EditOutlined,
  MeetingRoomOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { createRoom, deleteRoom, getRooms, updateRoom } from "../../services/roomService";

const EMPTY_FORM = {
  name: "",
  localization: "",
  description: "",
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

export default function RoomsPage() {
  const theme = useTheme();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const loadRooms = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(parseApiError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rooms;

    return rooms.filter((room) =>
      [room.name, room.localization, room.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [rooms, query]);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setForm(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setForm({
      name: room.name || "",
      localization: room.localization || "",
      description: room.description || "",
    });
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRoom(null);
    setForm(EMPTY_FORM);
  };

  const validate = () => {
    if (!form.name.trim()) return "Le nom est obligatoire.";
    if (!form.localization.trim()) return "La localisation est obligatoire.";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      localization: form.localization.trim(),
      description: form.description.trim() || null,
    };

    setSubmitting(true);
    setError("");

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, payload);
      } else {
        await createRoom(payload);
      }

      closeDialog();
      await loadRooms();
      await Swal.fire({
        icon: "success",
        title: editingRoom ? "Salle modifiee" : "Salle ajoutee",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (submitError) {
      setError(parseApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Supprimer cette salle ?",
      text: `La salle ${room.name} sera supprimee definitivement.`,
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d32f2f",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      await deleteRoom(room.id);
      await loadRooms();
      await Swal.fire({
        icon: "success",
        title: "Salle supprimee",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (deleteError) {
      await Swal.fire({
        icon: "error",
        title: "Suppression impossible",
        text: parseApiError(deleteError),
      });
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
                Gestion des salles
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip label={`${rooms.length} salles`} color="primary" />
              {isAdmin && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddOutlined />}
                  onClick={handleOpenCreate}
                >
                  Nouvelle salle
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

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

          <TextField
            size="small"
            fullWidth
            label="Rechercher une salle"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {!loading && filteredRooms.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <MeetingRoomOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={800}>
                Aucune salle trouvee
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajustez votre recherche ou ajoutez une nouvelle salle.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Localisation</TableCell>
                    <TableCell>Description</TableCell>
                    {isAdmin && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {room.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{room.localization || "-"}</TableCell>
                      <TableCell>{room.description || "-"}</TableCell>
                      {isAdmin && (
                        <TableCell align="right">
                          <Tooltip title="Modifier">
                            <IconButton onClick={() => handleOpenEdit(room)} size="small">
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              onClick={() => handleDelete(room)}
                              size="small"
                              color="error"
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      <Dialog open={dialogOpen} onClose={submitting ? undefined : closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingRoom ? "Modifier la salle" : "Nouvelle salle"}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Nom"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Localisation"
              value={form.localization}
              onChange={(event) =>
                setForm((current) => ({ ...current, localization: event.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {editingRoom ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

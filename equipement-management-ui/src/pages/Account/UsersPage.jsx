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
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AddOutlined,
  DeleteOutline,
  EditOutlined,
  LockResetOutlined,
  RefreshOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getRoles,
  updateUser,
  updateUserPassword,
  updateUserRole,
} from "../../services/userService";

const EMPTY_USER_FORM = {
  username: "",
  email: "",
  password: "",
  role: "USER",
};

const EMPTY_PASSWORD_FORM = {
  password: "",
  confirmPassword: "",
};

function roleLabel(role) {
  const labels = {
    ADMIN: "Administrateur",
    USER: "Utilisateur",
    TECHNICIEN: "Technicien",
    RESPONSABLE_TECHNIQUE: "Responsable technique",
  };
  return labels[role] || role;
}

function parseApiError(error) {
  const fallback = "Operation impossible pour le moment. Veuillez reessayer.";
  const data = error?.response?.data;

  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors.join(" | ");

  return fallback;
}

export default function UsersPage() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    username: "",
    email: "",
    role: "",
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [createForm, setCreateForm] = useState(EMPTY_USER_FORM);
  const [editForm, setEditForm] = useState({ username: "", email: "", role: "USER" });
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  const currentUser = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const isAdmin = currentUser?.role === "ADMIN";

  const loadUsers = async (inputFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllUsers(
        inputFilters.email,
        inputFilters.role,
        inputFilters.username,
      );
      setUsers(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(parseApiError(loadError));
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setRoles(["ADMIN", "USER", "TECHNICIEN", "RESPONSABLE_TECHNIQUE"]);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadRoles();
    loadUsers();
  }, []);

  const handleSearch = () => {
    loadUsers();
  };

  const handleReset = () => {
    const reset = {
      username: "",
      email: "",
      role: "",
    };
    setFilters(reset);
    loadUsers(reset);
  };

  const handleCreate = async () => {
    if (!createForm.username.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setError("Username, email et mot de passe sont obligatoires.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createUser({
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });
      setCreateOpen(false);
      setCreateForm(EMPTY_USER_FORM);
      await loadUsers();
      await Swal.fire({
        icon: "success",
        title: "Utilisateur cree",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (createError) {
      setError(parseApiError(createError));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      role: user.role || "USER",
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    setError("");
    try {
      const roleChanged = selectedUser.role !== editForm.role;
      if (roleChanged) {
        await updateUserRole(selectedUser.id, editForm.role);
      }

      await updateUser(selectedUser.id, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      });

      setEditOpen(false);
      setSelectedUser(null);
      await loadUsers();
      await Swal.fire({
        icon: "success",
        title: "Utilisateur modifie",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (editError) {
      setError(parseApiError(editError));
    } finally {
      setSubmitting(false);
    }
  };

  const openPassword = (user) => {
    setSelectedUser(user);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordOpen(true);
  };

  const handlePassword = async () => {
    if (!selectedUser) return;

    if (!passwordForm.password.trim()) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await updateUserPassword(selectedUser.id, passwordForm.password);
      setPasswordOpen(false);
      setSelectedUser(null);
      await Swal.fire({
        icon: "success",
        title: "Mot de passe mis a jour",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (passwordError) {
      setError(parseApiError(passwordError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Supprimer cet utilisateur ?",
      text: `Le compte ${user.username} sera supprime definitivement.`,
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d32f2f",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      await deleteUser(user.id);
      await loadUsers();
      await Swal.fire({
        icon: "success",
        title: "Utilisateur supprime",
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

  if (!isAdmin) {
    return (
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
          <Alert severity="warning">Cette section est reservee aux administrateurs.</Alert>
        </Paper>
      </Container>
    );
  }

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
                Gestion des utilisateurs
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip label={`${users.length} utilisateurs`} color="primary" />
              <Button
                variant="contained"
                size="small"
                startIcon={<AddOutlined />}
                onClick={() => setCreateOpen(true)}
              >
                Nouvel utilisateur
              </Button>
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

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Username"
                value={filters.username}
                onChange={(event) => setFilters((cur) => ({ ...cur, username: event.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Email"
                value={filters.email}
                onChange={(event) => setFilters((cur) => ({ ...cur, email: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={filters.role}
                  onChange={(event) => setFilters((cur) => ({ ...cur, role: event.target.value }))}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {roleLabel(role)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button variant="contained" onClick={handleSearch}>
              Rechercher
            </Button>
            <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={handleReset}>
              Reinitialiser
            </Button>
          </Stack>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Aucun utilisateur trouve.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip size="small" label={roleLabel(user.role)} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => openEdit(user)}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mot de passe">
                          <IconButton size="small" onClick={() => openPassword(user)}>
                            <LockResetOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={() => handleDelete(user)}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <Dialog open={createOpen} onClose={submitting ? undefined : () => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nouvel utilisateur</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Username"
              value={createForm.username}
              onChange={(event) => setCreateForm((cur) => ({ ...cur, username: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Email"
              value={createForm.email}
              onChange={(event) => setCreateForm((cur) => ({ ...cur, email: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((cur) => ({ ...cur, password: event.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={createForm.role}
                onChange={(event) => setCreateForm((cur) => ({ ...cur, role: event.target.value }))}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {roleLabel(role)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={submitting}>
            Creer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={submitting ? undefined : () => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Modifier utilisateur</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Username"
              value={editForm.username}
              onChange={(event) => setEditForm((cur) => ({ ...cur, username: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Email"
              value={editForm.email}
              onChange={(event) => setEditForm((cur) => ({ ...cur, email: event.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={editForm.role}
                onChange={(event) => setEditForm((cur) => ({ ...cur, role: event.target.value }))}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {roleLabel(role)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleEdit} variant="contained" disabled={submitting}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordOpen}
        onClose={submitting ? undefined : () => setPasswordOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Mettre a jour le mot de passe</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="password"
              label="Nouveau mot de passe"
              value={passwordForm.password}
              onChange={(event) =>
                setPasswordForm((cur) => ({ ...cur, password: event.target.value }))
              }
            />
            <TextField
              fullWidth
              type="password"
              label="Confirmer le mot de passe"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((cur) => ({ ...cur, confirmPassword: event.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handlePassword} variant="contained" disabled={submitting}>
            Mettre a jour
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

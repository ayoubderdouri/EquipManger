import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AddOutlined,
  CalendarMonthOutlined,
  ClearOutlined,
  DeleteOutline,
  EditOutlined,
  FilterAltOutlined,
  GridViewOutlined,
  Inventory2Outlined,
  ListAltOutlined,
  LocationOnOutlined,
  SearchOutlined,
  SortOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteEquipment, getEquipments } from "../../services/equipmentService";

const STATUS_META = {
  FUNCTIONAL: { label: "Fonctionnel", color: "success" },
  MAINTENANCE: { label: "Maintenance", color: "warning" },
  BROKEN: { label: "En panne", color: "error" },
  OUT_OF_SERVICE: { label: "Hors service", color: "default" },
};

const SORT_OPTIONS = [
  { value: "name", label: "Nom" },
  { value: "status", label: "Statut" },
  { value: "type", label: "Type" },
  { value: "location", label: "Localisation" },
  { value: "date", label: "Date acquisition" },
];

const API_ORIGIN = "http://localhost:8080";

function getStatusMeta(status) {
  return (
    STATUS_META[status] || { label: status || "Non defini", color: "default" }
  );
}

function getPhotoUrl(photoUrl) {
  if (!photoUrl) return "";
  if (photoUrl.startsWith("http")) return photoUrl;
  return `${API_ORIGIN}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function uniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort(
    (a, b) => String(a).localeCompare(String(b)),
  );
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

function EquipmentAvatar({ equipment }) {
  const theme = useTheme();
  const image = getPhotoUrl(equipment.photoUrl);

  return (
    <Avatar
      variant="rounded"
      src={image}
      alt={equipment.name}
      sx={{
        width: 48,
        height: 48,
        borderRadius: "8px",
        background: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        flexShrink: 0,
      }}
    >
      <Inventory2Outlined />
    </Avatar>
  );
}

function FilterSidebar({
  filters,
  statusOptions,
  typeOptions,
  locationOptions,
  onFilterChange,
  onReset,
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        position: { lg: "sticky" },
        top: { lg: 84 },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.5}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterAltOutlined color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={800}>
            Filtres
          </Typography>
        </Stack>
        <Tooltip title="Reinitialiser">
          <IconButton size="small" onClick={onReset}>
            <ClearOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack spacing={1.5}>
        <TextField
          label="Recherche"
          value={filters.query}
          onChange={(event) => onFilterChange("query", event.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Statut</InputLabel>
          <Select
            label="Statut"
            value={filters.status}
            onChange={(event) => onFilterChange("status", event.target.value)}
          >
            <MenuItem value="all">Tous les statuts</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {getStatusMeta(status).label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={filters.type}
            onChange={(event) => onFilterChange("type", event.target.value)}
          >
            <MenuItem value="all">Tous les types</MenuItem>
            {typeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Localisation</InputLabel>
          <Select
            label="Localisation"
            value={filters.locationName}
            onChange={(event) =>
              onFilterChange("locationName", event.target.value)
            }
          >
            <MenuItem value="all">Toutes les localisations</MenuItem>
            {locationOptions.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider />

        <FormControl size="small" fullWidth>
          <InputLabel>Trier par</InputLabel>
          <Select
            label="Trier par"
            value={filters.sortBy}
            onChange={(event) => onFilterChange("sortBy", event.target.value)}
            startAdornment={
              <SortOutlined
                fontSize="small"
                sx={{ mr: 1, color: "text.secondary" }}
              />
            }
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" color="primary" onClick={onReset} fullWidth>
          Reinitialiser
        </Button>
      </Stack>
    </Paper>
  );
}

function EquipmentCard({ equipment, canManage, onEdit, onDelete }) {
  const theme = useTheme();
  const status = getStatusMeta(equipment.status);

  return (
    <Card sx={{ height: "100%", boxShadow: "none" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <EquipmentAvatar equipment={equipment} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                noWrap
                title={equipment.name}
              >
                {equipment.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
              >
                {equipment.reference || "Reference non definie"}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={status.label}
              color={status.color}
              variant="outlined"
            />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Inventory2Outlined fontSize="small" color="primary" />
              <Typography variant="body2" noWrap>
                {equipment.type || "Type non defini"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnOutlined
                fontSize="small"
                sx={{ color: theme.palette.secondary.main }}
              />
              <Typography variant="body2" noWrap>
                {equipment.locationName || "Localisation non definie"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarMonthOutlined fontSize="small" color="action" />
              <Typography variant="body2">
                Acquis le {formatDate(equipment.acquisitionDate)}
              </Typography>
            </Stack>
          </Stack>

          {equipment.technicalDescription && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: 40,
              }}
            >
              {equipment.technicalDescription}
            </Typography>
          )}

          {canManage && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditOutlined fontSize="small" />}
                onClick={() => onEdit(equipment)}
              >
                Modifier
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<DeleteOutline fontSize="small" />}
                onClick={() => onDelete(equipment)}
              >
                Supprimer
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function EquipmentList({ equipments, canManage, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Equipement</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Localisation</TableCell>
            <TableCell>Date acquisition</TableCell>
            <TableCell>N serie</TableCell>
            {canManage && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {equipments.map((equipment) => {
            const status = getStatusMeta(equipment.status);
            return (
              <TableRow key={equipment.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <EquipmentAvatar equipment={equipment} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={800}>
                        {equipment.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {equipment.reference || "-"}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{equipment.type || "-"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={status.label}
                    color={status.color}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{equipment.locationName || "-"}</TableCell>
                <TableCell>{formatDate(equipment.acquisitionDate)}</TableCell>
                <TableCell>{equipment.serialNumber || "-"}</TableCell>
                {canManage && (
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => onEdit(equipment)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => onDelete(equipment)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function EquipmentsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    type: "all",
    locationName: "all",
    sortBy: "name",
  });

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const canManage = user?.role === "ADMIN";

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const data = await getEquipments();
      setEquipments(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Impossible de charger les equipements depuis l'API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipments();
  }, []);

  const options = useMemo(
    () => ({
      statuses: uniqueValues(equipments, "status"),
      types: uniqueValues(equipments, "type"),
      locations: uniqueValues(equipments, "locationName"),
    }),
    [equipments],
  );

  const filteredEquipments = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return equipments
      .filter((equipment) => {
        const matchesQuery =
          !query ||
          [
            equipment.name,
            equipment.reference,
            equipment.type,
            equipment.locationName,
            equipment.serialNumber,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        const matchesStatus =
          filters.status === "all" || equipment.status === filters.status;
        const matchesType =
          filters.type === "all" || equipment.type === filters.type;
        const matchesLocation =
          filters.locationName === "all" ||
          equipment.locationName === filters.locationName;

        return matchesQuery && matchesStatus && matchesType && matchesLocation;
      })
      .sort((a, b) => {
        const sortAccessors = {
          name: [a.name, b.name],
          status: [
            getStatusMeta(a.status).label,
            getStatusMeta(b.status).label,
          ],
          type: [a.type, b.type],
          location: [a.locationName, b.locationName],
          date: [a.acquisitionDate, b.acquisitionDate],
        };
        const [first, second] =
          sortAccessors[filters.sortBy] || sortAccessors.name;
        return String(first || "").localeCompare(String(second || ""), "fr", {
          numeric: true,
        });
      });
  }, [equipments, filters]);

  const statusCounts = useMemo(
    () =>
      equipments.reduce((acc, equipment) => {
        acc[equipment.status] = (acc[equipment.status] || 0) + 1;
        return acc;
      }, {}),
    [equipments],
  );

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      query: "",
      status: "all",
      type: "all",
      locationName: "all",
      sortBy: "name",
    });
  };

  const handleEdit = (equipment) => {
    navigate(`/equipements/${equipment.id}/modifier`);
  };

  const handleDelete = async (equipment) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Supprimer cet equipement ?",
      text: `L'equipement ${equipment.name} sera supprime definitivement.`,
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d32f2f",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      await deleteEquipment(equipment.id);
      await loadEquipments();
      await Swal.fire({
        icon: "success",
        title: "Equipement supprime",
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
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: theme.palette.primary.main }}
              >
                Equipements
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label={`${equipments.length} equipements`}
                color="primary"
              />
              {Object.entries(STATUS_META).map(([status, meta]) => (
                <Chip
                  key={status}
                  label={`${meta.label}: ${statusCounts[status] || 0}`}
                  color={meta.color}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 3 }}>
            <FilterSidebar
              filters={filters}
              statusOptions={options.statuses}
              typeOptions={options.types}
              locationOptions={options.locations}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 9 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, md: 2 },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                background: theme.palette.background.paper,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                gap={1.5}
                mb={2}
              >
                <Box>
                  {canManage && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddOutlined />}
                      onClick={() => navigate("/equipements/nouveau")}
                    >
                      Nouvel equipement
                    </Button>
                  )}
                 
                </Box>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, value) => value && setViewMode(value)}
                  size="small"
                  fullWidth={isMobile}
                >
                  <ToggleButton value="list" aria-label="Vue liste">
                    <Tooltip title="Vue liste">
                      <ListAltOutlined fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="cards" aria-label="Vue cards">
                    <Tooltip title="Vue cards">
                      <GridViewOutlined fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {loading && <LinearProgress sx={{ mb: 2 }} />}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {!loading && filteredEquipments.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <Inventory2Outlined
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                  />
                  <Typography variant="subtitle1" fontWeight={800}>
                    Aucun equipement trouve
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajustez les filtres pour elargir les resultats.
                  </Typography>
                </Box>
              ) : viewMode === "list" ? (
                <EquipmentList
                  equipments={filteredEquipments}
                  canManage={canManage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <Grid container spacing={2}>
                  {filteredEquipments.map((equipment) => (
                    <Grid key={equipment.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                      <EquipmentCard
                        equipment={equipment}
                        canManage={canManage}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BuildCircleOutlined,
  CheckCircleOutline,
  Inventory2Outlined,
  MeetingRoomOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { getEquipments } from "../../services/equipmentService";
import { getRooms } from "../../services/roomService";
import { getInterventions } from "../../services/interventionService";

function parseApiError(error) {
  const fallback = "Impossible de charger les indicateurs pour le moment.";
  const data = error?.response?.data;

  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors.join(" | ");

  return fallback;
}

function StatCard({ title, value, subtitle, tone, icon }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        border: `1px solid ${alpha(tone, 0.2)}`,
        boxShadow: "none",
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ mt: 0.5, mb: 0.5, color: tone, fontWeight: 800, lineHeight: 1.1 }}
            >
              {value}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              color: tone,
              background: alpha(tone, 0.1),
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [equipments, setEquipments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [interventions, setInterventions] = useState([]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [equipmentsData, roomsData, interventionsData] = await Promise.all([
          getEquipments(),
          getRooms(),
          getInterventions(),
        ]);

        if (!active) return;

        setEquipments(Array.isArray(equipmentsData) ? equipmentsData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setInterventions(Array.isArray(interventionsData) ? interventionsData : []);
      } catch (loadError) {
        if (active) {
          setError(parseApiError(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalEquipments = equipments.length;
    const roomsCount = rooms.length;

    const operational = equipments.filter((item) => item.status === "FUNCTIONAL").length;
    const maintenance = equipments.filter((item) => item.status === "MAINTENANCE").length;
    const broken = equipments.filter((item) => item.status === "BROKEN").length;
    const outOfService = equipments.filter((item) => item.status === "OUT_OF_SERVICE").length;
    const nonOperational = broken + outOfService;

    const openInterventions = interventions.filter(
      (item) => item.status === "OPEN" || item.status === "IN_PROGRESS",
    ).length;
    const critical = interventions.filter(
      (item) =>
        item.urgencyLevel === "CRITICAL" &&
        item.status !== "RESOLVED" &&
        item.status !== "CANCELLED",
    ).length;

    const availability =
      totalEquipments > 0 ? Math.round((operational / totalEquipments) * 100) : 0;

    return {
      totalEquipments,
      roomsCount,
      openInterventions,
      critical,
      availability,
      operational,
      maintenance,
      nonOperational,
      statusCounts: {
        OPEN: interventions.filter((item) => item.status === "OPEN").length,
        IN_PROGRESS: interventions.filter((item) => item.status === "IN_PROGRESS").length,
        RESOLVED: interventions.filter((item) => item.status === "RESOLVED").length,
        CANCELLED: interventions.filter((item) => item.status === "CANCELLED").length,
      },
    };
  }, [equipments, rooms, interventions]);

  const statusPieData = useMemo(
    () => [
      {
        name: "Operationnels",
        value: metrics.operational,
        color: theme.palette.success.main,
      },
      {
        name: "En maintenance",
        value: metrics.maintenance,
        color: theme.palette.warning.main,
      },
      {
        name: "Non operationnels",
        value: metrics.nonOperational,
        color: theme.palette.error.main,
      },
    ],
    [metrics, theme],
  );

  const interventionBarData = useMemo(
    () => [
      { name: "Ouvertes", Total: metrics.statusCounts.OPEN },
      { name: "En cours", Total: metrics.statusCounts.IN_PROGRESS },
      { name: "Resolues", Total: metrics.statusCounts.RESOLVED },
      { name: "Annulees", Total: metrics.statusCounts.CANCELLED },
    ],
    [metrics.statusCounts],
  );

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          mb: 3,
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 3 },
          borderRadius: 1,
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
              : `linear-gradient(135deg, ${theme.palette.primary.dark}, #0b1220)`,
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              Plateforme de gestion technique
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 1, maxWidth: 740, color: "rgba(255,255,255,0.82)" }}
            >
              Indicateurs reels du parc, des salles et des interventions techniques.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label="Donnees API"
              sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.32)" }}
              variant="outlined"
            />
            <Chip
              label={`${metrics.availability}% disponibilite`}
              sx={{
                background: "#fff",
                color: theme.palette.primary.main,
                fontWeight: 800,
              }}
            />
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === "light"
              ? "0 6px 24px rgba(0,0,0,0.06)"
              : "0 6px 24px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {(loading || error) && (
          <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}

        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Equipements"
                value={metrics.totalEquipments}
                subtitle="Materiels inventories"
                tone={theme.palette.primary.main}
                icon={<Inventory2Outlined />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Salles"
                value={metrics.roomsCount}
                subtitle="Espaces suivis"
                tone={theme.palette.info.main}
                icon={<MeetingRoomOutlined />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Interventions ouvertes"
                value={metrics.openInterventions}
                subtitle={`${metrics.statusCounts.IN_PROGRESS} en cours`}
                tone={theme.palette.warning.main}
                icon={<BuildCircleOutlined />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Alertes critiques"
                value={metrics.critical}
                subtitle="A traiter en priorite"
                tone={theme.palette.error.main}
                icon={<WarningAmberOutlined />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "none",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleOutline color="success" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Etat du parc
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Repartition des equipements par statut reel
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={96}
                          paddingAngle={3}
                        >
                          {statusPieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={24} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "none",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Statuts interventions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Donnees en direct des interventions de l'API
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={interventionBarData} barGap={8}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={alpha(theme.palette.text.secondary, 0.2)}
                        />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="Total"
                          fill={theme.palette.primary.main}
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

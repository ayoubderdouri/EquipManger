import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
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
} from 'recharts';
import {
  BuildCircleOutlined,
  CheckCircleOutline,
  Inventory2Outlined,
  MeetingRoomOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';

const SITES = [
  {
    id: 'campus-nord',
    label: 'Site Nord',
    stats: {
      equipments: 428,
      rooms: 36,
      interventions: 18,
      critical: 5,
      availability: 91,
      operational: 356,
      maintenance: 47,
      outOfService: 25,
      planned: 12,
      urgent: 6,
    },
  },
  {
    id: 'campus-centre',
    label: 'Site Centre',
    stats: {
      equipments: 312,
      rooms: 28,
      interventions: 11,
      critical: 3,
      availability: 94,
      operational: 274,
      maintenance: 27,
      outOfService: 11,
      planned: 8,
      urgent: 3,
    },
  },
  {
    id: 'campus-sud',
    label: 'Site Sud',
    stats: {
      equipments: 245,
      rooms: 22,
      interventions: 15,
      critical: 4,
      availability: 88,
      operational: 201,
      maintenance: 31,
      outOfService: 13,
      planned: 9,
      urgent: 6,
    },
  },
];

function StatCard({ title, value, subtitle, tone, icon }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        border: `1px solid ${alpha(tone, 0.2)}`,
        boxShadow: 'none',
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
              borderRadius: '8px',
              display: 'grid',
              placeItems: 'center',
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
  const [activeTab, setActiveTab] = useState(0);
  const selectedSite = SITES[activeTab];
  const {
    equipments,
    rooms,
    interventions,
    critical,
    availability,
    operational,
    maintenance,
    outOfService,
    planned,
    urgent,
  } = selectedSite.stats;

  const statusPieData = useMemo(
    () => [
      { name: 'Operationnels', value: operational, color: theme.palette.success.main },
      { name: 'En maintenance', value: maintenance, color: theme.palette.warning.main },
      { name: 'Hors service', value: outOfService, color: theme.palette.error.main },
    ],
    [maintenance, operational, outOfService, theme]
  );

  const interventionBarData = useMemo(
    () => [
      { name: 'Lun', Planifiees: 4, Urgentes: 1 },
      { name: 'Mar', Planifiees: 3, Urgentes: 2 },
      { name: 'Mer', Planifiees: planned, Urgentes: urgent },
      { name: 'Jeu', Planifiees: 5, Urgentes: 2 },
      { name: 'Ven', Planifiees: 6, Urgentes: 1 },
    ],
    [planned, urgent]
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
            theme.palette.mode === 'light'
              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
              : `linear-gradient(135deg, ${theme.palette.primary.dark}, #0b1220)`,
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              Plateforme de gestion technique
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, maxWidth: 740, color: 'rgba(255,255,255,0.82)' }}>
              Suivi centralise des equipements, salles et interventions techniques.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Temps reel" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.32)' }} variant="outlined" />
            <Chip label={`${availability}% disponibilite`} sx={{ background: '#fff', color: theme.palette.primary.main, fontWeight: 800 }} />
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 6px 24px rgba(0,0,0,0.06)'
              : '0 6px 24px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 2.5 }, pb: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.5}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                Vue operationnelle
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Controle du parc, occupation des salles et priorite des interventions.
              </Typography>
            </Box>
            <Box sx={{ minWidth: { xs: '100%', md: 260 } }}>
              <Stack direction="row" justifyContent="space-between" mb={0.75}>
                <Typography variant="caption" color="text.secondary">Disponibilite globale</Typography>
                <Typography variant="caption" fontWeight={800}>{availability}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={availability} sx={{ height: 8, borderRadius: 8 }} />
            </Box>
          </Stack>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': {
              py: 1.25,
              fontWeight: 700,
              fontSize: { xs: '0.82rem', md: '0.92rem' },
            },
          }}
        >
          {SITES.map((item) => (
            <Tab key={item.id} label={item.label} />
          ))}
        </Tabs>

        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Equipements"
                value={equipments}
                subtitle="Materiels inventories"
                tone={theme.palette.primary.main}
                icon={<Inventory2Outlined />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Salles"
                value={rooms}
                subtitle="Espaces suivis"
                tone={theme.palette.info.main}
                icon={<MeetingRoomOutlined />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Interventions ouvertes"
                value={interventions}
                subtitle={`${urgent} urgentes aujourd'hui`}
                tone={theme.palette.warning.main}
                icon={<BuildCircleOutlined />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Alertes critiques"
                value={critical}
                subtitle="A traiter en priorite"
                tone={theme.palette.error.main}
                icon={<WarningAmberOutlined />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleOutline color="success" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Etat du parc
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Repartition des equipements par statut
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>
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
              <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Charge des interventions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Planifiees et urgentes sur la semaine
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={interventionBarData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Planifiees" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Urgentes" fill={theme.palette.warning.main} radius={[8, 8, 0, 0]} />
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

import { Box, Typography, Button, useTheme } from '@mui/material';
import { HomeOutlined, ArrowBackOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: '6rem', sm: '9rem' },
          fontWeight: 900,
          lineHeight: 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
        }}
      >
        404
      </Typography>
      <Typography variant="h5" fontWeight={800} mb={1}>Page introuvable</Typography>
      <Typography variant="body2" color="text.secondary" mb={4} maxWidth={380}>
        La page demandee n'existe pas ou a ete deplacee.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="contained" startIcon={<HomeOutlined />} onClick={() => navigate('/')}>
          Tableau de bord
        </Button>
        <Button variant="outlined" color="secondary" startIcon={<ArrowBackOutlined />} onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Box>
    </Box>
  );
}

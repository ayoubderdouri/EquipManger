import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';

function ForgotPassword() {
  return (
    <Box
      maxWidth={500}
      mx="auto"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      minHeight="100vh"
      gap={2}
      px={2}
    >
      <Helmet>
        <title>Mot de passe oublie - EquipManager</title>
      </Helmet>

      <Card sx={{ width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" mb={1} fontWeight={800}>
            Recuperation du mot de passe
          </Typography>

          <Typography variant="body2" mb={3} color="text.secondary">
            Indiquez votre adresse email pour recevoir les instructions de recuperation.
          </Typography>

          <TextField label="Adresse email" type="email" fullWidth margin="normal" />

          <Button variant="contained" fullWidth sx={{ mt: 2 }}>
            Envoyer les instructions
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ForgotPassword;

import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';

function FirstActivation() {
  return (
    <Box
      maxWidth={520}
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
        <title>Activation du compte - EquipManager</title>
      </Helmet>

      <Card sx={{ width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" mb={1} fontWeight={800}>
            Premiere activation
          </Typography>
          <Typography variant="body2" mb={2} color="text.secondary">
            Completez les informations necessaires pour activer votre acces.
          </Typography>

          <TextField label="Adresse email" type="email" fullWidth margin="normal" />
          <TextField label="Identifiant interne" fullWidth margin="normal" />
          <TextField label="Date de naissance" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField label="Numero de telephone" fullWidth margin="normal" />

          <Button variant="contained" fullWidth sx={{ mt: 2 }}>
            Activer le compte
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FirstActivation;

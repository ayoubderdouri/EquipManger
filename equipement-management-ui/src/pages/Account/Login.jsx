import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PrecisionManufacturingOutlined } from "@mui/icons-material";

function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
      }}
    >
      <Helmet>
        <title>Connexion - EquipManager</title>
      </Helmet>

      <Box
        sx={{
          color: "#fff",
          px: { xs: 3, md: 8 },
          py: { xs: 5, md: 8 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: { xs: 300, md: "100vh" },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <PrecisionManufacturingOutlined />
          </Box>
          <Typography variant="h6" fontWeight={800}>EquipManager</Typography>
        </Stack>

        <Box sx={{ maxWidth: 620, mt: { xs: 7, md: 0 } }}>
          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.08 }}>
            Gestion des equipements, salles et interventions techniques
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: "rgba(255,255,255,0.82)", maxWidth: 520 }}>
            Pilotez le parc materiel, l'occupation des salles et les demandes de maintenance depuis une interface unique.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)", mt: 5 }}>
          Plateforme interne de supervision technique
        </Typography>
      </Box>

      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 7 },
          py: { xs: 4, md: 8 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: (theme) => theme.palette.background.default,
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 460, boxShadow: 6 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" mb={0.5} fontWeight={800}>
              Connexion
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Accedez a votre espace de gestion technique.
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Utilisateur"
                type="text"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                label="Mot de passe"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <Typography color="error" variant="body2" mt={1}>
                  {error}
                </Typography>
              )}

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2.5 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Login;

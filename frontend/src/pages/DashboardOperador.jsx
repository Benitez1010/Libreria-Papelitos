import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../auth/authContext.js";

export default function DashboardOperador() {
  const { usuario, logout } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7f6" }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            Papelitos · Panel de Operador
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">{usuario?.username}</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                color: "#ffffff",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": { borderColor: "#ffffff", backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              Cerrar sesion
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Paper sx={{ p: 4 }} elevation={2}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Hola, {usuario?.first_name || usuario?.username}.
          </Typography>
          <Typography color="text.secondary">
            Espacio de trabajo del operador: ventas, atencion al cliente y
            consultas rapidas de inventario.
          </Typography>
          <Chip
            label="ROL: OPERADOR"
            color="info"
            sx={{ mt: 2, fontWeight: 600 }}
          />
        </Paper>
      </Container>
    </Box>
  );
}

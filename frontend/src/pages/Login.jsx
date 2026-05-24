import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useAuth } from "../auth/authContext.js";
import { COLORES_MARCA } from "../theme.js";

const MENSAJE_CAMPOS_VACIOS = "Complete usuario y contrasena para continuar.";
const MENSAJE_CREDENCIALES_INVALIDAS = "Credenciales invalidas, intente nuevamente";
const MENSAJE_ERROR_SERVIDOR = "No se pudo contactar al servidor. Intente mas tarde.";

function rutaPorRol(rol) {
  if (rol === "ADMINISTRADOR") return "/admin";
  if (rol === "OPERADOR") return "/operador";
  return "/";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [identificador, setIdentificador] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError("");

    if (identificador.trim() === "" || contrasena === "") {
      setError(MENSAJE_CAMPOS_VACIOS);
      return;
    }

    setEnviando(true);
    try {
      const usuarioAutenticado = await login(identificador.trim(), contrasena);
      const destinoPrevio = ubicacion.state?.desde;
      const destinoPorRol = rutaPorRol(usuarioAutenticado.rol);
      navigate(destinoPrevio || destinoPorRol, { replace: true });
    } catch (errorPeticion) {
      const detail = errorPeticion?.response?.data?.detail;
      if (errorPeticion?.response?.status === 400) {
        setError(detail || MENSAJE_CREDENCIALES_INVALIDAS);
      } else {
        setError(MENSAJE_ERROR_SERVIDOR);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORES_MARCA.verdeFondo,
        padding: 3,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          width: "min(900px, 100%)",
          minHeight: 480,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundColor: COLORES_MARCA.verdeMarca,
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            gap: 2,
            minHeight: { xs: 220, md: "auto" },
          }}
          aria-hidden
        >
          <Box
            sx={{
              width: 140,
              height: 140,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "2px solid rgba(255,240,200,0.4)",
            }}
          >
            <EditNoteIcon sx={{ fontSize: 90, color: "#fbbf24" }} />
          </Box>
          <Typography
            variant="h4"
            sx={{ color: "#4ade80", textShadow: "0 0 12px rgba(74,222,128,0.4)" }}
          >
            PAPELITOS
          </Typography>
          <Typography
            sx={{
              color: "#c084fc",
              letterSpacing: 3,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            LIBRERIA Y PAPELERIA
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={manejarEnvio}
          noValidate
          sx={{
            backgroundColor: COLORES_MARCA.crema,
            padding: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ mb: 3, textTransform: "uppercase", color: "#0a0a0a" }}
          >
            Inicio de sesion
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              id="identificador"
              name="identificador"
              label="Usuario o Correo Electronico"
              type="text"
              autoComplete="username"
              value={identificador}
              onChange={(evento) => setIdentificador(evento.target.value)}
              error={Boolean(error) && identificador.trim() === ""}
              required
            />

            <TextField
              id="contrasena"
              name="contrasena"
              label="Contrasena"
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              error={Boolean(error) && contrasena === ""}
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={enviando}
              sx={{ height: 48, fontSize: 16, mt: 1 }}
              startIcon={
                enviando ? <CircularProgress size={18} color="inherit" /> : null
              }
            >
              {enviando ? "Validando..." : "Acceder"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

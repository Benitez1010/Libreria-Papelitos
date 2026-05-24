import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "./authContext.js";

export default function RutaProtegida({ rolesPermitidos }) {
  const { usuario, cargandoSesion } = useAuth();
  const ubicacion = useLocation();

  if (cargandoSesion) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Validando sesion...</Typography>
      </Box>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

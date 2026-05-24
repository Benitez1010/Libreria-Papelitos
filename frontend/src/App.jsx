import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/authContext.js";
import RutaProtegida from "./auth/RutaProtegida.jsx";
import Login from "./pages/Login.jsx";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import DashboardOperador from "./pages/DashboardOperador.jsx";

function RedireccionPorRol() {
  const { usuario } = useAuth();
  if (usuario?.rol === "ADMINISTRADOR") return <Navigate to="/admin" replace />;
  if (usuario?.rol === "OPERADOR") return <Navigate to="/operador" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida rolesPermitidos={["ADMINISTRADOR"]} />}>
        <Route path="/admin" element={<DashboardAdmin />} />
      </Route>

      <Route element={<RutaProtegida rolesPermitidos={["OPERADOR"]} />}>
        <Route path="/operador" element={<DashboardOperador />} />
      </Route>

      <Route element={<RutaProtegida />}>
        <Route path="/" element={<RedireccionPorRol />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

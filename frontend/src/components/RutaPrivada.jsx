import { Navigate, Outlet } from 'react-router-dom';

const RutaPrivada = () => {
  // Revisa si hay un token guardado (sesión iniciada)
  const token = localStorage.getItem('token');

  // Si NO hay token, manda al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si SÍ hay token, deja pasar a la página que quería entrar
  return <Outlet />;
};

export default RutaPrivada;
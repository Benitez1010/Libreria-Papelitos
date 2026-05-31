import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Usuarios from './pages/Usuarios/Usuarios';
import RegistrarCategoria from './pages/Categorias/RegistrarCategoria';
import RegistrarProducto from './pages/Productos/RegistrarProducto';
import RutaPrivada from './components/RutaPrivada';
import Login from './pages/Login/Login';
import UsuarioAcceso from './pages/Configuracion/UsuarioAcceso';
import AccesoRol from './pages/Configuracion/AccesoRol';
import ProtectorRuta from './components/ProtectorRuta'; // Ajusta la ruta si es necesario

function App() {
  return (
    <Routes>
      {/* Ruta pública: Login no requiere autenticación y no tiene Sidebar */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas: requieren iniciar sesión */}
      <Route element={<RutaPrivada />}>
        <Route path="/" element={<MainLayout />}>
          {/* Cualquier ruta que se ponga aquí dentro, lo tendra el Sidebar automáticamente */}

          {/* Vista del Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Nueva Vista enlazada (localhost:5173/usuarios) */}
          <Route path="usuarios" element={
            <ProtectorRuta modulo="usuarios">
              <Usuarios />
            </ProtectorRuta>
          } />

          {/*Vista de menu de acceso por usuario*/}
          <Route path="Listadousuarios" element={
            <ProtectorRuta modulo="acceso_rol">
              <UsuarioAcceso />
            </ProtectorRuta>
          } />

          {/* Vista de configuración de acceso por rol con ID dinámico */}
          <Route path="Listadousuarios/acceso-rol/:id" element={<AccesoRol />} />

          <Route path="categorias/nuevo" element={<RegistrarCategoria />} />
          <Route path="productos/nuevo" element={<RegistrarProducto />} />
          
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
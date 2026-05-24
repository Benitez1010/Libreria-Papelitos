import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Usuarios from './pages/Usuarios/Usuarios';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Cualquier ruta que se ponga aquí dentro, lo tendra el Sidebar automáticamente */}

        {/* Vista del Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* Nueva Vista enlazada (localhost:5173/usuarios) */}
        <Route path="usuarios" element={<Usuarios />} />

        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
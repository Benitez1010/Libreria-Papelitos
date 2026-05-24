import { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const drawerWidth = 280;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#EAF4EC' }}>
      <CssBaseline /> {/* Normaliza los márgenes del navegador */}
      
      {/* Barra Lateral importada */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        drawerWidth={drawerWidth} 
      />

      {/* Área de contenido dinámico */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'white', color: 'black', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            {/* Botón hamburguesa: solo visible en pantallas pequeñas */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: '#1E5631' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1E5631' }}>
              Librería Papelitos
            </Typography>
          </Toolbar>
        </AppBar>

        {/* El contenedor principal con Límite de Ancho (maxWidth) */}
        <Box component="main" sx={{ p: 4, flexGrow: 1 }}>
          <Box sx={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default MainLayout;
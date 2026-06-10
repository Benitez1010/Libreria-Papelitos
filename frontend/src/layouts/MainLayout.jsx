import { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, CssBaseline, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const drawerWidth = 280;
const collapsedWidth = 88; // Ancho cuando está contraído

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDesktopToggle = () => setDesktopOpen(!desktopOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#EAF4EC' }}>
      <CssBaseline />
      
      {/* Barra Lateral importada */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        drawerWidth={drawerWidth}
        collapsedWidth={collapsedWidth}
        desktopOpen={desktopOpen}
        setDesktopOpen={setDesktopOpen}
      />

      {/* Área de contenido dinámico */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          width: { 
            xs: '100%', 
            md: `calc(100% - ${desktopOpen ? drawerWidth : collapsedWidth}px)` 
          },
          transition: 'width 0.3s ease' 
        }}
      >
        <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'white', color: 'black', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            {/* Botón hamburguesa: visible en móviles */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: '#1E5631' }}
            >
              <MenuIcon />
            </IconButton>

            {/* Botón hamburguesa: visible en escritorio */}
            <Tooltip title={desktopOpen ? "Contraer menú" : "Expandir menú"}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDesktopToggle}
                sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, color: '#1E5631' }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>

            {/* NUEVO: Logo Corporativo */}
            <Box 
              component="img" 
              src="/logo.png" 
              alt="Logo Librería Papelitos" 
              sx={{ 
                height: 40, // Altura que encaja perfecto con la barra
                width: 'auto', 
                mr: 1.5,
                display: { xs: 'none', sm: 'block' } // Oculto en móviles muy pequeños para no quitar espacio
              }} 
            />

            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1E5631' }}>
              Librería Papelitos
            </Typography>
          </Toolbar>
        </AppBar>

        {/* El contenedor principal */}
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
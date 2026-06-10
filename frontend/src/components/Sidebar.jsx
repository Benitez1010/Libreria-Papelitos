import React, { useState, useEffect } from 'react';
import { 
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, 
  Collapse, Box, Typography, Button, Tooltip 
} from '@mui/material';
import { 
  Home, ExpandLess, ExpandMore, Inventory, Category, 
  Storefront, SyncAlt, Assessment, Settings, Group, 
  ManageAccounts, Security, Logout 
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../services/api';

const SidebarContent = ({ openAdmin, setOpenAdmin, openConfig, setOpenConfig, onLogout, usuarioInfo, desktopOpen, setDesktopOpen }) => {
  
  const esAdmin = usuarioInfo?.rol === 'Administrador' || usuarioInfo?.rol === 'ADMIN';
  

  const mostrarCategoriaAdmin = true;
  

  const mostrarCategoriaConfig = esAdmin;

  const handleMenuClick = (setter, currentState) => {
    if (!desktopOpen) {
      setDesktopOpen(true);
      setter(true);
    } else {
      setter(!currentState);
    }
  };

  
  const NavItem = ({ to, icon, text, isSubmenu = false }) => {
    const styledIcon = React.cloneElement(icon, {
      sx: { 
        ...icon.props.sx, 
        fontSize: desktopOpen ? (isSubmenu ? 22 : 24) : 28, 
        transition: 'all 0.3s ease' 
      }
    });

    return (
      <Tooltip title={!desktopOpen ? text : ""} placement="right" arrow>
        <ListItemButton 
          component={to ? Link : 'div'} 
          to={to} 
          sx={{ 
            minHeight: 48,
            justifyContent: desktopOpen ? 'initial' : 'center',
            px: 2.5,
            pl: desktopOpen && isSubmenu ? 4 : 2.5,
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: desktopOpen ? 2 : 'auto', justifyContent: 'center' }}>
            {styledIcon}
          </ListItemIcon>
          <ListItemText 
            primary={text} 
            sx={{ 
              opacity: desktopOpen ? 1 : 0, 
              transition: 'opacity 0.3s',
              display: desktopOpen ? 'block' : 'none',
              whiteSpace: 'nowrap'
            }} 
          />
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      <Box>
        <Box sx={{ p: desktopOpen ? 3 : 2, textAlign: 'center', borderBottom: '1px solid #2C7A4B', backgroundColor: 'rgba(44, 122, 75, 0.3)', transition: 'all 0.3s ease' }}>
          <Box 
            sx={{ 
              width: desktopOpen ? 50 : 42, 
              height: desktopOpen ? 50 : 42, 
              borderRadius: '50%', 
              backgroundColor: '#2C7A4B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: desktopOpen ? 1.5 : 0,
              border: '2px solid #A3C4AC',
              transition: 'all 0.3s ease'
            }}
          >
            <Typography variant={desktopOpen ? "h6" : "body1"} sx={{ color: 'white', fontWeight: 'bold' }}>
              {usuarioInfo ? usuarioInfo.username.charAt(0).toUpperCase() : '?'}
            </Typography>
          </Box>
          
          {desktopOpen && (
            <Box sx={{ animation: 'fadeIn 0.5s' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white', whiteSpace: 'nowrap' }}>
                {usuarioInfo ? usuarioInfo.username : 'Cargando...'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4CAF50', display: 'inline-block' }} />
                <Typography variant="body2" sx={{ color: '#A3C4AC', whiteSpace: 'nowrap' }}>
                  {usuarioInfo ? usuarioInfo.rol : ''}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <List sx={{ mt: 1 }}>
          <NavItem to="/" icon={<Home sx={{ color: 'white' }} />} text="Inicio" />

          {mostrarCategoriaAdmin && (
            <>
              <Tooltip title={!desktopOpen ? "Gestión Administrativa" : ""} placement="right" arrow>
                <ListItemButton 
                  onClick={() => handleMenuClick(setOpenAdmin, openAdmin)} 
                  sx={{ 
                    minHeight: 48,
                    bgcolor: openAdmin && desktopOpen ? '#2C7A4B' : 'transparent',
                    justifyContent: desktopOpen ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: desktopOpen ? 2 : 'auto', justifyContent: 'center' }}>
                    <Assessment sx={{ color: 'white', fontSize: desktopOpen ? 24 : 28, transition: 'all 0.3s ease' }} />
                  </ListItemIcon>
                  <ListItemText primary="Gestión Administrativa" sx={{ opacity: desktopOpen ? 1 : 0, display: desktopOpen ? 'block' : 'none', whiteSpace: 'nowrap' }} />
                  {desktopOpen && (openAdmin ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />)}
                </ListItemButton>
              </Tooltip>
              <Collapse in={openAdmin && desktopOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <NavItem to="/productos" icon={<Inventory sx={{ color: 'white' }} />} text="Listado de Productos" isSubmenu />
                  <NavItem to="/categorias" icon={<Category sx={{ color: 'white' }} />} text="Categorías" isSubmenu />
                  <NavItem to="" icon={<Storefront sx={{ color: 'white' }} />} text="Área de almacenaje" isSubmenu />
                  <NavItem to="" icon={<SyncAlt sx={{ color: 'white' }} />} text="Movimientos" isSubmenu />
                  <NavItem to="" icon={<Assessment sx={{ color: 'white' }} />} text="Control de Inventario" isSubmenu />
                </List>
              </Collapse>
            </>
          )}

          {mostrarCategoriaConfig && (
            <>
              <Tooltip title={!desktopOpen ? "Configuración" : ""} placement="right" arrow>
                <ListItemButton 
                  onClick={() => handleMenuClick(setOpenConfig, openConfig)} 
                  sx={{ 
                    minHeight: 48,
                    bgcolor: openConfig && desktopOpen ? '#2C7A4B' : 'transparent', mt: 1,
                    justifyContent: desktopOpen ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: desktopOpen ? 2 : 'auto', justifyContent: 'center' }}>
                    <Settings sx={{ color: 'white', fontSize: desktopOpen ? 24 : 28, transition: 'all 0.3s ease' }} />
                  </ListItemIcon>
                  <ListItemText primary="Configuración" sx={{ opacity: desktopOpen ? 1 : 0, display: desktopOpen ? 'block' : 'none', whiteSpace: 'nowrap' }} />
                  {desktopOpen && (openConfig ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />)}
                </ListItemButton>
              </Tooltip>
              <Collapse in={openConfig && desktopOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <NavItem to="/usuarios" icon={<Group sx={{ color: 'white' }} />} text="Usuarios" isSubmenu />
                  <NavItem to="" icon={<ManageAccounts sx={{ color: 'white' }} />} text="Roles" isSubmenu />
                  <NavItem to="/Listadousuarios" icon={<Security sx={{ color: 'white' }} />} text="Acceso por Rol" isSubmenu />
                </List>
              </Collapse>
            </>
          )}
        </List>
      </Box>

      <Box sx={{ p: desktopOpen ? 2 : 1.5, mt: 'auto', display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={!desktopOpen ? "Cerrar Sesión" : ""} placement="right" arrow>
          <Button
            fullWidth={desktopOpen}
            variant="outlined"
            onClick={onLogout}
            sx={{
              color: 'white',
              borderColor: desktopOpen ? '#2C7A4B' : 'transparent',
              '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
              textTransform: 'none',
              justifyContent: desktopOpen ? 'flex-start' : 'center',
              px: desktopOpen ? 2 : 0,
              minWidth: desktopOpen ? 'auto' : 48,
            }}
          >
            <Logout sx={{ mr: desktopOpen ? 1 : 0, fontSize: desktopOpen ? 24 : 28, transition: 'all 0.3s ease' }} />
            {desktopOpen && "Cerrar Sesión"}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth, collapsedWidth, desktopOpen, setDesktopOpen }) => {
  const [openAdmin, setOpenAdmin] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerUsuario = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/me/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsuarioInfo({
            username: data.username,
            rol: data.rol_display || data.rol,
            permisos: data.permisos || {},
          });
        }
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      }
    };

    obtenerUsuario();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsuarioInfo(null);
    navigate('/login');
  };

  return (
    <Box 
      component="nav" 
      sx={{ 
        width: { md: desktopOpen ? drawerWidth : collapsedWidth }, 
        flexShrink: { md: 0 },
        transition: 'width 0.3s ease'
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1E5631', color: 'white' },
        }}
      >
        <SidebarContent 
          openAdmin={openAdmin} setOpenAdmin={setOpenAdmin} 
          openConfig={openConfig} setOpenConfig={setOpenConfig} 
          onLogout={handleLogout} usuarioInfo={usuarioInfo}
          desktopOpen={true} 
          setDesktopOpen={() => {}}
        />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: desktopOpen ? drawerWidth : collapsedWidth, 
            backgroundColor: '#1E5631', 
            color: 'white',
            transition: 'width 0.3s ease',
            overflowX: 'hidden'
          },
        }}
        open
      >
        <SidebarContent 
          openAdmin={openAdmin} setOpenAdmin={setOpenAdmin} 
          openConfig={openConfig} setOpenConfig={setOpenConfig} 
          onLogout={handleLogout} usuarioInfo={usuarioInfo}
          desktopOpen={desktopOpen}
          setDesktopOpen={setDesktopOpen}
        />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
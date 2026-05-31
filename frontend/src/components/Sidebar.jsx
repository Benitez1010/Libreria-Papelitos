import { useState, useEffect } from 'react';
import { 
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, 
  Collapse, Box, Typography, Button 
} from '@mui/material';
import { 
  Home, ExpandLess, ExpandMore, Inventory, Category, 
  Storefront, SyncAlt, Assessment, Settings, Group, 
  ManageAccounts, Security, Logout 
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../services/api';

const SidebarContent = ({ openAdmin, setOpenAdmin, openConfig, setOpenConfig, onLogout, usuarioInfo }) => {
  
  // --- LÓGICA DE PERMISOS ---
  const esAdmin = usuarioInfo?.rol === 'Administrador';
  const permisos = usuarioInfo?.permisos || {};
  
  const verArticulos = esAdmin || permisos.articulos?.master === true;
  const verCategorias = esAdmin || permisos.categorias?.master === true;
  const verAlmacenamiento = esAdmin || permisos.almacenamiento?.master === true;
  const verMovimientos = esAdmin || permisos.movimientos?.master === true;
  const verControlInventario = esAdmin || permisos.control_inventario?.master === true;
  
  const verUsuarios = esAdmin || permisos.usuarios?.master === true;
  const verRoles = esAdmin || permisos.roles?.master === true;
  const verAccesoRol = esAdmin || permisos.acceso_rol?.master === true;

  const mostrarCategoriaAdmin = verArticulos || verCategorias || verAlmacenamiento || verMovimientos || verControlInventario;
  const mostrarCategoriaConfig = verUsuarios || verRoles || verAccesoRol;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box>
        <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #2C7A4B', backgroundColor: 'rgba(44, 122, 75, 0.3)' }}>
          {/* Círculo con inicial del usuario */}
          <Box 
            sx={{ 
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              backgroundColor: '#2C7A4B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 1.5,
              border: '2px solid #A3C4AC'
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              {usuarioInfo ? usuarioInfo.username.charAt(0).toUpperCase() : '?'}
            </Typography>
          </Box>
          
          {/* Nombre de usuario */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
            {usuarioInfo ? usuarioInfo.username : 'Cargando...'}
          </Typography>
          
          {/* Rol con indicador */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#4CAF50',
                display: 'inline-block'
              }} 
            />
            <Typography variant="body2" sx={{ color: '#A3C4AC' }}>
              {usuarioInfo ? usuarioInfo.rol : ''}
            </Typography>
          </Box>
        </Box>

        <List sx={{ mt: 2 }}>
          <ListItemButton component={Link} to="/">
            <ListItemIcon><Home sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItemButton>

          {/* --- MENÚ: GESTIÓN ADMINISTRATIVA --- */}
          {mostrarCategoriaAdmin && (
            <>
              <ListItemButton onClick={() => setOpenAdmin(!openAdmin)} sx={{ bgcolor: openAdmin ? '#2C7A4B' : 'transparent' }}>
                <ListItemIcon><Assessment sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary="Gestión Administrativa" />
                {openAdmin ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openAdmin} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {verArticulos && <ListItemButton sx={{ pl: 4 }}><ListItemIcon><Inventory sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Listado de Artículos" /></ListItemButton>}
                  {/* Se corrigió agregando el Link que te faltaba aquí */}
                  {verCategorias && <ListItemButton component={Link} to="/categorias" sx={{ pl: 4 }}><ListItemIcon><Category sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Categorías" /></ListItemButton>}
                  {verAlmacenamiento && <ListItemButton sx={{ pl: 4 }}><ListItemIcon><Storefront sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Área de almacenaje" /></ListItemButton>}
                  {verMovimientos && <ListItemButton sx={{ pl: 4 }}><ListItemIcon><SyncAlt sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Movimientos" /></ListItemButton>}
                  {verControlInventario && <ListItemButton sx={{ pl: 4 }}><ListItemIcon><Assessment sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Control de Inventario" /></ListItemButton>}
                </List>
              </Collapse>
            </>
          )}

          {/* --- MENÚ: CONFIGURACIÓN --- */}
          {mostrarCategoriaConfig && (
            <>
              <ListItemButton onClick={() => setOpenConfig(!openConfig)} sx={{ bgcolor: openConfig ? '#2C7A4B' : 'transparent', mt: 1 }}>
                <ListItemIcon><Settings sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary="Configuración" />
                {openConfig ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openConfig} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {verUsuarios && <ListItemButton component={Link} to="/usuarios" sx={{ pl: 4 }}><ListItemIcon><Group sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Usuarios" /></ListItemButton>}
                  {verRoles && <ListItemButton sx={{ pl: 4 }}><ListItemIcon><ManageAccounts sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Roles" /></ListItemButton>}
                  {verAccesoRol && <ListItemButton component={Link} to="/Listadousuarios" sx={{ pl: 4 }}><ListItemIcon><Security sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Acceso por Rol" /></ListItemButton>}
                </List>
              </Collapse>
            </>
          )}
        </List>
      </Box>

      {/* ========== BOTÓN CERRAR SESIÓN ========== */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onLogout}
          startIcon={<Logout />}
          sx={{
            color: 'white',
            borderColor: '#2C7A4B',
            '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
            textTransform: 'none',
            justifyContent: 'flex-start',
            pl: 2
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const [openAdmin, setOpenAdmin] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const navigate = useNavigate();

  // Obtener información del usuario logueado
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
          // Convertir el código del rol a texto legible
          const rolTexto = data.rol === 'ADMIN' ? 'Administrador' : 'Operador';
          setUsuarioInfo({
            username: data.username,
            rol: rolTexto,
            permisos: data.permisos || {}
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
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Drawer para pantallas pequeñas (Móvil/Tablet) */}
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
          openAdmin={openAdmin} 
          setOpenAdmin={setOpenAdmin} 
          openConfig={openConfig} 
          setOpenConfig={setOpenConfig} 
          onLogout={handleLogout}
          usuarioInfo={usuarioInfo}
        />
      </Drawer>

      {/* Drawer fijo para monitores grandes */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1E5631', color: 'white' },
        }}
        open
      >
        <SidebarContent 
          openAdmin={openAdmin} 
          setOpenAdmin={setOpenAdmin} 
          openConfig={openConfig} 
          setOpenConfig={setOpenConfig} 
          onLogout={handleLogout}
          usuarioInfo={usuarioInfo}
        />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
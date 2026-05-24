import { useState } from 'react';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Box, Avatar, Typography, Divider, Button
} from '@mui/material';
import {
  Home, ExpandLess, ExpandMore, Inventory, Category,
  Storefront, SyncAlt, Assessment, Settings, Group,
  ManageAccounts, Security, Logout
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/authContext.js';

const ETIQUETAS_ROL = {
  ADMINISTRADOR: 'Administrador',
  OPERADOR: 'Operador',
};

// Extraemos el contenido a una variable para no repetir código en las versiones telefono y PC
const SidebarContent = ({ openAdmin, setOpenAdmin, openConfig, setOpenConfig }) => {
  const { usuario, logout } = useAuth();
  const nombreVisible = usuario?.first_name || usuario?.username || 'Sin sesion';
  const rolVisible = ETIQUETAS_ROL[usuario?.rol] || 'Sin rol';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #2C7A4B' }}>
        <Avatar sx={{ bgcolor: '#A4B0B5' }}>
          {nombreVisible.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">{nombreVisible}</Typography>
          <Typography variant="body2" sx={{ color: '#A3C4AC' }}>{rolVisible}</Typography>
        </Box>
      </Box>

      <List sx={{ mt: 2, flexGrow: 1 }}>
        <ListItemButton component={Link} to="/">
          <ListItemIcon><Home sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItemButton>

        <ListItemButton onClick={() => setOpenAdmin(!openAdmin)} sx={{ bgcolor: openAdmin ? '#2C7A4B' : 'transparent' }}>
          <ListItemIcon><Assessment sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Gestión Administrativa" />
          {openAdmin ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openAdmin} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton sx={{ pl: 4 }}><ListItemIcon><Inventory sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Listado de Artículos" /></ListItemButton>
            <ListItemButton sx={{ pl: 4 }}><ListItemIcon><Category sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Categorías" /></ListItemButton>
            <ListItemButton sx={{ pl: 4 }}><ListItemIcon><Storefront sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Área de almacenaje" /></ListItemButton>
            <ListItemButton sx={{ pl: 4 }}><ListItemIcon><SyncAlt sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Movimientos" /></ListItemButton>
            <ListItemButton sx={{ pl: 4 }}><ListItemIcon><Assessment sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Control de Inventario" /></ListItemButton>

          </List>
        </Collapse>

        <ListItemButton onClick={() => setOpenConfig(!openConfig)} sx={{ bgcolor: openConfig ? '#2C7A4B' : 'transparent', mt: 1 }}>
          <ListItemIcon><Settings sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Configuración" />
          {openConfig ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openConfig} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton component={Link} to="/usuarios" sx={{ pl: 4 }}><ListItemIcon><Group sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Usuarios" /></ListItemButton>
            <ListItemButton sx={{ pl: 4 }}><ListItemIcon><ManageAccounts sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Roles" /></ListItemButton>
            <ListItemButton sx={{ pl: 4 }}><ListItemIcon><Security sx={{ color: 'white', fontSize: 20 }} /></ListItemIcon><ListItemText primary="Acceso por Rol" /></ListItemButton>

          </List>
        </Collapse>
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: '#2C7A4B', mb: 2 }} />
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={logout}
          sx={{
            color: 'white',
            borderColor: 'rgba(255,255,255,0.4)',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          Cerrar sesion
        </Button>
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const [openAdmin, setOpenAdmin] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);

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
        <SidebarContent openAdmin={openAdmin} setOpenAdmin={setOpenAdmin} openConfig={openConfig} setOpenConfig={setOpenConfig} />
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
        <SidebarContent openAdmin={openAdmin} setOpenAdmin={setOpenAdmin} openConfig={openConfig} setOpenConfig={setOpenConfig} />
      </Drawer>
    </Box>
  );
};

export default Sidebar;

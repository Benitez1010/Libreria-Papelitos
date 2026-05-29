import React, { useState } from 'react';
import { Box, Typography, Paper, Switch, Divider, Button, Stack } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

const AccesoRol = () => {
  const [config, setConfig] = useState({
    articulos: { master: true, agregar: true, editar: true, eliminar: true },
    categorias: { master: true, agregar: false, editar: false, eliminar: false },
    almacenamiento: { master: false, agregar: false, editar: false, eliminar: false },
  });

  const toggleMaster = (modulo) => {
    setConfig(prev => ({
      ...prev,
      [modulo]: { ...prev[modulo], master: !prev[modulo].master }
    }));
  };

  const toggleSub = (modulo, sub) => {
    setConfig(prev => ({
      ...prev,
      [modulo]: { ...prev[modulo], [sub]: !prev[modulo][sub] }
    }));
  };

  const RenderModulo = ({ title, moduloKey, actions }) => (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>{title}</Typography>
          <Switch color="success" checked={config[moduloKey].master} onChange={() => toggleMaster(moduloKey)} />
        </Box>
        
        {config[moduloKey].master && (
          <Stack spacing={1.5} sx={{ mt: 2, pt: 2, borderTop: '1px dashed #d0d0d0' }}>
            {actions.map((action) => (
              <Box key={action.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: '#555' }}>{action.label}</Typography>
                <Switch size="medium" color="success" checked={config[moduloKey][action.key]} onChange={() => toggleSub(moduloKey, action.key)} />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: '#f4f6f8', minHeight: '90vh' }}>
      {/* Contenedor centralizado para evitar el vacío excesivo */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 50, color: '#009F4D', mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">Configuración de Accesos</Typography>
          <Typography variant="body1" color="text.secondary">
            Administrando privilegios para: <strong>Usuario 2 (Operativo - Bodega)</strong>
          </Typography>
        </Box>

        {/* Bloque principal de opciones */}
        <Box>
          <RenderModulo title='Mostrar "Listado de Artículos"' moduloKey="articulos" actions={[{key:'agregar', label:'Agregar Articulo'}, {key:'editar', label:'Editar Articulo'}, {key:'eliminar', label:'Eliminar Articulo'}]} />
          <RenderModulo title='Mostrar "Categorías"' moduloKey="categorias" actions={[{key:'agregar', label:'Agregar Categoria'}, {key:'editar', label:'Editar Categoria'}, {key:'eliminar', label:'Eliminar Categoria'}]} />
          <RenderModulo title='Mostrar "Área de Almacenamiento"' moduloKey="almacenamiento" actions={[{key:'agregar', label:'Agregar Área'}, {key:'editar', label:'Editar Área'}, {key:'eliminar', label:'Eliminar Área'}]} />
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="success" size="large" sx={{ px: 8, py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 'bold' }}>
            GUARDAR CONFIGURACIÓN
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AccesoRol;
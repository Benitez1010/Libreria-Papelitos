import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

// Usuarios con los nuevos datos solicitados
const usuarios = [
  { id: 1, nombre: 'Usuario 1', rol: 'Administrador', area: 'Gerencia' },
  { id: 2, nombre: 'Usuario 2', rol: 'Operativo', area: 'Bodega' },
  { id: 3, nombre: 'Usuario 3', rol: 'Operativo', area: 'Vitrina' },
];

const UsuarioAcceso = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <PersonSearchIcon sx={{ fontSize: 40, color: '#009F4D' }} />
        <Typography variant="h4" fontWeight="bold">Gestión de Accesos</Typography>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: '#1E5631' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#ffffff' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#ffffff' }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#ffffff' }}>Área Asignada</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#ffffff' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.rol}</TableCell>
                <TableCell>{user.area}</TableCell>
                <TableCell align="center">
                  <Button 
                    variant="outlined" 
                    color="success"
                    startIcon={<SettingsSuggestIcon />}
                    // Navega a la vista de configuración específica del usuario
                    onClick={() => navigate(`/Listadousuarios/acceso-rol`)} 
                  >
                    Administrar Acceso
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UsuarioAcceso;
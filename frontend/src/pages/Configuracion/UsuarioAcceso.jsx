import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, CircularProgress, Snackbar, Alert, Chip 
} from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { ENDPOINTS } from '../../services/api';

const UsuarioAcceso = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null); 
  const [cargando, setCargando] = useState(true);
  const [snackbar, setSnackbar] = useState({ abierto: false, mensaje: '', tipo: 'success' });

  const obtenerDatos = async () => {
    const token = localStorage.getItem('token');
    try {
      const resMe = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/me/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      const meData = resMe.ok ? await resMe.json() : null;
      setUsuarioActual(meData);

      const response = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/usuarios/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      
      if (response.ok) {
        let data = await response.json();
        if (meData) {
          data = data.sort((a, b) => {
            if (a.id === meData.id) return -1;
            if (b.id === meData.id) return 1;
            return 0;
          });
        }
        setUsuarios(data);
      } else {
        setSnackbar({ abierto: true, mensaje: 'Error al cargar usuarios', tipo: 'error' });
      }
    } catch (error) {
      setSnackbar({ abierto: true, mensaje: 'Error de conexión', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <PersonSearchIcon sx={{ fontSize: 40, color: '#009F4D' }} />
        <Typography variant="h4" fontWeight="bold">Control de accesos</Typography>
      </Box>

      {cargando ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress color="success" />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1E5631' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#ffffff' }}>Nº</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#ffffff' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#ffffff' }}>Rol</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#ffffff' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {usuarios.map((user, index) => {
                const soyYo = usuarioActual && usuarioActual.id === user.id;
                const soyOperadorYelEsAdmin = usuarioActual?.rol !== 'ADMIN' && user.rol === 'ADMIN';
                const botonBloqueado = soyYo || soyOperadorYelEsAdmin;

                return (
                  <TableRow 
                    key={user.id} 
                    hover
                    sx={{ backgroundColor: soyYo ? 'rgba(0, 159, 77, 0.08)' : 'inherit' }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight={soyYo ? 'bold' : 'normal'} component="span">
                        {user.username}
                      </Typography>
                      {soyYo && (
                        <Chip label="Tú" size="small" color="success" sx={{ ml: 1.5, height: 20, fontSize: '0.7rem' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={user.rol_display} color={user.rol === 'ADMIN' ? 'primary' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="outlined" 
                        color="success"
                        startIcon={<SettingsSuggestIcon />}
                        disabled={botonBloqueado}
                        onClick={() => navigate(`/Listadousuarios/acceso-rol/${user.id}`)} 
                        sx={{
                          '&.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
                            color: '#a0a0a0',
                            borderColor: '#e0e0e0'
                          }
                        }}
                      >
                        Administrar Acceso
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar open={snackbar.abierto} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, abierto: false})}>
        <Alert severity={snackbar.tipo}>{snackbar.mensaje}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UsuarioAcceso;
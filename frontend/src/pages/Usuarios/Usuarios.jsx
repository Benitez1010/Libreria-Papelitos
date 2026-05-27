import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Chip, Snackbar, Alert,
  CircularProgress
} from '@mui/material';
import { Block, CheckCircle } from '@mui/icons-material';
import { ENDPOINTS } from '../../services/api';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [accion, setAccion] = useState(''); // 'desactivar' o 'reactivar'
  const [snackbar, setSnackbar] = useState({ abierto: false, mensaje: '', tipo: 'success' });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/usuarios/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        setSnackbar({
          abierto: true,
          mensaje: 'Error al cargar usuarios',
          tipo: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        abierto: true,
        mensaje: 'Error de conexión',
        tipo: 'error'
      });
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = (usuario, tipoAccion) => {
    setUsuarioSeleccionado(usuario);
    setAccion(tipoAccion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setAccion('');
  };

  const ejecutarAccion = async () => {
    if (!usuarioSeleccionado || !accion) return;

    const token = localStorage.getItem('token');
    const endpoint = accion === 'desactivar' ? 'desactivar' : 'reactivar';
    
    try {
      const response = await fetch(
        `${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/usuarios/${usuarioSeleccionado.id}/${endpoint}/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          abierto: true,
          mensaje: data.mensaje,
          tipo: 'success'
        });
        // Recargar lista de usuarios
        obtenerUsuarios();
      } else {
        setSnackbar({
          abierto: true,
          mensaje: data.error || `Error al ${accion} usuario`,
          tipo: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        abierto: true,
        mensaje: 'Error de conexión',
        tipo: 'error'
      });
    } finally {
      cerrarModal();
    }
  };

  const cerrarSnackbar = () => {
    setSnackbar({ ...snackbar, abierto: false });
  };

  const getColorRol = (rol) => {
    return rol === 'ADMIN' ? 'primary' : 'default';
  };

  const getColorEstado = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1E5631' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ color: '#1E5631', mb: 3 }}>
        Gestión de Usuarios
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1E5631' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Registro</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow
                key={usuario.id}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(30, 86, 49, 0.05)' },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell>{usuario.id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{usuario.username}</TableCell>
                <TableCell>
                  <Chip
                    label={usuario.rol_display || usuario.rol}
                    color={getColorRol(usuario.rol)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={usuario.estado || (usuario.is_active ? 'Activo' : 'Inactivo')}
                    color={getColorEstado(usuario.is_active)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  {new Date(usuario.date_joined).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell>
                  {usuario.is_active ? (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Block />}
                      onClick={() => abrirModal(usuario, 'desactivar')}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        }
                      }}
                    >
                      Dar de Baja
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => abrirModal(usuario, 'reactivar')}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        }
                      }}
                    >
                      Reactivar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ========== MODAL DE CONFIRMACIÓN ========== */}
      <Dialog
        open={modalAbierto}
        onClose={cerrarModal}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: '400px' }
        }}
      >
        <DialogTitle sx={{ color: '#1E5631', fontWeight: 'bold' }}>
          {accion === 'desactivar' ? 'Confirmar Desactivación' : 'Confirmar Reactivación'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {accion === 'desactivar' ? (
              <>
                ¿Está seguro que desea desactivar al usuario{' '}
                <strong>{usuarioSeleccionado?.username}</strong>?
                <br /><br />
                Esta acción impedirá que el usuario inicie sesión, pero su historial de acciones se mantendrá.
              </>
            ) : (
              <>
                ¿Está seguro que desea reactivar al usuario{' '}
                <strong>{usuarioSeleccionado?.username}</strong>?
                <br /><br />
                El usuario podrá volver a iniciar sesión en el sistema.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={cerrarModal}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              color: '#666',
              borderColor: '#ccc'
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={ejecutarAccion}
            variant="contained"
            color={accion === 'desactivar' ? 'error' : 'success'}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {accion === 'desactivar' ? 'Dar de Baja' : 'Reactivar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== SNACKBAR (MENSAJES) ========== */}
      <Snackbar
        open={snackbar.abierto}
        autoHideDuration={4000}
        onClose={cerrarSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={cerrarSnackbar}
          severity={snackbar.tipo}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Usuarios;
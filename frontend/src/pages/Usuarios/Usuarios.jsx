import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,TablePagination, Button, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Chip, Snackbar, Alert,
  CircularProgress, TextField, Grid, MenuItem, FormControl,
  InputLabel, Select, FormHelperText
} from '@mui/material';
import { Block, CheckCircle, PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material';
import GroupIcon from '@mui/icons-material/Group';
import { IconButton, InputAdornment } from '@mui/material';
import { ENDPOINTS } from '../../services/api';

const ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'BODEGA', label: 'Operador de Bodega' },
  { value: 'CAJA', label: 'Operador de Caja' },
];

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [accion, setAccion] = useState('');
  const [snackbar, setSnackbar] = useState({ abierto: false, mensaje: '', tipo: 'success' });

  
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    username: '',
    email: '',
    password: '',
    rol: 'BODEGA'
  });
  const [errores, setErrores] = useState({});
  const [cargandoRegistro, setCargandoRegistro] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para saber si el usuario actual es admin
  const [usuarioActual, setUsuarioActual] = useState(null);

  //para busqueda
  const [busqueda, setBusqueda] = useState('');

  //para paginacion
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(25);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // Obtener usuario actual para saber si es admin
  useEffect(() => {
    const obtenerUsuarioActual = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/me/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUsuarioActual(data);
        }
      } catch (error) {
        console.error('Error al obtener usuario actual:', error);
      }
    };
    obtenerUsuarioActual();
  }, []);

  const obtenerUsuarios = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/usuarios/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
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
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSnackbar({ abierto: true, mensaje: data.mensaje, tipo: 'success' });
        obtenerUsuarios();
      } else {
        setSnackbar({ abierto: true, mensaje: data.error || `Error al ${accion} usuario`, tipo: 'error' });
      }
    } catch (error) {
      setSnackbar({ abierto: true, mensaje: 'Error de conexión', tipo: 'error' });
    } finally {
      cerrarModal();
    }
  };

  const cerrarSnackbar = () => {
    setSnackbar({ ...snackbar, abierto: false });
  };

  const getColorRol = (rol) => rol === 'ADMIN' ? 'primary' : 'default';
  const getColorEstado = (isActive) => isActive ? 'success' : 'error';

  // ========== FUNCIONES DE REGISTRO ==========
  const abrirModalRegistro = () => {
    setFormData({ nombre_completo: '', username: '', email: '', password: '', rol: 'BODEGA' });
    setErrores({});
    setModalRegistroAbierto(true);
  };

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false);
    setErrores({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errores[name]) {
      setErrores({ ...errores, [name]: '' });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

    const evaluarFortaleza = (password) => {
    let puntos = 0;
    if (password.length >= 8) puntos += 1;
    if (password.length >= 12) puntos += 1;
    if (/[A-Z]/.test(password)) puntos += 1;
    if (/[0-9]/.test(password)) puntos += 1;
    if (/[^A-Za-z0-9]/.test(password)) puntos += 1;
    
    if (puntos <= 2) return { nivel: 'Débil', color: '#d32f2f', ancho: 33 };
    if (puntos <= 4) return { nivel: 'Media', color: '#f9a825', ancho: 66 };
    return { nivel: 'Fuerte', color: '#2e7d32', ancho: 100 };
  };

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busqueda.toLowerCase())
  ).sort((a, b) => a.username.localeCompare(b.username));

    const handleChangePage = (event, newPage) => {
    setPagina(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };
  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.nombre_completo.trim()) nuevosErrores.nombre_completo = 'El nombre completo es obligatorio';
    if (!formData.username.trim()) nuevosErrores.username = 'El nombre de usuario es obligatorio';
    if (!formData.email.trim()) nuevosErrores.email = 'El correo electrónico es obligatorio';
    if (!formData.password) nuevosErrores.password = 'La contraseña es obligatoria';
    else if (formData.password.length < 8) nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const registrarUsuario = async () => {
    if (!validarFormulario()) return;

    setCargandoRegistro(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/usuarios/registrar/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSnackbar({ abierto: true, mensaje: 'Usuario creado con éxito.', tipo: 'success' });
        cerrarModalRegistro();
        obtenerUsuarios();
      } else {
        const mensajeError = data.username?.[0] || data.email?.[0] || data.nombre_completo?.[0] || data.password?.[0] || 'Error al crear usuario';
        setSnackbar({ abierto: true, mensaje: mensajeError, tipo: 'error' });
      }
    } catch (error) {
      setSnackbar({ abierto: true, mensaje: 'Error de conexión', tipo: 'error' });
    } finally {
      setCargandoRegistro(false);
    }
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1E5631' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupIcon sx={{ fontSize: 40, color: '#1E5631' }} />
          <Typography variant="h4" fontWeight="bold">
            Gestión de Usuarios
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            size="small"
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              minWidth: '250px'
            }}
          />
          {usuarioActual?.rol === 'ADMIN' && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={abrirModalRegistro}
              sx={{
                backgroundColor: '#1E5631',
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { backgroundColor: '#143D22' }
              }}
            >
              Nuevo Usuario
            </Button>
          )}
        </Box>
      </Box>
      

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
             <TableRow sx={{ backgroundColor: '#1E5631' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre Completo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Correo Electrónico</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Registro</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                        {usuariosFiltrados
              .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
              .map((usuario) => (
                <TableRow key={usuario.id} sx={{ '&:hover': { backgroundColor: 'rgba(30, 86, 49, 0.05)' } }}>
                <TableCell>{usuario.id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{usuario.username}</TableCell>
                <TableCell>{usuario.nombre_completo || '—'}</TableCell>
                <TableCell sx={{ fontStyle: usuario.rol === 'ADMIN' ? 'arial' : 'normal', color: usuario.rol === 'ADMIN' ? '#000000' : 'inherit' }}>
                  {(usuario.email || '—')}
                </TableCell>
                <TableCell>
                  <Chip label={usuario.rol_display || usuario.rol} color={getColorRol(usuario.rol)} size="small" sx={{ fontWeight: 500 }} />
                </TableCell>
                <TableCell>
                  <Chip label={usuario.estado || (usuario.is_active ? 'Activo' : 'Inactivo')} color={getColorEstado(usuario.is_active)} size="small" sx={{ fontWeight: 500 }} />
                </TableCell>
                <TableCell>{new Date(usuario.date_joined).toLocaleDateString('es-ES')}</TableCell>
                <TableCell>
                  {usuario.is_active ? (
                    <Button variant="outlined" color="error" size="small" startIcon={<Block />} onClick={() => abrirModal(usuario, 'desactivar')} sx={{ textTransform: 'none', borderRadius: 2 }}>
                      Dar de Baja
                    </Button>
                  ) : (
                    <Button variant="outlined" color="success" size="small" startIcon={<CheckCircle />} onClick={() => abrirModal(usuario, 'reactivar')} sx={{ textTransform: 'none', borderRadius: 2 }}>
                      Reactivar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

           <TablePagination
        component="div"
        count={usuariosFiltrados.length}
        page={pagina}
        onPageChange={handleChangePage}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[25, 50, 100]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          '& .MuiTablePagination-toolbar': { backgroundColor: 'white', borderRadius: '0 0 12px 12px' },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { color: '#1E5631', fontWeight: 500 },
        }}
      />

      {/* ========== MODAL DAR DE BAJA / REACTIVAR ========== */}
      <Dialog open={modalAbierto} onClose={cerrarModal} PaperProps={{ sx: { borderRadius: 3, minWidth: '400px' } }}>
        <DialogTitle sx={{ color: '#1E5631', fontWeight: 'bold' }}>
          {accion === 'desactivar' ? 'Confirmar Desactivación' : 'Confirmar Reactivación'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {accion === 'desactivar' ? (
              <span>
                ¿Está seguro que desea desactivar al usuario <strong>{usuarioSeleccionado?.username}</strong>?
                <br /><br />
                Esta acción impedirá que el usuario inicie sesión, pero su historial de acciones se mantendrá.
              </span>
            ) : (
              <span>
                ¿Está seguro que desea reactivar al usuario <strong>{usuarioSeleccionado?.username}</strong>?
                <br /><br />
                El usuario podrá volver a iniciar sesión en el sistema.
              </span>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={cerrarModal} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, color: '#666', borderColor: '#ccc' }}>Cancelar</Button>
          <Button onClick={ejecutarAccion} variant="contained" color={accion === 'desactivar' ? 'error' : 'success'} sx={{ textTransform: 'none', borderRadius: 2 }}>
            {accion === 'desactivar' ? 'Dar de Baja' : 'Reactivar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/*  MODAL REGISTRO DE NUEVO USUARIO */}
      <Dialog open={modalRegistroAbierto} onClose={cerrarModalRegistro} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#1E5631', fontWeight: 'bold' }}>
          Registrar Nuevo Usuario
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  error={!!errores.nombre_completo}
                  helperText={errores.nombre_completo}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de Usuario"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errores.username}
                  helperText={errores.username}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
                            <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errores.email}
                  helperText={errores.email}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errores.password}
                  helperText={errores.password || 'Mínimo 8 caracteres'}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleShowPassword}
                            edge="end"
                            sx={{ color: '#666' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ 
                    '& input::-ms-reveal': { display: 'none' },
                    '& input::-webkit-textfield-decoration-container': { display: 'none' },
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
                   <Box sx={{ mt: 1, mb: 1, minHeight: 32 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 500, color: '#666' }}>
                      Fortaleza:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: formData.password ? evaluarFortaleza(formData.password).color : '#999' }}>
                      {formData.password ? evaluarFortaleza(formData.password).nivel : '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{
                      width: formData.password ? `${evaluarFortaleza(formData.password).ancho}%` : '0%',
                      height: '100%',
                      backgroundColor: formData.password ? evaluarFortaleza(formData.password).color : 'transparent',
                      transition: 'all 0.3s ease',
                      borderRadius: 3
                    }} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errores.rol}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    name="rol"
                    value={formData.rol}
                    label="Rol"
                    onChange={handleChange}
                    sx={{ borderRadius: 2 }}
                  >
                    {ROLES.map((rol) => (
                      <MenuItem key={rol.value} value={rol.value}>{rol.label}</MenuItem>
                    ))}
                  </Select>
                  {errores.rol && <FormHelperText>{errores.rol}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={cerrarModalRegistro} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, color: '#666', borderColor: '#ccc' }}>
            Cancelar
          </Button>
          <Button
            onClick={registrarUsuario}
            variant="contained"
            disabled={cargandoRegistro}
            sx={{
              backgroundColor: '#1E5631',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { backgroundColor: '#143D22' }
            }}
          >
            {cargandoRegistro ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== SNACKBAR ========== */}
      <Snackbar open={snackbar.abierto} autoHideDuration={4000} onClose={cerrarSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={cerrarSnackbar} severity={snackbar.tipo} variant="filled" sx={{ boxShadow: 3, borderRadius: '8px' }}>
          {snackbar.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Usuarios;
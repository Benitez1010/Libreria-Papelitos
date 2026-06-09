import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, 
  CircularProgress, TextField, InputAdornment, Button, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../services/api';
import EditarCategoria from './EditarCategoria';
import RegistrarCategoriaModal from './RegistrarCategoriaModal';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de seguridad
  const [esAdmin, setEsAdmin] = useState(false);
  const [permisos, setPermisos] = useState({});
  
  // Estados para controlar el Modal Externo
  const [modalOpen, setModalOpen] = useState(false);
  // AGREGAR ESTA LÍNEA JUNTO A LOS DEMÁS STATE:
const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [alertaGlobal, setAlertaGlobal] = useState({ tipo: '', mensaje: '' });
  const navigate = useNavigate();
  const verdePapelitos = '#1E5631';

  useEffect(() => {
    const inicializarDatos = async () => {
      const token = localStorage.getItem('token');
      try {
        // 1. Obtener los permisos del usuario logueado
        if (token) {
          const resUser = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/me/`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            }
          });
          if (resUser.ok) {
            const dataUser = await resUser.json();
            setEsAdmin(dataUser.rol === 'ADMIN');
            setPermisos(dataUser.permisos || {});
          }
        }

        // 2. Cargar las categorías
        const response = await fetch(ENDPOINTS.INVENTARIO.CATEGORIAS);
        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };

    inicializarDatos();
  }, []);

  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
      const response = await fetch(`${ENDPOINTS.INVENTARIO.CATEGORIAS}${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlertaGlobal({ tipo: 'success', mensaje: 'Categoría eliminada correctamente.' });
        // Recargar categorías manualmente sin volver a pedir el usuario
        const resCat = await fetch(ENDPOINTS.INVENTARIO.CATEGORIAS);
        if (resCat.ok) setCategorias(await resCat.json());
        
        setTimeout(() => setAlertaGlobal({ tipo: '', mensaje: '' }), 3000);
      } else {
        setAlertaGlobal({ 
          tipo: 'error', 
          mensaje: 'No se puede eliminar: existen productos vinculados a esta categoría.' 
        });
      }
    } catch (error) {
      setAlertaGlobal({ tipo: 'error', mensaje: 'Error de conexión con el backend.' });
    }
  };

  const categoriasFiltradas = categorias
    .filter((cat) => cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Validaciones booleanas para pintar o esconder la UI
  const puedeAgregar = esAdmin || permisos.categorias?.agregar;
  const puedeEditar = esAdmin || permisos.categorias?.editar;
  const puedeEliminar = esAdmin || permisos.categorias?.eliminar;

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress color="success" /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <CategoryIcon sx={{ color: verdePapelitos, fontSize: 35 }} />
        <Typography variant="h4" fontWeight="bold" color={verdePapelitos}>Listado de Categorías</Typography>
      </Box>

      {alertaGlobal.mensaje && <Alert severity={alertaGlobal.tipo} sx={{ mb: 3 }}>{alertaGlobal.mensaje}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          size="small"
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: verdePapelitos }} /></InputAdornment> }}
          sx={{ backgroundColor: '#fff', width: '350px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
        
        {/* CONDICIONAL: Botón Agregar */}
        {puedeAgregar && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalCrearOpen(true)} sx={{ backgroundColor: verdePapelitos, '&:hover': { backgroundColor: '#143d22' }, borderRadius: '8px', textTransform: 'none' }}>
            Agregar Categoría
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: verdePapelitos }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>NOMBRE DE LA CATEGORÍA</TableCell>
              {(puedeEditar || puedeEliminar) && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>ACCIONES</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map((cat) => (
                <TableRow key={cat.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>#{cat.id}</TableCell>
                  <TableCell>{cat.nombre}</TableCell>
                  
                  {(puedeEditar || puedeEliminar) && (
                    <TableCell sx={{ textAlign: 'center' }}>
                      {/* CONDICIONAL: Botón Editar */}
                      {puedeEditar && (
                        <Tooltip title="Editar Categoría">
                          <IconButton onClick={() => { setCategoriaSeleccionada(cat); setModalOpen(true); }} sx={{ color: verdePapelitos, mr: 1 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* CONDICIONAL: Botón Eliminar */}
                      {puedeEliminar && (
                        <Tooltip title="Eliminar Categoría">
                          <IconButton onClick={() => handleEliminarCategoria(cat.id)} sx={{ color: '#d32f2f' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={(puedeEditar || puedeEliminar) ? 3 : 2} sx={{ textAlign: 'center', py: 4 }}>
                  No se encontraron categorías.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <RegistrarCategoriaModal 
        open={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onSuccess={async () => {
          // Refresca la tabla automáticamente consultando a Django
          const response = await fetch(ENDPOINTS.INVENTARIO.CATEGORIAS);
          if (response.ok) setCategorias(await response.json());
          
          // Muestra la alerta verde de éxito
          setAlertaGlobal({ tipo: 'success', mensaje: 'Categoría guardada correctamente.' });
          setTimeout(() => setAlertaGlobal({ tipo: '', mensaje: '' }), 3000);
        }}
      />

      {/* LLAMADA AL COMPONENTE HIJO (MODAL) */}
      {categoriaSeleccionada && (
        <EditarCategoria 
          open={modalOpen} 
          onClose={() => { setModalOpen(false); setCategoriaSeleccionada(null); }} 
          categoria={categoriaSeleccionada}
          onSuccess={() => { 
            // Recarga las categorías limpiamente
            fetch(ENDPOINTS.INVENTARIO.CATEGORIAS).then(res => res.json()).then(data => setCategorias(data));
            setAlertaGlobal({ tipo: 'success', mensaje: 'Categoría actualizada correctamente.' }); 
            setTimeout(() => setAlertaGlobal({ tipo: '', mensaje: '' }), 3000); 
          }}
        />
      )}
    </Box>
  );
};

export default Categorias;
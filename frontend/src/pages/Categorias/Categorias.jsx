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
import EditarCategoria from './EditarCategoria'; // IMPORTAMOS TU OTRA TAREA DE JIRA

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para controlar el Modal Externo
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [alertaGlobal, setAlertaGlobal] = useState({ tipo: '', mensaje: '' });
  const navigate = useNavigate();
  const verdePapelitos = '#1E5631';

  const cargarCategorias = async () => {
    try {
      const response = await fetch(ENDPOINTS.INVENTARIO.CATEGORIAS);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
      const response = await fetch(`${ENDPOINTS.INVENTARIO.CATEGORIAS}${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlertaGlobal({ tipo: 'success', mensaje: 'Categoría eliminada correctamente.' });
        cargarCategorias();
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

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/categorias/nuevo')} sx={{ backgroundColor: verdePapelitos, '&:hover': { backgroundColor: '#143d22' }, borderRadius: '8px', textTransform: 'none' }}>
          Agregar Categoría
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: verdePapelitos }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>NOMBRE DE LA CATEGORÍA</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map((cat) => (
                <TableRow key={cat.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>#{cat.id}</TableCell>
                  <TableCell>{cat.nombre}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title="Editar Categoría">
                      <IconButton onClick={() => { setCategoriaSeleccionada(cat); setModalOpen(true); }} sx={{ color: verdePapelitos, mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Categoría">
                      <IconButton onClick={() => handleEliminarCategoria(cat.id)} sx={{ color: '#d32f2f' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>No se encontraron categorías.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* LLAMADA AL COMPONENTE HIJO (MODAL) */}
      {categoriaSeleccionada && (
        <EditarCategoria 
          open={modalOpen} 
          onClose={() => { setModalOpen(false); setCategoriaSeleccionada(null); }} 
          categoria={categoriaSeleccionada}
          onSuccess={() => { cargarCategorias(); setAlertaGlobal({ tipo: 'success', mensaje: 'Categoría actualizada correctamente.' }); setTimeout(() => setAlertaGlobal({ tipo: '', mensaje: '' }), 3000); }}
        />
      )}
    </Box>
  );
};

export default Categorias;
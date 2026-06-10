import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Alert, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, InputAdornment, 
  Button, IconButton, Tooltip, CircularProgress, FormControl, Select, 
  MenuItem, TablePagination 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ENDPOINTS } from '../../services/api';
import RegistrarProductoModal from './RegistrarProductoModal';

// IMPORTACIONES DE COMPONENTES REUTILIZABLES
import BotonTransacciones from '../../components/BotonTransacciones';
import BotonExportar from '../../components/BotonExportar';

const ListaProductos = () => {
  const navigate = useNavigate();

  // Paleta de colores institucional
  const verdePapelitos = '#1E5631';

  // Estados de datos
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioInfo, setUsuarioInfo] = useState(null); // Estado para permisos
  
  // Estados para Búsqueda y Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Estados para Paginación (Iniciando en 10 por página)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Control de errores / alertas
  const [alertaGlobal, setAlertaGlobal] = useState({ tipo: '', mensaje: '' });

  // Modal de registro
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);

  // Función principal de carga de datos
  const obtenerDatosInventario = async (esRecargaManual = false) => {
    if (esRecargaManual) setCargando(true);
    const token = localStorage.getItem('token');
    
    try {
      const [respuestaProductos, respuestaCategorias, respuestaUsuario] = await Promise.all([
        fetch(ENDPOINTS.INVENTARIO.PRODUCTOS),
        fetch(ENDPOINTS.INVENTARIO.CATEGORIAS),
        fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/me/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
      ]);

      if (respuestaProductos.ok && respuestaCategorias.ok && respuestaUsuario.ok) {
        const datosProductos = await respuestaProductos.json();
        const datosCategorias = await respuestaCategorias.json();
        const datosUsuario = await respuestaUsuario.json();
        
        setProductos(datosProductos);
        setCategorias(datosCategorias);
        setUsuarioInfo(datosUsuario);
        
        if (esRecargaManual) {
          setAlertaGlobal({ tipo: 'success', mensaje: 'Tabla actualizada con los últimos datos.' });
          setTimeout(() => setAlertaGlobal({ tipo: '', mensaje: '' }), 3000);
        }
      } else {
        setAlertaGlobal({ tipo: 'error', mensaje: 'Error al recuperar los registros del servidor.' });
      }
    } catch (error) {
      setAlertaGlobal({ tipo: 'error', mensaje: 'No se pudo establecer conexión con la base de datos.' });
    } finally {
      setCargando(false);
    }
  };

  // Efecto de carga inicial
  useEffect(() => {
    obtenerDatosInventario();
  }, []);

  // Lógica de Permisos
  const rol = usuarioInfo?.rol || '';
  const esAdmin = rol === 'ADMIN' || rol === 'Administrador';
  const esBodega = rol === 'BODEGA' || rol === 'Operador de Bodega';

  const puedeExportar = esAdmin;
  const puedeGestionarProducto = esAdmin || esBodega; // Agregar, Editar, 
  const puedeEliminarProducto = esAdmin; // Solo eliminar para Admin
  

  // Función del Botón "Recargar"
  const handleRecargarTabla = () => {
    setPage(0);
    obtenerDatosInventario(true);
  };

  // Función: Eliminar Producto
  const handleEliminarProducto = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    try {
      const response = await fetch(`${ENDPOINTS.INVENTARIO.PRODUCTOS}${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProductos(productos.filter((producto) => producto.id !== id));
        setAlertaGlobal({ tipo: 'success', mensaje: 'Producto eliminado correctamente del inventario.' });
        setTimeout(() => setAlertaGlobal({ tipo: '', mensaje: '' }), 3000);
      } else {
        setAlertaGlobal({ 
          tipo: 'error', 
          mensaje: 'No se puede eliminar: el producto tiene existencias o movimientos registrados.' 
        });
        setTimeout(() => setAlertaGlobal({ tipo: '', mensaje: '' }), 4000);
      }
    } catch (error) {
      setAlertaGlobal({ tipo: 'error', mensaje: 'Error de red al intentar eliminar el producto.' });
      setTimeout(() => setAlertaGlobal({ tipo: '', mensaje: '' }), 4000);
    }
  };

  // Manejadores de cambios en los filtros
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleCategoryChange = (e) => {
    setFiltroCategoria(e.target.value);
    setPage(0);
  };

  // Lógica de filtrado en vivo
  const productosFiltrados = productos.filter((producto) => {
    const termino = searchTerm.toLowerCase();
    const coincideBusqueda = 
      producto.nombre.toLowerCase().includes(termino) || 
      String(producto.id).toLowerCase().includes(termino);

    const coincideCategoria = 
      filtroCategoria === '' || 
      String(producto.categoria_id) === String(filtroCategoria) ||
      producto.categoria === filtroCategoria;

    return coincideBusqueda && coincideCategoria;
  });

  // Funciones de Paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const productosPaginados = productosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress sx={{ color: verdePapelitos }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <InventoryIcon sx={{ color: verdePapelitos, fontSize: 35 }} />
        <Typography variant="h4" fontWeight="bold" color={verdePapelitos}>
          Listado de Productos
        </Typography>
      </Box>

      {alertaGlobal.mensaje && (
        <Alert severity={alertaGlobal.tipo} sx={{ mb: 3 }}>
          {alertaGlobal.mensaje}
        </Alert>
      )}

      {/* Barra de Herramientas Principal */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        
        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
          <TextField
            size="small"
            placeholder="Buscar por ID o Nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: verdePapelitos }} />
                </InputAdornment>
              ) 
            }}
            sx={{ backgroundColor: '#fff', width: '350px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />

          <FormControl size="small" sx={{ minWidth: 200, backgroundColor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
            <Select
              displayEmpty
              value={filtroCategoria}
              onChange={handleCategoryChange}
            >
              <MenuItem value="">
                <em>Todas las categorías</em>
              </MenuItem>
              {categorias.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Panel de Opciones Integrado y Botones de Acción */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          
          <Button 
            onClick={handleRecargarTabla} 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            sx={{ 
              backgroundColor: '#fff', 
              color: '#424242', 
              borderColor: '#bdbdbd', 
              textTransform: 'none', 
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#9e9e9e' } 
            }}
          >
            Recargar
          </Button>

          {/* COMPONENTE DE EXPORTACIÓN (Solo Admin) */}
          {puedeExportar && <BotonExportar />}

          {/* COMPONENTE DE TRANSACCIONES INTEGRADO */}
          <BotonTransacciones />

          {/* Botón original de Agregar Producto (Solo Admin) */}
          {puedeGestionarProducto && (
            <Button 
              onClick={() => setModalAgregarOpen(true)}
              variant="contained" 
              startIcon={<AddIcon />} 
              sx={{ backgroundColor: verdePapelitos, '&:hover': { backgroundColor: '#143d22' }, borderRadius: '8px', textTransform: 'none' }}
            >
              Agregar Producto
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabla e Integración de Paginación */}
      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: verdePapelitos }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>NOMBRE DEL PRODUCTO</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>CATEGORÍA</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>BODEGA</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>VITRINA</TableCell>
                {(puedeGestionarProducto || puedeEliminarProducto) && (
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>ACCIONES</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {productosPaginados.length > 0 ? (
                productosPaginados.map((producto) => (
                  <TableRow key={producto.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>#{producto.id}</TableCell>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>{producto.categoria_nombre || producto.categoria}</TableCell>
                    
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: verdePapelitos }}>
                      {producto.stock_bodega ?? producto.cantidad_inicial}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                      {producto.stock_vitrina ?? 0}
                    </TableCell>

                    {/* Celda de Acciones - Lógica separada por permisos */}
                  {(puedeGestionarProducto || puedeEliminarProducto) && (
                    <TableCell align="center">
                      {/* El Administrador y Bodega pueden editar */}
                      {puedeGestionarProducto && (
                        <Tooltip title="Editar Producto">
                          <IconButton 
                            onClick={() => navigate(`/productos/editar/${producto.id}`)} 
                            sx={{ color: verdePapelitos, mr: 0.5 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* SOLO el Administrador puede eliminar */}
                      {puedeEliminarProducto && (
                        <Tooltip title="Eliminar Producto">
                          <IconButton 
                            onClick={() => handleEliminarProducto(producto.id)} 
                            sx={{ color: '#d32f2f' }}
                          >
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
                  <TableCell colSpan={puedeGestionarProducto ? 6 : 5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    No se encontraron productos que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Componente de Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={productosFiltrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
        />
      </Paper>
    
      <RegistrarProductoModal 
        open={modalAgregarOpen}
        onClose={() => setModalAgregarOpen(false)}
        onSuccess={() => obtenerDatosInventario(false)} 
      />
    </Box>
  );
};

export default ListaProductos;
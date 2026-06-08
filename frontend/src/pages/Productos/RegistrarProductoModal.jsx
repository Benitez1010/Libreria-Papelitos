import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Box, Typography, Alert, MenuItem, 
  InputLabel, Select, FormControl, Dialog, DialogContent, DialogTitle, IconButton 
} from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import CloseIcon from '@mui/icons-material/Close';
import { ENDPOINTS } from '../../services/api';

const RegistrarProductoModal = ({ open, onClose, onSuccess }) => {
  const navigate = useNavigate();

  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [cantidadInicial, setCantidadInicial] = useState(0);
  
  // Estados de Control
  const [categorias, setCategorias] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorServidor, setErrorServidor] = useState('');
  const [sugerenciaId, setSugerenciaId] = useState(null);

  // Cargar categorías para el desplegable (Select) cada vez que el modal se abre
  useEffect(() => {
    if (!open) return;

    const obtenerCategorias = async () => {
      try {
        const response = await fetch(ENDPOINTS.INVENTARIO.CATEGORIAS);
        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
        }
      } catch (error) {
        setErrorServidor("No se pudieron cargar las categorías del catálogo.");
      }
    };
    obtenerCategorias();
  }, [open]);

  // Limpieza total al cerrar el modal
  const manejarCierre = () => {
    setNombre('');
    setCategoriaId('');
    setCantidadInicial(0);
    setMensajeExito('');
    setErrorServidor('');
    setSugerenciaId(null);
    onClose();
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setErrorServidor('');
    setSugerenciaId(null);

    const productoPayload = {
      nombre: nombre,
      categoria: categoriaId,
      cantidad_inicial: parseInt(cantidadInicial, 10)
    };

    try {
      const response = await fetch(ENDPOINTS.INVENTARIO.PRODUCTOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoPayload),
      });

      // Validamos la respuesta antes de intentar transformarla a JSON
      if (response.ok) {
        const data = await response.json();
        setMensajeExito(data.message || "Producto registrado con éxito.");
        
        // CORRECCIÓN: Limpiamos los inputs del formulario de inmediato
        setNombre('');
        setCategoriaId('');
        setCantidadInicial(0);

        // Dejamos que el usuario vea el mensaje verde por 1 segundo, luego cerramos y refrescamos
        setTimeout(() => {
          // 1. Cerramos el modal limpiamente llamando a la función local
          manejarCierre();
          
          // 2. Una vez cerrado, le avisamos al padre que refresque la tabla sin interferencias
          if (onSuccess) onSuccess();
        }, 1200);

      } else {
        // Si la respuesta no es OK, procesamos los errores controlados de Django
        const data = await response.json();
        if (data.error_type === "PRODUCTO_DUPLICADO") {
          setErrorServidor(data.message);
          setSugerenciaId(data.producto_id);
        } else if (data.errors?.nombre) {
          setErrorServidor(`Error en el nombre: ${data.errors.nombre[0]}`);
        } else {
          setErrorServidor("Error al registrar: Verifica que los campos sean válidos.");
        }
      }
    } catch (error) {
      // Este bloque no se disparará falsamente porque la recarga ocurre POST-cierre
      setErrorServidor("Error de conexión con el servidor backend.");
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={manejarCierre}
      fullWidth
      maxWidth="xs" // Mantiene una anchura compacta de formulario
    >
      {/* Título superior con botón X de cierre */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LibraryAddIcon color="success" />
          <Typography variant="h6" fontWeight="bold">
            Registrar Producto
          </Typography>
        </Box>
        <IconButton onClick={manejarCierre} aria-label="close" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {mensajeExito && <Alert severity="success" sx={{ mb: 2 }}>{mensajeExito}</Alert>}
        
        {errorServidor && (
          <Alert severity={sugerenciaId ? "warning" : "error"} sx={{ mb: 2 }}>
            {errorServidor}
            {sugerenciaId && (
              <Box sx={{ mt: 1.5 }}>
                <Button 
                  variant="contained" 
                  color="warning" 
                  size="small"
                  onClick={() => {
                    manejarCierre();
                    // Redirige dinámicamente usando el contexto de inventario
                    navigate(`/inventario/movimiento?contexto=entrada`); 
                  }}
                >
                  Ir a Entrada de Inventario
                </Button>
              </Box>
            )}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre del Producto"
            variant="outlined"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            sx={{ mb: 2.5, mt: 1 }}
          />

          <FormControl fullWidth required sx={{ mb: 2.5 }}>
            <InputLabel id="modal-categoria-select-label">Categoría</InputLabel>
            <Select
              labelId="modal-categoria-select-label"
              label="Categoría"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              {categorias.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Cantidad o Stock Inicial"
            variant="outlined"
            value={cantidadInicial}
            onChange={(e) => setCantidadInicial(e.target.value)}
            slotProps={{ htmlInput: { min: 0 } }}
            required
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="success"
            size="large"
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Registrar en Catálogo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrarProductoModal;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Grid 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ENDPOINTS } from '../../services/api';

const EditarProducto = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  const verdePapelitos = '#1E5631';

  // Estados
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });
  
  const [formData, setFormData] = useState({
    nombre: '',
    stock_minimo: 1, // Nuestro campo estrella para la ALT-03
    categoria_nombre: '', 
  });

  // Cargar los datos actuales del producto al entrar a la pantalla
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await fetch(`${ENDPOINTS.INVENTARIO.PRODUCTOS}${id}/`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            nombre: data.nombre,
            stock_minimo: data.stock_minimo,
            categoria_nombre: data.categoria_nombre || 'Sin categoría',
          });
        } else {
          setAlerta({ tipo: 'error', mensaje: 'No se pudo cargar la información del producto.' });
        }
      } catch (error) {
        setAlerta({ tipo: 'error', mensaje: 'Error de conexión con el servidor.' });
      } finally {
        setCargando(false);
      }
    };
    fetchProducto();
  }, [id]);

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Enviar los datos actualizados al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerta({ tipo: '', mensaje: '' });

    // Validación del lado del cliente (Criterio de Aceptación ALT-03)
    const stockMinimoNumerico = parseInt(formData.stock_minimo, 10);
    if (isNaN(stockMinimoNumerico) || stockMinimoNumerico <= 0) {
      setAlerta({ tipo: 'error', mensaje: 'El Stock Mínimo debe ser un número entero mayor a cero.' });
      return;
    }

    setGuardando(true);

    try {
      // Usamos PATCH porque solo queremos actualizar algunos campos, no todo el objeto
      const response = await fetch(`${ENDPOINTS.INVENTARIO.PRODUCTOS}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          stock_minimo: stockMinimoNumerico,
        }),
      });

      if (response.ok) {
        setAlerta({ tipo: 'success', mensaje: 'Parámetros del producto actualizados correctamente.' });
        setTimeout(() => navigate('/productos'), 2000); // Redirige a la lista después de 2 segundos
      } else {
        const errorData = await response.json();
        setAlerta({ tipo: 'error', mensaje: errorData.message || 'Error al guardar los cambios.' });
      }
    } catch (error) {
      setAlerta({ tipo: 'error', mensaje: 'Error de conexión al intentar actualizar.' });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress sx={{ color: verdePapelitos }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/productos')}
          sx={{ color: '#555' }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" color={verdePapelitos}>
          Configuración de Producto
        </Typography>
      </Box>

      {alerta.mensaje && (
        <Alert severity={alerta.tipo} sx={{ mb: 3 }}>
          {alerta.mensaje}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Campo de sólo lectura para referencia */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Categoría"
                value={formData.categoria_nombre}
                InputProps={{ readOnly: true }}
                disabled
                helperText="La categoría no se puede modificar desde aquí."
              />
            </Grid>

            {/* Nombre del Producto */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Producto"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Configuración de Parámetro de Alerta (ALT-03) */}
            <Grid item xs={12}>
              <Box sx={{ p: 3, backgroundColor: 'rgba(211, 47, 47, 0.05)', borderRadius: '8px', borderLeft: '4px solid #d32f2f' }}>
                <Typography variant="h6" color="#d32f2f" fontWeight="bold" mb={4}>
                  Parámetros de Alerta
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock Mínimo Permitido"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1 }} // Validación HTML base
                  helperText="Define en qué cantidad el sistema debe considerar el producto en nivel crítico y disparar la alerta."
                />
              </Box>
            </Grid>

            {/* Botón de Guardado */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={guardando}
                startIcon={guardando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ backgroundColor: verdePapelitos, '&:hover': { backgroundColor: '#143d22' }, py: 1.5, px: 4 }}
              >
                {guardando ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </Grid>
            
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditarProducto;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert, Paper, MenuItem, InputLabel, Select, FormControl } from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { ENDPOINTS } from '../../services/api';

const RegistrarProducto = () => {
  const navigate = useNavigate();

  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [cantidadInicial, setCantidadInicial] = useState(0);
  
  // Estados de Control
  const [categorias, setCategorias] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorServidor, setErrorServidor] = useState('');
  const [sugerenciaId, setSugerenciaId] = useState(null); // Guarda el ID si está duplicado

  // Cargar categorías para el desplegable (Select)
  useEffect(() => {
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
  }, []);

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

      const data = await response.json();

      if (response.ok) {
        // Criterio de Aceptación: Mensaje de confirmación verde
        setMensajeExito(data.message || "Producto registrado con éxito.");
        setNombre('');
        setCategoriaId('');
        setCantidadInicial(0);
        setTimeout(() => {
          navigate('/productos');
        }, 1500);
      } else {
        // Evaluamos el tipo de error directo que configuramos en Django
        if (data.error_type === "PRODUCTO_DUPLICADO") {
          setErrorServidor(data.message);
          setSugerenciaId(data.producto_id); // Activamos el botón amarillo de sugerencia
        } else if (data.errors?.nombre) {
          setErrorServidor(`Error en el nombre: ${data.errors.nombre[0]}`);
        } else {
          setErrorServidor("Error al registrar: Verifica que los campos sean válidos.");
        }
      }
    } catch (error) {
      setErrorServidor("Error de conexión con el servidor backend.");
    }
  };
  return (
    <Box sx={{ maxWidth: 550, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
          <LibraryAddIcon color="success" fontSize="large" />
          <Typography variant="h5" component="h1" fontWeight="bold">
            Registrar Producto
          </Typography>
        </Box>

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
                  onClick={() => navigate(``)} // Aquí iría la ruta real para actualizar stock, usando sugerenciaId
                >
                  Ir a Actualizar Stock
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
            sx={{ mb: 2.5 }}
          />

          <FormControl fullWidth required sx={{ mb: 2.5 }}>
            <InputLabel id="categoria-select-label">Categoría</InputLabel>
            <Select
              labelId="categoria-select-label"
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
          >
            Registrar en Catálogo
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default RegistrarProducto;
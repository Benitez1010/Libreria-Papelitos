import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, Paper } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import { ENDPOINTS } from '../../services/api';

const RegistrarCategoria = () => {
  // Estados para controlar el formulario y las respuestas de la API
  const [nombre, setNombre] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorServidor, setErrorServidor] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setErrorServidor('');

    try {
      // Conexión con el endpoint de Django
      const response = await fetch(ENDPOINTS.CATEGORIAS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nombre }), // Enviamos el nombre
      });

      const data = await response.json();

      if (response.ok) {
        // Criterio de Aceptación: Mostrar mensaje de éxito tras el guardado
        setMensajeExito(data.message || "Categoría registrada con éxito.");
        setNombre(''); // Limpiamos el formulario
      } else {
        // Captura los errores de validación de Django (ej. si ya existe)
        const errorMsg = data.errors?.nombre ? data.errors.nombre[0] : "Ocurrió un error inesperado.";
        setErrorServidor(errorMsg);
      }
    } catch (error) {
      setErrorServidor("No se pudo conectar con el servidor backend.");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      {/* Paper simula una tarjeta con sombra elegante de Material UI */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
          <CategoryIcon color="success" fontSize="large" />
          <Typography variant="h5" component="h1" fontWeight="bold">
            Registrar Categoría
          </Typography>
        </Box>

        {/* Notificaciones dinámicas basadas en los criterios de aceptación */}
        {mensajeExito && <Alert severity="success" sx={{ mb: 2 }}>{mensajeExito}</Alert>}
        {errorServidor && <Alert severity="error" sx={{ mb: 2 }}>{errorServidor}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre de la Categoría"
            variant="outlined"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            helperText="El sistema lo convertirá a mayúsculas automáticamente."
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="success"
            size="large"
          >
            Guardar Categoría
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default RegistrarCategoria;
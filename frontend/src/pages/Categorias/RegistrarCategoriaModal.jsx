import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
import { ENDPOINTS } from '../../services/api';

const RegistrarCategoriaModal = ({ open, onClose, onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorServidor, setErrorServidor] = useState('');


  const manejarCierre = () => {
    setNombre('');
    setMensajeExito('');
    setErrorServidor('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setErrorServidor('');

    try {
      const response = await fetch(ENDPOINTS.INVENTARIO.CATEGORIAS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nombre }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensajeExito(data.message || "Categoría registrada con éxito.");
        setNombre('');
        
        // Si pasaste una función para refrescar la lista del padre, la ejecuta
        if (onSuccess) onSuccess();
        
        // Opcional: Cerrar automáticamente el modal tras 1.5 segundos de éxito
        setTimeout(() => {
          manejarCierre();
        }, 1500);

      } else {
        const errorMsg = data.errors?.nombre ? data.errors.nombre[0] : "Ocurrió un error inesperado.";
        setErrorServidor(errorMsg);
      }
    } catch (error) {
      setErrorServidor("No se pudo conectar con el servidor backend.");
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={manejarCierre}
      fullWidth
      maxWidth="xs" 
    >
      {/* Título del Modal con botón de cerrar X integrado */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon color="success" />
          <Typography variant="h6" fontWeight="bold">
            Registrar Categoría
          </Typography>
        </Box>
        <IconButton onClick={manejarCierre} aria-label="close" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
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
            sx={{ mb: 3, mt: 1 }}
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
      </DialogContent>
    </Dialog>
  );
};

export default RegistrarCategoriaModal;
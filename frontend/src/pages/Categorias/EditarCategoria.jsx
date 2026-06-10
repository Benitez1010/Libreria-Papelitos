import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';
import { ENDPOINTS } from '../../services/api';

const EditarCategoria = ({ open, onClose, categoria, onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [errorModal, setErrorModal] = useState('');
  const verdePapelitos = '#1E5631';


  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre);
      setErrorModal('');
    }
  }, [categoria]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    const nombreLimpio = nombre.trim().toUpperCase();

    if (!nombreLimpio) {
      setErrorModal('El nombre de la categoría no puede estar vacío.');
      return;
    }

    try {
      const response = await fetch(`${ENDPOINTS.INVENTARIO.CATEGORIAS}${categoria.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreLimpio }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(); 
        onClose();   
      } else {
        // --- AQUÍ ESTÁ EL TRUCO DE TRADUCCIÓN ---
        let errorMsg = "Error al actualizar la categoría.";
        
        if (data.nombre && data.nombre[0]) {
          const mensajeBackend = data.nombre[0].toLowerCase();
          // Interceptamos cualquier variante de "ya existe" en inglés o español
          if (mensajeBackend.includes("already exists") || mensajeBackend.includes("existe")) {
            errorMsg = "Esta categoría ya se encuentra registrada.";
          } else {
            errorMsg = data.nombre[0];
          }
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
        
        setErrorModal(errorMsg);
      }
    } catch (error) {
      setErrorModal("No se pudo conectar con el servidor backend.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: '12px', p: 1, width: '400px' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: verdePapelitos, pb: 1 }}>
        Modificar Categoría
      </DialogTitle>
      <form onSubmit={handleGuardar}>
        <DialogContent>
          {errorModal && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{errorModal}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la Categoría"
            fullWidth
            variant="outlined"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            helperText="El sistema lo guardará en mayúsculas automáticamente."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} sx={{ color: '#666', textTransform: 'none' }}>Cancelar</Button>
          <Button 
            type="submit"
            variant="contained" 
            sx={{ backgroundColor: verdePapelitos, '&:hover': { backgroundColor: '#143d22' }, borderRadius: '6px', textTransform: 'none' }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditarCategoria;
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, FormControl, InputLabel, Select, MenuItem, Divider, CircularProgress 
} from '@mui/material';
import { ENDPOINTS } from '../../services/api'; // Ajusta según tu estructura de carpetas

const AccesoRol = ({ open, onClose, user, onSaveSuccess }) => {
  // Estado local para manejar el rol seleccionado dentro del modal
  const [nuevoRol, setNuevoRol] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cada vez que el usuario cambia (ej: abres el modal con otro usuario), actualizamos el estado
  useEffect(() => {
    if (user) {
      setNuevoRol(user.rol || '');
    }
  }, [user]);

  const handleGuardar = async () => {
    // 1. ESCUDO: Evitar peticiones a URLs rotas por falta de ID
    if (!user?.id) {
      alert("Error: No se encontró el ID del usuario.");
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${ENDPOINTS.USUARIOS}${user.id}/cambiar-rol/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rol: nuevoRol })
      });

      if (response.ok) {
        if (onSaveSuccess) onSaveSuccess(); // Notifica al padre
        onClose();       // Cierra el modal
        
       
        window.location.reload(); 
      } else {
     
        const text = await response.text();
        try {
            const errorData = JSON.parse(text);
            alert(errorData.error || "Error al actualizar el rol.");
        } catch {
            alert("Error en el servidor. Revisa la consola.");
            console.error("Respuesta del servidor no es JSON:", text);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', color: '#1E5631', pb: 1 }}>
        Cambiar Rol
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ mt: 1 }}>
        <TextField 
          fullWidth 
          margin="normal" 
          label="Usuario" 
          value={user?.username || ''} 
          disabled 
          variant="outlined"
          sx={{ mt: 1 }}
        />
        <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
          <InputLabel>Nuevo Rol</InputLabel>
          <Select 
            value={nuevoRol} 
            onChange={(e) => setNuevoRol(e.target.value)}
            label="Nuevo Rol"
          >
            <MenuItem value="ADMIN">Administrador</MenuItem>
            <MenuItem value="BODEGA">Operador de Bodega</MenuItem>
            <MenuItem value="CAJA">Operador de Caja</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#666', fontWeight: 'bold', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleGuardar} 
          disabled={cargando}
          sx={{ 
            bgcolor: '#1E5631', 
            '&:hover': { bgcolor: '#143d22' }, 
            fontWeight: 'bold', 
            textTransform: 'none',
            px: 3 
          }}
        >
          {cargando ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccesoRol;
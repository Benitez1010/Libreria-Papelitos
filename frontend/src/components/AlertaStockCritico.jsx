import React from 'react';
import { Snackbar, Alert, Typography } from '@mui/material';

const AlertaStockCritico = ({ open, onClose, productos }) => {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={8000} // Se oculta automáticamente tras 8 segundos
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {/* Usamos 'error' para que salga en un rojo intenso de advertencia */}
      <Alert 
        onClose={onClose} 
        severity="error" 
        variant="filled" // Le da un fondo de color sólido para resaltar más
        sx={{ width: '100%', boxShadow: 3, borderRadius: '8px' }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          ¡ALERTA DE REABASTECIMIENTO!
        </Typography>
        <Typography variant="body2">
          El stock ha llegado al nivel crítico en los siguientes productos:
        </Typography>
        <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
          {productos.map((prod, index) => (
            <li key={index}><strong>{prod}</strong></li>
          ))}
        </ul>
      </Alert>
    </Snackbar>
  );
};

export default AlertaStockCritico;
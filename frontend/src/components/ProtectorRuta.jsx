import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ENDPOINTS } from '../services/api';

const ProtectorRuta = ({ children, modulo }) => {
  const [autorizado, setAutorizado] = useState(null);

  useEffect(() => {
    const verificarPermiso = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAutorizado(false);
        return;
      }

      try {
        // Consultamos al backend en tiempo real para evitar hackeos por localStorage
        const res = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/me/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const esAdmin = data.rol === 'ADMIN';
          const permisos = data.permisos || {};

          // Si es Admin, o si el permiso de este módulo está en true, lo dejamos pasar
          if (esAdmin || permisos[modulo]?.master === true) {
            setAutorizado(true);
          } else {
            setAutorizado(false); // No tiene permiso
          }
        } else {
          setAutorizado(false);
        }
      } catch (error) {
        setAutorizado(false);
      }
    };

    verificarPermiso();
  }, [modulo]);

  // Mientras verifica en el backend, mostramos un loader de carga
  if (autorizado === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  // Si está autorizado, mostramos la vista. Si no, lo mandamos al inicio ("/")
  return autorizado ? children : <Navigate to="/" replace />;
};

export default ProtectorRuta;
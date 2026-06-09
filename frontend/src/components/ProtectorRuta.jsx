import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ENDPOINTS } from '../services/api';

const ProtectorRuta = ({ children, modulo }) => {
  const [autorizado, setAutorizado] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verificarPermiso = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAutorizado(false);
        return;
      }

      try {
        const res = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/me/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const rol = (data.rol || '').toUpperCase();
          
          const esAdmin = rol === 'ADMIN' || rol === 'ADMINISTRADOR';
          const esOperativo = rol === 'BODEGA' || rol === 'CAJA';

          // Lista de módulos que los operativos SIEMPRE pueden ver
          const modulosOperativos = [
            'productos', 
            'categorias', 
            'almacenamiento', 
            'movimientos', 
            'control_inventario'
          ];

          if (esAdmin) {
            setAutorizado(true);
          } else if (esOperativo && modulosOperativos.includes(modulo)) {
            setAutorizado(true);
          } else {
            setAutorizado(false);
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

  if (autorizado === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  return autorizado ? children : <Navigate to="/" replace state={{ from: location }} />;
};

export default ProtectorRuta;
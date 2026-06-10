import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ENDPOINTS } from '../services/api';

const ProtectorRuta = ({ children, modulo, accion = 'master' }) => {
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
        const urlMe = ENDPOINTS.SEGURIDAD.LOGIN.replace('login/', 'me/');
        const res = await fetch(urlMe, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Usamos .includes para que funcione aunque el backend mande "CAJA" o "Operador de Caja"
          const rolTexto = (data.rol || data.rol_display || '').toUpperCase();
          const permisosBackend = data.permisos || {}; 
          
          const esAdmin = rolTexto.includes('ADMIN');
          const esBodega = rolTexto.includes('BODEGA');
          const esCaja = rolTexto.includes('CAJA');

          const pathActual = location.pathname.toLowerCase();

          // ==============================================================
          // 🛡️ REGLA 1: ADMINISTRADORES PASAN DIRECTO A TODO
          // ==============================================================
          if (esAdmin) {
            setAutorizado(true);
            return;
          }

          // A PARTIR DE AQUÍ, SOLO LLEGAN CAJA Y BODEGA (OPERATIVOS)

          // ==============================================================
          // 🛡️ REGLA 2: BLOQUEO ESTRICTO DE RUTAS DE USUARIOS
          // ==============================================================
          // Bloquea localhost:5173/usuarios y localhost:5173/Listadousuarios
          if (pathActual.includes('usuario') || pathActual.includes('rol') || pathActual.includes('acceso')) {
            setAutorizado(false); 
            return;
          }

          // ==============================================================
          // 🛡️ REGLA 3: BLOQUEO ESTRICTO DE MOVIMIENTOS (URL PARAMS)
          // ==============================================================
          const searchParams = new URLSearchParams(location.search);
          const contexto = (searchParams.get('contexto') || '').toLowerCase(); // Traduce da%C3%B1o a daño automáticamente
          const esVistaMovimiento = pathActual.includes('movimiento') || (modulo && modulo.toLowerCase().includes('movimiento'));

          if (esVistaMovimiento && contexto) {
            // Reglas exactas para CAJA
            if (esCaja) {
              if (contexto === 'entrada' || contexto === 'daño' || contexto === 'correccion' || contexto === 'corrección') {
                setAutorizado(false);
                return;
              }
            }

            // Reglas exactas para BODEGA
            if (esBodega) {
              if (contexto === 'venta' || contexto === 'daño' || contexto === 'correccion' || contexto === 'corrección') {
                setAutorizado(false);
                return;
              }
            }
          }

          // ==============================================================
          // 🛡️ REGLA 4: PERMISOS PARA VER LAS TABLAS/CATÁLOGOS
          // ==============================================================
          const modBase = modulo ? modulo.toLowerCase().replace(/s$/, '') : ''; 
          let permisosDelModulo = permisosBackend[modulo?.toLowerCase()] || permisosBackend[`${modBase}s`] || permisosBackend[modBase];

          const modulosDeLecturaLibre = ['producto', 'productos', 'categoria', 'categorias', 'almacenamiento', 'movimiento', 'movimientos', 'control_inventario'];

          if (modulosDeLecturaLibre.includes(modulo?.toLowerCase()) && accion === 'master') {
            setAutorizado(true); // Deja ver las tablas
          } else if (permisosDelModulo && permisosDelModulo[accion]) {
            setAutorizado(true); // Deja ejecutar según JSON
          } else {
            setAutorizado(false); // Bloquea todo lo demás
          }

        } else {
          setAutorizado(false);
        }
      } catch (error) {
        console.error("Error al verificar permisos:", error);
        setAutorizado(false);
      }
    };

    verificarPermiso();
  }, [modulo, accion, location.pathname, location.search]);

  if (autorizado === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  // Si no está autorizado, lo saca de inmediato al dashboard
  return autorizado ? children : <Navigate to="/" replace state={{ from: location }} />;
};

export default ProtectorRuta;
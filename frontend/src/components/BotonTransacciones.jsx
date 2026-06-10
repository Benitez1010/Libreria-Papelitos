import React, { useState, useEffect } from 'react';
import { Button, Menu, MenuItem, Divider, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Íconos
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import { ENDPOINTS } from '../services/api'; 
const BotonTransacciones = () => {
  const navigate = useNavigate();
  const verdePapelitos = '#1E5631';

  const [anchorElMovimiento, setAnchorElMovimiento] = useState(null);
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  const openMenuMov = Boolean(anchorElMovimiento);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/me/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (res.ok) setUsuarioInfo(await res.json());
      } catch (err) { console.error("Error cargando permisos", err); }
      finally { setCargando(false); }
    };
    fetchUser();
  }, []);

  // Lógica de roles
  const esAdmin = usuarioInfo?.rol === 'ADMIN' || usuarioInfo?.rol === 'Administrador';
  const esBodega = usuarioInfo?.rol === 'BODEGA';
  const esCaja = usuarioInfo?.rol === 'CAJA';

  const puedeVerEntrada = esAdmin || esBodega;
  const puedeVerDespacho = esAdmin || esCaja;
  const puedeVerTraslado = true; // Todos
  const puedeVerAjustes = esAdmin;

  const handleClickMovimiento = (event) => setAnchorElMovimiento(event.currentTarget);
  const handleCloseMovimiento = () => setAnchorElMovimiento(null);
  
  const irARegistroMovimiento = (contexto) => {
    setAnchorElMovimiento(null);
    navigate(`/inventario/movimiento?contexto=${contexto}`);
  };

  if (cargando) return <Button disabled variant="contained" size="small"><CircularProgress size={20} /></Button>;

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClickMovimiento}
        startIcon={<SyncAltIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ 
          backgroundColor: '#1565c0', 
          '&:hover': { backgroundColor: '#0d47a1' }, 
          borderRadius: '8px', 
          textTransform: 'none' 
        }}
      >
        Transacción
      </Button>

      <Menu
        anchorEl={anchorElMovimiento}
        open={openMenuMov}
        onClose={handleCloseMovimiento}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {puedeVerEntrada && (
          <MenuItem onClick={() => irARegistroMovimiento('entrada')}>
            <LocalShippingIcon sx={{ mr: 2, color: verdePapelitos }} /> Entrada de Mercadería
          </MenuItem>
        )}
        
        {puedeVerDespacho && (
          <MenuItem onClick={() => irARegistroMovimiento('venta')}>
            <ShoppingCartIcon sx={{ mr: 2, color: '#1565c0' }} /> Despacho / Venta
          </MenuItem>
        )}
        
        {puedeVerTraslado && (
          <MenuItem onClick={() => irARegistroMovimiento('traslado')}>
            <SyncAltIcon sx={{ mr: 2, color: '#ed6c02' }} /> Traslado Interno
          </MenuItem>
        )}
        
        {puedeVerAjustes && (
          <div>
            <Divider />
            <MenuItem onClick={() => irARegistroMovimiento('daño')}>
              <BuildIcon sx={{ mr: 2, color: '#d32f2f' }} /> Ajuste por Daño/Merma
            </MenuItem>
            <MenuItem onClick={() => irARegistroMovimiento('correccion')}>
              <BuildIcon sx={{ mr: 2, color: '#9c27b0' }} /> Corrección Administrativa
            </MenuItem>
          </div>
        )}
      </Menu>
    </>
  );
};

export default BotonTransacciones;
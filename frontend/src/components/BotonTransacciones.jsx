import React, { useState } from 'react';
import { Button, Menu, MenuItem, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Íconos específicos del menú
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';

const BotonTransacciones = () => {
  const navigate = useNavigate();
  const verdePapelitos = '#1E5631';

  const [anchorElMovimiento, setAnchorElMovimiento] = useState(null);
  const openMenuMov = Boolean(anchorElMovimiento);

  const handleClickMovimiento = (event) => {
    setAnchorElMovimiento(event.currentTarget);
  };
  
  const handleCloseMovimiento = () => {
    setAnchorElMovimiento(null);
  };
  
  const irARegistroMovimiento = (contexto) => {
    setAnchorElMovimiento(null);
    navigate(`/inventario/movimiento?contexto=${contexto}`);
  };

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
        <MenuItem onClick={() => irARegistroMovimiento('entrada')}>
          <LocalShippingIcon sx={{ mr: 2, color: verdePapelitos }} /> Entrada de Proveedor
        </MenuItem>
        <MenuItem onClick={() => irARegistroMovimiento('venta')}>
          <ShoppingCartIcon sx={{ mr: 2, color: '#1565c0' }} /> Despacho / Venta
        </MenuItem>
        <MenuItem onClick={() => irARegistroMovimiento('traslado')}>
          <SyncAltIcon sx={{ mr: 2, color: '#ed6c02' }} /> Traslado Interno
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => irARegistroMovimiento('daño')}>
          <BuildIcon sx={{ mr: 2, color: '#d32f2f' }} /> Ajuste por Daño/Merma
        </MenuItem>
        <MenuItem onClick={() => irARegistroMovimiento('correccion')}>
          <BuildIcon sx={{ mr: 2, color: '#9c27b0' }} /> Corrección Administrativa
        </MenuItem>
      </Menu>
    </>
  );
};

export default BotonTransacciones;
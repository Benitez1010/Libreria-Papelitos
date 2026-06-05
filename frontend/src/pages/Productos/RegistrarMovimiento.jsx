import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, MenuItem, 
  FormControl, InputLabel, Select, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../services/api';
import AlertaStockCritico from '../../components/AlertaStockCritico';

const RegistrarMovimiento = () => {
  const [searchParams] = useSearchParams();
  const contexto = searchParams.get('contexto') || 'venta';
  const navigate = useNavigate();
  const verdePapelitos = '#1E5631';

  const [productosCatalogo, setProductosCatalogo] = useState([]);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });
  const [justificacion, setJustificacion] = useState('');
  const [lineasMovimiento, setLineasMovimiento] = useState([]);
  const [alertaStockEmergente, setAlertaStockEmergente] = useState({ open: false, productos: [] });
  
  // MATRIZ DE CONFIGURACIÓN DINÁMICA (CORREGIDA: Sin el contexto 'salida')
  const configContexto = {
    venta: { titulo: 'Despacho definitivo (Venta)', tipoAPI: 'venta', origenFijo: 'VITRINA', destinoFijo: 'EXTERNO', muestraUbicacion: false, requereJustificacion: false },
    entrada: { titulo: 'Entrada de Mercadería', tipoAPI: 'entrada', origenFijo: 'EXTERNO', destinoFijo: 'BODEGA', muestraUbicacion: false, requereJustificacion: false },
    traslado: { titulo: 'Traslado Interno (Bodega / Vitrina)', tipoAPI: 'traslado', origenFijo: '', destinoFijo: '', muestraUbicacion: true, requereJustificacion: false },
    daño: { titulo: 'Ajuste por Merma / Avería', tipoAPI: 'daño', origenFijo: '', destinoFijo: 'EXTERNO', muestraUbicacion: true, requereJustificacion: true },
    correccion: { titulo: 'Ajuste Administrativo (Corrección)', tipoAPI: 'correccion', origenFijo: '', destinoFijo: '', muestraUbicacion: true, requereJustificacion: true }
  }[contexto] || { titulo: 'Movimiento de Inventario', tipoAPI: contexto, origenFijo: '', destinoFijo: '', muestraUbicacion: true, requereJustificacion: false };

  const cargarProductosDelCatálogo = async () => {
    try {
      const response = await fetch(ENDPOINTS.INVENTARIO.PRODUCTOS);
      if (response.ok) {
        const data = await response.json();
        setProductosCatalogo(data);
      }
    } catch (error) {
      setAlerta({ tipo: 'error', mensaje: 'No se pudo conectar con el catálogo de productos.' });
    }
  };

  useEffect(() => {
    cargarProductosDelCatálogo();
  }, []);

  useEffect(() => {
    setLineasMovimiento([
      { 
        producto_id: '', 
        cantidad: 1, 
        origen: configContexto.origenFijo || '', 
        destino: configContexto.destinoFijo || '' 
      }
    ]);
    setJustificacion('');
    setAlerta({ tipo: '', mensaje: '' });
  }, [contexto]);

  useEffect(() => {
    const contextosValidos = ['venta', 'entrada', 'traslado', 'daño', 'correccion'];
    
    if (!contextosValidos.includes(contexto)) {
      // Si el operario escribe un contexto falso, lo redirige al listado limpio
      navigate('/productos'); 
    }
  }, [contexto, navigate]);

  const handleAgregarFila = () => {
    setLineasMovimiento([...lineasMovimiento, { 
      producto_id: '', 
      cantidad: 1, 
      origen: configContexto.origenFijo || '', 
      destino: configContexto.destinoFijo || '' 
    }]);
  };

  const handleEliminarFila = (index) => {
    if (lineasMovimiento.length === 1) return;
    const nuevasLineas = [...lineasMovimiento];
    nuevasLineas.splice(index, 1);
    setLineasMovimiento(nuevasLineas);
  };

  const handleCambioFila = (index, campo, valor) => {
    const nuevasLineas = [...lineasMovimiento];
    nuevasLineas[index][campo] = valor;

    if (contexto === 'traslado' && campo === 'origen') {
      nuevasLineas[index]['destino'] = valor === 'BODEGA' ? 'VITRINA' : 'BODEGA';
    }
    if (contexto === 'traslado' && campo === 'destino') {
      nuevasLineas[index]['origen'] = valor === 'BODEGA' ? 'VITRINA' : 'BODEGA';
    }

    if (contexto === 'correccion') {
      const filaActual = nuevasLineas[index];
      if (filaActual.origen && filaActual.destino && filaActual.origen === filaActual.destino) {
        nuevasLineas[index][campo] = '';
        setAlerta({ 
          tipo: 'error', 
          mensaje: 'En una corrección administrativa, la ubicación de origen y destino deben ser diferentes.' 
        });
        setTimeout(() => setAlerta({ tipo: '', mensaje: '' }), 4000);
      }
    }

    setLineasMovimiento(nuevasLineas);
  };

  // Agrupar productos idénticos antes de despachar a la API
  const agruparLineasDuplicadas = (lineas) => {
    const mapaAgrupado = {};

    lineas.forEach(linea => {
      // Creamos una clave única combinando ID, Origen y Destino
      const claveUnica = `${linea.producto_id}-${linea.origen}-${linea.destino}`;
      
      if (mapaAgrupado[claveUnica]) {
        // Si ya existe en el lote, sumamos la cantidad
        mapaAgrupado[claveUnica].cantidad += linea.cantidad;
      } else {
        // Si no existe, creamos la referencia clonando el objeto
        mapaAgrupado[claveUnica] = { ...linea };
      }
    });

    return Object.values(mapaAgrupado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerta({ tipo: '', mensaje: '' });

    const token = localStorage.getItem('token');
    if (!token) {
      setAlerta({ tipo: 'error', mensaje: 'Sesión expirada. Por favor vuelva a iniciar sesión.' });
      return;
    }

    // Aplicamos la agrupación inteligente de filas
    const lineasProcesadas = agruparLineasDuplicadas(lineasMovimiento);

    const payload = {
      tipo_contexto: configContexto.tipoAPI,
      justificacion: justificacion,
      detalles: lineasProcesadas
    };

    try {
      const response = await fetch(ENDPOINTS.INVENTARIO.PROCESAR_MOVIMIENTO, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // --- 1. Lógica de éxito tradicional ---
        setAlerta({ tipo: 'success', mensaje: data.message });
        setJustificacion('');
        await cargarProductosDelCatálogo();
        setLineasMovimiento([{ 
          producto_id: '', 
          cantidad: 1, 
          origen: configContexto.origenFijo || '', 
          destino: configContexto.destinoFijo || '' 
        }]);

        // --- 2. Lógica nueva: Disparar pop-up de stock crítico ---
        if (data.detalles_procesados) {
          // Filtramos solo los productos que Django nos indicó que requieren alerta
          const productosCriticos = data.detalles_procesados
            .filter(item => item.requiere_alerta)
            .map(item => item.producto);

          // Si hay al menos uno, abrimos el pop-up emergente
          if (productosCriticos.length > 0) {
            setAlertaStockEmergente({ open: true, productos: productosCriticos });
          }
        }
      } else {
        setAlerta({ tipo: 'error', mensaje: data.message || 'Error al procesar la transacción.' });
      }
    } catch (error) {
      setAlerta({ tipo: 'error', mensaje: 'Fallo crítico de conexión con el backend.' });
    }
  };

  const formularioInvalido = lineasMovimiento.some(linea => !linea.producto_id || linea.cantidad <= 0);

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <InventoryIcon sx={{ color: verdePapelitos, fontSize: 40 }} />
          <Typography variant="h4" fontWeight="bold" color={verdePapelitos}>
            {configContexto.titulo}
          </Typography>
        </Box>

        {alerta.mensaje && <Alert severity={alerta.tipo} sx={{ mb: 3 }}>{alerta.mensaje}</Alert>}

        <form onSubmit={handleSubmit}>
          
          {configContexto.requereJustificacion && (
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Justificación de la Operación"
                variant="outlined"
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                required={configContexto.requereJustificacion}
                helperText="Este ajuste requiere una justificación obligatoria para fines de auditoría."
              />
            </Box>
          )}

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Detalle de Productos</Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: '8px' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell width={configContexto.muestraUbicacion ? "35%" : "65%"}><b>Producto</b></TableCell>
                  <TableCell width="15%"><b>Cantidad</b></TableCell>
                  {configContexto.muestraUbicacion && <TableCell width="20%"><b>Origen</b></TableCell>}
                  {configContexto.muestraUbicacion && <TableCell width="20%"><b>Destino</b></TableCell>}
                  <TableCell width="10%" align="center"><b>Acción</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lineasMovimiento.map((linea, index) => (
                  <TableRow key={index}>
                    
                   <TableCell>
                    <Autocomplete
                      size="small"
                      options={productosCatalogo}
                      // Nos aseguramos de mapear por el ID del producto
                      value={productosCatalogo.find(p => p.id === linea.producto_id) || null}
                      onChange={(event, nuevoProducto) => {
                        handleCambioFila(index, 'producto_id', nuevoProducto ? nuevoProducto.id : '');
                      }}
                      // Aquí resolvemos la ambigüedad mostrando Nombre + Categoría + Stocks
                      getOptionLabel={(option) => 
                        `${option.nombre} [${option.categoria_nombre || option.categoria?.nombre || 'Sin Categoría'}] (B:${option.stock_bodega} | V:${option.stock_vitrina})`
                      }
                      // Evita errores visuales si el valor está vacío
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          placeholder="Escriba para buscar producto..." 
                          required
                        />
                      )}
                    />
                  </TableCell>

                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={linea.cantidad}
                        onChange={(e) => handleCambioFila(index, 'cantidad', parseInt(e.target.value, 10) || 0)}
                        slotProps={{ htmlInput: { min: 1 } }}
                        required
                        fullWidth
                      />
                    </TableCell>

                    {/* Ubicación de Origen */}
                    {configContexto.muestraUbicacion && (
                      <TableCell>
                        <FormControl fullWidth size="small" required>
                          <Select
                            value={linea.origen}
                            onChange={(e) => handleCambioFila(index, 'origen', e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="" disabled>Seleccione</MenuItem>
                            <MenuItem value="BODEGA">Bodega</MenuItem>
                            <MenuItem value="VITRINA">Vitrina</MenuItem>
                            {contexto === 'correccion' && <MenuItem value="EXTERNO">Externo</MenuItem>}
                          </Select>
                        </FormControl>
                      </TableCell>
                    )}

                    {/* Ubicación de Destino */}
                    {configContexto.muestraUbicacion && (
                      <TableCell>
                        <FormControl fullWidth size="small" required disabled={contexto === 'daño' || contexto === 'traslado'}>
                          <Select
                            value={linea.destino}
                            onChange={(e) => handleCambioFila(index, 'destino', e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="" disabled>Seleccione</MenuItem>
                            <MenuItem value="BODEGA">Bodega</MenuItem>
                            <MenuItem value="VITRINA">Vitrina</MenuItem>
                            <MenuItem value="EXTERNO">Externo</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    )}

                    <TableCell align="center">
                      <IconButton 
                        color="error" 
                        onClick={() => handleEliminarFila(index)}
                        disabled={lineasMovimiento.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddCircleIcon />}
              onClick={handleAgregarFila}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Añadir otro producto
            </Button>

            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={formularioInvalido}
              sx={{ 
                backgroundColor: verdePapelitos, 
                '&:hover': { backgroundColor: '#143d22' },
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              Procesar Movimiento
            </Button>
          </Box>
        </form>
      </Paper>
      
      <AlertaStockCritico 
        open={alertaStockEmergente.open} 
        onClose={(event, reason) => {
          if (reason !== 'clickaway') {
            setAlertaStockEmergente({ ...alertaStockEmergente, open: false });
          }
        }} 
        productos={alertaStockEmergente.productos} 
      />        

    </Box>
  );
};

export default RegistrarMovimiento;
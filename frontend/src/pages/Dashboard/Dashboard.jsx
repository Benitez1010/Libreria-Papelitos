import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Card, CardContent, 
  Tabs, Tab, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Chip, CircularProgress, Alert, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, Divider, Button
} from '@mui/material';

// IMPORTACIONES DE ÍCONOS INDIVIDUALES
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; 
import CategoryIcon from '@mui/icons-material/Category';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

import { ENDPOINTS } from '../../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const verdePapelitos = '#1E5631';
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(ENDPOINTS.INVENTARIO.PRODUCTOS);
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        }
      } catch (error) {
        console.error('Error cargando los datos del dashboard', error);
      } finally {
        setCargando(false);
      }
    };
    fetchDashboardData();
  }, []); 

  // ==========================================
  // LÓGICAS MATEMÁTICAS DEL DASHBOARD
  // ==========================================
  
  // 1. Productos Agotados en su totalidad
  const productosAgotados = productos.filter(p => p.stock_total === 0);
  
  // 2. Alertas Críticas y en Riesgo (Para compras a proveedores)
  const productosCriticos = productos.filter(p => p.stock_total > 0 && p.stock_total <= p.stock_minimo);
  const margenRiesgo = 5; 
  const productosEnRiesgo = productos.filter(p => p.stock_total > p.stock_minimo && p.stock_total <= (p.stock_minimo + margenRiesgo));
  const todasLasAlertas = [...productosAgotados, ...productosCriticos, ...productosEnRiesgo];
  
  // 3. NUEVO: Sugerencias de Traslado Interno (Bodega a Vitrina)
  // Agotados en mostrador, pero con existencias en el cuarto de bodega
  const reposicionSugerida = productos.filter(p => p.stock_vitrina === 0 && p.stock_bodega > 0);

  // 4. Estadísticas Generales
  const totalCategorias = new Set(productos.map(p => p.categoria_nombre)).size;
  const top5MenorStock = [...productos].sort((a, b) => a.stock_total - b.stock_total).slice(0, 5);

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress sx={{ color: verdePapelitos }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: verdePapelitos }}>
        Panel Principal
      </Typography>

      {/* SISTEMA DE PESTAÑAS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ 
            '& .MuiTabs-indicator': { backgroundColor: verdePapelitos }, 
            '& .Mui-selected': { color: verdePapelitos, fontWeight: 'bold' }
          }}
        >
          <Tab label="Resumen Operativo" />
          
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Alertas de Compra
                {todasLasAlertas.length > 0 && (
                  <Chip 
                    label={todasLasAlertas.length} 
                    size="small" 
                    color={productosCriticos.length > 0 || productosAgotados.length > 0 ? "error" : "warning"} 
                    sx={{ height: 20, fontWeight: 'bold' }} 
                  />
                )}
              </Box>
            } 
          />

          {/* NUEVA PESTAÑA: Reposición Interna */}
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Reposición Interna
                {reposicionSugerida.length > 0 && (
                  <Chip 
                    label={reposicionSugerida.length} 
                    size="small" 
                    color="info" 
                    sx={{ height: 20, fontWeight: 'bold' }} 
                  />
                )}
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* ==========================================
          TAB 1: RESUMEN GENERAL
          ========================================== */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, borderLeft: `5px solid ${verdePapelitos}` }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InventoryIcon sx={{ fontSize: 45, color: verdePapelitos }} />
                <Box>
                  <Typography color="textSecondary" variant="body2" fontWeight="bold">TOTAL PRODUCTOS</Typography>
                  <Typography variant="h5" fontWeight="bold">{productos.length}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, borderLeft: '5px solid #0288d1' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CategoryIcon sx={{ fontSize: 45, color: '#0288d1' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2" fontWeight="bold">CATEGORÍAS</Typography>
                  <Typography variant="h5" fontWeight="bold">{totalCategorias}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, borderLeft: '5px solid #d32f2f' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ProductionQuantityLimitsIcon sx={{ fontSize: 45, color: '#d32f2f' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2" fontWeight="bold">AGOTADOS TOTALES</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#d32f2f">{productosAgotados.length}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, borderLeft: '5px solid #ed6c02', opacity: 0.8 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 45, color: '#ed6c02' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2" fontWeight="bold">MOVIMIENTOS HOY</Typography>
                  <Typography variant="h5" fontWeight="bold">--</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon sx={{ color: '#ed6c02' }} /> Top 5: Menor Disponibilidad
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List disablePadding>
                {top5MenorStock.length > 0 ? top5MenorStock.map((prod, index) => (
                  <React.Fragment key={prod.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: prod.stock_total === 0 ? '#ffebee' : '#fff3e0', color: prod.stock_total === 0 ? '#d32f2f' : '#ed6c02' }}>
                          {prod.stock_total}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography fontWeight="bold">{prod.nombre}</Typography>} 
                        secondary={`${prod.categoria_nombre} | Stock Mínimo: ${prod.stock_minimo}`} 
                      />
                    </ListItem>
                    {index !== top5MenorStock.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                )) : (
                  <Typography color="textSecondary">No hay productos registrados.</Typography>
                )}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
              <TrendingUpIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">Gráfica de Movimientos</Typography>
              <Typography variant="body2" color="textSecondary" textAlign="center" mt={1}>
                Se activará al conectar el módulo de Reportes (REP-05).
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ==========================================
          TAB 2: ALERTAS DE COMPRA (PROVEEDORES)
          ========================================== */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {productosCriticos.length > 0 && (
            <Alert severity="error">
              <strong>Prioridad Alta (Rojo):</strong> Existen productos que han alcanzado su límite mínimo o están agotados. Se requiere compra inmediata.
            </Alert>
          )}
          {productosEnRiesgo.length > 0 && (
            <Alert severity="warning">
              <strong>Prioridad Media (Naranja):</strong> Existen productos acercándose a su stock mínimo (Umbral de 5 unidades). Vigilar inventario.
            </Alert>
          )}
        </Box>

        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '12px' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>CÓDIGO</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>PRODUCTO</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>CATEGORÍA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>MÍNIMO PERMITIDO</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>STOCK ACTUAL</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>ESTADO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todasLasAlertas.length > 0 ? (
                todasLasAlertas.sort((a, b) => a.stock_total - b.stock_total).map((producto) => {
                  let estadoTexto = "";
                  let estadoColor = "";
                  
                  if (producto.stock_total === 0) {
                    estadoTexto = "Agotado";
                    estadoColor = "error";
                  } else if (producto.stock_total <= producto.stock_minimo) {
                    estadoTexto = "Crítico";
                    estadoColor = "error";
                  } else {
                    estadoTexto = "En Riesgo";
                    estadoColor = "warning";
                  }

                  return (
                    <TableRow key={producto.id} hover>
                      <TableCell sx={{ color: 'text.secondary' }}>#{producto.id}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{producto.nombre}</TableCell>
                      <TableCell>{producto.categoria_nombre}</TableCell>
                      <TableCell align="center">{producto.stock_minimo}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: estadoColor === 'error' ? '#d32f2f' : '#ed6c02' }}>
                        {producto.stock_total}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={estadoTexto} color={estadoColor} size="small" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <NotificationsActiveIcon sx={{ fontSize: 50, color: '#a5d6a7', mb: 1 }} />
                    <Typography variant="subtitle1" color="textSecondary">
                      Todo en orden. No hay productos críticos ni en riesgo actualmente.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* ==========================================
          TAB 3: REPOSICIÓN INTERNA (BODEGA VS VITRINA)
          ========================================== */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" icon={<StorefrontIcon fontSize="inherit" />}>
            <strong>Oportunidad de Ventas:</strong> Los siguientes productos se han agotado en la vitrina, pero cuentan con existencias en la bodega. Se sugiere realizar un traslado interno.
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '12px' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#0277bd' }}>PRODUCTO</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0277bd' }}>STOCK EN VITRINA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0277bd' }}>DISPONIBLE EN BODEGA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0277bd' }}>ACCIÓN RECOMENDADA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reposicionSugerida.length > 0 ? (
                reposicionSugerida.map((producto) => (
                  <TableRow key={producto.id} hover>
                    <TableCell>
                      <Typography fontWeight="bold">{producto.nombre}</Typography>
                      <Typography variant="caption" color="textSecondary">{producto.categoria_nombre}</Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip label="Agotado" color="error" size="small" variant="outlined" />
                    </TableCell>
                    
                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1E5631' }}>
                      {producto.stock_bodega} unidades
                    </TableCell>
                    
                    <TableCell align="center">
                      {/* Este botón usa el enrutador para enviarlo directamente a hacer un traslado */}
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<SyncAltIcon />}
                        onClick={() => navigate('/inventario/movimiento?contexto=traslado')}
                        sx={{ backgroundColor: '#0288d1', textTransform: 'none', borderRadius: '8px' }}
                      >
                        Hacer Traslado
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <StorefrontIcon sx={{ fontSize: 50, color: '#90caf9', mb: 1 }} />
                    <Typography variant="subtitle1" color="textSecondary">
                      La vitrina está completamente abastecida. No hay traslados pendientes.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

    </Box>
  );
};

export default Dashboard;
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Inventory, WarningAmber, TrendingUp } from '@mui/icons-material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1E5631' }}>
        Panel Principal
      </Typography>

      <Grid container spacing={3}>
        {/* Tarjeta 1 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Inventory sx={{ fontSize: 50, color: '#1E5631' }} />
              <Box>
                <Typography color="textSecondary" variant="subtitle1">Total Productos</Typography>
                <Typography variant="h4" fontWeight="bold">1,245</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tarjeta 2 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, borderLeft: '5px solid #d32f2f' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningAmber sx={{ fontSize: 50, color: '#d32f2f' }} />
              <Box>
                <Typography color="textSecondary" variant="subtitle1">Alertas Críticas</Typography>
                <Typography variant="h4" fontWeight="bold">12</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tarjeta 3 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp sx={{ fontSize: 50, color: '#2C7A4B' }} />
              <Box>
                <Typography color="textSecondary" variant="subtitle1">Movimientos Hoy</Typography>
                <Typography variant="h4" fontWeight="bold">84</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
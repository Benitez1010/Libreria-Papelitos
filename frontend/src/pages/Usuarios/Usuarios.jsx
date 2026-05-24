import { Box, Typography } from '@mui/material';

const Usuarios = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        border: '2px dashed #1E5631',
        borderRadius: 4,
        backgroundColor: 'rgba(30, 86, 49, 0.05)',
        p: 4
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1E5631', textAlign: 'center' }}>
        Acá irá la pantalla de usuarios
      </Typography>
    </Box>
  );
};

export default Usuarios;
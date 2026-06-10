import { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  Fade, CircularProgress, Zoom, IconButton, InputAdornment,
  Collapse
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../services/api';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarError, setMostrarError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- Control de visibilidad
  const navigate = useNavigate();

  // Si ya hay sesión iniciada, redirigir al dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMostrarError(false);
    
    if (!usuario.trim() || !contrasena.trim()) {
      setError('Por favor complete todos los campos');
      setMostrarError(true);
      return;
    }

    setCargando(true);

    try {
      const response = await fetch(ENDPOINTS.SEGURIDAD.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usuario,
          password: contrasena,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Leer el mensaje de error específico del backend
        const mensajeError = 
          data.non_field_errors?.[0] || 
          data.username?.[0] || 
          data.password?.[0] || 
          'Credenciales inválidas, intente nuevamente';
        
        setError(mensajeError);
        setMostrarError(true);
        setCargando(false);
        return;
      }

      // Login exitoso
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError('Error de conexión con el servidor');
      setMostrarError(true);
    } finally {
      setCargando(false);
    }
  };

  // alternar mostrar/ocultar contraseña
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#A3C9B8',
        p: 2
      }}
    >
      {/* Entrada suave de toda la tarjeta */}
      <Zoom in={true} timeout={600}>
        <Paper 
          elevation={10} 
          sx={{ 
            display: 'flex', 
            width: { xs: '100%', sm: '900px' }, 
            minHeight: '550px',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}
        >
          {/* ========== PANEL IZQUIERDO ========== */}
          <Box 
            sx={{ 
              width: { xs: '0%', md: '50%' }, 
              backgroundColor: '#1E5631',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4
            }}
          >
            <Box 
              component="img" 
              src="/logo.png" 
              alt="Logo Papelitos" 
              sx={{ 
                width: 320, 
                height: 'auto',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.05) rotate(2deg)', 
                }
              }} 
            />
          </Box>

          {/* ========== PANEL DERECHO ========== */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '50%' }, 
              backgroundColor: '#EAF4EC',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 4, md: 6 },
              gap: 4
            }}
          >
            {/* animacion titulo */}
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <Typography 
                variant="h4" 
                fontWeight="900" 
                sx={{ color: '#1E5631', letterSpacing: 1 }}
              >
                INICIO DE SESIÓN
              </Typography>
            </Zoom>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Campo Usuario con Zoom */}
              <Zoom in={true} style={{ transitionDelay: '500ms' }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>
                    Usuario o Correo Electrónico:
                  </Typography>
                  <TextField
                    fullWidth
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Ingrese su usuario"
                    disabled={cargando}
                    sx={{ 
                      backgroundColor: 'white', 
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      '& input::-ms-reveal': { display: 'none !important' },
                      '& input::-ms-clear': { display: 'none !important' }
                    }}
                  />
                </Box>
              </Zoom>

              {/* animacion contraseña */}
              <Zoom in={true} style={{ transitionDelay: '700ms' }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>
                    Contraseña:
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    disabled={cargando}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={toggleShowPassword} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          '& input::-ms-reveal, & input::-ms-clear': { display: 'none !important' }
                        }
                      },
                    }}
                    sx={{ 
                      backgroundColor: 'white', 
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': { borderRadius: 2 }
                    }}
                  />
                </Box>
              </Zoom>
              
              {/* animacion error */}
              <Collapse in={mostrarError}>
                <Box sx={{ 
                  backgroundColor: '#ffebee', 
                  color: '#d32f2f', 
                  p: 1.5, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  border: '1px solid #ffcdd2'
                }}>
                  <Typography variant="caption" fontWeight="bold">{error}</Typography>
                </Box>
              </Collapse>
              
              {/*animacion boton */}
              <Zoom in={true} style={{ transitionDelay: '900ms' }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={cargando}
                  sx={{
                    backgroundColor: '#1E5631',
                    color: 'white',
                    py: 1.8,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(30, 86, 49, 0.3)',
                    '&:hover': { 
                      backgroundColor: '#143D22',
                      transform: 'scale(1.02)' 
                    }
                  }}
                >
                  {cargando ? <CircularProgress size={24} color="inherit" /> : 'Acceder al Sistema'}
                </Button>
              </Zoom>
            </Box>
          </Box>
        </Paper>
      </Zoom>
    </Box>
  );
};

export default Login;
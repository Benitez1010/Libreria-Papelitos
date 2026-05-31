import { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  Fade, CircularProgress, Slide, IconButton, InputAdornment
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
  const [showPassword, setShowPassword] = useState(false); // <-- NUEVO: controlar ojito
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

  // NUEVO: alternar mostrar/ocultar contraseña
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
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={6} 
          sx={{ 
            display: 'flex', 
            width: { xs: '100%', sm: '900px' }, 
            minHeight: '500px',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          {/* ========== PANEL IZQUIERDO (Verde oscuro con logo) ========== */}
          <Box 
            sx={{ 
              width: { xs: '0%', md: '50%' }, 
              backgroundColor: '#1E5631',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              gap: 3
            }}
          >
            <Box 
              component="img" 
              src="/logo.png" 
              alt="Logo Papelitos" 
              sx={{ 
                width: 300, 
                height: 'auto',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.05) rotate(2deg)',
                }
              }} 
            />
          </Box>

          {/* ========== PANEL DERECHO (Formulario) ========== */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '50%' }, 
              backgroundColor: '#EAF4EC',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, md: 5 },
              gap: 3
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              sx={{ 
                color: 'black', 
                mb: 1,
                animation: 'fadeInDown 0.8s ease'
              }}
            >
              INICIO DE SESION
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              <Slide direction="right" in={true} timeout={600}>
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, color: 'black', fontWeight: 500 }}>
                    Usuario o Correo Electronico:
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
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 3px rgba(30, 86, 49, 0.2)',
                        }
                      }
                    }}
                  />
                </Box>
              </Slide>

              <Slide direction="right" in={true} timeout={800}>
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, color: 'black', fontWeight: 500 }}>
                    Contraseña
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
                            <IconButton
                              onClick={toggleShowPassword}
                              edge="end"
                              sx={{ color: '#666' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                     sx={{ 
                      '& input::-ms-reveal': { display: 'none' },
                      '& input::-webkit-textfield-decoration-container': { display: 'none' },
                      backgroundColor: 'white', 
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 3px rgba(30, 86, 49, 0.2)',
                        }
                      }
                    }}
                  />
                </Box>
              </Slide>
              
              {mostrarError && (
                <Slide direction="left" in={mostrarError} timeout={300}>
                  <Typography sx={{ 
                    color: '#d32f2f', 
                    fontSize: '0.9rem', 
                    textAlign: 'center',
                    animation: mostrarError ? 'shake 0.5s ease' : 'none'
                  }}>
                    {error}
                  </Typography>
                </Slide>
              )}
              
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={cargando}
                sx={{
                  backgroundColor: '#1E5631',
                  color: 'white',
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    backgroundColor: '#143D22',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(30, 86, 49, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  mt: 1
                }}
              >
                {cargando ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Acceder'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;
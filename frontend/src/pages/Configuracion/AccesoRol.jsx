import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Switch, Button, Stack, 
  CircularProgress, Alert, IconButton 
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ENDPOINTS } from '../../services/api';

const AccesoRol = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: 'success' });

  // ESTADO ACTUALIZADO: Todos los módulos del Sidebar
  const [config, setConfig] = useState({
    articulos: { master: false, agregar: false, editar: false, eliminar: false },
    categorias: { master: false, agregar: false, editar: false, eliminar: false },
    almacenamiento: { master: false, agregar: false, editar: false, eliminar: false },
    movimientos: { master: false, agregar: false, editar: false, eliminar: false },
    control_inventario: { master: false, agregar: false, editar: false, eliminar: false },
    usuarios: { master: false, agregar: false, editar: false, eliminar: false },
    roles: { master: false, agregar: false, editar: false, eliminar: false },
    acceso_rol: { master: false, agregar: false, editar: false, eliminar: false },
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      const token = localStorage.getItem('token');
      try {
        const resUsers = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/usuarios/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (resUsers.ok) {
          const todosLosUsuarios = await resUsers.json();
          const usuarioEncontrado = todosLosUsuarios.find(u => u.id === parseInt(id));
          setUsuario(usuarioEncontrado);
        }

        const resPermisos = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/usuarios/${id}/permisos/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (resPermisos.ok) {
          const dataPermisos = await resPermisos.json();
          // Combinamos la configuración que viene de la BD con nuestra estructura base 
          if (dataPermisos.configuracion && Object.keys(dataPermisos.configuracion).length > 0) {
            setConfig(prevConfig => ({
              ...prevConfig,
              ...dataPermisos.configuracion
            }));
          }
        }
      } catch (error) {
        setAlerta({ mostrar: true, mensaje: 'Error al cargar los datos del usuario.', tipo: 'error' });
      } finally {
        setCargando(false);
      }
    };

    if (id) cargarConfiguracion();
  }, [id]);

  const handleGuardar = async () => {
    const token = localStorage.getItem('token');
    setAlerta({ ...alerta, mostrar: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await fetch(`${ENDPOINTS.SEGURIDAD.LOGIN.replace('/login/', '')}/usuarios/${id}/permisos/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ configuracion: config }) 
      });

      if (response.ok) {
        setAlerta({ mostrar: true, mensaje: 'Configuración guardada exitosamente.', tipo: 'success' });
        setTimeout(() => navigate('/Listadousuarios'), 1500); 
      } else {
        setAlerta({ mostrar: true, mensaje: 'Error al guardar la configuración en la base de datos.', tipo: 'error' });
      }
    } catch (error) {
      setAlerta({ mostrar: true, mensaje: 'Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  const toggleMaster = (modulo) => {
    setConfig(prev => ({
      ...prev,
      [modulo]: { ...prev[modulo], master: !prev[modulo].master }
    }));
  };

  const toggleSub = (modulo, sub) => {
    setConfig(prev => ({
      ...prev,
      [modulo]: { ...prev[modulo], [sub]: !prev[modulo][sub] }
    }));
  };

  const RenderModulo = ({ title, moduloKey, actions }) => (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>{title}</Typography>
          <Switch color="success" checked={config[moduloKey].master} onChange={() => toggleMaster(moduloKey)} />
        </Box>
        
        {config[moduloKey].master && actions && actions.length > 0 && (
          <Stack spacing={1.5} sx={{ mt: 2, pt: 2, borderTop: '1px dashed #d0d0d0' }}>
            {actions.map((action) => (
              <Box key={action.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: '#555' }}>{action.label}</Typography>
                <Switch size="medium" color="success" checked={config[moduloKey][action.key]} onChange={() => toggleSub(moduloKey, action.key)} />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', bgcolor: '#f4f6f8' }}>
        <CircularProgress sx={{ color: '#009F4D' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '90vh', position: 'relative' }}>
      
      {/* ENCABEZADO FIJO */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 10, bgcolor: '#f4f6f8',
        pt: { xs: 3, md: 5 }, pb: 2, px: { xs: 2, md: 5 },
        borderBottom: '1px solid rgba(0,0,0,0.08)', boxShadow: '0px 4px 10px -10px rgba(0,0,0,0.2)'
      }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ mb: alerta.mostrar ? 2 : 0, textAlign: 'center', position: 'relative' }}>
            <IconButton onClick={() => navigate('/Listadousuarios')} sx={{ position: 'absolute', left: 0, top: 0, color: '#009F4D' }}>
              <ArrowBackIcon sx={{ fontSize: 30 }} />
            </IconButton>
            <SecurityIcon sx={{ fontSize: 50, color: '#009F4D', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">Configuración de Accesos</Typography>
            <Typography variant="body1" color="text.secondary">
              Administrando privilegios para: <strong>{usuario?.username || 'Cargando...'} ({usuario?.rol_display || 'Operador'} - {usuario?.area_display || 'Sin asignar'})</strong>
            </Typography>
          </Box>
          {alerta.mostrar && (
            <Box sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
              <Alert severity={alerta.tipo} sx={{ borderRadius: 2 }}>{alerta.mensaje}</Alert>
            </Box>
          )}
        </Box>
      </Box>

      {/* ZONA DESLIZABLE CON TODOS LOS MÓDULOS */}
      <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 5 }, pt: { xs: 2, md: 4 } }}>
        <Box>
          {/* Módulos de Gestión Administrativa */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1E5631', mb: 2, mt: 2 }}>Gestión Administrativa</Typography>
          <RenderModulo title='Mostrar "Listado de Artículos"' moduloKey="articulos" actions={[{key:'agregar', label:'Agregar Artículo'}, {key:'editar', label:'Editar Artículo'}, {key:'eliminar', label:'Eliminar Artículo'}]} />
          <RenderModulo title='Mostrar "Categorías"' moduloKey="categorias" actions={[{key:'agregar', label:'Agregar Categoría'}, {key:'editar', label:'Editar Categoría'}, {key:'eliminar', label:'Eliminar Categoría'}]} />
          <RenderModulo title='Mostrar "Área de Almacenamiento"' moduloKey="almacenamiento" actions={[{key:'agregar', label:'Agregar Área'}, {key:'editar', label:'Editar Área'}, {key:'eliminar', label:'Eliminar Área'}]} />
          <RenderModulo title='Mostrar "Movimientos"' moduloKey="movimientos" actions={[{key:'agregar', label:'Agregar Movimiento'}, {key:'editar', label:'Editar Movimiento'}, {key:'eliminar', label:'Eliminar Movimiento'}]} />
          <RenderModulo title='Mostrar "Control de Inventario"' moduloKey="control_inventario" actions={[{key:'agregar', label:'Agregar Control'}, {key:'editar', label:'Editar Control'}, {key:'eliminar', label:'Eliminar Control'}]} />
          
          {/* Módulos de Configuración */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1E5631', mb: 2, mt: 4 }}>Configuración</Typography>
          <RenderModulo title='Mostrar "Usuarios"' moduloKey="usuarios" actions={[{key:'agregar', label:'Agregar Usuario'}, {key:'editar', label:'Editar Usuario'}, {key:'eliminar', label:'Eliminar Usuario'}]} />
          <RenderModulo title='Mostrar "Roles"' moduloKey="roles" actions={[{key:'agregar', label:'Agregar Rol'}, {key:'editar', label:'Editar Rol'}, {key:'eliminar', label:'Eliminar Rol'}]} />
          
          {/* AQUÍ ESTÁ EL ÚNICO CAMBIO: No se envían acciones (actions={null}), 
              así el componente solo renderiza el título y el switch principal sin errores */}
          <RenderModulo title='Mostrar "Acceso por Rol"' moduloKey="acceso_rol" actions={null} />
        </Box>

        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="success" 
            size="large" 
            onClick={handleGuardar}
            sx={{ px: 8, py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 'bold' }}
          >
            GUARDAR CONFIGURACIÓN
          </Button>
        </Box>
      </Box>

    </Box>
  );
};

export default AccesoRol;
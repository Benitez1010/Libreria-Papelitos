import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ControlInactividad = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    const cerrarSesion = () => {
      // Borramos el token de seguridad
      localStorage.removeItem('token');
      
      // Opcional: Mostrar un mensaje al usuario
      alert("Tu sesión ha expirado por inactividad de 15 minutos.");
      
      // Redirigir al login
      navigate('/login');
    };

    const resetTimer = () => {
      // Si el usuario se mueve, cancelamos el temporizador anterior
      clearTimeout(timeoutId);
      
      // Y creamos uno nuevo para 15 minutos (15 * 60 * 1000 = 900,000 milisegundos)
      // 💡 TIP: Para probar que funciona ahorita, cambia 900000 por 5000 (5 segundos)
      timeoutId = setTimeout(cerrarSesion, 900000); 
    };

    // Eventos que le dicen a React "el usuario está vivo y trabajando"
    const eventos = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    // Le agregamos el detector a toda la ventana
    eventos.forEach(evento => window.addEventListener(evento, resetTimer));

    // Iniciamos el temporizador la primera vez que carga
    resetTimer();

    // Limpiamos los eventos si el usuario sale del sistema manualmente
    return () => {
      clearTimeout(timeoutId);
      eventos.forEach(evento => window.removeEventListener(evento, resetTimer));
    };
  }, [navigate]);

  // Este componente es invisible, solo devuelve las pantallas que envuelve
  return children; 
};

export default ControlInactividad;
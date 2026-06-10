import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ControlInactividad = ({ children }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // TIEMPO DE CONFIGURACIÓN:
  // 15 minutos en ms: 15 * 60 * 1000 = 900000
  // PARA TESTEAR: Cambia 900000 por 5000 (5 segundos)
  const INACTIVITY_TIME = 900000; 

  useEffect(() => {
    const cerrarSesion = () => {
     
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        alert("Tu sesión ha expirado por inactividad. Por seguridad, inicia sesión nuevamente.");
        navigate('/login');
      }
    };

    const resetTimer = () => {
    
      if (timerRef.current) clearTimeout(timerRef.current);
      
   
      timerRef.current = setTimeout(cerrarSesion, INACTIVITY_TIME);
    };

    // Eventos que detectan actividad humana
    const eventos = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'wheel'];

  
    eventos.forEach(evento => 
      window.addEventListener(evento, resetTimer, { passive: true })
    );
    resetTimer();


    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      eventos.forEach(evento => 
        window.removeEventListener(evento, resetTimer)
      );
    };
  }, [navigate]);

  return <>{children}</>;
};

export default ControlInactividad;
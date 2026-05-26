// La dirección base del servidor backend (Django)
const BASE_URL = 'http://127.0.0.1:8000/api/';

// Exportamos un objeto con todos los endpoints agrupados por módulo
export const ENDPOINTS = {
  CATEGORIAS: `${BASE_URL}categorias/`,
  USUARIOS: `${BASE_URL}usuarios/`, 
  // Aquí van a ir agregando los endpoints de los siguientes Sprints
};
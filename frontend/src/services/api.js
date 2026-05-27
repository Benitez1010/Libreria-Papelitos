const BASE_URL = 'http://127.0.0.1:8000/api/';

export const ENDPOINTS = {
  // Módulo de Inventario
  INVENTARIO: {
    CATEGORIAS: `${BASE_URL}categorias/`,
    PRODUCTOS: `${BASE_URL}productos/`,
  },

  // Módulo de Seguridad
  SEGURIDAD: {
    LOGIN: `${BASE_URL}login/`,
  },
}
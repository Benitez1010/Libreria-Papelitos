import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const STORAGE_ACCESS = "papelitos.access";
export const STORAGE_REFRESH = "papelitos.refresh";
export const STORAGE_USUARIO = "papelitos.usuario";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(STORAGE_ACCESS);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshEnCurso = null;

async function refrescarToken() {
  const refreshToken = localStorage.getItem(STORAGE_REFRESH);
  if (!refreshToken) {
    throw new Error("Sin refresh token");
  }

  const respuesta = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
    refresh: refreshToken,
  });

  const nuevoAccess = respuesta.data.access;
  localStorage.setItem(STORAGE_ACCESS, nuevoAccess);
  return nuevoAccess;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestOriginal = error.config;
    const es401 = error.response?.status === 401;
    const esEndpointRefresh = requestOriginal?.url?.includes("/auth/refresh/");

    if (!es401 || esEndpointRefresh || requestOriginal._reintentado) {
      return Promise.reject(error);
    }

    try {
      refreshEnCurso = refreshEnCurso ?? refrescarToken();
      const nuevoAccess = await refreshEnCurso;
      refreshEnCurso = null;

      requestOriginal._reintentado = true;
      requestOriginal.headers.Authorization = `Bearer ${nuevoAccess}`;
      return apiClient(requestOriginal);
    } catch (errorRefresh) {
      refreshEnCurso = null;
      localStorage.removeItem(STORAGE_ACCESS);
      localStorage.removeItem(STORAGE_REFRESH);
      localStorage.removeItem(STORAGE_USUARIO);
      window.location.href = "/login";
      return Promise.reject(errorRefresh);
    }
  },
);

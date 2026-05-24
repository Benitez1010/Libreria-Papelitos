import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiClient,
  STORAGE_ACCESS,
  STORAGE_REFRESH,
  STORAGE_USUARIO,
} from "../api/client.js";
import { AuthContext } from "./authContext.js";

function leerUsuarioGuardado() {
  const datos = localStorage.getItem(STORAGE_USUARIO);
  if (!datos) return null;
  try {
    return JSON.parse(datos);
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);
  const [cargandoSesion, setCargandoSesion] = useState(
    () => Boolean(localStorage.getItem(STORAGE_ACCESS)),
  );

  useEffect(() => {
    if (!cargandoSesion) {
      return undefined;
    }

    let cancelado = false;

    async function validarSesionInicial() {
      try {
        const respuesta = await apiClient.get("/auth/me/");
        if (cancelado) return;
        setUsuario(respuesta.data);
        localStorage.setItem(STORAGE_USUARIO, JSON.stringify(respuesta.data));
      } catch {
        if (cancelado) return;
        localStorage.removeItem(STORAGE_ACCESS);
        localStorage.removeItem(STORAGE_REFRESH);
        localStorage.removeItem(STORAGE_USUARIO);
        setUsuario(null);
      } finally {
        if (!cancelado) setCargandoSesion(false);
      }
    }

    validarSesionInicial();

    return () => {
      cancelado = true;
    };
  }, [cargandoSesion]);

  const login = useCallback(async (identificador, contrasena) => {
    const respuesta = await apiClient.post("/auth/login/", {
      usuario: identificador,
      contrasena,
    });
    const { access, refresh, usuario: usuarioRespuesta } = respuesta.data;
    localStorage.setItem(STORAGE_ACCESS, access);
    localStorage.setItem(STORAGE_REFRESH, refresh);
    localStorage.setItem(STORAGE_USUARIO, JSON.stringify(usuarioRespuesta));
    setUsuario(usuarioRespuesta);
    return usuarioRespuesta;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_ACCESS);
    localStorage.removeItem(STORAGE_REFRESH);
    localStorage.removeItem(STORAGE_USUARIO);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargandoSesion, login, logout }),
    [usuario, cargandoSesion, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

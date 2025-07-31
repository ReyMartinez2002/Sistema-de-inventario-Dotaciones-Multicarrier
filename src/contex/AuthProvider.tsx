import { useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/types";
import { useNavigate, useLocation } from "react-router-dom";
import { Api } from "../services/api";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const api = useMemo(() => new Api(), []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (token) {
        try {
          await api.auth.logout(token);
        } catch (error) {
          console.error("Error en logout remoto:", error);
        }
      }

      // Limpieza completa
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userId"); // <-- Limpia el id
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");

      // Forzar recarga completa para limpiar estados
      window.location.href = '/login?logout=success';
      
    } catch (error) {
      console.error("Error en logout:", error);
      window.location.href = '/login?logout=error';
    } finally {
      setLoading(false);
    }
  }, [api]);

  const validateToken = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const userData = await api.auth.validateToken(token);
      
      setUser({
        id: userData.id_usuario,
        username: userData.username,
        nombre: userData.nombre,
        rol: userData.rol,
        id_rol: userData.id_rol,
        email: userData.email || userData.username,
        token,
      });

      // También guarda el id en localStorage/sessionStorage si no está (para Ajustes)
      if (localStorage.getItem("token") === token) {
        localStorage.setItem("userId", String(userData.id_usuario));
      } else if (sessionStorage.getItem("token") === token) {
        sessionStorage.setItem("userId", String(userData.id_usuario));
      }
      
      // Solo redirigir si estamos en la página de login
      if (location.pathname === "/login") {
        const searchParams = new URLSearchParams(location.search);
        const redirect = searchParams.get('redirect') || '/';
        navigate(redirect, { replace: true });
      }
    } catch (error) {
      console.error("Token inválido o expirado:", error);
      await logout();
    } finally {
      setLoading(false);
    }
  }, [api, logout, navigate, location]);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const checkAuth = async () => {
      if (token) {
        await validateToken(token);
      } else {
        setLoading(false);
        if (location.pathname !== "/login") {
          navigate("/login", { replace: true });
        }
      }
    };
    checkAuth();
  }, [validateToken, navigate, location]);

  const login = async (username: string, password: string, remember: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { token, usuario: userData } = await api.auth.login(username, password);

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("userId", String(userData.id_usuario)); // <-- AQUÍ GUARDA EL ID

      setUser({
        id: userData.id_usuario,
        username: userData.username,
        nombre: userData.nombre,
        rol: userData.rol,
        id_rol: userData.id_rol,
        email: userData.email || userData.username,
        token,
      });

      // Redirigir después de login exitoso
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect, { replace: true });
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!user,
    clearError,
    token: user?.token ?? null,
  }), [user, login, logout, loading, error, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
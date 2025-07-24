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

  // Dentro de tu AuthProvider
const logout = useCallback(async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    // 1. Invalidar token en backend
    if (token) {
      try {
        await api.auth.logout(token);
      } catch (error) {
        console.error("Error en logout remoto:", error);
      }
    }

    // 2. Limpieza nuclear
    setUser(null);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    
    // 3. Forzar recarga completa
    window.location.href = '/login?logout=success&t=' + Date.now();
    
  } catch (error) {
    console.error("Error en logout:", error);
    window.location.href = '/login?logout=error';
  } finally {
    setLoading(false);
  }
}, [api]);

  const validateToken = useCallback(async (token: string) => {
    try {
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
      
      // Si estamos en la página de login y el token es válido, redirigir
      if (location.pathname === "/login") {
        const redirectPath = userData.id_rol === 1 ? "/admin" : "/dashboard";
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error("Token inválido o expirado:", error);
      await logout(); // Limpiar sesión inválida
    } finally {
      setLoading(false);
    }
  }, [api, logout, navigate, location]);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
      // Si no hay token y no estamos en login, redirigir
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    }
  }, [validateToken, navigate, location]);

  const login = async (username: string, password: string, remember: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { token, usuario: userData } = await api.auth.login(username, password);

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", token);

      setUser({
        id: userData.id_usuario,
        username: userData.username,
        nombre: userData.nombre,
        rol: userData.rol,
        id_rol: userData.id_rol,
        email: userData.email || userData.username,
        token,
      });

      const redirectPath = userData.id_rol === 1 ? "/admin" : "/dashboard";
      navigate(redirectPath, { replace: true });
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
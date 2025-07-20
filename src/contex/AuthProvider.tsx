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
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        await api.auth.logout(token);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, location.pathname, api]);

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
    } catch (error) {
      console.error("Token inválido o expirado:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout, api]);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, [validateToken]);

  const login = async (username: string, password: string, remember: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { usuario: userData, token } = await api.auth.login(username, password);

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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        error,
        isAuthenticated: !!user,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

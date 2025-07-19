import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/types";
import { useNavigate } from "react-router-dom";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Cierra la sesión del usuario tanto en frontend como en backend
   */
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        // Llamar al endpoint de logout en el backend
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión en el backend:', error);
    } finally {
      // Limpiar el estado y almacenamiento local
      setUser(null);
      setSessionId(null);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  }, [navigate, sessionId]);

  /**
   * Valida el token con el backend y actualiza el estado del usuario
   */
  const validateToken = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      const userData = await response.json();
      
      setUser({
        id: userData.id_usuario,
        username: userData.username,
        nombre: userData.nombre,
        rol: userData.rol,
        id_rol: userData.id_rol,
        email: userData.email,
        token,
      });

      // Extraer sessionId del token si existe
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sessionId) {
          setSessionId(payload.sessionId);
        }
      } catch (e) {
        console.warn('No se pudo extraer sessionId del token'+ e);
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setError("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  /**
   * Efecto para validar el token al cargar el provider
   */
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, [validateToken]);

  /**
   * Maneja el proceso de login
   */
  const login = async (username: string, password: string, remember: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      const userData = data.usuario;
      const token = data.token;

      // Almacenar token según preferencia de "recordar"
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      // Extraer sessionId del token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sessionId) {
          setSessionId(payload.sessionId);
        }
      } catch (e) {
        console.warn('No se pudo extraer sessionId del token'+ e);
      }

      // Actualizar estado del usuario
      setUser({
        id: userData.id_usuario,
        username: userData.username,
        nombre: userData.nombre,
        rol: userData.rol,
        id_rol: userData.id_rol,
        email: userData.email || userData.username,
        token
      });

      // Redirigir según el rol del usuario
      const redirectPath = userData.rol === 'admin' ? '/admin' : '/';
      navigate(redirectPath, { replace: true });
      
      return true;
    } catch (error: unknown) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Error al iniciar sesión");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      loading,
      error,
      sessionId,
      isAuthenticated: !!user,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
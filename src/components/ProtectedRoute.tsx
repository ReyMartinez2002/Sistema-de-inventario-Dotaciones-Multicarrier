import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contex/useAuth';

const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated, loading, token } = useAuth();
  const location = useLocation();

  // Efecto para verificar autenticación en cada cambio de ruta
  useEffect(() => {
    if (!loading && !isAuthenticated && token) {
      // Forzar recarga si hay token pero no está autenticado
      window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}&invalid_session=true`;
    }
  }, [location.pathname, isAuthenticated, loading, token]);

  if (loading) {
    return <div className="loading-screen">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    // Guardar la ubicación actual para redirección después del login
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
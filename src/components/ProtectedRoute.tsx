import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contex/useAuth';

const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Verificando autenticación...</div>;
  }

  if (!isAuthenticated) {
    // Redirigir al login manteniendo la ruta deseada
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
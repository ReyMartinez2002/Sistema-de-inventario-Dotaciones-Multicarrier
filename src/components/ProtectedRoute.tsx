import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contex/useAuth';

const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
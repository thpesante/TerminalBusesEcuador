import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Si no hay usuario, mandamos a Login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si hay roles permitidos definidos, verificamos el rol del usuario
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirigir según el rol que SÍ tenga
    if (role === 'CLIENTE') return <Navigate to="/dashboard" replace />;
    if (role === 'BUS') return <Navigate to="/driver-dashboard" replace />;
    if (role === 'OFICINA') return <Navigate to="/erp/ticketing" replace />;
    if (role === 'DATOS') return <Navigate to="/datos-dashboard" replace />;
    
    // Si el rol no es ninguno de los conocidos, vuelta al login
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00216e] border-t-transparent"></div>
      </div>
    );
  }

  // Si el usuario ya está autenticado, lo redirigimos a su dashboard correspondiente
  if (user) {
    if (role === 'CLIENTE') return <Navigate to="/dashboard" replace />;
    if (role === 'BUS') return <Navigate to="/driver-dashboard" replace />;
    if (role === 'OFICINA') return <Navigate to="/erp/ticketing" replace />;
    if (role === 'DATOS') return <Navigate to="/municipio/dashboard" replace />;
    
    // Fallback por si el rol no está cargado aún o no es reconocido
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

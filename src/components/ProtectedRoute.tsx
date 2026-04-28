import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, userData, loading } = useAuth();
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
    
    return <Navigate to="/" replace />;
  }

  // REGLAS DE ACCESO PARA STAFF (OFICINA)
  if (role === 'OFICINA' && userData?.permissions) {
    const path = location.pathname;
    const permissions = userData.permissions;

    // Mapa de rutas a llaves de permisos
    const pathMap: Record<string, string> = {
      '/erp/ticketing': 'ticketing',
      '/erp/fleet': 'fleet',
      '/erp/invoicing': 'invoicing',
      '/erp/routing': 'routing',
      '/erp/cash-close': 'cash-close',
      '/erp/terminal': 'terminal',
      '/erp/reports': 'reports',
      '/erp/settings': 'settings'
    };

    const requiredPermission = pathMap[path];

    if (requiredPermission && !permissions[requiredPermission]) {
      // Si no tiene permiso para la ruta actual, buscar el primero que sí tenga
      const firstAvailable = Object.keys(pathMap).find(p => permissions[pathMap[p]]);
      if (firstAvailable) {
        return <Navigate to={firstAvailable} replace />;
      } else {
        // Si no tiene acceso a nada, fuera
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

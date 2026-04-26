import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

interface ERPSidebarProps {
  activePath?: string;
}

export default function ERPSidebar({ activePath }: ERPSidebarProps) {
  const { userData } = useAuth();
  const location = useLocation();
  const currentPath = activePath || location.pathname;

  const navItems = [
    { name: 'Terminal', icon: 'terminal', path: '/erp/terminal', key: 'terminal' },
    { name: 'Control de Flota', icon: 'directions_bus', path: '/erp/fleet', key: 'fleet' },
    { name: 'Emisión de Boletos', icon: 'confirmation_number', path: '/erp/ticketing', key: 'ticketing' },
    { name: 'Planificación de Rutas', icon: 'map', path: '/erp/routing', key: 'routing' },
    { name: 'Facturación Electrónica', icon: 'receipt_long', path: '/erp/invoicing', key: 'invoicing' },
    { name: 'Reportes', icon: 'analytics', path: '/erp/reports', key: 'reports' },
    { name: 'Cierre de Caja', icon: 'point_of_sale', path: '/erp/cash-close', key: 'cash-close' },
    { name: 'Configuración', icon: 'settings', path: '/erp/settings', key: 'settings' },
  ];

  const visibleItems = navItems.filter(item => {
    if (!userData) return false;
    if (!userData.permissions) return true;
    return userData.permissions[item.key] === true;
  });

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.replace('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col bg-[#00113a] w-64 border-r border-white/10 font-headline tracking-tight z-50 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-black uppercase tracking-widest text-[#ffe07f]">Bus ERP</h1>
        <div className="mt-8 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ffe07f]">
            <img
              className="w-full h-full object-cover grayscale brightness-125"
              alt="Profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANXKPNzgv89UaHJzU6fRzpUieHP_f6fE6SuyvDEl26zQJ-zUcJhCbFX9epLx5zX2RcvHxHYlabzoGoVeBPF3TDwNuqfvmKabMs81CjRyldduqQysR8Xs4fT67rYHUKWxPNnypxSzQeeJPKsspan6fG6GVAM6X_Z3aArAx9lhvaLbW0_YJsxKEShp4CGaAqsNuadGnwzRJK9bau_Amk3VvR6BEVS0h-_nDH7708TldHwtD1zj_SmagHEbU8CUc-kBnBJM8L0m6e3yb8"
            />
          </div>
          <div>
            <p className="text-sm font-bold truncate w-24">{userData?.nombre || 'Jefe Oficina'}</p>
            <p className="text-[10px] text-blue-300 uppercase tracking-widest font-black">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 font-bold transition-all duration-150 rounded-xl group cursor-pointer ${isActive
                  ? 'text-[#ffe07f] bg-white/10 shadow-lg shadow-black/20'
                  : 'text-blue-200/60 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="material-symbols-outlined text-xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <span className="text-xs uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </nav>




      <div className="p-4 border-t border-[#42494f]/15 space-y-1">
        <button className="flex w-full items-center gap-3 px-4 py-2 text-slate-400 font-medium hover:text-white cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-lg">help</span>
          <span className="text-sm">Soporte</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 text-red-300 font-bold hover:text-red-100 hover:bg-red-500/10 rounded-xl cursor-pointer transition-all"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="text-sm uppercase tracking-widest">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  msg: string;
  time: string;
  read: boolean;
}

export default function ERPTopBar({ title }: { title?: string }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Cargar notificaciones desde localStorage para no saturar la DB
  useEffect(() => {
    const saved = localStorage.getItem('erp_alerts');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      // Notificaciones iniciales de bienvenida / sistema
      const initial = [
        { id: '1', msg: 'Sistema de Taquilla Conectado', time: 'Ahora', read: false },
        { id: '2', msg: 'Sincronización con SRI Exitosa', time: 'Hace 5m', read: true }
      ];
      setNotifications(initial);
      localStorage.setItem('erp_alerts', JSON.stringify(initial));
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('erp_alerts', JSON.stringify(updated));
  };

  const addTestNotification = (msg: string) => {
    const fresh = { id: Date.now().toString(), msg, time: 'Ahora', read: false };
    const updated = [fresh, ...notifications].slice(0, 5); // Max 5
    setNotifications(updated);
    localStorage.setItem('erp_alerts', JSON.stringify(updated));
  };

  return (
    <header className="flex items-center justify-between px-8 w-full h-16 bg-[#00113a]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl sticky top-0 z-40 text-white">
      <div className="flex items-center gap-8">
        <h1 className="font-headline font-black text-[#ffe07f] tracking-tighter text-xl uppercase cursor-pointer" onClick={() => navigate('/erp/terminal')}>
          {title || 'Terminal ERP'}
        </h1>
        <nav className="hidden lg:flex gap-6 border-l border-white/10 pl-6 ml-2">
          <Link to="/erp/reports" className="text-blue-200/60 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-[#ffe07f] transition-all">Telemetría</Link>
          <Link to="/erp/fleet" className="text-blue-200/60 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-[#ffe07f] transition-all">Flota en Vivo</Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar - UI Functional focus */}
        <div className="relative group hidden md:block">
            <span className="absolute inset-y-0 left-3 flex items-center text-blue-300">
                <span className="material-symbols-outlined text-sm">search</span>
            </span>
            <input 
                className="bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-widest w-64 py-2.5 pl-10 pr-4 rounded-xl focus:ring-1 focus:ring-[#ffe07f] placeholder-blue-300/30 text-white outline-none transition-all focus:bg-white/10" 
                placeholder="Buscar recursos..." 
                type="text"
            />
        </div>

        <div className="flex items-center gap-5">
            {/* Notifications Dropdown */}
            <div className="relative pr-2">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) markAsRead(); }}
                className="material-symbols-outlined text-blue-200/80 cursor-pointer hover:text-[#ffe07f] transition-colors bg-transparent border-none p-0 outline-none"
              >
                notifications
              </button>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#00113a] animate-pulse"></span>
              )}
              
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-72 bg-[#001c5a] border border-white/10 rounded-[2rem] shadow-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                   <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-300">Notificaciones Locales</h4>
                      <button onClick={() => setShowNotifications(false)} className="material-symbols-outlined text-xs opacity-40 hover:opacity-100">close</button>
                   </div>
                   <div className="space-y-4">
                      {notifications.map(n => (
                        <div key={n.id} className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0">
                           <p className={`text-[11px] font-bold ${n.read ? 'text-blue-100/40' : 'text-blue-50'}`}>{n.msg}</p>
                           <span className="text-[8px] font-black uppercase opacity-30 italic">{n.time}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            {/* Topology / Terminal Status */}
            <button 
              onClick={() => navigate('/erp/terminal')}
              className="material-symbols-outlined text-blue-200/80 cursor-pointer hover:text-[#ffe07f] transition-colors bg-transparent border-none p-0 outline-none"
            >
              hub
            </button>

            {/* Settings Link */}
            <div 
              onClick={() => navigate('/erp/settings')}
              className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:border-[#ffe07f] hover:bg-white/10 transition-all cursor-pointer group"
            >
              <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform duration-500">settings</span>
            </div>
        </div>
      </div>
    </header>
  );
}

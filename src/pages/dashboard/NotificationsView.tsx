import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
}

const NotificationsView: React.FC<{ setView: (v: any) => void }> = ({ setView }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      // Default initial notifications if empty
      const initial: Notification[] = [
        { id: '1', title: 'Bienvenido a Terminal Digital', content: 'Tu cuenta ha sido activada correctamente.', time: 'Reciente', type: 'SUCCESS', read: false },
        { id: '2', title: 'Seguridad', content: 'Recuerda que nunca te pediremos tu clave por teléfono.', time: 'Hoy', type: 'INFO', read: false }
      ];
      setNotifications(initial);
      localStorage.setItem('notifications', JSON.stringify(initial));
    }
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto py-12 px-6">
       <div className="flex justify-between items-end mb-12">
          <div>
             <h1 className="text-4xl font-black font-headline text-[#00216e] italic tracking-tighter uppercase">Alertas</h1>
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-2">{notifications.filter(n => !n.read).length} Mensajes nuevos</p>
          </div>
          <button onClick={markAllRead} className="text-[9px] font-black uppercase text-blue-500 tracking-widest hover:underline">Marcar leídos</button>
       </div>

       <div className="space-y-4">
          {notifications.map(n => (
            <div key={n.id} className={`p-8 rounded-[2.5rem] bg-white shadow-sm border border-slate-100 flex gap-6 transition-all group ${n.read ? 'opacity-50' : 'opacity-100 shadow-xl'}`}>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${n.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  <span className="material-symbols-outlined">{n.type === 'SUCCESS' ? 'verified' : 'info'}</span>
               </div>
               <div className="flex-1">
                  <h4 className="font-black text-[#00216e] uppercase italic tracking-tighter">{n.title}</h4>
                  <p className="text-slate-500 text-sm font-medium mt-1">{n.content}</p>
                  <span className="text-[9px] font-black text-slate-300 uppercase mt-4 block">{n.time}</span>
               </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-20 text-center opacity-20 italic font-black uppercase text-xs tracking-widest">No hay notificaciones</div>
          )}
       </div>

       <button onClick={() => setView('hub')} className="mt-12 w-full py-5 bg-slate-100 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all">Regresar</button>
    </div>
  );
};

export default NotificationsView;

import React, { useState } from 'react';

interface NotificationsViewProps {
  setView: (view: any) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ setView }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '¡Tu unidad está cerca!',
      content: 'La unidad 402 de Cooperativa Loja está a 10 minutos de tu ubicación.',
      time: 'Hace 5 mins',
      icon: 'info',
      color: 'secondary',
      read: false,
    },
    {
      id: 2,
      title: 'Pago Confirmado',
      content: 'Tu ticket para Cuenca - Guayaquil ha sido generado con éxito.',
      time: 'Hace 1 hora',
      icon: 'confirmation_number',
      color: 'primary',
      read: false,
    },
    {
      id: 3,
      title: 'Mantenimiento de Plataforma',
      content: 'Realizaremos mejoras técnicas hoy a las 23:00 PM.',
      time: 'Ayer',
      icon: 'campaign',
      color: 'outline',
      read: true,
    },
  ]);

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-12 text-left">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold font-headline text-primary">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-sm font-bold text-secondary mt-1">{unreadCount} sin leer</p>
          )}
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="text-sm font-bold text-primary hover:underline font-headline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 flex gap-4 transition-all hover:translate-x-1 cursor-pointer ${n.read ? 'opacity-60' : 'opacity-100'}`}
            style={{ borderLeftColor: `var(--${n.color})` }}
          >
            <span className="material-symbols-outlined" style={{ color: `var(--${n.color})` }}>
              {n.icon}
            </span>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold font-headline">{n.title}</h4>
                {!n.read && (
                  <span className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-1.5 ml-2"></span>
                )}
              </div>
              <p className="text-sm text-on-surface-variant font-body">{n.content}</p>
              <span className="text-[10px] text-outline font-bold uppercase mt-2 block font-label">{n.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => setView('hub')}
          className="text-primary font-bold font-headline flex items-center justify-center gap-2 mx-auto hover:bg-primary/5 px-6 py-3 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default NotificationsView;

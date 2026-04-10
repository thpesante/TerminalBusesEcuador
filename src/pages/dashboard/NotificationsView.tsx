import React from 'react';

interface NotificationsViewProps {
  setView: (view: any) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ setView }) => {
  const notifications = [
    {
      title: '¡Tu unidad está cerca!',
      content: 'La unidad 402 de Cooperativa Loja está a 10 minutos de tu ubicación.',
      time: 'Hace 5 mins',
      type: 'status',
      icon: 'info',
      color: 'secondary'
    },
    {
      title: 'Pago Confirmado',
      content: 'Tu ticket para Cuenca - Guayaquil ha sido generado con éxito.',
      time: 'Hace 1 hora',
      type: 'success',
      icon: 'confirmation_number',
      color: 'primary'
    },
    {
      title: 'Mantenimiento de Plataforma',
      content: 'Realizaremos mejoras técnicas hoy a las 23:00 PM.',
      time: 'Ayer',
      type: 'info',
      icon: 'campaign',
      color: 'outline'
    }
  ];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-12 text-left">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold font-headline text-primary">Notificaciones</h1>
        <button className="text-sm font-bold text-primary hover:underline font-headline">Marcar todas como leídas</button>
      </div>
      
      <div className="space-y-4">
        {notifications.map((n, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 flex gap-4 transition-all hover:translate-x-1 cursor-pointer ${i === 2 ? 'opacity-60' : ''}`} style={{ borderLeftColor: `var(--${n.color})` }}>
            <span className="material-symbols-outlined" style={{ color: `var(--${n.color})` }}>{n.icon}</span>
            <div>
              <h4 className="font-bold font-headline">{n.title}</h4>
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

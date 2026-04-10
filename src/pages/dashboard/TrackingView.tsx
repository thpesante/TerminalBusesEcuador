import React, { useState } from 'react';
import MapBoxComponent from '../../components/MapBoxComponent';

const TrackingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'history'>('tracking');

  // Sample data for the map
  const busLocation: [number, number] = [-78.4720, -0.1900];
  const terminalLocation: [number, number] = [-78.4678, -0.1807];

  const markers = [
    { lngLat: busLocation, title: 'Bus 148-B', description: 'En camino a Terminal Carcelén', type: 'bus' as const },
    { lngLat: terminalLocation, title: 'Terminal Carcelén', description: 'Destino final', type: 'terminal' as const }
  ];

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 text-left">
        {/* Map Section */}
        <div className="lg:col-span-8 h-[500px] bg-surface-container-low rounded-3xl overflow-hidden relative shadow-sm group">
          <MapBoxComponent center={busLocation} zoom={14} markers={markers} />
          
          <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-80 glass-card bg-white/90 p-6 rounded-2xl shadow-xl border border-white/20 z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1 font-label">En Camino</p>
                <h3 className="font-headline text-xl font-bold text-on-surface">Ruta Quito - Manta</h3>
              </div>
              <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold font-headline">148-B</div>
            </div>
            <div className="space-y-3 font-body">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                <span className="text-on-surface-variant text-sm">Llega en <span className="font-bold text-on-surface">12 minutos</span></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">pin_drop</span>
                <span className="text-on-surface-variant text-sm">Próxima parada: <span className="font-bold text-on-surface">Terminal Carcelén</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Ticket Section */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-3xl p-6 flex flex-col shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-lg font-extrabold text-primary">Boleto Digital</h2>
            <span className="material-symbols-outlined text-emerald-500 filled-icon">verified</span>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center py-4 bg-surface-container-low rounded-2xl mb-6">
            <div className="p-4 bg-white rounded-xl shadow-inner border-2 border-dashed border-slate-200">
              <img 
                className="w-40 h-40 object-contain" 
                alt="QR Code" 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TR-9982-XQ22"
              />
            </div>
            <p className="mt-4 font-mono text-xs font-medium text-slate-400 tracking-[0.2em]">TR-9982-XQ22</p>
          </div>
          <div className="space-y-4 font-body">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Asiento</span>
              <span className="text-sm font-bold text-on-surface">A24 (Ventana)</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Hora Salida</span>
              <span className="text-sm font-bold text-on-surface">09:15 AM</span>
            </div>
          </div>
          <button className="mt-8 w-full bg-gradient-to-r from-primary to-primary-container text-white rounded-full py-4 font-headline font-bold text-sm tracking-wide shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">file_download</span>
            DESCARGAR BOLETO
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-3xl p-2 flex gap-2 w-fit mb-8 shadow-inner">
        <button 
          onClick={() => setActiveTab('tracking')}
          className={`${activeTab === 'tracking' ? 'bg-white text-primary' : 'text-slate-500'} px-8 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all font-headline`}
        >
          Seguimiento
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`${activeTab === 'history' ? 'bg-white text-primary' : 'text-slate-500'} px-8 py-3 rounded-2xl font-bold text-sm transition-all font-headline`}
        >
          Historial de Viajes
        </button>
      </div>

      {activeTab === 'tracking' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {/* Alert Card */}
          <div className="bg-error-container/20 p-6 rounded-3xl border border-error-container/30 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-on-error-container">
              <span className="material-symbols-outlined text-3xl filled-icon">warning</span>
              <h3 className="font-headline font-bold">Aviso de Salida</h3>
            </div>
            <p className="text-sm text-on-error-container leading-relaxed font-body">El bus está por iniciar el embarque en el Andén 14. Por favor, acérquese a la puerta de salida en los próximos 5 minutos.</p>
            <div className="mt-auto">
              <span className="inline-block bg-white/50 text-on-error-container px-3 py-1 rounded-full text-[10px] font-black uppercase font-label">Urgente</span>
            </div>
          </div>

          {/* Bus Info Card */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-3xl">directions_bus</span>
              <h3 className="font-headline font-bold">Unidad Detalles</h3>
            </div>
            <div className="space-y-4 font-body">
                <div className="flex justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Cooperativa</span>
                    <span className="text-sm font-bold">Trans. Occidentales</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Placa</span>
                    <span className="text-sm font-bold">PBB-2345</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Conductor</span>
                    <span className="text-sm font-bold">Carlos M.</span>
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {/* Past Trip Cards */}
          {[
            { destination: 'Guayaquil - Cuenca', date: '12 Oct 2023', seat: '12', price: '15.00' },
            { destination: 'Quito - Ibarra', date: '05 Oct 2023', seat: '08', price: '12.50' }
          ].map((trip, i) => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 cursor-pointer">
              <div className="flex justify-between items-start mb-6 font-body">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400">history</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{trip.destination}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{trip.date}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-lg">chevron_right</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 font-body">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">event_seat</span>
                  <span>Asiento {trip.seat}</span>
                </div>
                <div className="font-bold text-primary font-headline">${trip.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackingView;

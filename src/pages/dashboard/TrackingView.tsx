import React, { useState, useEffect } from 'react';
import MapBoxComponent from '../../components/MapBoxComponent';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

interface Ticket {
  id: string;
  destino: string;
  origen: string;
  asiento: number;
  hora: string;
  tripId: string;
  ruc_empresa: string;
}

const TrackingView: React.FC = () => {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Buscamos el ticket más reciente activo del usuario
    const q = query(
      collection(db, 'tickets'),
      where('pasajero.uid', '==', user.uid),
      where('estado', '==', 'ACTIVO'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveTicket({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Ticket);
      } else {
        setActiveTicket(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Coordenadas fijas para la demo (en producción vendrían del bus vía Firestore)
  const busLocation: [number, number] = [-78.4720, -0.1900];
  const terminalLocation: [number, number] = [-78.5256, -0.2858]; // Quitumbe

  const markers = [
    { lngLat: busLocation, title: 'Tu Bus en Vivo', description: activeTicket ? `Rumbo a ${activeTicket.destino}` : 'En ruta', type: 'bus' as const },
    { lngLat: terminalLocation, title: 'Terminal Destino', description: 'Punto de llegada', type: 'terminal' as const }
  ];

  if (loading) return <div className="p-20 text-center text-primary font-black uppercase tracking-widest animate-pulse italic">Localizando tu frecuencia...</div>;

  if (!activeTicket) {
    return (
      <div className="p-20 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 text-center animate-fade-in">
         <span className="material-symbols-outlined text-6xl text-slate-200 mb-6">location_off</span>
         <h2 className="text-3xl font-black font-headline text-[#00216e] uppercase italic tracking-tighter">Sin Viajes en Curso</h2>
         <p className="text-slate-400 mt-4 text-[10px] font-black uppercase tracking-widest max-w-sm mx-auto leading-loose">No hemos detectado tickets activos para seguimiento en este momento. Compra un boleto para activar el GPS.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-stretch">
        {/* Live GPS Map */}
        <div className="lg:col-span-8 h-[600px] bg-slate-100 rounded-[3.5rem] overflow-hidden relative shadow-2xl border-4 border-white group">
          <MapBoxComponent center={busLocation} zoom={13} markers={markers} />
          
          <div className="absolute top-8 left-8 bg-[#00113a] text-white p-6 rounded-3xl shadow-2xl border border-white/10 z-10">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2 italic">Monitoreo Satelital</p>
             <h3 className="text-2xl font-black font-headline italic tracking-tighter uppercase leading-none">{activeTicket.origen} → {activeTicket.destino}</h3>
          </div>

          <div className="absolute bottom-8 left-8 right-8 lg:w-96 bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 z-10 flex flex-col gap-6">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#00216e] text-white rounded-2xl flex items-center justify-center animate-pulse">
                   <span className="material-symbols-outlined text-3xl">navigation</span>
                </div>
                <div>
                   <p className="text-2xl font-black font-headline text-[#00216e] leading-none">12 MIN</p>
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic">Tiempo est. de llegada</p>
                </div>
             </div>
             <div className="h-px bg-slate-100"></div>
             <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-300">pin_drop</span>
                <p className="text-xs font-bold text-slate-500">Ubicación actual: <span className="text-[#00216e]">Entrada Sur (Quito)</span></p>
             </div>
          </div>
        </div>

        {/* Digital Ticket Detail */}
        <div className="lg:col-span-4 bg-white rounded-[3.5rem] p-10 flex flex-col shadow-xl border border-slate-50">
           <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
              <h2 className="text-xl font-black font-headline text-[#00216e] uppercase italic tracking-tighter">Abordaje Digital</h2>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Validado</span>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center py-10 bg-slate-50 rounded-[2.5rem] mb-10 border border-slate-100 relative overflow-hidden group">
              <div className="relative z-10 p-6 bg-white rounded-[2rem] shadow-2xl group-hover:scale-105 transition-transform">
                 <img 
                    className="w-44 h-44 object-contain opacity-80" 
                    alt="QR" 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${activeTicket.id}`}
                 />
              </div>
              <p className="mt-8 font-black text-[10px] text-slate-300 tracking-[0.4em] uppercase z-10 italic">Ticket ID: {activeTicket.id.slice(-8).toUpperCase()}</p>
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
           </div>

           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asiento Selecto</span>
                 <span className="text-xl font-black text-[#00216e] font-headline"># {activeTicket.asiento}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Puerta Salida</span>
                 <span className="text-xl font-black text-blue-500 font-headline uppercase italic">{activeTicket.hora}</span>
              </div>
           </div>

           <button className="mt-10 w-full bg-[#00216e] text-white py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 active:scale-95 transition-all flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              Vincular con App Móvil
           </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingView;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';

interface Company {
  id: string;
  nombre: string;
  ruc_empresa: string;
  logo?: string;
  office?: string;
}

interface Trip {
  id: string;
  destino: string;
  hora: string;
  estado: string;
  discoBus: string;
}

const TERMINAL_SERVICES = [
  { category: 'Bancos / Cajeros', items: ['Banco Pichincha (ATM)', 'Banco del Austro', 'Cooperativa JEP'], icon: 'payments', info: 'Ubicados en el pasillo principal, planta baja.' },
  { category: 'Alimentación', items: ['Patio de Comidas (Mora)', 'KFC', 'Subway', 'Cafetería Local'], icon: 'restaurant', info: 'Planta alta, zona de balcones.' },
  { category: 'Salud y Seguridad', items: ['Punto SOS 911', 'Policía Nacional', 'Farmacia Fybeca'], icon: 'emergency', info: 'Junto a la zona de arribos.' },
  { category: 'Servicios Básicos', items: ['Baños Públicos (SS.HH)', 'Duchas', 'Guarda Equipaje'], icon: 'wc', info: 'Distribuidos en los 4 vértices del terminal.' },
];

const VirtualTerminalView: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'plano' | 'cooperativas' | 'servicios'>('plano');
  const [cooperativas, setCooperativas] = useState<Company[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener Cooperativas (Usuarios con rol OFICINA)
    const qCoops = query(collection(db, 'users'), where('role', '==', 'OFICINA'));
    const unsubCoops = onSnapshot(qCoops, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        nombre: doc.data().nombre_empresa || doc.data().nombre || 'Cooperativa',
        ruc_empresa: doc.data().ruc_empresa,
        logo: doc.data().logo || `https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=100`,
        office: doc.data().oficina || 'Sector C'
      })) as Company[];
      
      // Eliminar duplicados por RUC
      const unique = Array.from(new Map(list.map(item => [item.ruc_empresa, item])).values());
      setCooperativas(unique);
    });

    // 2. Obtener Viajes en Tiempo Real para el 'Board'
    const qTrips = query(collection(db, 'trips'), where('estado', 'in', ['PROGRAMADO', 'ABORDAJE']));
    const unsubTrips = onSnapshot(qTrips, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        destino: doc.data().destino,
        hora: doc.data().hora,
        estado: doc.data().estado,
        discoBus: doc.data().discoBus
      })) as Trip[];
      setTrips(list);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error in VirtualTerminalView:", error);
      setLoading(false);
    });

    return () => { unsubCoops(); unsubTrips(); };
  }, []);

  return (
    <div className="bg-[#f8fafc] font-body text-slate-800 antialiased overflow-hidden h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-slate-100 transition-all text-[#00216e]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-xl font-black tracking-tighter text-[#00216e] font-headline uppercase italic">Andén Virtual Cuenca</span>
        </div>
        <div className="flex gap-4">
           {['plano', 'cooperativas', 'servicios'].map(v => (
             <button 
              key={v}
              onClick={() => setActiveView(v as any)}
              className={`px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === v ? 'bg-[#00216e] text-white' : 'bg-slate-100 text-slate-400'}`}
             >
               {v}
             </button>
           ))}
        </div>
      </header>

      <div className="flex flex-1 pt-20 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
           
           {activeView === 'plano' && (
             <div className="space-y-10 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                   {/* Departure Board (Real Data) */}
                   <div className="md:col-span-8 bg-[#00113a] p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-20"></div>
                      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                         <h2 className="text-2xl font-black font-headline uppercase italic tracking-tighter">Panel de Salidas</h2>
                         <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.4em] animate-pulse">En Vivo</span>
                      </div>
                      
                      <div className="space-y-4">
                         {trips.length === 0 ? (
                           <p className="text-slate-500 font-bold italic">No hay salidas inmediatas programadas...</p>
                         ) : (
                           trips.map(trip => (
                             <div key={trip.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-6">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${trip.estado === 'ABORDAJE' ? 'bg-[#ffe07f] text-[#00216e] animate-pulse' : 'bg-blue-600 text-white'}`}>
                                      {trip.discoBus}
                                   </div>
                                   <div>
                                      <p className="text-xl font-black uppercase tracking-tighter">{trip.destino}</p>
                                      <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Hora: {trip.hora}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${trip.estado === 'ABORDAJE' ? 'bg-green-500' : 'bg-blue-900 text-blue-200'}`}>
                                      {trip.estado}
                                   </span>
                                </div>
                             </div>
                           ))
                         )}
                      </div>
                   </div>

                   {/* Terminal Stats */}
                   <div className="md:col-span-4 space-y-6">
                      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Capacidad de Andén</h3>
                         <div className="flex items-center gap-4">
                            <span className="text-5xl font-black font-headline text-[#00216e]">84%</span>
                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                               <div className="w-[84%] h-full bg-[#00216e]"></div>
                            </div>
                         </div>
                      </div>
                      <div className="bg-[#ffe07f] p-8 rounded-[3rem] shadow-xl">
                         <p className="text-[10px] font-black text-[#00216e]/40 uppercase tracking-widest">Estado Terminal</p>
                         <p className="text-2xl font-black text-[#00216e] font-headline mt-2 uppercase italic leading-none">Operación Normal</p>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeView === 'cooperativas' && (
             <div className="animate-fade-in">
                <h2 className="text-4xl font-black font-headline text-[#00216e] mb-10 uppercase italic tracking-tighter">Oficinas y Boleterías Arrendadas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {cooperativas.map(coop => (
                     <div key={coop.id} onClick={() => navigate(`/cooperativa/${coop.ruc_empresa}`)} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all group cursor-pointer">
                        <div className="flex items-start justify-between mb-8">
                           <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-slate-50">
                              <img src={coop.logo} alt="logo" className="w-full h-full object-cover" />
                           </div>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{coop.office}</span>
                        </div>
                        <h3 className="text-2xl font-black font-headline text-[#00216e] uppercase tracking-tighter italic">{coop.nombre}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{coop.ruc_empresa}</p>
                        <div className="mt-8 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-all">
                           Ir a la Vitrina <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeView === 'servicios' && (
             <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                {TERMINAL_SERVICES.map((s, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex gap-8">
                     <div className="w-20 h-20 bg-[#00216e] text-white rounded-3xl flex items-center justify-center shadow-xl">
                        <span className="material-symbols-outlined text-4xl">{s.icon}</span>
                     </div>
                     <div className="flex-1">
                        <h4 className="text-2xl font-black font-headline text-[#00216e] uppercase italic mb-4">{s.category}</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                           {s.items.map(it => <span key={it} className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">{it}</span>)}
                        </div>
                        <p className="text-xs font-medium text-slate-400">{s.info}</p>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default VirtualTerminalView;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface Trip {
  id: string;
  destino: string;
  origen: string;
  hora: string;
  precio: number;
  discoBus: string;
  estado: string;
  ruc_empresa: string;
  nombre_empresa?: string;
}

const TerminalSchedule = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'trips'), orderBy('hora', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
      setTrips(list);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error in TerminalSchedule:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredTrips = trips.filter(t => 
    t.destino.toLowerCase().includes(filter.toLowerCase()) || 
    (t.nombre_empresa || '').toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8fafc]"><div className="w-12 h-12 border-4 border-[#00216e] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-body pb-32">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center px-10 h-20 shadow-sm">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
           <span className="text-xl font-black font-headline text-[#00216e] uppercase italic tracking-tighter leading-none">Andén Real-Time</span>
        </div>
        <div className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl">
           <button onClick={() => navigate('/terminal-map')} className="px-8 py-2 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-[#00216e] transition-all">Mapa</button>
           <button className="px-8 py-2 rounded-xl text-[10px] font-black uppercase bg-[#00216e] text-white shadow-lg">Frecuencias</button>
        </div>
        <button onClick={() => navigate('/dashboard')} className="material-symbols-outlined text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-all">close</button>
      </header>

      <main className="pt-32 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
           <div>
              <h1 className="text-5xl font-black font-headline text-[#00216e] leading-none tracking-tighter uppercase italic">Horarios del Día</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] mt-4 italic">Sincronización central con todas las operadoras</p>
           </div>
           <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
              <input 
                type="text" 
                placeholder="Filtrar por Destino o Cooperativa..." 
                className="w-full bg-white border-none rounded-2xl py-5 pl-14 pr-6 shadow-sm focus:ring-2 focus:ring-blue-100 font-bold placeholder:opacity-30"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
           </div>
        </div>

        <section className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden text-left">
           <div className="grid grid-cols-12 bg-[#00216e] text-white p-8 font-black text-[10px] uppercase tracking-widest italic">
              <div className="col-span-4 md:col-span-3">Cooperativa</div>
              <div className="col-span-4 md:col-span-3">Destino Final</div>
              <div className="hidden md:block col-span-2 text-center">Hora Salida</div>
              <div className="hidden md:block col-span-2 text-center">Unidad</div>
              <div className="col-span-4 md:col-span-2 text-right">Estatus</div>
           </div>

           <div className="divide-y divide-slate-50">
              {filteredTrips.map((t) => (
                <div key={t.id} className="grid grid-cols-12 p-10 items-center hover:bg-blue-50/30 transition-all group group-hover:scale-[1.01] cursor-pointer" onClick={() => navigate(`/booking/${t.ruc_empresa}?route=${t.origen} — ${t.destino}`)}>
                   <div className="col-span-4 md:col-span-3 flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-xs text-[#00216e] border border-slate-100 italic group-hover:bg-[#00216e] group-hover:text-white transition-all">
                         TD
                      </div>
                      <span className="font-black text-[#00216e] text-lg tracking-tighter uppercase italic">{t.nombre_empresa || 'Ruta Cooperada'}</span>
                   </div>
                   <div className="col-span-4 md:col-span-3 font-black text-slate-600 text-xl tracking-tighter uppercase italic">{t.destino}</div>
                   <div className="hidden md:block col-span-2 text-center font-black text-blue-600 text-2xl font-headline tracking-tighter italic">{t.hora}</div>
                   <div className="hidden md:block col-span-2 text-center font-black text-slate-300">#{t.discoBus}</div>
                   <div className="col-span-4 md:col-span-2 text-right">
                      <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${t.estado === 'ABORDAJE' ? 'bg-[#ffe07f] text-[#00216e]' : 'bg-slate-100 text-slate-400'}`}>
                         {t.estado}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <section className="bg-[#ffe07f] p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="max-w-xl space-y-6">
              <h2 className="text-5xl font-black font-headline text-[#00216e] italic tracking-tighter uppercase leading-none">Ahorra tiempo, elige digital</h2>
              <p className="text-[#00216e]/60 font-bold leading-relaxed italic">No hagas filas en ventanilla. Todos los horarios que ves aquí pueden reservarse directamente desde tu bolsillo.</p>
              <button onClick={() => navigate('/dashboard', { state: { view: 'search' } })} className="bg-[#00216e] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Explorar Marketplace</button>
           </div>
        </section>
      </main>
    </div>
  );
};

export default TerminalSchedule;

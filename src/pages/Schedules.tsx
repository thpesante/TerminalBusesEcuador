import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Trip {
  id: string;
  origen: string;
  destino: string;
  hora: string;
  precio: number;
  discoBus: string;
  estado: string;
}

const Schedules: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'trips'), where('estado', '==', 'PROGRAMADO'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
      setTrips(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const commonDestinations = ["Quito", "Guayaquil", "Cuenca", "Manta"];
  const filteredTrips = trips.filter(t => 
    t.destino.toLowerCase().includes(filter.toLowerCase()) || 
    t.origen.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-[#FDF8FF] min-h-screen font-body text-[#1C1A24]">
      {/* ── TOP NAV ── */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-sm border-b border-[#F7F1FF]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-primary p-2 rounded-xl text-white group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined">directions_bus</span>
          </div>
          <span className="text-2xl font-black text-primary tracking-tighter uppercase font-headline">MOVU</span>
        </Link>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2.5 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all">Iniciar Sesión</Link>
          <Link to="/register" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all">Registrarse</Link>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── LEFT: Filters ── */}
          <aside className="lg:col-span-4 space-y-8 sticky top-32 h-fit">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F7F1FF]">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">filter_list</span>
                <h2 className="font-black text-xl uppercase tracking-tighter">Filtrar Rutas</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Filtro Rápido</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Busca tu próximo destino..." 
                      className="w-full bg-[#FDF8FF] border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold transition-all"
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <span className="material-symbols-outlined text-sm">explore</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Destinos Comunes</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonDestinations.map(dest => (
                      <button 
                        key={dest} 
                        onClick={() => setFilter(dest)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${filter === dest ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-600 border-slate-50 hover:border-primary/20'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px]">location_on</span> {dest}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <span className="material-symbols-outlined text-[160px]">info</span>
              </div>
              <h3 className="text-xl font-black uppercase mb-2 font-headline">Panel Informativo</h3>
              <p className="text-sm text-blue-100/70 leading-relaxed font-medium mb-6">Esta vista es solo para consulta de horarios. Para comprar boletos, por favor inicia sesión o crea una cuenta.</p>
              <Link to="/login" className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest bg-white text-primary px-6 py-3 rounded-xl hover:brightness-110 transition-all">Acceder Ahora</Link>
            </div>
          </aside>

          {/* ── RIGHT: Frequencies Grid ── */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h1 className="text-4xl font-black font-headline uppercase text-[#1C1A24]">Marketplace de Viajes</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Frecuencias activas en tiempo real</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-3xl font-black text-primary">{filteredTrips.length}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">Rutas Encontradas</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredTrips.map(trip => (
                  <div key={trip.id} className="bg-white p-6 rounded-[2rem] border border-[#F7F1FF] flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="bg-[#FDF8FF] p-4 rounded-2xl flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Horario</span>
                        <span className="text-2xl font-black text-primary leading-none">{trip.hora}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                          Salida: T. Terrestre {trip.origen}
                        </div>
                        <h3 className="text-2xl font-black text-[#1C1A24] uppercase tracking-tighter">Hacia {trip.destino}</h3>
                        <div className="flex gap-2">
                           <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Unidad #{trip.discoBus}</span>
                           <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">WiFi Disponible</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto border-t md:border-t-0 md:border-l border-[#F7F1FF] pt-6 md:pt-0 md:pl-10">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Desde</p>
                        <p className="text-4xl font-black text-[#1C1A24] tracking-tighter">${trip.precio.toFixed(2)}</p>
                      </div>
                      <button className="md:mt-4 px-6 py-3 bg-slate-50 text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                        Solo Informativo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
                <h3 className="text-xl font-black uppercase text-slate-400">No se encontraron rutas</h3>
                <p className="text-sm text-slate-300 font-medium">Prueba con otro destino o limpia los filtros.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-[#F7F1FF] py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Movu Ecosistema Digital • 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default Schedules;

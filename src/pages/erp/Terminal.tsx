import React, { useState, useEffect } from 'react';
import ERPSidebar from '../../components/erp/ERPSidebar';
import ERPTopBar from '../../components/erp/ERPTopBar';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface Trip {
  id: string;
  destino: string;
  hora: string;
  discoBus: string;
  placaBus: string;
  estado: 'PROGRAMADO' | 'ABORDAJE' | 'DESPACHADO' | 'CANCELADO';
  anden?: string;
}

export default function Terminal() {
  const { userData } = useAuth();
  const rucEmpresa = userData?.ruc_empresa || '';
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!rucEmpresa) return;
    const q = query(collection(db, 'trips'), where('ruc_empresa', '==', rucEmpresa));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        estado: 'PROGRAMADO', // Default if missing
        ...doc.data() 
      })) as Trip[];
      setTrips(list.sort((a, b) => a.hora.localeCompare(b.hora)));
    });
    return () => unsubscribe();
  }, [rucEmpresa]);

  const updateStatus = async (tripId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        estado: newStatus,
        lastUpdated: serverTimestamp()
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex bg-[#00113a] text-white font-body min-h-screen">
      <ERPSidebar activePath="/erp/terminal" />
      
      <main className="flex-1 ml-64 flex flex-col">
        <ERPTopBar title="Control Maestro de Terminal" />
        
        <div className="p-10 space-y-10">
           {/* Terminal Header Info */}
           <div className="flex justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-md">
              <div className="space-y-2">
                 <p className="text-[#ffe07f] font-black text-[10px] tracking-[0.4em] uppercase">Panel de Operaciones en Tiempo Real</p>
                 <h2 className="text-4xl font-black italic tracking-tighter uppercase">Boarding Status Control</h2>
              </div>
              <div className="flex gap-8">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Salidas Hoy</p>
                    <p className="text-3xl font-black">{trips.length}</p>
                 </div>
                 <div className="w-px bg-white/10"></div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">En Abordaje</p>
                    <p className="text-3xl font-black text-green-400">{trips.filter(t => t.estado === 'ABORDAJE').length}</p>
                 </div>
              </div>
           </div>

           {/* Flight Board Style UI */}
           <div className="bg-black/40 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                 <thead className="bg-[#00216e] text-blue-300">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Hora</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Destino</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Unidad</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Andén</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Estado Actual</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Acción</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {trips.map(trip => (
                      <tr key={trip.id} className="hover:bg-white/5 transition-all">
                         <td className="px-8 py-6 font-mono text-xl text-[#ffe07f] font-bold">{trip.hora}</td>
                         <td className="px-8 py-6 font-black text-lg italic tracking-widest uppercase">{trip.destino}</td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col">
                               <span className="text-xs font-black">DISCO {trip.discoBus}</span>
                               <span className="text-[10px] text-blue-400 font-bold">{trip.placaBus}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-xl font-black text-blue-300">{(trip.id.slice(-2)).toUpperCase()}</td>
                         <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
                               trip.estado === 'ABORDAJE' ? 'bg-amber-500 text-black animate-pulse' :
                               trip.estado === 'DESPACHADO' ? 'bg-green-600/20 text-green-400' :
                               trip.estado === 'CANCELADO' ? 'bg-red-600/20 text-red-400' :
                               'bg-blue-600/20 text-blue-400'
                            }`}>
                               {trip.estado}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex justify-center gap-2">
                               {trip.estado === 'PROGRAMADO' && (
                                 <button onClick={() => updateStatus(trip.id, 'ABORDAJE')} className="bg-amber-500 text-black px-4 py-2 rounded-xl text-[10px] font-black hover:scale-105 transition-all uppercase">Iniciar Abordaje</button>
                               )}
                               {trip.estado === 'ABORDAJE' && (
                                 <button onClick={() => updateStatus(trip.id, 'DESPACHADO')} className="bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:scale-105 transition-all uppercase">Despachar</button>
                               )}
                               {trip.estado === 'DESPACHADO' && (
                                 <span className="material-symbols-outlined text-green-500">task_alt</span>
                               )}
                            </div>
                         </td>
                      </tr>
                    ))}
                    {trips.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-20 text-center opacity-30">
                           <span className="material-symbols-outlined text-6xl">upcoming</span>
                           <p className="mt-4 text-xs font-black uppercase tracking-[0.3em]">No hay salidas programadas para este momento</p>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>

           {/* Quick Terminal Alerts */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[3rem] space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-red-400 tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                    Alertas Críticas
                 </h4>
                 <p className="text-xs font-bold text-red-200/60 lowercase italic">Sin incidentes registrados en andenes...</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-[3rem] space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-green-400 tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Eficiencia Operativa
                 </h4>
                 <p className="text-xs font-bold text-green-200/60">Tiempo promedio de abordaje: 8.5 min</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-[3rem] space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Visibilidad Pública
                 </h4>
                 <p className="text-xs font-bold text-blue-200/60 lowercase italic">Panel sincronizando con TV de sala de espera...</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

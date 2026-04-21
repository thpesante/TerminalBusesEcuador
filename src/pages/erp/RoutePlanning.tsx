import React, { useState, useEffect } from 'react';
import ERPSidebar from '../../components/erp/ERPSidebar';
import ERPTopBar from '../../components/erp/ERPTopBar';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface Bus {
  id: string;
  placa: string;
  disco: string;
  capacidad: number;
  busType: string;
}

interface Trip {
  id: string;
  destino: string;
  hora: string;
  precio: number;
  placaBus: string;
  discoBus: string;
  estado: string;
}

export default function RoutePlanning() {
  const { userData } = useAuth();
  const rucEmpresa = userData?.ruc_empresa || '';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newTrip, setNewTrip] = useState({
    destino: '',
    hora: '',
    precio: 0,
    busId: ''
  });

  useEffect(() => {
    if (!rucEmpresa) return;

    // Listen to Trips
    const qTrips = query(collection(db, 'trips'), where('ruc_empresa', '==', rucEmpresa));
    const unsubTrips = onSnapshot(qTrips, (snapshot) => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[]);
    });

    // CONSULTA REAL DE UNIDADES (Desde la colección 'units')
    const qBuses = query(
      collection(db, 'units'), 
      where('empresa_ruc', '==', rucEmpresa),
      where('estado', '==', 'ACTIVO')
    );
    
    const unsubBuses = onSnapshot(qBuses, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          disco: data.disco || 'S/N',
          placa: data.placa || 'S/P',
          capacidad: data.capacidad || 0,
          busType: data.busType || 'Normal'
        };
      }) as Bus[];
      setBuses(list);
      setLoading(false);
    });

    return () => { unsubTrips(); unsubBuses(); };
  }, [rucEmpresa]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBus = buses.find(b => b.id === newTrip.busId);
    if (!selectedBus) {
        alert("Por favor seleccione una unidad válida.");
        return;
    }

    try {
      await addDoc(collection(db, 'trips'), {
        ruc_empresa: rucEmpresa,
        nombre_empresa: userData?.nombre_cooperativa || 'Cooperativa',
        destino: newTrip.destino.toUpperCase(),
        hora: newTrip.hora,
        precio: Number(newTrip.precio),
        busId: selectedBus.id,
        placaBus: selectedBus.placa,
        discoBus: selectedBus.disco,
        capacidad: selectedBus.capacidad,
        asientosOcupados: [],
        estado: 'PROGRAMADO',
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setNewTrip({ destino: '', hora: '', precio: 0, busId: '' });
    } catch (e) { alert("Error al crear turno"); }
  };

  return (
    <div className="flex bg-[#f8fafc] text-slate-800 font-body min-h-screen">
      <ERPSidebar activePath="/erp/routing" />
      
      <main className="ml-64 flex-1 flex flex-col h-screen">
        <ERPTopBar title="Planificación y Despacho Operacional" />
        
        <div className="p-10 overflow-y-auto">
           <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-[#00216e] uppercase tracking-tighter italic leading-none">Gestión de Frecuencias</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-4 italic">Asignación de activos tecnológicos a rutas comerciales</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-[#00216e] text-white px-10 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
              >
                <span className="material-symbols-outlined text-sm">add_task</span>
                Programar Despacho
              </button>
           </div>

           <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400">
                       <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em]">Destino Operacional</th>
                       <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em]">Cronograma</th>
                       <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em]">Activo Asignado</th>
                       <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em] text-center">Tarifa Base</th>
                       <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em] text-right">Estatus SI</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {trips.map(trip => (
                      <tr key={trip.id} className="hover:bg-blue-50/50 transition-all cursor-pointer group">
                         <td className="px-10 py-10">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#00216e] shadow-sm border border-slate-50 group-hover:bg-[#00216e] group-hover:text-white transition-all">
                                  <span className="material-symbols-outlined">map</span>
                               </div>
                               <div>
                                  <span className="font-black text-xl text-[#00216e] uppercase italic tracking-tighter">{trip.destino}</span>
                                  <p className="text-[8px] font-black text-slate-300 uppercase mt-1">Ruta Directa Certificada</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-10 font-black text-2xl text-blue-600 font-headline italic tracking-tighter">{trip.hora}hs</td>
                         <td className="px-10 py-10">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">DISCO {trip.discoBus}</span>
                               <span className="font-black text-[9px] text-[#3755c3] uppercase italic mt-1 bg-blue-50 px-3 py-1 rounded-full w-fit">{trip.placaBus}</span>
                            </div>
                         </td>
                         <td className="px-10 py-10 text-center font-black text-2xl text-[#00216e] font-headline tracking-tighter">$ {(trip.precio || 0).toFixed(2)}</td>
                         <td className="px-10 py-10 text-right">
                            <span className={`px-4 py-2 rounded-full text-[9px] font-black tracking-widest uppercase ${trip.estado === 'PROGRAMADO' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                               {trip.estado}
                            </span>
                         </td>
                      </tr>
                    ))}
                    {trips.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-40 text-center">
                           <span className="material-symbols-outlined text-7xl text-slate-100 mb-6 block">departure_board</span>
                           <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] italic">No hay frecuencias activas en la red de despacho</p>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Modal New Trip */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[#001453]/95 backdrop-blur-xl">
             <div className="relative bg-white w-full max-w-2xl rounded-[4rem] p-16 shadow-2xl overflow-hidden border border-white">
                <h3 className="text-4xl font-black text-[#00216e] uppercase mb-12 flex items-center gap-6 italic tracking-tighter">
                  <span className="material-symbols-outlined text-5xl text-[#3755c3]">add_location_alt</span>
                  Protocolo de Despacho
                </h3>
                <form onSubmit={handleCreateTrip} className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-300 ml-4 tracking-[0.2em] italic underline decoration-[#3755c3] decoration-4 underline-offset-4">Destino de la Frecuencia</label>
                      <input required value={newTrip.destino} onChange={e => setNewTrip({...newTrip, destino: e.target.value})} className="w-full bg-[#f8fafc] h-20 rounded-[2.5rem] px-10 font-black uppercase text-xl text-[#00216e] outline-none border-2 border-transparent focus:border-blue-100 transition-all" placeholder="Escriba destino..." />
                   </div>
                   <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-slate-300 ml-4 tracking-[0.2em] italic underline decoration-[#3755c3] decoration-4 underline-offset-4">Hora de Salida</label>
                         <input required type="time" value={newTrip.hora} onChange={e => setNewTrip({...newTrip, hora: e.target.value})} className="w-full bg-[#f8fafc] h-20 rounded-[2.5rem] px-10 font-black text-2xl text-[#00216e] outline-none" />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-slate-300 ml-4 tracking-[0.2em] italic underline decoration-[#3755c3] decoration-4 underline-offset-4">Tarifa Pública ($)</label>
                         <input required type="number" step="0.01" value={newTrip.precio} onChange={e => setNewTrip({...newTrip, precio: Number(e.target.value)})} className="w-full bg-[#f8fafc] h-20 rounded-[2.5rem] px-10 font-black text-2xl text-[#00216e] outline-none" placeholder="0.00" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-300 ml-4 tracking-[0.2em] italic underline decoration-[#3755c3] decoration-4 underline-offset-4">Selección de Activo Disponible</label>
                      <select required value={newTrip.busId} onChange={e => setNewTrip({...newTrip, busId: e.target.value})} className="w-full bg-[#f8fafc] h-20 rounded-[2.5rem] px-10 font-black text-sm text-[#00216e] outline-none appearance-none cursor-pointer hover:bg-white border-2 border-transparent hover:border-blue-100 transition-all">
                         <option value="">Seleccione Unidad Flota...</option>
                         {buses.map(bus => (
                            <option key={bus.id} value={bus.id}>#{bus.disco} — {bus.placa} ({bus.busType} • {bus.capacidad} Asientos)</option>
                         ))}
                      </select>
                      {buses.length === 0 && <p className="text-[9px] font-black text-red-400 uppercase mt-2 ml-6 animate-pulse">Alerta: No se detectan unidades activas para asignación.</p>}
                   </div>
                   <div className="pt-10 flex gap-8">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-900 transition-all">Cancelar</button>
                      <button type="submit" className="flex-[2] bg-[#00216e] text-white py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 active:scale-95 transition-all">Publicar Frecuencia</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

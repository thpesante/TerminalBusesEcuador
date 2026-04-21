import React, { useState, useEffect } from 'react';
import ERPSidebar from '../../components/erp/ERPSidebar';
import ERPTopBar from '../../components/erp/ERPTopBar';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface Bus {
  id: string;
  placa: string;
  disco: string;
  marca?: string;
  modelo?: string;
  capacidad: number;
  estado: 'ACTIVO' | 'MANTENIMIENTO' | 'BAJA';
  empresa_ruc: string;
  busType?: string;
  amenities?: string[];
  hasAssistant?: string;
  hasCompartment?: boolean;
  topologia?: any;
  nombre_chofer?: string; // We'll try to find the driver
}

export default function BusVisualizer() {
  const { userData } = useAuth();
  const rucEmpresa = userData?.ruc_empresa || '';

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopology, setSelectedTopology] = useState<any>(null);

  useEffect(() => {
    if (!rucEmpresa) return;

    // CONSULTA REAL: Traemos las UNIDADES de esta empresa
    const q = query(
      collection(db, 'units'), 
      where('empresa_ruc', '==', rucEmpresa)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          estado: data.estado || 'ACTIVO',
          capacidad: data.capacidad || 0,
        } as Bus;
      });
      setBuses(list);
      setLoading(false);
    }, (error) => {
      console.error("Error Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [rucEmpresa]);

  const toggleEstado = async (busId: string, current: string) => {
    const next = current === 'ACTIVO' ? 'MANTENIMIENTO' : 'ACTIVO';
    try {
      await updateDoc(doc(db, 'units', busId), { estado: next });
    } catch (e) {
      alert("Error al actualizar estado");
    }
  };

  const getCellColor = (type: string) => {
    if (type === 'seat') return 'bg-blue-600 text-white border-blue-700';
    if (type === 'bathroom') return 'bg-amber-400 text-white border-amber-500';
    if (type === 'entrance') return 'bg-emerald-400 text-white border-emerald-500';
    return 'bg-slate-100 text-transparent border-slate-200';
  };

  return (
    <div className="flex bg-[#f8fafc] text-slate-800 font-body min-h-screen">
      <ERPSidebar activePath="/erp/fleet" />
      
      <main className="ml-64 flex-1 flex flex-col h-screen">
        <ERPTopBar title="Consola de Gestión de Flota" />
        
        <div className="p-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-12">
             <div>
               <h2 className="text-4xl font-black text-[#00216e] uppercase tracking-tighter italic leading-none">Mi Flota Operacional</h2>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-4 italic">Visualización técnica de unidades y topologías</p>
             </div>
             
             <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                <div className="px-8 py-3 border-r border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase">Unidades Activas</p>
                    <p className="text-2xl font-black text-[#00216e]">{buses.filter(b => b.estado === 'ACTIVO').length}</p>
                </div>
                <div className="px-8 py-3 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase">Capacidad Total</p>
                    <p className="text-2xl font-black text-blue-500">{buses.reduce((acc, b) => acc + (b.capacidad || 0), 0)}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8 pb-20">
             {loading ? (
                [1,2,3].map(i => <div key={i} className="h-80 bg-white rounded-[4rem] animate-pulse"></div>)
             ) : buses.map(bus => (
               <div key={bus.id} className="bg-white rounded-[4rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group overflow-hidden flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-10">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-[#00216e] group-hover:bg-[#ffe07f] transition-all">
                           <span className="material-symbols-outlined text-4xl">airport_shuttle</span>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Activo #{bus.disco}</p>
                           <h4 className="text-2xl font-black text-[#00216e] uppercase italic tracking-tighter leading-tight mt-1">{bus.marca} {bus.modelo}</h4>
                        </div>
                     </div>
                     <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${bus.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {bus.estado}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-[#f8fafc] p-6 rounded-[2.5rem] border border-slate-50">
                        <p className="text-[8px] font-black text-slate-300 uppercase mb-2">Identificador</p>
                        <p className="font-black text-[#00216e] text-lg uppercase">{bus.placa}</p>
                     </div>
                     <div className="bg-[#f8fafc] p-6 rounded-[2.5rem] border border-slate-50">
                        <p className="text-[8px] font-black text-slate-300 uppercase mb-2">Pasajeros</p>
                        <p className="font-black text-[#00216e] text-lg">{bus.capacidad} <span className="text-[10px] font-bold text-slate-400">Puestos</span></p>
                     </div>
                  </div>

                  <div className="space-y-6 mb-10">
                     <div className="flex flex-wrap gap-2">
                        {bus.amenities?.map(am => (
                           <span key={am} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                              {am === 'ac_unit' ? 'A/C' : am.toUpperCase()}
                           </span>
                        ))}
                        <span className="px-3 py-1.5 bg-blue-50 text-[#00216e] rounded-lg text-[8px] font-black uppercase tracking-widest">
                           {bus.hasAssistant === 'Sí' ? 'Con Ayudante' : 'Solo Piloto'}
                        </span>
                     </div>
                     
                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">architecture</span>
                        Arquitectura: {bus.busType || 'Normal'}
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button 
                       onClick={() => toggleEstado(bus.id, bus.estado)}
                       className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-blue-900/5 active:scale-95"
                     >
                        Gestionar
                     </button>
                     <button 
                       onClick={() => setSelectedTopology(bus.topologia)}
                       className="flex-1 bg-[#00216e] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3755c3] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                     >
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                        Ver Diseño
                     </button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* Topology Overlay Modal */}
      {selectedTopology && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001453]/95 backdrop-blur-xl p-10 overflow-y-auto">
          <div className="bg-white rounded-[5rem] p-12 max-w-4xl w-full relative shadow-2xl">
             <button 
                onClick={() => setSelectedTopology(null)}
                className="absolute top-10 right-10 w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
             >
                <span className="material-symbols-outlined text-3xl">close</span>
             </button>

             <div className="mb-12">
                <h3 className="text-3xl font-black text-[#00216e] italic uppercase tracking-tighter decoration-[#ffe07f] decoration-8 underline underline-offset-8">Esquema Topológico</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-8">Distribución certificada de asientos y facilidades</p>
             </div>

             <div className="flex gap-12 justify-center">
                {/* Superior Floor */}
                <div className="flex-1 max-w-[280px]">
                    <p className="text-[10px] font-black text-center text-slate-300 mb-6 tracking-widest uppercase">Piso Superior / Cabina Única</p>
                    <div className="grid grid-cols-4 gap-2 bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                        {Object.values(selectedTopology.superior || {}).sort((a:any, b:any) => a.row - b.row || a.col - b.col).map((c: any) => (
                           <div key={c.id} className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black border-2 shadow-sm transition-all ${getCellColor(c.type)}`}>
                              {c.type === 'seat' ? c.label : ''}
                           </div>
                        ))}
                    </div>
                </div>

                {/* Inferior Floor (if any) */}
                {Object.keys(selectedTopology.inferior || {}).length > 0 && (
                  <div className="flex-1 max-w-[280px]">
                      <p className="text-[10px] font-black text-center text-slate-300 mb-6 tracking-widest uppercase">Piso Inferior</p>
                      <div className="grid grid-cols-4 gap-2 bg-slate-900 p-8 rounded-[3rem] border border-black shadow-inner">
                          {Object.values(selectedTopology.inferior || {}).sort((a:any, b:any) => a.row - b.row || a.col - b.col).map((c: any) => (
                             <div key={c.id} className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black border-2 border-white/10 ${getCellColor(c.type)} shadow-md`}>
                                {c.type === 'seat' ? c.label : ''}
                             </div>
                          ))}
                      </div>
                  </div>
                )}
             </div>

             <div className="mt-16 flex justify-center gap-8 border-t border-slate-50 pt-10">
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-[#00216e]">Asientos</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 bg-amber-400 rounded-lg shadow-lg shadow-amber-400/20"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-[#00216e]">Baños</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 bg-emerald-400 rounded-lg shadow-lg shadow-emerald-400/20"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-[#00216e]">Entradas</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

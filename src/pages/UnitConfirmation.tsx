import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';

const UnitConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unitData, setUnitData] = useState<any>(location.state?.unitData || {});
  const [grids, setGrids] = useState<any>(location.state?.grids || { superior: {}, inferior: {} });
  const draftId = location.state?.draftId || `temp_${auth.currentUser?.uid}`;
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const snap = await getDoc(doc(db, 'units_draft', draftId));
            if (snap.exists()) {
                const data = snap.data();
                setUnitData(data);
                if (data.grids) setGrids(data.grids);
            }
        } catch (err) { console.error("Error loading final confirmation data:", err); }
        finally { setLoading(false); }
    };
    fetchData();
  }, [draftId]);

  const superiorCells = Object.values(grids.superior || {}).sort((a:any, b:any) => a.row - b.row || a.col - b.col);
  const inferiorCells = unitData.busType === 'Dos Pisos' ? Object.values(grids.inferior || {}).sort((a:any, b:any) => a.row - b.row || a.col - b.col) : [];
  
  const totalAsientos = [...superiorCells, ...inferiorCells].filter((c: any) => c.type === 'seat').length;

  const handleConfirm = async () => {
    setIsSaving(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No hay sesión activa.");

      const finalUnit = {
        placa: unitData.placa || '',
        disco: unitData.disco || '',
        marca: unitData.marca || '',
        modelo: unitData.modelo || '',
        busType: unitData.busType || 'Normal',
        hasAssistant: unitData.hasAssistant || 'No',
        seatingType: unitData.seatingType || 'Básico',
        hasCompartment: unitData.hasCompartment || false,
        amenities: unitData.amenities || [],
        topologia: grids, 
        capacidad: totalAsientos,
        empresa_ruc: unitData.ruc_empresa || 'S/R',
        nombre_cooperativa: unitData.nombre_cooperativa || 'Cooperativa',
        creadoPor: user.uid,
        estado: 'ACTIVO',
        rol: 'BUS',
        createdAt: serverTimestamp(),
      };

      // 1. Guardar la unidad DEFINITIVA
      const unitRef = await addDoc(collection(db, 'units'), finalUnit);

      // 2. Vincular unidad al perfil y asegurar que el usuario tenga el rol BUS
      await setDoc(doc(db, 'users', user.uid), {
        unidadAsignada: unitRef.id,
        discoAsignado: unitData.disco,
        placaAsignada: unitData.placa,
        rol: 'BUS', // Forzamos el rol BUS para que aparezca en el ERP
        ruc_empresa: unitData.ruc_empresa || '',
        nombre_cooperativa: unitData.nombre_cooperativa || ''
      }, { merge: true });

      // 3. Limpiar el borrador
      await deleteDoc(doc(db, 'units_draft', draftId));

      navigate('/driver-dashboard');
    } catch (e: any) {
      setError('Error al guardar: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getCellColor = (type: string) => {
    if (type === 'seat') return 'bg-white text-[#00216e] border-[#00216e]/20';
    if (type === 'bathroom') return 'bg-amber-100 text-amber-600 border-amber-200';
    if (type === 'entrance') return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    return 'bg-slate-50 text-slate-300 border-slate-100';
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f7f9fb]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00216e]"></div></div>;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-body antialiased min-h-screen">
      <header className="w-full sticky top-0 z-50 bg-[#f7f9fb]/80 backdrop-blur-md flex justify-between items-center px-12 py-6 border-b border-[#eceef0]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#00216e] rounded-xl flex items-center justify-center text-white">
             <span className="material-symbols-outlined font-black">verified</span>
          </div>
          <span className="text-xl font-black text-[#191c1e] italic uppercase italic">Certificación de Activo</span>
        </div>
        <button onClick={() => navigate('/seat-designer', { state: { draftId, unitData, grids } })} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg">
           <span className="material-symbols-outlined text-sm">edit</span>
           Modificar Diseño
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-12 py-16">
        <div className="mb-20">
          <h1 className="text-5xl font-black text-[#191c1e] mb-6 tracking-tighter italic leading-none">{unitData.nombre_cooperativa?.toUpperCase()}</h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em]">Resumen de especificaciones técnicas y topológicas</p>
        </div>

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8 space-y-12">
             {/* Datos Técnicos */}
             <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-slate-50">
               <div className="flex items-center gap-4 mb-14">
                  <span className="material-symbols-outlined text-[#00216e] filled-icon">description</span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00216e]">Ficha Técnica del Vehículo</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-y-12 gap-x-10">
                  <div className="bg-slate-50 p-6 rounded-3xl">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Placa Nacional</p>
                    <p className="text-3xl font-black tracking-tight text-[#191c1e] uppercase">{unitData.placa}</p>
                  </div>
                  <div className="bg-[#00216e]/5 p-6 rounded-3xl">
                    <p className="text-[9px] font-black text-[#00216e]/30 uppercase tracking-widest mb-2">Disco Asignado</p>
                    <p className="text-3xl font-black tracking-tight text-[#00216e]">#{unitData.disco}</p>
                  </div>
                  
                  <div className="col-span-2 grid grid-cols-3 gap-6">
                     <div className="border-l-4 border-slate-100 pl-4">
                        <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Modelo</p>
                        <p className="font-black text-sm uppercase">{unitData.modelo}</p>
                     </div>
                     <div className="border-l-4 border-slate-100 pl-4">
                        <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Asientos</p>
                        <p className="font-black text-sm uppercase">{unitData.seatingType}</p>
                     </div>
                     <div className="border-l-4 border-slate-100 pl-4">
                        <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Pasajeros</p>
                        <p className="font-black text-sm uppercase">{totalAsientos} Capacidad</p>
                     </div>
                  </div>

                  <div className="col-span-2 flex flex-wrap gap-3 pt-6">
                     <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${unitData.hasAssistant === 'Sí' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {unitData.hasAssistant === 'Sí' ? 'Con Ayudante' : 'Solo Conductor'}
                     </span>
                     <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${unitData.hasCompartment ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {unitData.hasCompartment ? 'Bodega Habilitada' : 'Sin Bodega'}
                     </span>
                     {unitData.amenities?.map((am: string) => (
                        <span key={am} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white">
                           {am === 'ac_unit' ? 'Aire Acondicionado' : am.toUpperCase()}
                        </span>
                     ))}
                  </div>
               </div>
             </div>

             {/* Topología Visual */}
             <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-slate-50">
               <div className="flex items-center gap-4 mb-12">
                  <span className="material-symbols-outlined text-[#00216e]">view_quilt</span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00216e]">Topología Estructural</h3>
               </div>

               <div className="bg-slate-50 rounded-[3rem] p-12">
                  <div className="max-w-xs mx-auto space-y-4">
                     <p className="text-[8px] font-black text-center text-slate-400 mb-6 tracking-[0.4em]">
                        {unitData.busType === 'Normal' ? 'LAYOUT CABINA ÚNICA' : 'LAYOUT SEGUNDO PISO'}
                     </p>
                     <div className="grid grid-cols-4 gap-3">
                        {superiorCells.map((c: any) => (
                           <div key={c.id} className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${getCellColor(c.type)}`}>
                              {c.type === 'seat' ? c.label : c.type === 'bathroom' ? 'WC' : c.type === 'entrance' ? 'ENT' : ''}
                           </div>
                        ))}
                     </div>
                     
                     {unitData.busType === 'Dos Pisos' && inferiorCells.length > 0 && (
                        <>
                           <div className="h-px bg-slate-200 my-10"></div>
                           <p className="text-[8px] font-black text-center text-slate-400 mb-6 tracking-[0.4em]">LAYOUT PRIMER PISO</p>
                           <div className="grid grid-cols-4 gap-3">
                              {inferiorCells.map((c: any) => (
                                 <div key={c.id} className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${getCellColor(c.type)}`}>
                                    {c.type === 'seat' ? c.label : c.type === 'bathroom' ? 'WC' : c.type === 'entrance' ? 'ENT' : ''}
                                 </div>
                              ))}
                           </div>
                        </>
                     )}
                  </div>
               </div>
             </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
             <div className="sticky top-32 space-y-8">
                <div className="bg-[#00216e] text-white rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
                   <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 mb-10 italic">Validación Operativa</h4>
                   <p className="text-sm font-medium opacity-70 leading-relaxed mb-12">Esta unidad será integrada a la flota activa de <b>{unitData.nombre_cooperativa}</b>. Confirme que todos los datos son correctos.</p>
                   
                   {error && <div className="bg-red-500/20 border border-red-500/30 p-5 rounded-[2rem] mb-8 text-red-100 text-[10px] font-black uppercase">{error}</div>}

                   <button 
                     onClick={handleConfirm}
                     disabled={isSaving}
                     className="w-full bg-white h-24 rounded-[2.5rem] text-[#00216e] font-black text-xs uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 group flex flex-col items-center justify-center gap-1"
                   >
                     {isSaving ? 'CONECTANDO...' : 'FINALIZAR REGISTRO'}
                     {!isSaving && <span className="text-[8px] opacity-40 font-bold group-hover:opacity-100">Click para publicar</span>}
                   </button>
                   
                   <button onClick={() => navigate('/unit-registration')} className="w-full mt-6 py-4 border border-white/10 rounded-[2rem] text-[9px] font-black uppercase tracking-widest text-blue-200/50 hover:bg-white/5 transition-all">
                      Regresar al paso 1
                   </button>
                </div>

                <div className="bg-white p-10 rounded-[4rem] border border-slate-100 flex flex-col items-center gap-6 text-center">
                   <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined text-4xl">security</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Protocolo de Seguridad</p>
                      <p className="text-xs font-black text-slate-900 leading-relaxed italic">Activo certificado bajo los estándares de Logística Alpha Ecuador.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnitConfirmation;

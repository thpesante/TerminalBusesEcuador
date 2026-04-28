import React from 'react';
import { useNavigate } from 'react-router-dom';

const DriverReports: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-10 font-body">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/driver-dashboard')} className="flex items-center gap-2 text-[#3755c3] font-black uppercase text-[10px] tracking-widest mb-10 hover:gap-4 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
          Volver al Panel
        </button>

        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#191c1e] italic uppercase tracking-tighter mb-2">Análisis de Rendimiento</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Reportes de Operación • Unidad #12</p>
          </div>
          <button className="bg-[#3755c3] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#3755c3]/20 flex items-center gap-3">
             <span className="material-symbols-outlined text-sm">download</span>
             Descargar PDF
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Viajes este Mes</p>
              <p className="text-4xl font-black text-[#191c1e]">42</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">+12% vs mes anterior</p>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Km Recorridos</p>
              <p className="text-4xl font-black text-[#191c1e]">12,450</p>
              <p className="text-[10px] font-bold text-[#3755c3] uppercase mt-2">Eficiencia Optima</p>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ocupación Promedio</p>
              <p className="text-4xl font-black text-[#191c1e]">88%</p>
              <p className="text-[10px] font-bold text-amber-500 uppercase mt-2">Ruta Alta Demanda</p>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 mb-12">
           <h3 className="text-xl font-black text-[#191c1e] uppercase italic mb-10">Análisis de Rutas y Sugerencias</h3>
           <div className="space-y-8">
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3755c3]">
                    <span className="material-symbols-outlined text-3xl">trending_up</span>
                 </div>
                 <div>
                    <p className="font-black text-[#191c1e] text-lg uppercase italic">Mejor Ruta: Cuenca - Guayaquil</p>
                    <p className="text-sm text-slate-500 font-medium">Mayor rentabilidad detectada los días Viernes a las 16:00hs.</p>
                 </div>
              </div>
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                    <span className="material-symbols-outlined text-3xl">lightbulb</span>
                 </div>
                 <div>
                    <p className="font-black text-[#191c1e] text-lg uppercase italic">Sugerencia Operativa</p>
                    <p className="text-sm text-slate-500 font-medium">Incrementar frecuencia en feriados nacionales debido a demanda del 100% proyectada.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative min-h-[300px] flex items-center justify-center">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
           <div className="text-center relative z-10">
              <span className="material-symbols-outlined text-6xl mb-4 animate-pulse">leaderboard</span>
              <h4 className="text-2xl font-black font-headline uppercase italic">Gráfico de Carga de Pasajeros</h4>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Sincronizando datos de Bitácora...</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DriverReports;

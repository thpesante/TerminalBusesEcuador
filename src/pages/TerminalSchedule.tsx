import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TerminalSchedule = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const schedules = [
    { id: 1, coop: 'Cooperativa Loja', code: 'CL', dest: 'Quito', time: '14:30', gate: 'A-12', status: 'En Andén', statusColor: 'blue' },
    { id: 2, coop: 'Transportes Azuay', code: 'TA', dest: 'Guayaquil', time: '14:50', gate: 'A-03', status: 'Abordando', statusColor: 'emerald' },
    { id: 3, coop: 'Occidental', code: 'OC', dest: 'Loja', time: '15:15', gate: 'A-18', status: 'Programada', statusColor: 'slate' },
  ];

  const filteredSchedules = schedules.filter(s => 
    s.coop.toLowerCase().includes(filter.toLowerCase()) || 
    s.dest.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body pb-20">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa] dark:bg-[#00113a] bg-opacity-80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,11,58,0.06)] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined text-primary text-3xl">directions_bus</span>
          <span className="text-xl font-black text-blue-950 dark:text-white uppercase tracking-wider font-headline">Meridian Transit</span>
        </div>
        <div className="flex bg-surface-container-high rounded-full p-1 h-10">
          <button 
            onClick={() => navigate('/terminal-map')}
            className="px-6 rounded-full text-xs font-bold text-primary/60 hover:text-primary transition-all"
          >
            Mapa
          </button>
          <button 
            className="px-6 rounded-full text-xs font-bold bg-primary text-white shadow-md transition-all"
          >
            Horarios
          </button>
        </div>
        <button onClick={() => navigate('/dashboard')} className="material-symbols-outlined text-primary p-2 hover:bg-slate-200/50 rounded-full">close</button>
      </header>

      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div>
            <span className="text-secondary font-bold text-[10px] uppercase tracking-widest block mb-2">Terminal Terrestre de Cuenca</span>
            <h1 className="text-5xl font-extrabold font-headline text-primary tracking-tight leading-none mb-2">Horarios en Tiempo Real</h1>
            <p className="text-on-surface-variant font-medium opacity-80">Próximas salidas y llegadas actualizadas al instante.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input 
                type="text" 
                placeholder="Buscar por cooperativa..."
                className="w-full bg-surface-container-high text-primary px-10 py-3 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-primary/20"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Schedule Table/Grid */}
        <section className="bg-surface-container-lowest rounded-[2rem] shadow-[0_20px_60px_rgba(0,17,58,0.05)] overflow-hidden border border-white text-left">
          <div className="grid grid-cols-12 bg-primary text-white p-6 font-bold text-xs uppercase tracking-widest">
            <div className="col-span-4 md:col-span-3">Cooperativa</div>
            <div className="col-span-4 md:col-span-3">Destino</div>
            <div className="hidden md:block col-span-2 text-center">Hora</div>
            <div className="hidden md:block col-span-2 text-center">Andén</div>
            <div className="col-span-4 md:col-span-2 text-right">Estado</div>
          </div>

          <div className="divide-y divide-outline-variant/10">
            {filteredSchedules.map((s) => (
              <div 
                key={s.id}
                className="grid grid-cols-12 p-6 items-center hover:bg-surface-container-low transition-colors group cursor-pointer" 
                onClick={() => s.code === 'CL' ? navigate('/cooperativa-loja') : navigate('/dashboard', { state: { view: 'search' } })}
              >
                <div className="col-span-4 md:col-span-3 flex items-center gap-4">
                  <div className={`w-10 h-10 ${s.code === 'CL' ? 'bg-primary-container text-white' : s.code === 'TA' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-primary'} rounded-lg flex items-center justify-center font-black text-sm`}>
                    {s.code}
                  </div>
                  <span className="font-bold text-primary group-hover:text-secondary transition-colors">{s.coop}</span>
                </div>
                <div className="col-span-4 md:col-span-3 font-semibold text-on-surface">{s.dest}</div>
                <div className="hidden md:block col-span-2 text-center font-headline font-black text-lg">{s.time}</div>
                <div className="hidden md:block col-span-2 text-center">
                  <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-bold">{s.gate}</span>
                </div>
                <div className="col-span-4 md:col-span-2 text-right">
                  <span className={`px-3 py-1 bg-${s.statusColor}-100 text-${s.statusColor}-700 rounded-full text-[10px] font-bold uppercase tracking-tighter`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
            {filteredSchedules.length === 0 && (
              <div className="p-12 text-center text-outline-variant font-bold uppercase tracking-widest">No se encontraron resultados</div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 flex flex-col items-center text-center max-w-2xl mx-auto py-16 bg-primary-container rounded-[2rem] text-white overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-[120px]">directions_bus</span>
          </div>
          <h2 className="text-3xl font-extrabold font-headline mb-4 relative z-10">¿Ya tienes tu boleto?</h2>
          <p className="text-white/70 mb-8 relative z-10 leading-relaxed px-8">Evita filas y asegura tu asiento comprando directamente desde la aplicación de forma segura.</p>
          <button onClick={() => navigate('/dashboard', { state: { view: 'search' } })} className="bg-secondary-container text-on-secondary-container px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-transform relative z-10 shadow-lg">
            Comprar Pasaje Online
          </button>
        </section>
      </main>

      {/* Nav for Mobile compatibility */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white flex justify-around items-center px-4 pt-2 pb-6 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,17,58,0.08)] z-50">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-slate-400 px-4 py-1.5 hover:text-amber-600 transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-tighter mt-1">Inicio</span>
        </button>
        <button onClick={() => navigate('/terminal-map')} className="flex flex-col items-center justify-center text-slate-400 px-4 py-1.5 hover:text-amber-600 transition-all">
          <span className="material-symbols-outlined">map</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-tighter mt-1">Mapa</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center text-slate-400 px-4 py-1.5 hover:text-amber-600 transition-all">
          <span className="material-symbols-outlined">history</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-tighter mt-1">Viajes</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-amber-50 text-amber-700 rounded-xl px-4 py-1.5 transition-all">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-tighter mt-1">Terminal</span>
        </button>
      </nav>
    </div>
  );
};

export default TerminalSchedule;

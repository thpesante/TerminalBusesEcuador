import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VIRTUAL_TERMINAL_DATA = {
  cooperativas: [
    { id: 'loja', name: 'Cooperativa Loja', destinations: ['Quito', 'Guayaquil', 'Loja', 'Machala'], slogan: 'Excelencia y Tradición', office: 'Oficina 12', logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=100' },
    { id: 'oriental', name: 'Turismo Oriental', destinations: ['Guayaquil', 'Quito', 'Riobamba', 'Ambato'], slogan: 'Viaja con nosotros', office: 'Oficina 15', logo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=100' },
    { id: 'imbabura', name: 'Flota Imbabura', destinations: ['Quito', 'Ibarra', 'Tulcán', 'Manta'], slogan: 'Rapidez y Seguridad', office: 'Oficina 08', logo: 'https://images.unsplash.com/photo-1557223562-6c77ff16210f?auto=format&fit=crop&q=80&w=100' },
    { id: 'semeria', name: 'Super Semeria', destinations: ['Guayaquil', 'Machala', 'Huaquillas'], slogan: 'El gigante del sur', office: 'Oficina 03', logo: 'https://images.unsplash.com/photo-1632276534839-ef960453de63?auto=format&fit=crop&q=80&w=100' },
    { id: 'sanluis', name: 'San Luis', destinations: ['Quito', 'Gualaceo', 'Paute'], slogan: 'Servicio Intercantonal', office: 'Oficina 22', logo: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=100' }
  ],
  servicios: [
    { category: 'Bancos / Cajeros', items: ['Banco Pichincha (ATM)', 'Banco del Austro', 'Cooperativa JEP'], icon: 'payments', info: 'Ubicados en el pasillo principal, planta baja.' },
    { category: 'Alimentación', items: ['Patio de Comidas (Mora)', 'KFC', 'Subway', 'Cafetería Local'], icon: 'restaurant', info: 'Planta alta, zona de balcones.' },
    { category: 'Salud y Seguridad', items: ['Punto SOS 911', 'Policía Nacional', 'Farmacia Fybeca'], icon: 'emergency', info: 'Junto a la zona de arribos.' },
    { category: 'Servicios Básicos', items: ['Baños Públicos (SS.HH)', 'Duchas', 'Guarda Equipaje'], icon: 'wc', info: 'Distribuidos en los 4 vértices del terminal.' },
    { category: 'Comercios', items: ['Tienda de Dulces', 'Venta de Artesanías', 'Tecnología'], icon: 'storefront', info: 'Pasillo de conexión hacia andenes.' }
  ]
};

const VirtualTerminalView: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'plano' | 'cooperativas' | 'servicios'>('plano');
  const [activeTab, setActiveTab] = useState('salidas');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCooperativas = VIRTUAL_TERMINAL_DATA.cooperativas.filter(coop => 
    coop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coop.destinations.some(dest => dest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-hidden h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,11,58,0.06)] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <span className="text-xl font-extrabold tracking-tighter text-primary font-headline">Andén Virtual: Cuenca</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4 items-center bg-slate-100 p-1.5 rounded-2xl">
            <button 
                onClick={() => setActiveView('plano')}
                className={`px-6 py-2 rounded-xl font-headline font-black text-xs uppercase tracking-widest transition-all ${activeView === 'plano' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
            >
                Plano
            </button>
            <button 
                onClick={() => setActiveView('cooperativas')}
                className={`px-6 py-2 rounded-xl font-headline font-black text-xs uppercase tracking-widest transition-all ${activeView === 'cooperativas' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
            >
                Vitrina
            </button>
            <button 
                onClick={() => setActiveView('servicios')}
                className={`px-6 py-2 rounded-xl font-headline font-black text-xs uppercase tracking-widest transition-all ${activeView === 'servicios' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
            >
                Servicios
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-slate-400 p-2 rounded-full hover:bg-slate-50 cursor-pointer">notifications</span>
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold border-2 border-white shadow-sm">U</div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 pt-20 overflow-hidden">
        {/* SideNavBar (Desktop) */}
        <aside className="h-full w-72 bg-white shadow-2xl flex flex-col py-8 hidden lg:flex border-r border-slate-100">
          <div className="px-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white">directions_bus</span>
              </div>
              <div>
                <h2 className="font-bold text-primary font-headline text-md italic">Terminal Digital</h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Status: Online</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 flex flex-col gap-2">
            {[
                { id: 'plano', icon: 'map', label: 'Mapa Interactivo' },
                { id: 'cooperativas', icon: 'storefront', label: 'Ventanilla Única' },
                { id: 'servicios', icon: 'info_i', label: 'Guía de Servicios' },
                { id: 'emergency', icon: 'emergency', label: 'Emergencia SOS' }
            ].map((nav) => (
                <div 
                    key={nav.id}
                    onClick={() => setActiveView(nav.id as any)}
                    className={`mr-4 pl-6 py-4 flex items-center gap-4 cursor-pointer rounded-r-full transition-all border-l-4
                        ${activeView === nav.id ? 'bg-secondary/10 text-secondary border-secondary' : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-primary'}
                    `}
                >
                    <span className="material-symbols-outlined">{nav.icon}</span>
                    <span className="font-headline font-bold text-xs uppercase tracking-wider">{nav.label}</span>
                </div>
            ))}
          </nav>

          <div className="px-6 mt-auto">
            <button className="w-full py-4 bg-primary text-white rounded-2xl font-black font-headline tracking-tighter shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              COMPRAR TICKET
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 relative bg-slate-50 p-8 flex flex-col overflow-hidden">
          {/* Header Context */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-5xl font-black font-headline text-primary tracking-tighter leading-none mb-3">
                {activeView === 'plano' ? 'Plano de Terminal' : activeView === 'cooperativas' ? 'Ventanillas' : 'Directorio de Servicios'}
              </h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Corte: Tiempo Real • Gestión Inteligente</p>
            </div>
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="w-full bg-white border-none rounded-2xl py-4 pl-14 pr-6 shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary font-medium placeholder:text-slate-300" 
                placeholder="Busca por Cooperativa o Destino..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Content Shell */}
          <div className="flex-1 relative bg-white rounded-[3rem] shadow-2xl border-8 border-slate-100 overflow-hidden">
             
             {/* VIEW: PLANO */}
             {activeView === 'plano' && (
                <div className="w-full h-full p-12 animate-fade-in flex items-center justify-center">
                    <div className="relative w-full h-full max-w-5xl border-4 border-slate-50 rounded-[2.5rem] shadow-inner bg-slate-50/50 overflow-hidden">
                        {/* Architectural Mockup */}
                        <div className="absolute top-0 left-0 w-full h-1/4 bg-blue-50 flex items-center justify-around px-20 border-b border-white">
                            <div className="flex gap-4">
                                {[1,2,3,4].map(n => <div key={n} className="h-16 w-12 bg-white rounded-xl border-2 border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-300">A{n}</div>)}
                            </div>
                            <div className="hidden lg:block text-[10px] font-black text-blue-300 tracking-[0.5em] uppercase">Arribos</div>
                        </div>
                        {/* Central Hall */}
                        <div className="absolute top-1/3 left-1/4 w-1/2 h-1/3 bg-white rounded-3xl shadow-xl border border-slate-100 grid grid-cols-2 grid-rows-2 p-8 gap-6">
                            {[ {i:'payments', l:'Boleterías'}, {i:'restaurant', l:'Comidas'}, {i:'storefront', l:'Tiendas'}, {i:'package_2', l:'Encomiendas'} ].map((hall, idx) => (
                                <div key={idx} onClick={() => setActiveView(idx === 0 ? 'cooperativas' : idx === 1 ? 'servicios' : 'plano')} className="bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-100 group cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all">
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary mb-2">{hall.i}</span>
                                    <span className="text-[9px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest">{hall.l}</span>
                                </div>
                            ))}
                        </div>
                        {/* Departure Platforms */}
                        <div className="absolute bottom-0 left-0 w-full h-1/5 bg-slate-100/30 flex items-center px-10 gap-2 border-t border-white">
                            {[10,11,12,13,14,15,16].map(p => (
                                <div key={p} className={`flex-1 h-16 rounded-t-2xl shadow-sm border-x border-t transition-all cursor-pointer flex items-center justify-center group relative ${p === 12 ? 'bg-secondary text-white border-secondary h-20 shadow-xl shadow-secondary/20 -translate-y-2' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}>
                                    <span className="font-black text-xs">P{p}</span>
                                    {p === 12 && (
                                        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-56 bg-primary p-5 rounded-3xl shadow-2xl text-left animate-bounce-subtle pointer-events-none">
                                            <p className="text-xs font-black text-white/50 mb-3 tracking-widest">ANDÉN 12 • ACTIVO</p>
                                            <p className="text-sm font-black text-white leading-none">FLOTA IMBABURA</p>
                                            <p className="text-[9px] text-white/60 font-bold mt-1">DESTINO: QUITO</p>
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Reference Icons */}
                        <div className="absolute top-[55%] left-[15%] cursor-pointer group" onClick={() => setActiveView('servicios')}><div className="w-10 h-10 bg-white border-2 border-primary rounded-full flex items-center justify-center shadow-xl"><span className="material-symbols-outlined text-primary">wc</span></div></div>
                        <div className="absolute top-[20%] left-[80%] cursor-pointer group" onClick={() => setActiveView('servicios')}><div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-xl"><span className="material-symbols-outlined text-white">taxi_alert</span></div></div>
                    </div>
                    {/* Legend Tab Selector */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-2xl flex gap-2 z-20 border border-white/50">
                        {['salidas', 'arribos', 'boleteria', 'info'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-4 rounded-2xl font-black font-headline text-xs uppercase tracking-widest transition-all ${activeTab === t ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white'}`}>{t}</button>
                        ))}
                    </div>
                </div>
             )}

             {/* VIEW: COOPERATIVAS (Vitrina) */}
             {activeView === 'cooperativas' && (
                <div className="w-full h-full p-12 overflow-y-auto animate-fade-in custom-scrollbar">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-black font-headline text-primary tracking-tighter">Boleterías y Oficinas</h2>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-1 rounded-full uppercase tracking-widest">{filteredCooperativas.length} Cooperativas encontradas</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCooperativas.map((coop) => (
                            <div 
                                key={coop.id}
                                onClick={() => navigate(`/cooperativa/${coop.id}`)}
                                className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] group cursor-pointer hover:bg-primary transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden shadow-lg border-2 border-white">
                                        <img src={coop.logo} alt={coop.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-white/40">{coop.office}</span>
                                </div>
                                <h3 className="text-xl font-black font-headline text-primary group-hover:text-white tracking-tighter mb-2 leading-none">{coop.name}</h3>
                                <p className="text-[10px] font-black uppercase text-secondary group-hover:text-secondary-fixed tracking-widest italic mb-6">"{coop.slogan}"</p>
                                <div className="space-y-3 mb-8">
                                    <p className="text-[9px] font-black text-slate-400 group-hover:text-white/30 uppercase tracking-[0.2em]">Principales Destinos</p>
                                    <div className="flex flex-wrap gap-2">
                                        {coop.destinations.slice(0, 3).map((d, i) => <span key={i} className="px-3 py-1 bg-white group-hover:bg-white/10 rounded-full text-[9px] font-black text-slate-600 group-hover:text-white transition-colors">{d}</span>)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-primary group-hover:text-white font-black text-[10px] uppercase tracking-widest group-hover:translate-x-3 transition-all duration-500">
                                    Ver Vitrina Virtual
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {/* VIEW: SERVICIOS */}
             {activeView === 'servicios' && (
                <div className="w-full h-full p-12 overflow-y-auto animate-fade-in custom-scrollbar">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-black font-headline text-primary tracking-tighter">Directorio de Servicios</h2>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-3">
                            <span className="material-symbols-outlined filled-icon">verified</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Área Monitoreada</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {VIRTUAL_TERMINAL_DATA.servicios.map((serv, i) => (
                            <div key={i} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-50 flex items-start gap-8 hover:bg-white hover:shadow-2xl transition-all duration-500">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                    <span className="material-symbols-outlined text-2xl">{serv.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black font-headline text-primary tracking-tighter mb-4">{serv.category}</h3>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {serv.items.map((it, j) => <span key={j} className="px-4 py-1.5 bg-white rounded-xl text-xs font-bold text-slate-600 border border-slate-100">{it}</span>)}
                                    </div>
                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Información de Ubicación</p>
                                        <p className="text-xs font-bold text-indigo-900 leading-relaxed">{serv.info}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}

          </div>
        </main>
      </div>

      {/* Bottom Nav (Mobile) */}
      <footer className="lg:hidden fixed bottom-0 left-0 w-full h-24 bg-white border-t border-slate-100 flex justify-around items-center px-4 pb-4 z-50">
            <button onClick={() => setActiveView('plano')} className={`flex flex-col items-center gap-1 ${activeView === 'plano' ? 'text-primary' : 'text-slate-300'}`}>
                <span className="material-symbols-outlined">map</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Plano</span>
            </button>
            <button onClick={() => setActiveView('cooperativas')} className={`flex flex-col items-center gap-1 ${activeView === 'cooperativas' ? 'text-primary' : 'text-slate-300'}`}>
                <span className="material-symbols-outlined">storefront</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Vitrina</span>
            </button>
            <div className="w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center -translate-y-6"><span className="material-symbols-outlined">qr_code_scanner</span></div>
            <button onClick={() => setActiveView('servicios')} className={`flex flex-col items-center gap-1 ${activeView === 'servicios' ? 'text-primary' : 'text-slate-300'}`}>
                <span className="material-symbols-outlined">info</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Info</span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-slate-300">
                <span className="material-symbols-outlined">person</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Perfil</span>
            </button>
      </footer>
    </div>
  );
};

export default VirtualTerminalView;

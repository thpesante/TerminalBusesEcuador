import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapBoxComponent from '../components/MapBoxComponent';

const TerminalMap: React.FC = () => {
  const navigate = useNavigate();

  const terminalMarkers: any[] = [
    { 
        lngLat: [-78.5256, -0.2858], 
        title: 'Terminal Terrestre Quitumbe', 
        description: 'La terminal más importante de la capital.',
        fullInfo: 'Ubicación: Sur de Quito. Conecta con el centro y sur del país. Servicios: Food Court, Encomiendas, Conexión Trolebús.',
        type: 'terminal' 
    },
    { 
        lngLat: [-78.4735, -0.1118], 
        title: 'Terminal Carcelén', 
        description: 'Puerta de entrada al norte de Quito.',
        fullInfo: 'Ubicación: Norte de Quito. Destinos: Imbabura, Carchi, Esmeraldas. Operación: 24/7.',
        type: 'terminal' 
    },
    { 
        lngLat: [-79.8862, -2.1466], 
        title: 'Terminal Terrestre Guayaquil', 
        description: 'Terminal Jaime Roldós Aguilera.',
        fullInfo: 'La terminal de pasajeros más grande del Ecuador. Conecta con todas las ciudades del país.',
        type: 'terminal' 
    },
    { 
        lngLat: [-78.9950, -2.8974], 
        title: 'Terminal Terrestre Cuenca', 
        description: 'Ubicada en la Av. de las Américas.',
        fullInfo: 'Servicios de alta calidad. Rutas principales: Azogues, Gualaceo, Guayaquil, Loja.',
        type: 'terminal' 
    },
    { 
        lngLat: [-78.6225, -1.2491], 
        title: 'Terminal Terrestre Ambato', 
        description: 'Ubicación estratégica en el centro del país.',
        fullInfo: 'Punto de interconexión nacional. Destinos hacia Sierra, Costa y Oriente.',
        type: 'terminal' 
    },
    { 
        lngLat: [-79.2042, -3.9931], 
        title: 'Terminal Terrestre Loja', 
        description: 'Conectividad al Sur del Ecuador.',
        fullInfo: 'Destinos principales: Cuenca, Machala, Vilcabamba y conexiones internacionales a Piura (Perú).',
        type: 'terminal' 
    },
    { 
        lngLat: [-80.7063, -0.9634], 
        title: 'Terminal Terrestre Manta', 
        description: 'Terminal Marítima de Pasajeros.',
        fullInfo: 'Modernas instalaciones. Acceso directo a playas y zona comercial de Manta.',
        type: 'terminal' 
    },
    // Paradas Reales
    { lngLat: [-78.4841, -0.1867], title: 'Parada Estadio Olímpico', description: 'Conexión Ecovía', type: 'stop' },
    { lngLat: [-78.4985, -0.1918], title: 'Parada La Carolina', description: 'Zona Financiera', type: 'stop' },
    { lngLat: [-78.5123, -0.2188], title: 'Parada El Ejido', description: 'Centro de la ciudad', type: 'stop' }
  ];

  const routes = [
    {
      id: 'quito-guayaquil',
      coordinates: [
        [-78.5256, -0.2858], // Quitumbe
        [-78.59, -0.65], 
        [-78.8, -1.2], 
        [-79.4, -1.8], 
        [-79.8862, -2.1466]  // GYE
      ] as Array<[number, number]>,
      color: '#1a73e8',
      label: 'Flota Imbabura'
    },
    {
      id: 'gye-cuenca',
      coordinates: [
        [-79.8862, -2.1466], // GYE
        [-79.4, -2.3], 
        [-79.1, -2.7], 
        [-78.9950, -2.8974]  // Cuenca
      ] as Array<[number, number]>,
      color: '#ea4335',
      label: 'Turismo Oriental'
    },
    {
      id: 'quito-manta',
      coordinates: [
        [-78.5256, -0.2858], // Quitumbe
        [-79.1, -0.3], 
        [-79.8, -0.7], 
        [-80.7063, -0.9634]  // Manta
      ] as Array<[number, number]>,
      color: '#34a853',
      label: 'Reina del Camino'
    }
  ];

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body overflow-hidden flex flex-col">
       <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-6">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="font-headline font-black text-2xl tracking-tighter text-primary uppercase">TransporteEcuador</span>
        </div>
        <div className="flex gap-4">
            <div className="bg-slate-100 px-4 py-2 rounded-full hidden md:flex items-center gap-2">
                <span className="w-3 h-3 bg-[#1a73e8] rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">F. Imbabura</span>
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-full hidden md:flex items-center gap-2">
                <span className="w-3 h-3 bg-[#ea4335] rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">T. Oriental</span>
            </div>
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                PANEL
            </button>
        </div>
      </header>

      <main className="flex-1 mt-16 relative">
        <MapBoxComponent center={[-78.7248, -1.5]} zoom={7} markers={terminalMarkers} routes={routes} />
        
        {/* Real-time Legend Info */}
        <div className="absolute top-6 left-6 z-10 w-full max-w-sm hidden md:block">
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/50 animate-fade-in">
                <h2 className="text-3xl font-black text-primary font-headline mb-4 tracking-tight leading-none">Rutas Nacionales</h2>
                <p className="text-slate-500 text-sm mb-6 font-medium">Información real de terminales y paradas en todo el territorio ecuatoriano.</p>
                
                <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Estado General</p>
                                <p className="text-sm font-bold text-primary">Sistema Operativo 100%</p>
                            </div>
                        </div>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Terminales Activas</h3>
                    <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                        {terminalMarkers.filter(m => m.type === 'terminal').map((t, i) => (
                            <div key={i} className="flex gap-4 items-start group cursor-pointer hover:translate-x-1 transition-transform">
                                <span className="material-symbols-outlined text-primary text-xl mt-1">apartment</span>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary">{t.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase">{t.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-10 right-10 z-10 space-y-4">
             <div className="glass-card bg-emerald-600/90 text-white p-4 rounded-3xl shadow-xl border border-white/20 flex items-center gap-4">
                <span className="material-symbols-outlined animate-spin">sync</span>
                <div>
                   <p className="text-[8px] font-black uppercase tracking-widest opacity-80 leading-none">Actualización Real</p>
                   <p className="text-xs font-bold font-headline">TRANSPORTE ACTIVO</p>
                </div>
             </div>
        </div>
      </main>
    </div>
  );
};

export default TerminalMap;

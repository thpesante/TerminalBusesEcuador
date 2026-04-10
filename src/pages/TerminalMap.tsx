import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapBoxComponent from '../components/MapBoxComponent';

const TerminalMap: React.FC = () => {
  const navigate = useNavigate();

  // Datos exhaustivos de Terminales del Ecuador
  const terminalMarkers: any[] = [
    // Sierra
    { lngLat: [-78.5256, -0.2858], title: 'Terminal Terrestre Quitumbe', description: 'Terminal de Transparencia - Sur de Quito', fullInfo: 'Conector nacional sur. Servicios premium, seguridad 24/7 y acceso a Metro de Quito.', type: 'terminal' },
    { lngLat: [-78.4735, -0.1118], title: 'Terminal Carcelén', description: 'Acceso Norte - Quito', fullInfo: 'Puerta hacia Imbabura, Carchi y Esmeraldas. Alta frecuencia de salidas interprovinciales.', type: 'terminal' },
    { lngLat: [-78.9950, -2.8974], title: 'Terminal Terrestre Cuenca', description: 'Terminal Gil Ramírez Dávalos', fullInfo: 'Ubicación central, servicios de primera y rutas directas a Guayaquil, Loja y Machala.', type: 'terminal' },
    { lngLat: [-78.6225, -1.2491], title: 'Terminal Terrestre Ambato', description: 'Centro de Interconexión Nacional', fullInfo: 'Estratégicamente ubicada para conectar Sierra, Costa y Amazonía con alta demanda diaria.', type: 'terminal' },
    { lngLat: [-78.6542, -1.6731], title: 'Terminal Terrestre Riobamba', description: 'Conexión Sierra Centro', fullInfo: 'Servicios de transporte hacia la Costa y el Sur del país. Punto turístico ferroviario.', type: 'terminal' },
    { lngLat: [-79.2042, -3.9931], title: 'Terminal Terrestre Loja', description: 'Conexión Sur Binacional', fullInfo: 'Puerta hacia el Parque Nacional Podocarpus y rutas hacia Piura, Perú.', type: 'terminal' },
    { lngLat: [-78.1256, 0.3512], title: 'Terminal Terrestre Ibarra', description: 'Terminal de la Ciudad Blanca', fullInfo: 'Conecta con los lagos de Imbabura y la frontera norte.', type: 'terminal' },
    { lngLat: [-77.6322, 0.8115], title: 'Terminal Terrestre Tulcán', description: 'Frontera Norte', fullInfo: 'Principal puerto terrestre de conexión con el terminal de Ipiales, Colombia.', type: 'terminal' },
    
    // Costa
    { lngLat: [-79.8862, -2.1466], title: 'Terminal Terrestre Guayaquil', description: 'Terminal Jaime Roldós Aguilera', fullInfo: 'La terminal más grande de Latinoamérica por flujo de pasajeros. Conexión comercial total.', type: 'terminal' },
    { lngLat: [-80.7063, -0.9634], title: 'Terminal Terrestre Manta', description: 'Nodo Logístico Marítimo', fullInfo: 'Modernidad y acceso directo a la zona hotelera y comercial de la costa manabita.', type: 'terminal' },
    { lngLat: [-79.1764, -0.2522], title: 'Terminal Terrestre Santo Domingo', description: 'Nodo Vial del Ecuador', fullInfo: 'Punto de convergencia obligado para rutas que cruzan entre Sierra y Costa.', type: 'terminal' },
    { lngLat: [-79.9122, -3.2612], title: 'Terminal Terrestre Machala', description: 'Capital Bananera', fullInfo: 'Moderna infraestructura para la exportación y el tránsito hacia la frontera sur.', type: 'terminal' },
    { lngLat: [-79.6512, 0.9612], title: 'Terminal Terrestre Esmeraldas', description: 'Rutas a la Provincia Verde', fullInfo: 'Frecuencias constantes hacia Atacames y balnearios de la zona norte.', type: 'terminal' },
    { lngLat: [-80.9522, -2.2212], title: 'Terminal Terrestre Salinas', description: 'Destino Península', fullInfo: 'Principal acceso terrestre para el turismo vacacional en Santa Elena.', type: 'terminal' },
    { lngLat: [-79.4678, -1.0256], title: 'Terminal Terrestre Quevedo', description: 'Corazón Agrícola', fullInfo: 'Gran puerto terrestre intermedio entre Quito y Guayaquil.', type: 'terminal' },

    // Amazonía
    { lngLat: [-76.8912, -0.4612], title: 'Terminal Lago Agrio', description: 'Extremo Norte Amazónico', fullInfo: 'Servicios para la zona petrolera y conexión con la selva alta.', type: 'terminal' },
    { lngLat: [-76.9812, -0.9812], title: 'Terminal El Coca', description: 'Puerto Orellana', fullInfo: 'Acceso vial principal para el transporte masivo hacia el Yasuní.', type: 'terminal' },
    { lngLat: [-77.8112, -0.9912], title: 'Terminal Tena', description: 'Centro de Aventura', fullInfo: 'Rutas hacia la selva y el corredor turístico de Archidona.', type: 'terminal' },
    { lngLat: [-77.9912, -1.4812], title: 'Terminal Puyo', description: 'Acceso Amazónico Central', fullInfo: 'Conecta con Baños y el interior de la provincia de Pastaza.', type: 'terminal' }
  ];

  // Rutas GeoJSON maestras del Ecuador
  const routes = [
    { id: 'p-norte', label: 'Eje Panamericano Norte', color: '#1a73e8', coordinates: [[-77.6322, 0.8115], [-78.1256, 0.3512], [-78.4735, -0.1118], [-78.5256, -0.2858]] as Array<[number, number]> },
    { id: 'p-sur', label: 'Eje Panamericano Sur', color: '#ea4335', coordinates: [[-78.5256, -0.2858], [-78.6225, -1.2491], [-78.6542, -1.6731], [-78.9950, -2.8974], [-79.2042, -3.9931]] as Array<[number, number]> },
    { id: 'r-costa', label: 'Ruta Transversal Costa', color: '#34a853', coordinates: [[-78.5256, -0.2858], [-79.1764, -0.2522], [-80.7063, -0.9634]] as Array<[number, number]> },
    { id: 'r-gye', label: 'Corredor Quito - Guayaquil', color: '#fbbc05', coordinates: [[-78.5256, -0.2858], [-79.1764, -0.2522], [-79.4678, -1.0256], [-79.8862, -2.1466]] as Array<[number, number]> },
    { id: 'r-oriente', label: 'Acceso Amazónico', color: '#ff6d00', coordinates: [[-78.5256, -0.2858], [-77.8112, -0.9912], [-77.9912, -1.4812]] as Array<[number, number]> }
  ];

  return (
    <div className="w-full h-screen relative bg-slate-900 overflow-hidden flex flex-col font-body">
      {/* Overlay Header */}
      <header className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-8 py-6 pointer-events-none">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">T</div>
             <div>
                <h1 className="text-xl font-black text-primary font-headline tracking-tighter uppercase leading-none">Red Terrestre Nacional</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronización Real de Terminales</p>
             </div>
        </div>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-full text-xs font-black shadow-2xl transition-all border border-slate-100 hover:-translate-y-1 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">dashboard_customize</span>
          VOLVER AL PANEL
        </button>
      </header>

      {/* Main Map Content - Full View */}
      <main className="flex-1 w-full h-full relative z-10">
        <MapBoxComponent center={[-78.5, -1.5]} zoom={7.2} markers={terminalMarkers} routes={routes} />
        
        {/* Sidebar Mini-Info */}
        <div className="absolute top-32 left-8 z-20 w-80 hidden lg:block animate-fade-in pointer-events-none">
            <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50 max-h-[60vh] flex flex-col">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Terminales Operativas</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {terminalMarkers.map((t, i) => (
                        <div key={i} className="flex gap-4 items-center p-3 rounded-2xl bg-slate-50 hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/20">
                            <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs leading-none">{t.title}</h4>
                                <p className="text-[9px] text-slate-400 font-medium uppercase mt-1">{t.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        ACTUALIZADO
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">GEO-JSON V2</span>
                </div>
            </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-white/80 backdrop-blur-xl px-8 py-4 rounded-full shadow-2xl border border-white/20 flex gap-8 items-center max-w-4xl overflow-x-auto no-scrollbar">
             {routes.map(r => (
                 <div key={r.id} className="flex items-center gap-3 whitespace-nowrap">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }}></span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{r.label}</span>
                 </div>
             ))}
        </div>
      </main>
    </div>
  );
};

export default TerminalMap;

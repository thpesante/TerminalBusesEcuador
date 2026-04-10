import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapBoxComponent from '../../components/MapBoxComponent';

interface HubViewProps {
  setView: (view: any) => void;
}

const HubView: React.FC<HubViewProps> = ({ setView }) => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Hero Search Section */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black font-headline text-primary mb-8 tracking-tight">¿A dónde viajas hoy?</h1>
        <div className="relative max-w-2xl group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-primary">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input 
            className="w-full h-16 pl-14 pr-6 rounded-2xl bg-surface-container-lowest border-none shadow-[0_20px_40px_rgba(25,28,29,0.06)] focus:ring-2 focus:ring-primary/20 text-lg font-medium transition-all outline-none" 
            placeholder="Busca terminales o destinos..." 
            type="text"
            onKeyDown={(e) => e.key === 'Enter' && setView('search')}
          />
        </div>
      </section>

      {/* Dynamic Event Banner */}
      <section className="mb-12 relative overflow-hidden rounded-[2rem] h-64 md:h-80 shadow-lg group">
        <img 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt="Cuenca" 
          src="https://images.unsplash.com/photo-1598064973307-e075f14e45df?auto=format&fit=crop&q=80&w=1200"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-transparent flex flex-col justify-center px-10">
          <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 w-fit">Evento en Cuenca</span>
          <h2 className="text-white text-3xl md:text-5xl font-black font-headline max-w-md leading-tight">Vive el Festival de Artes Vivas</h2>
          <p className="text-white/80 mt-4 max-w-sm font-medium font-body">Reserva tu pasaje hoy y obtén un 15% de descuento directo a la Atenas del Ecuador.</p>
          <button 
            onClick={() => setView('search')}
            className="mt-6 kinetic-gradient text-white px-8 py-3 rounded-full font-bold w-fit shadow-lg active:scale-95 transition-transform"
          >
            Ver Rutas
          </button>
        </div>
      </section>

      {/* Bento Grid: Main Terminals & Nearby */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nearby Terminal Card */}
        <div className="md:col-span-1 bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-headline text-primary">Terminales Cercanas</h3>
              <span className="material-symbols-outlined text-secondary">location_on</span>
            </div>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">directions_bus</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">Quitumbe</p>
                  <p className="text-xs text-outline font-medium uppercase tracking-wider">A 1.2 KM DE TI</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">directions_bus</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">Carcelén</p>
                  <p className="text-xs text-outline font-medium uppercase tracking-wider">A 15.4 KM DE TI</p>
                </div>
              </div>
            </div>
          </div>
          <div 
            onClick={() => navigate('/terminal-map')}
            className="mt-8 p-4 rounded-2xl bg-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-bold text-primary font-headline whitespace-nowrap">Ver mapa completo</span>
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </div>
        </div>

        {/* Principal Terminals */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline text-primary">Principales Destinos</h3>
            <button className="text-sm font-bold text-secondary uppercase tracking-widest">Ver todos</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Quito */}
            <div onClick={() => setView('search')} className="relative aspect-square rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm">
              <img 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Quito" 
                src="https://images.unsplash.com/photo-1599026402324-4ae0193297a7?auto=format&fit=crop&q=80&w=400"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-left">
                <p className="text-white font-black text-2xl font-headline tracking-tight">Quito</p>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Pichincha</p>
              </div>
            </div>
            {/* Guayaquil */}
            <div onClick={() => setView('search')} className="relative aspect-square rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm">
              <img 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Guayaquil" 
                src="https://images.unsplash.com/photo-1585822700542-a044d08f4c47?auto=format&fit=crop&q=80&w=400"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-left">
                <p className="text-white font-black text-2xl font-headline tracking-tight">Guayaquil</p>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Guayas</p>
              </div>
            </div>
            {/* Cuenca */}
            <div onClick={() => setView('search')} className="relative aspect-square rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm">
              <img 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Cuenca" 
                src="https://images.unsplash.com/photo-1598064973307-e075f14e45df?auto=format&fit=crop&q=80&w=400"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-left">
                <p className="text-white font-black text-2xl font-headline tracking-tight">Cuenca</p>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Azuay</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Map Mini-View */}
      <section className="mt-12">
        <div className="relative h-96 w-full rounded-[2.5rem] overflow-hidden bg-surface-container-high shadow-2xl border-4 border-white/50">
          <MapBoxComponent 
            center={[-78.5, -0.2]} 
            zoom={10} 
            markers={[
              { lngLat: [-78.5256, -0.2858], title: 'Terminal Quitumbe', type: 'terminal', description: 'Terminal Sur de Quito' },
              { lngLat: [-78.4900, -0.2200], title: 'Bus en movimiento', type: 'bus', description: 'Ruta: Quito - Latacunga' }
            ]} 
            routes={[
                {
                    id: 'quito-local',
                    coordinates: [
                        [-78.5256, -0.2858],
                        [-78.51, -0.25],
                        [-78.4900, -0.2200]
                    ],
                    color: '#1a73e8',
                    label: 'Troncal Sur'
                }
            ]}
          />
          
          {/* Map Overlay Cards */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row gap-4 z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 flex-1 shadow-xl border border-white/20">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined">departure_board</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-primary font-headline">Terminal Quitumbe</p>
                <p className="text-xs font-semibold text-secondary font-body">ACTIVO • CONEXIÓN NACIONAL</p>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 flex-1 shadow-xl border border-white/20">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white">
                <span className="material-symbols-outlined">route</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-primary font-headline">Bus #405</p>
                <p className="text-xs font-semibold text-on-surface-variant font-body">ESTADO: EN MOVIMIENTO</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HubView;

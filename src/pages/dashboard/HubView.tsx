import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapBoxComponent from '../../components/MapBoxComponent';

interface HubViewProps {
  setView: (view: any) => void;
}

const TERMINAL_DATA = {
  quito: {
    name: 'Quitumbe (Quito)',
    coords: [-78.5256, -0.2858] as [number, number],
    destinations: [
      { 
        id: 'quito-1', title: 'Centro Histórico', category: 'Cultura', image: 'https://images.unsplash.com/photo-1599026402324-4ae0193297a7?auto=format&fit=crop&q=80&w=800', 
        description: 'Patrimonio de la Humanidad con iglesias barrocas y plazas coloniales.',
        details: 'El Centro Histórico de Quito es el más grande y mejor preservado de América Latina. Puedes llegar tomando el Metro de Quito desde Quitumbe directamente hasta la estación San Francisco.'
      },
      { 
        id: 'quito-2', title: 'Mitad del Mundo', category: 'Turismo', image: 'https://images.unsplash.com/photo-1590216124403-1200fa4ca451?auto=format&fit=crop&q=80&w=800', 
        description: 'Punto exacto donde el hemisferio norte se encuentra con el sur.',
        details: 'Ubicado al norte de Quito. Desde el terminal Quitumbe, puedes tomar el Metro hasta el terminal Carcelén y luego un alimentador directo al monumento.'
      },
      { 
        id: 'quito-3', title: 'TelefériQo', category: 'Aventura', image: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d344?auto=format&fit=crop&q=80&w=800', 
        description: 'Vistas impresionantes de los Andes a más de 4,000 msnm.',
        details: 'Para llegar desde Quitumbe, toma el Metro hasta la estación Ejido y luego un taxi corto hacia las faldas del volcán Pichincha.'
      }
    ],
    events: [
      { title: 'Festival del Pasillo', date: 'Esta semana', icon: 'music_note' },
      { title: 'Feria Gastronómica Sur', date: 'Viernes 25', icon: 'restaurant' }
    ]
  },
  guayaquil: {
    name: 'J. Roldós Aguilera (GYE)',
    coords: [-79.8862, -2.1466] as [number, number],
    destinations: [
      { 
        id: 'gye-1', title: 'Malecón 2000', category: 'Urbanismo', image: 'https://images.unsplash.com/photo-1585822700542-a044d08f4c47?auto=format&fit=crop&q=80&w=800', 
        description: 'Un recorrido de 2.5km junto al Río Guayas con parques y museos.',
        details: 'Ubicado en el corazón de Guayaquil. Puedes llegar tomando la Metrovía desde el terminal terrestre directamente al centro.'
      },
      { 
        id: 'gye-2', title: 'Barrio Las Peñas', category: 'Cultura', image: 'https://images.unsplash.com/photo-1595123550441-d3098522e8fd?auto=format&fit=crop&q=80&w=800', 
        description: 'El barrio más antiguo de Guayaquil con escalinatas y casas coloridas.',
        details: 'Sube los 444 escalones del Cerro Santa Ana para una vista de 360 grados. Toma la Metrovía hasta la estación Jardines del Malecón.'
      }
    ],
    events: [
      { title: 'Concierto en la Perla', date: 'Sábado 26', icon: 'theater_comedy' },
      { title: 'Mercado del Río', date: 'Todo el mes', icon: 'shopping_bag' }
    ]
  },
  cuenca: {
    name: 'Gil Ramírez (Cuenca)',
    coords: [-78.9950, -2.8974] as [number, number],
    destinations: [
      { 
        id: 'cuenca-1', title: 'Parque Nacional Cajas', category: 'Naturaleza', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBABOIKqTCeys-uEKUQI4i-S7_F_gWfNf1bKkpvfEnFD5EhhT889V5RAujVfr5-nXjXk0NdYkfgE_ApPiNVZln1U9iwxT77GPoSE1MStI5_VGMoVp6KNmRL6hXQGI8aQ9j2yQTjsK2g_Sl4TwW9GnKKtoNUNmPPXiGA2oCCULmbh78Q-AiHcqt26XnDxLxCSR_HwCQYVsbGA1xDHK_XyNjQyBGL6V_63qjfylGVB2NSMhyImd0wAfUknzkrafVKSbvV8-zJ6JnSzhkL', 
        description: 'Más de 200 lagunas glaciares en un entorno de páramo místico.',
        details: 'A solo 45 min de Cuenca. Salen buses directos cada hora desde la terminal terrestre Gil Ramírez Dávalos por un costo de $2.50.'
      },
      { 
        id: 'cuenca-2', title: 'Catedral de la Inmaculada', category: 'Arquitectura', image: 'https://images.unsplash.com/photo-1598064973307-e075f14e45df?auto=format&fit=crop&q=80&w=800', 
        description: 'Icono de la ciudad con sus famosas cúpulas azul cielo.',
        details: 'Ubicada frente al Parque Calderón. Desde la terminal, toma un taxi de $2 o el tranvía hasta San Sebastián.'
      },
      { 
        id: 'cuenca-3', title: 'Gualaceo y Chordeleg', category: 'Cultura', image: 'https://images.unsplash.com/photo-1592185128635-43a992929e71?auto=format&fit=crop&q=80&w=800', 
        description: 'Pueblos mágicos famosos por sus artesanías y joyas de filigrana.',
        details: 'Buses intercantonales salen cada 15 min desde la terminal Cuenca. Viaje de aproximadamente 50 minutos.'
      }
    ],
    events: [
      { title: 'Fiesta de la Filigrana', date: 'Esta semana', icon: 'diamond' },
      { title: 'Ruta del Pan en Gualaceo', date: 'Domingo 27', icon: 'bakery_dining' }
    ]
  }
};

const HubView: React.FC<HubViewProps> = ({ setView }) => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<keyof typeof TERMINAL_DATA>('quito');
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 400 : -400, behavior: 'smooth' });
    }
  };

  const cityData = TERMINAL_DATA[selectedCity];

  return (
    <div className="animate-fade-in pb-12">
      {/* Terminal Selector (Floating Style) */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl md:text-5xl font-black font-headline text-primary mb-2 tracking-tighter">¿Cuál es tu origen?</h1>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Selecciona una terminal para explorar tu entorno</p>
        </div>
        <div className="flex bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-xl border border-slate-100 self-start">
           {(Object.keys(TERMINAL_DATA) as Array<keyof typeof TERMINAL_DATA>).map((key) => (
             <button
               key={key}
               onClick={() => setSelectedCity(key)}
               className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                 ${selectedCity === key ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}
               `}
             >
               {key}
             </button>
           ))}
        </div>
      </div>

      {/* Main Action Banner */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        <div className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] min-h-[400px] shadow-2xl group border-4 border-white">
          <img 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            alt={cityData.name} 
            src={cityData.destinations[0].image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="bg-secondary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 w-fit shadow-lg shadow-secondary/20">Terminal Seleccionada</span>
            <h2 className="text-white text-4xl md:text-6xl font-black font-headline max-w-lg leading-none tracking-tighter editorial-text-shadow">
               Terminal <br/> {cityData.name.split(' (')[0]}
            </h2>
            <div className="flex flex-wrap gap-4 mt-8">
               <button 
                  onClick={() => navigate('/virtual-terminal')}
                  className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 hover:-translate-y-1"
               >
                  <span className="material-symbols-outlined text-sm">explore</span>
                  Ver Andén Virtual
               </button>
               <button 
                  onClick={() => setView('search')}
                  className="bg-secondary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 hover:-translate-y-1"
               >
                  Ver Horarios
               </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex-1">
                <h3 className="text-primary font-black font-headline text-sm tracking-widest uppercase mb-6 flex items-center gap-3">
                    <span className="w-2 h-6 bg-secondary rounded-full"></span>
                    Eventos {selectedCity}
                </h3>
                <div className="space-y-4">
                    {cityData.events.map((event, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer p-4 border border-transparent hover:border-slate-100 hover:bg-slate-50 rounded-2xl transition-all">
                            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">{event.icon}</span>
                            </div>
                            <div>
                                <p className="font-black text-primary text-sm leading-none">{event.title}</p>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1.5 tracking-widest">{event.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => alert('Calendario de eventos próximamente')} className="w-full mt-6 py-4 bg-slate-50 text-slate-400 font-bold text-[10px] rounded-2xl uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors">Ver Calendario Completo</button>
            </div>
            
            <div className="bg-primary text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <p className="text-[9px] font-black tracking-widest uppercase opacity-50 mb-2">Clima en Terminal</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-4xl font-headline font-black">18°C</p>
                        <p className="text-xs font-bold text-white/70">Parcialmente Nublado</p>
                    </div>
                    <span className="material-symbols-outlined text-4xl">partly_cloudy_day</span>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Destinations (The requested Section) */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-8 px-2">
            <div>
               <h2 className="text-3xl font-black font-headline text-primary tracking-tighter">Explora desde tu terminal</h2>
               <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest mt-1">Sugerencias turísticas según tu origen</p>
            </div>
            <div className="hidden md:flex gap-2">
                <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
                <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
        </div>

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth px-2">
           {cityData.destinations.map((dest) => (
             <div 
               key={dest.id} 
               onClick={() => setSelectedDestination(dest)}
               className="min-w-[320px] md:min-w-[380px] h-[480px] relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
             >
                <img 
                   className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                   alt={dest.title} 
                   src={dest.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent group-hover:via-primary/0 transition-all duration-700"></div>
                
                <div className="absolute top-8 left-8">
                    <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {dest.category}
                    </span>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-white text-3xl font-black font-headline leading-tight editorial-text-shadow">
                        {dest.title}
                    </h3>
                    <p className="text-white/60 text-sm mt-3 line-clamp-2 leading-relaxed font-medium">
                        {dest.description}
                    </p>
                    <div className="mt-6 flex items-center gap-3 text-secondary group-hover:gap-5 transition-all duration-500">
                        <span className="text-[10px] font-black uppercase tracking-widest">Ver Detalles</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Mini Info Map Section */}
      <section className="mb-8">
        <h2 className="text-xl font-black font-headline text-primary mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">explore</span>
            Tu Conexión en {selectedCity.toUpperCase()}
        </h2>
        <div className="relative h-[450px] w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <MapBoxComponent 
            center={cityData.coords} 
            zoom={12} 
            markers={[
              { lngLat: cityData.coords, title: cityData.name, type: 'terminal', description: 'Ubicación de origen' },
              { lngLat: cityData.destinations[0].coords || [cityData.coords[0] + 0.05, cityData.coords[1] + 0.05], title: cityData.destinations[0].title, type: 'stop', description: 'Destino destacado' }
            ]} 
          />
          <div className="absolute bottom-6 left-6 right-6 flex gap-4 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[2rem] flex flex-1 shadow-2xl items-center gap-6 border border-white/50">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined">directions_bus</span>
                </div>
                <div>
                   <p className="text-lg font-black text-primary font-headline leading-none">{cityData.name}</p>
                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2">Opera 24/7 • Monitoreo Activo</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setSelectedDestination(null)}></div>
             <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
                 <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                    <img className="w-full h-full object-cover" src={selectedDestination.image} alt={selectedDestination.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                        <span className="bg-secondary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 w-fit">{selectedDestination.category}</span>
                        <h2 className="text-white text-4xl font-headline font-black leading-none">{selectedDestination.title}</h2>
                    </div>
                 </div>
                 <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <button 
                        onClick={() => setSelectedDestination(null)}
                        className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6">Sobre el destino</h3>
                    <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
                        {selectedDestination.description}
                    </p>

                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                        <h4 className="font-headline font-black text-primary text-xl flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-secondary">navigation</span>
                            Cómo llegar
                        </h4>
                        <p className="text-slate-500 font-medium leading-relaxed text-sm">
                            {selectedDestination.details}
                        </p>
                        <div className="mt-8 flex gap-4">
                            <button onClick={() => { navigate('/terminal-map'); setSelectedDestination(null); }} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">Ver Ruta en Mapa</button>
                            <button onClick={() => setView('search')} className="flex-1 bg-secondary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Buscar Horarios</button>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-secondary text-3xl mb-2">hotel</span>
                            <p className="text-[10px] font-black uppercase text-slate-400">Estadía</p>
                        </div>
                        <div className="text-center">
                            <span className="material-symbols-outlined text-secondary text-3xl mb-2">restaurant</span>
                            <p className="text-[10px] font-black uppercase text-slate-400">Comida</p>
                        </div>
                        <div className="text-center">
                            <span className="material-symbols-outlined text-secondary text-3xl mb-2">camera</span>
                            <p className="text-[10px] font-black uppercase text-slate-400">Fotos</p>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default HubView;

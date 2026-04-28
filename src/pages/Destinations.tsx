import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ecuadorProvinces, type Province } from '../components/erp/ecuadorData';

const Destinations: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCanton, setSelectedCanton] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleProvinceClick = (prov: Province) => {
    setSelectedProvince(prov);
    setSelectedCanton(null);
  };

  const tourismData: Record<string, any> = {
    "Quito": {
      title: "Quito: Patrimonio de la Humanidad",
      desc: "Descubre el Centro Histórico mejor conservado de América, sube al Teleférico a 4,100m o visita la Mitad del Mundo donde el GPS marca 00°00'00\".",
      image: "https://images.unsplash.com/photo-1594916298270-4318c47ca305?auto=format&fit=crop&q=80&w=1200",
      activities: ["Recorrido en el Centro Histórico", "Cena en la Calle La Ronda", "Museo de la Ciudad"],
      officialLink: "https://visitquito.ec"
    },
    "Guayaquil": {
      title: "Guayaquil: El Renacer del Río",
      desc: "Camina por el Malecón 2000, sube los 444 escalones del Cerro Santa Ana y cena en los barcos-restaurantes del Puerto Santa Ana.",
      image: "https://images.unsplash.com/photo-1599307737380-60f1b51e90df?auto=format&fit=crop&q=80&w=1200",
      activities: ["Malecón 2000", "Barrio Las Peñas", "Parque de las Iguanas"],
      officialLink: "https://www.guayaquilturismo.com"
    },
    "Cuenca": {
      title: "Cuenca: Cultura y Ríos",
      desc: "La ciudad de los cuatro ríos. Explora sus iglesias coloniales, los sombreros de paja toquilla y la belleza natural del Parque Nacional Cajas.",
      image: "https://images.unsplash.com/photo-1589146522774-72b2207f2df4?auto=format&fit=crop&q=80&w=1200",
      activities: ["Catedral de la Inmaculada", "Taller de Sombreros Homero Ortega", "Paseo por el Tomebamba"],
      officialLink: "https://visitcuencaecuador.com.ec"
    },
    "Manta": {
      title: "Manta: Aventura y Mar",
      desc: "Destino líder en deportes acuáticos. Disfruta de la mejor gastronomía manabita y playas de ensueño como San Lorenzo y Santa Marianita.",
      image: "https://images.unsplash.com/photo-1629814435805-4c0846505370?auto=format&fit=crop&q=80&w=1200",
      activities: ["Surf en San Lorenzo", "Degustación de Viche", "Avistamiento de Ballenas (Jun-Sep)"],
      officialLink: "https://manta.gob.ec/turismo"
    },
    "Baños de Agua Santa": {
      title: "Baños: Aventura sin Límites",
      desc: "La capital de la aventura en Ecuador. Cascadas, termas, deportes extremos y el columpio del fin del mundo te esperan.",
      image: "https://images.unsplash.com/photo-1594916298270-4318c47ca305?auto=format&fit=crop&q=80&w=1200",
      activities: ["Pailón del Diablo", "Casa del Árbol", "Rafting en el Río Pastaza"],
      officialLink: "https://turismo.municipiobanos.gob.ec"
    },
    "Otavalo": {
      title: "Otavalo: Cultura y Tradición",
      desc: "Visita el mercado artesanal más grande de Sudamérica, la Laguna de Cuicocha y la cascada de Peguche.",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200",
      activities: ["Plaza de los Ponchos", "Laguna de Cuicocha", "Cascada de Peguche"],
      officialLink: "https://otavalo.gob.ec"
    }
  };

  const currentTourism = tourismData[selectedCanton || ''] || tourismData[selectedProvince?.name === 'Pichincha' ? 'Quito' : selectedProvince?.name === 'Guayas' ? 'Guayaquil' : selectedProvince?.name === 'Azuay' ? 'Cuenca' : selectedProvince?.name === 'Manabí' ? 'Manta' : selectedProvince?.name === 'Tungurahua' ? 'Baños de Agua Santa' : selectedProvince?.name === 'Imbabura' ? 'Otavalo' : ''] || {
    title: `${selectedCanton || selectedProvince?.name || 'Explora Ecuador'}`,
    desc: "Un destino lleno de cultura, paisajes increíbles y experiencias inolvidables te espera en cada rincón del país.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200",
    activities: ["Cultura local", "Gastronomía típica", "Senderismo natural"],
    officialLink: "https://ecuador.travel"
  };

  return (
    <div className="bg-[#000814] min-h-screen text-white font-body selection:bg-blue-500 selection:text-white">
      {/* ── LUXURY NAV ── */}
      <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-3xl flex justify-between items-center px-10 h-24 border-b border-white/5">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">explore</span>
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase font-headline">MOVU <span className="text-blue-500 text-xs tracking-[0.5em] ml-2">Destinos</span></span>
        </Link>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
           <Link to="/horarios" className="hover:text-white transition-colors">Horarios</Link>
           <a href="#" className="hover:text-white transition-colors">Eventos</a>
           <a href="#" className="hover:text-white transition-colors">Guías</a>
        </div>
        <Link to="/login" className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Acceso VIP</Link>
      </header>

      <main className={`pt-32 pb-20 px-8 max-w-[1600px] mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* ── LEFT: Province Selection (Modern Sidebar) ── */}
          <aside className="lg:col-span-3 space-y-10">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-blue-500 mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-blue-500"></span> Provincias
              </h2>
              <div className="space-y-2 h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {ecuadorProvinces.map((prov, index) => (
                  <button 
                    key={prov.name} 
                    onClick={() => handleProvinceClick(prov)}
                    style={{ transitionDelay: `${index * 50}ms` }}
                    className={`w-full text-left p-6 rounded-[2rem] transition-all group relative overflow-hidden animate-in slide-in-from-left-4 fill-mode-both ${selectedProvince?.name === prov.name ? 'bg-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                  >
                    <div className="flex justify-between items-center relative z-10">
                       <span className="text-lg font-black uppercase tracking-tighter">{prov.name}</span>
                       <span className={`material-symbols-outlined transition-transform duration-500 ${selectedProvince?.name === prov.name ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`}>chevron_right</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── CENTER: Canton Selection + Tourism Content ── */}
          <div className="lg:col-span-9 space-y-12">
            
            {/* Header Content */}
            <div className="space-y-4">
               <h1 className="text-6xl md:text-8xl font-black font-headline uppercase leading-none tracking-tighter">
                 Explora tu <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Próximo Destino</span>
               </h1>
               <p className="text-white/40 max-w-xl font-medium text-lg">Selecciona una provincia para descubrir los tesoros ocultos de sus cantones.</p>
            </div>

            {selectedProvince ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                
                {/* Canton Selector (Horizontal Chip List) */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Cantones de {selectedProvince.name}</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedProvince.cantons.map((canton, idx) => (
                      <button 
                        key={canton}
                        onClick={() => setSelectedCanton(canton)}
                        style={{ animationDelay: `${idx * 40}ms` }}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all animate-in zoom-in-75 fill-mode-both ${selectedCanton === canton ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/20'}`}
                      >
                        {canton}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tourism Card */}
                <div className="relative group rounded-[4rem] overflow-hidden bg-white/5 border border-white/10 min-h-[600px] flex flex-col md:flex-row">
                   <div className="md:w-1/2 relative overflow-hidden">
                      <img src={currentTourism.image} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" alt={currentTourism.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                   </div>
                   <div className="md:w-1/2 p-16 flex flex-col justify-center space-y-8">
                      <div>
                        <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">TURISMO & AVENTURA</span>
                        <h2 className="text-5xl font-black font-headline uppercase mt-4 mb-6 leading-tight">{currentTourism.title}</h2>
                        <p className="text-xl text-white/60 leading-relaxed font-light">{currentTourism.desc}</p>
                      </div>

                      <div className="space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">¿Qué hacer?</p>
                        <div className="space-y-4">
                           {currentTourism.activities.map((act: string) => (
                             <div key={act} className="flex items-center gap-4 group/item">
                               <div className="w-2 h-2 rounded-full bg-blue-500 group-hover/item:scale-[2] transition-transform"></div>
                               <span className="text-sm font-bold uppercase tracking-widest text-white/80">{act}</span>
                             </div>
                           ))}
                        </div>
                      </div>

                      <div className="pt-8 flex gap-4">
                        <Link to="/horarios" className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-[0_20px_50px_rgba(37,99,235,0.2)] hover:-translate-y-1 transition-all">Ver Horarios</Link>
                        <a href={currentTourism.officialLink} target="_blank" rel="noopener noreferrer" className="bg-white/10 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                           Sitio Oficial <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-[600px] border border-dashed border-white/10 rounded-[4rem] flex flex-col items-center justify-center text-center p-20">
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <span className="material-symbols-outlined text-4xl text-white/20">mouse</span>
                 </div>
                 <h3 className="text-2xl font-black uppercase text-white/20 tracking-[0.2em]">Selecciona una provincia para comenzar la aventura</h3>
              </div>
            )}

          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
             <span className="text-sm font-black uppercase tracking-[0.5em]">MOVU</span>
          </div>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Ecuador • Patrimonio Natural del Mundo</p>
          <div className="flex gap-6">
             <span className="material-symbols-outlined text-white/30 hover:text-white transition-colors cursor-pointer">share</span>
             <span className="material-symbols-outlined text-white/30 hover:text-white transition-colors cursor-pointer">favorite</span>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
};

export default Destinations;

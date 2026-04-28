import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapBoxComponent from '../../components/MapBoxComponent';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

interface HubViewProps {
  setView: (view: any) => void;
}

interface Province {
  name: string;
  cantons: string[];
}

export const ecuadorProvinces: Province[] = [
  { name: "Azuay", cantons: ["Cuenca", "Camilo Ponce Enríquez", "Chordeleg", "El Pan", "Girón", "Guachapala", "Gualaceo", "Nabón", "Oña", "Paute", "Pucará", "San Fernando", "Santa Isabel", "Sevilla de Oro", "Sígsig"] },
  { name: "Bolívar", cantons: ["Guaranda", "Caluma", "Chillanes", "Chimbo", "Echeandía", "Las Naves", "San Miguel"] },
  { name: "Cañar", cantons: ["Azogues", "Biblián", "Cañar", "Déleg", "El Tambo", "La Troncal", "Suscal"] },
  { name: "Carchi", cantons: ["Tulcán", "Bolívar", "Espejo", "Mira", "Montúfar", "San Pedro de Huaca"] },
  { name: "Chimborazo", cantons: ["Riobamba", "Alausí", "Chambo", "Chunchi", "Colta", "Cumandá", "Guamote", "Guano", "Pallatanga", "Penipe"] },
  { name: "Cotopaxi", cantons: ["Latacunga", "La Maná", "Pangua", "Pujilí", "Salcedo", "Saquisilí", "Sigchos"] },
  { name: "El Oro", cantons: ["Machala", "Arenillas", "Atahualpa", "Balsas", "Chilla", "El Guabo", "Huaquillas", "Las Lajas", "Marcabelí", "Pasaje", "Piñas", "Portovelo", "Santa Rosa", "Zaruma"] },
  { name: "Esmeraldas", cantons: ["Esmeraldas", "Atacames", "Eloy Alfaro", "Muisne", "Quinindé", "Rioverde", "San Lorenzo"] },
  { name: "Galápagos", cantons: ["San Cristóbal", "Isabela", "Santa Cruz"] },
  { name: "Guayas", cantons: ["Guayaquil", "Alfredo Baquerizo Moreno (Juján)", "Balao", "Balzar", "Colimes", "Daule", "El Empalme", "El Triunfo", "General Antonio Elizalde (Bucay)", "Isidro Ayora", "Lomas de Sargentillo", "Marcelino Maridueña", "Milagro", "Naranjal", "Naranjito", "Nobol", "Palestina", "Pedro Carbo", "Playas", "Salitre", "Samborondón", "Santa Lucía", "Simón Bolívar", "Coronel Marcelino Maridueña", "Yaguachi"] },
  { name: "Imbabura", cantons: ["Ibarra", "Antonio Ante", "Cotacachi", "Otavalo", "Pimampiro", "San Miguel de Urcuquí"] },
  { name: "Loja", cantons: ["Loja", "Calvas", "Catamayo", "Celica", "Chaguarpamba", "Espíndola", "Gonzanamá", "Macará", "Olmedo", "Paltas", "Pindal", "Puyango", "Quilanga", "Saraguro", "Sozoranga", "Zapotillo"] },
  { name: "Los Ríos", cantons: ["Babahoyo", "Baba", "Buena Fe", "Mocache", "Montalvo", "Palenque", "Puebloviejo", "Quevedo", "Quinsaloma", "Urdaneta", "Valencia", "Ventanas", "Vinces"] },
  { name: "Manabí", cantons: ["Portoviejo", "24 de Mayo", "Bolívar", "Chone", "El Carmen", "Flavio Alfaro", "Jama", "Jaramijó", "Jipijapa", "Junín", "Manta", "Montecristi", "Olmedo", "Paján", "Pedernales", "Pichincha", "Puerto López", "Rocafuerte", "Santa Ana", "San Vicente", "Sucre", "Tosagua"] },
  { name: "Morona Santiago", cantons: ["Macas (Morona)", "Gualaquiza", "Huamboya", "Limón Indanza", "Logroño", "Pablo Sexto", "Palora", "San Juan Bosco", "Santiago", "Sevilla Don Bosco", "Sucúa", "Taisha", "Tiwintza"] },
  { name: "Napo", cantons: ["Tena", "Archidona", "Carlos Julio Arosemena Tola", "El Chaco", "Quijos"] },
  { name: "Orellana", cantons: ["Francisco de Orellana", "Aguarico", "La Joya de los Sachas", "Loreto"] },
  { name: "Pastaza", cantons: ["Puyo (Pastaza)", "Arajuno", "Mera", "Santa Clara"] },
  { name: "Pichincha", cantons: ["Quito", "Cayambe", "Mejía", "Pedro Moncayo", "Pedro Vicente Maldonado", "Puerto Quito", "Rumiñahui", "San Miguel de los Bancos"] },
  { name: "Santa Elena", cantons: ["Santa Elena", "La Libertad", "Salinas"] },
  { name: "Santo Domingo de los Tsáchilas", cantons: ["Santo Domingo", "La Concordia"] },
  { name: "Sucumbíos", cantons: ["Nueva Loja (Lago Agrio)", "Cascales", "Cuyabeno", "Gonzalo Pizarro", "Putumayo", "Shushufindi", "Sucumbíos"] },
  { name: "Tungurahua", cantons: ["Ambato", "Baños de Agua Santa", "Cevallos", "Mocha", "Patate", "Pelileo", "Píllaro", "Quero", "Tisaleo"] },
  { name: "Zamora Chinchipe", cantons: ["Zamora", "Centinela del Cóndor", "Chinchipe", "El Pangui", "Nangaritza", "Palanda", "Paquisha", "Yacuambi", "Yantzaza"] }
];

const TERMINAL_DATA: Record<string, any> = {
  quito: {
    coords: [-78.5256, -0.2858],
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
    ]
  },
  guayaquil: {
    coords: [-79.8862, -2.1466],
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
    ]
  },
  cuenca: {
    coords: [-78.9950, -2.8974],
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
    ]
  }
};

const HubView: React.FC<HubViewProps> = ({ setView }) => {
  const navigate = useNavigate();
  const [selectedProvince, setSelectedProvince] = useState<string>('Pichincha');
  const [selectedCanton, setSelectedCanton] = useState<string>('Quito');
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [weather, setWeather] = useState<{ temp: number; desc: string; icon: string }>({ temp: 18, desc: 'Parcialmente Nublado', icon: 'partly_cloudy_day' });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [terminalBanner, setTerminalBanner] = useState<string>('');
  const [tourismSuggestions, setTourismSuggestions] = useState<any[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.provincia) {
              setSelectedProvince(data.provincia);
            }
            if (data.canton) {
              setSelectedCanton(data.canton);
            }
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }
      }
    };
    fetchUserLocation();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'municipio_events'), where('canton', '==', selectedCanton));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDbEvents(eventsData);
      } catch (e) {
        console.error("Error fetching events", e);
        setDbEvents([]);
      }
    };
    fetchEvents();

    const fetchTerminalBanner = async () => {
      try {
        const q = query(collection(db, 'bannerterminal'), where('caton', '==', selectedCanton));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setTerminalBanner(data.url);
        } else {
          setTerminalBanner('');
        }
      } catch (e) {
        console.error("Error fetching terminal banner", e);
      }
    };
    fetchTerminalBanner();

    const fetchTourism = async () => {
      try {
        const q = query(collection(db, 'municipio_banners'), where('canton', '==', selectedCanton), where('active', '==', true));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTourismSuggestions(data);
      } catch (e) {
        console.error("Error fetching tourism", e);
      }
    };
    fetchTourism();
  }, [selectedCanton]);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsWeatherLoading(true);
      const coords = cityData.coords || [-78.5256, -0.2858];
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords[1]}&longitude=${coords[0]}&current=temperature_2m,weather_code,is_day`;
        const res = await fetch(url);
        const data = await res.json();
        const current = data.current;
        
        const codeMap: Record<number, { desc: string; icon: string }> = {
          0: { desc: 'Despejado', icon: 'sunny' },
          1: { desc: 'Mayormente Despejado', icon: 'sunny_snowing' },
          2: { desc: 'Parcialmente Nublado', icon: 'partly_cloudy_day' },
          3: { desc: 'Nublado', icon: 'cloud' },
          45: { desc: 'Neblina', icon: 'foggy' },
          48: { desc: 'Neblina Rime', icon: 'foggy' },
          51: { desc: 'Llovizna Ligera', icon: 'rainy_light' },
          61: { desc: 'Lluvia', icon: 'rainy' },
          80: { desc: 'Chubascos', icon: 'rainy' },
          95: { desc: 'Tormenta', icon: 'thunderstorm' },
        };

        const weatherInfo = codeMap[current.weather_code] || { desc: 'Nublado', icon: 'cloud' };
        setWeather({
          temp: Math.round(current.temperature_2m),
          desc: weatherInfo.desc,
          icon: weatherInfo.icon
        });
      } catch (e) {
        console.error("Weather fetch error", e);
      } finally {
        setIsWeatherLoading(false);
      }
    };
    fetchWeather();
  }, [selectedCanton]);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 400 : -400, behavior: 'smooth' });
    }
  };

  const normalizedCanton = selectedCanton.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const cityData = TERMINAL_DATA[normalizedCanton] || {
    coords: [-78.5256, -0.2858],
    destinations: [
      {
        id: `generic-${selectedCanton}`,
        title: `Explora ${selectedCanton}`,
        category: 'Turismo',
        image: 'https://images.unsplash.com/photo-1599026402324-4ae0193297a7?auto=format&fit=crop&q=80&w=800',
        description: `Descubre los mejores lugares y atracciones de ${selectedCanton}.`,
        details: `Disfruta todo lo que ${selectedCanton} tiene para ofrecer partiendo de nuestra terminal.`
      }
    ]
  };

  return (
    <div className="animate-fade-in pb-12">
      {/* Terminal Selector (Floating Style) */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-headline text-primary mb-2 tracking-tighter">¿Cuál es tu origen?</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Selecciona una provincia y cantón</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 self-start bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-slate-100">
          <select
            value={selectedProvince}
            onChange={(e) => {
              const newProv = e.target.value;
              setSelectedProvince(newProv);
              const provinceData = ecuadorProvinces.find(p => p.name === newProv);
              if (provinceData && provinceData.cantons.length > 0) {
                setSelectedCanton(provinceData.cantons[0]);
              }
            }}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-white shadow-sm border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            {ecuadorProvinces.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedCanton}
            onChange={(e) => setSelectedCanton(e.target.value)}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-primary text-white shadow-xl border border-primary outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer"
          >
            {ecuadorProvinces.find(p => p.name === selectedProvince)?.cantons.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Action Banner */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        <div className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] min-h-[400px] shadow-2xl group border-4 border-white bg-slate-100">
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            alt={selectedCanton}
            src={terminalBanner || cityData.destinations[0].image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="bg-secondary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 w-fit shadow-lg shadow-secondary/20">Terminal Seleccionada</span>
            <h2 className="text-white text-4xl md:text-6xl font-black font-headline max-w-lg leading-none tracking-tighter editorial-text-shadow">
              Terminal <br /> {selectedCanton}
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
              Eventos {selectedCanton}
            </h3>
            <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar pr-2">
              {dbEvents.length > 0 ? dbEvents.map((event, i) => (
                <div key={event.id || i} onClick={() => setSelectedEvent(event)} className="flex items-center gap-4 group cursor-pointer p-4 border border-transparent hover:border-slate-100 hover:bg-slate-50 rounded-2xl transition-all">
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">event</span>
                  </div>
                  <div>
                    <p className="font-black text-primary text-sm leading-tight line-clamp-2">{event.title}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1.5 tracking-widest">
                      {event.time || (event.createdAt?.seconds ? new Date(event.createdAt.seconds * 1000).toLocaleDateString() : '')} • {event.location || ''}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-sm font-medium text-center py-4">No hay eventos próximos en {selectedCanton}</p>
              )}
            </div>
            <button onClick={() => setShowFullCalendar(true)} className="w-full mt-6 py-4 bg-slate-50 text-slate-400 font-bold text-[10px] rounded-2xl uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors">Ver Calendario Completo</button>
          </div>

          <div className="bg-primary text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center justify-between">
              {isWeatherLoading ? (
                <div className="animate-pulse flex items-center gap-4">
                  <div className="h-10 w-16 bg-white/20 rounded-lg"></div>
                  <div className="h-4 w-24 bg-white/20 rounded-lg"></div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-4xl font-headline font-black">{weather.temp}°C</p>
                    <p className="text-xs font-bold text-white/70">{weather.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-4xl animate-pulse">{weather.icon}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-8 px-2">
          <div>
            <h2 className="text-3xl font-black font-headline text-primary tracking-tighter">Explora desde tu terminal</h2>
            <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest mt-1">Sugerencias turísticas según tu origen</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAllDestinations(true)} className="px-6 py-3 rounded-xl bg-slate-100 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all mr-4">Ver Todos</button>
            <div className="hidden md:flex gap-2">
              <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth px-2">
          {tourismSuggestions.length > 0 ? tourismSuggestions.map((dest: any) => (
            <div
              key={dest.id}
              onClick={() => setSelectedDestination(dest)}
              className="min-w-[320px] md:min-w-[380px] h-[480px] relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt={dest.title}
                src={dest.imageUrl}
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
          )) : (
            <div className="w-full text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No hay sugerencias para {selectedCanton}</p>
            </div>
          )}
        </div>
      </section>

      {/* Mini Info Map Section */}
      <section className="mb-8">
        <h2 className="text-xl font-black font-headline text-primary mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">explore</span>
          Tu Conexión en {selectedCanton.toUpperCase()}
        </h2>
        <div className="relative h-[450px] w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <MapBoxComponent
            center={cityData.coords}
            zoom={12}
            markers={[
              { lngLat: cityData.coords, title: `Terminal ${selectedCanton}`, type: 'terminal', description: 'Ubicación de origen' },
              { lngLat: cityData.destinations[0].coords || [cityData.coords[0] + 0.05, cityData.coords[1] + 0.05], title: cityData.destinations[0].title, type: 'stop', description: 'Destino destacado' }
            ]}
          />
          <div className="absolute bottom-6 left-6 right-6 flex gap-4 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[2rem] flex flex-1 shadow-2xl items-center gap-6 border border-white/50">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined">directions_bus</span>
              </div>
              <div>
                <p className="text-lg font-black text-primary font-headline leading-none">Terminal {selectedCanton}</p>
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
              <img className="w-full h-full object-cover" src={selectedDestination.imageUrl || selectedDestination.image} alt={selectedDestination.title} />
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
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setSelectedEvent(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">event_available</span>
              </div>
              <div>
                <h2 className="text-3xl font-headline font-black text-primary leading-tight">{selectedEvent.title}</h2>
                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1">Evento Confirmado en {selectedCanton}</p>
              </div>
            </div>
            <div className="space-y-6 text-slate-600 font-medium">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">schedule</span>
                <p>Fecha y Hora: <span className="font-black text-primary">{selectedEvent.time || 'Por confirmar'}</span></p>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                <p>Ubicación: <span className="font-black text-primary">{selectedEvent.location || 'Lugar central'}</span></p>
              </div>
              <p className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed italic">
                "{selectedEvent.description || 'No hay descripción detallada disponible para este evento.'}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Calendar Modal */}
      {showFullCalendar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setShowFullCalendar(false)}></div>
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-10 sticky top-0 bg-white pb-4 z-10">
              <div>
                <h2 className="text-4xl font-headline font-black text-primary">Calendario de Eventos</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Agenda Cultural y Municipal de {selectedCanton}</p>
              </div>
              <button onClick={() => setShowFullCalendar(false)} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dbEvents.length > 0 ? dbEvents.map((event, i) => (
                <div key={event.id || i} onClick={() => { setSelectedEvent(event); setShowFullCalendar(false); }} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{event.category || 'Ciudad'}</span>
                    <span className="material-symbols-outlined text-slate-200 group-hover:text-secondary transition-colors">arrow_forward</span>
                  </div>
                  <h3 className="text-xl font-black text-primary mb-2 leading-tight">{event.title}</h3>
                  <p className="text-xs text-slate-400 font-bold mb-4">{event.location}</p>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">{event.time}</p>
                </div>
              )) : (
                <div className="col-span-2 text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                   <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">calendar_month</span>
                   <p className="text-slate-400 font-black uppercase tracking-widest">No hay eventos registrados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* See All Destinations Modal */}
      {showAllDestinations && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setShowAllDestinations(false)}></div>
          <div className="bg-white w-full max-w-6xl rounded-[3rem] p-10 shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="flex justify-between items-center mb-12 sticky top-0 bg-white pb-4 z-10">
               <div>
                  <h2 className="text-4xl font-headline font-black text-primary uppercase tracking-tighter">Todos los Destinos</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Sugerencias desde Terminal {selectedCanton}</p>
               </div>
               <button onClick={() => setShowAllDestinations(false)} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tourismSuggestions.map((dest: any) => (
                  <div key={dest.id} onClick={() => { setSelectedDestination(dest); setShowAllDestinations(false); }} className="relative h-96 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-lg hover:-translate-y-2 transition-all duration-500">
                    <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src={dest.imageUrl} alt={dest.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-8">
                       <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-3 w-fit">{dest.category}</span>
                       <h3 className="text-white text-2xl font-black font-headline editorial-text-shadow">{dest.title}</h3>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubView;

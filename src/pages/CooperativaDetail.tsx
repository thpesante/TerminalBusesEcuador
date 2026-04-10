import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const COOPERATIVA_DATA: Record<string, any> = {
  'loja': {
    name: 'Cooperativa Loja',
    slogan: 'Excelencia y Tradición en Cada Kilómetro.',
    description: 'Conectando el sur del Ecuador con el resto del país mediante un servicio premium de confort y seguridad inigualable. Fundada en el corazón de la Centinela del Sur, Cooperativa Loja ha sido el pilar del transporte nacional por más de 60 años.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5PcZm4RI9l-ZL47rzgWQMMZ5Ep0WaJSRFskx6oSGQM9E_SCM4WRjmBZ7fJp41ssk7FL87NNEex8dPb_32uNyb-RrFFIPJBoP1kKZE8leN_ZZsiAKTnoVIYUlKfakF8ixZpvbMlib2EcWzrPInH9dsMvfEko7-k0i9sSeyR8MvK5KFlaHMfDZvlPPZgBX-3sGziYzcKyo3UdWdoUzh1EoGhxnygnDKuPLKdPm7aELswwcbqlD_JZx6ZINuanGII3nbbOTL7CdD0zE5',
    routes: [
      { from: 'Quito', to: 'Cuenca', price: '$15.00', duration: '8h 30m', type: 'Luxury', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOmyCh39wty3ZJEqWHZ5SY_P8v_4_0xduQLx1dQpihsWBXw3V938l5u5Ri1c_4CzOw9WGsh_bTTsQfZNOAUqYP5Y-ETukuA6sbuXhxoQ_LzSUJwMg5VQ7cYxkkWeQlOXCpwwFJojv7s5XgOBXTDjSx9mtyJcTMHvUF1sRWIGXROs5dp6Y5BHAz4vuARSS-ckZ9r7umOk_Ac_pEQIM_J5DXqg7VCE8hOtt9P6zb-OvObwUsrAvHnR1IMvjHuadOuXZR3ckpBP9Wpu6g' },
      { from: 'Guayaquil', to: 'Loja', price: '$12.50', duration: '7h 00m', type: 'Ejecutivo', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEI-uwzYeIIi28WnVngp2alWpHDD3NL07SR5hzSqz2vYYqKh7fi2GhzBGw6ORAyE52_SsPIYPqRmPNBhDgQiFnc2UMiJkczxOp0ZeK0iuKA0Y9oz14iKYD2UNhSckKqCp4XI5usT7JLPaRbM0gI3FHMyO6tmDJNUE-QJiN0AukVW8_iIaqXrpzQhmOCvP0ffLCDYKzfEydov60f3lkWQLxPZEbEOcI3Xw04llBtKg9AzLZQ54fKvRclvXHr4i392wyWVXciZsVSbfU' }
    ],
    liveSchedules: [
      { time: '10:30 PM', destination: 'Loja', platform: 'P12', status: 'boarding' },
      { time: '11:15 PM', destination: 'Quito', platform: 'P10', status: 'on_time' },
      { time: '12:00 AM', destination: 'Machala', platform: 'P14', status: 'delayed' }
    ]
  },
  'oriental': {
    name: 'Turismo Oriental',
    slogan: 'Tu mejor destino es viajar con nosotros.',
    description: 'Especialistas en la ruta Cuenca - Guayaquil - Quito. Con más de 40 años sirviendo a la región austral con flota renovada y puntualidad garantizada.',
    heroImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200',
    routes: [
      { from: 'Cuenca', to: 'Guayaquil', price: '$8.00', duration: '3h 30m', type: 'Directo', image: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&q=80&w=800' }
    ],
    liveSchedules: [
      { time: '10:45 PM', destination: 'Guayaquil', platform: 'P15', status: 'boarding' }
    ]
  }
};

const CooperativaDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSchedules, setShowSchedules] = useState(false);
  const data = COOPERATIVA_DATA[id || 'loja'] || COOPERATIVA_DATA['loja'];

  return (
    <div className="bg-surface font-body text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopAppBar Shell */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,11,58,0.06)] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined text-primary text-3xl">directions_bus</span>
          <span className="font-headline font-black tracking-tighter text-2xl text-primary uppercase">TransporteEcuador</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/virtual-terminal')} className="text-secondary font-bold font-headline transition-all duration-300">Explorar Terminal</button>
          <button onClick={() => navigate('/my-tickets')} className="text-primary hover:bg-slate-100 font-headline transition-all duration-300 px-3 py-1 rounded-lg">Mis Boletos</button>
          <button className="text-primary hover:bg-slate-100 font-headline transition-all duration-300 px-3 py-1 rounded-lg">Rutas</button>
        </nav>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-primary hover:bg-slate-100 p-2 rounded-full active:scale-95 transition-all">search</button>
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold border-2 border-white">U</div>
        </div>
      </header>

      <main className="pt-24 pb-32">
        {/* Hero Section */}
        <section className="relative px-6 mb-16 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[3.5rem] aspect-[21/9] bg-primary shadow-2xl group">
            <img alt={data.name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105" src={data.heroImage} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent flex flex-col justify-end p-8 md:p-16">
              <span className="text-secondary-fixed bg-secondary/20 backdrop-blur-md px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-5 w-fit shadow-lg shadow-secondary/20 border border-white/10">
                {data.name}
              </span>
              <h1 className="text-white font-headline text-5xl md:text-8xl font-black italic tracking-tighter mb-6 max-w-4xl leading-none">
                {data.slogan}
              </h1>
              <p className="text-white/80 font-body text-lg md:text-2xl max-w-2xl mb-12 leading-relaxed font-medium">
                Conectando el Ecuador con seguridad, confort y excelencia logística en cada kilómetro de nuestra red nacional.
              </p>
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={() => navigate(`/booking/${id || 'loja'}`)}
                  className="bg-secondary text-white font-black text-xs uppercase tracking-widest px-14 py-6 rounded-2xl shadow-2xl shadow-secondary/30 active:scale-95 transition-all hover:-translate-y-1"
                >
                    Reservar Boleto
                </button>
                <button 
                  onClick={() => setShowSchedules(true)}
                  className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-black text-xs uppercase tracking-widest px-14 py-6 rounded-2xl hover:bg-white/20 active:scale-95 transition-all"
                >
                    Ver Horarios
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-8">
            <section className="mb-16">
              <h2 className="text-[10px] font-black text-secondary tracking-[0.5em] uppercase mb-4">Misión & Visión</h2>
              <h2 className="font-headline text-4xl font-black mb-8 text-primary tracking-tighter">Nuestra Trayectoria</h2>
              <div className="space-y-6 text-slate-500 leading-relaxed text-xl font-medium">
                <p>{data.description}</p>
                <p>Priorizamos la seguridad por encima de todo. Nuestra flota cuenta con monitoreo satelital en tiempo real, conductores certificados y sistemas de frenado de última generación.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                {[
                  { icon: 'wifi', label: 'Wi-Fi 5G' },
                  { icon: 'ac_unit', label: 'Clima' },
                  { icon: 'airline_seat_recline_extra', label: 'Asientos 160°' },
                  { icon: 'usb', label: 'Carga USB' }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-10 rounded-[2.5rem] flex flex-col items-center text-center border border-slate-50 group hover:bg-primary-container transition-all cursor-default shadow-lg shadow-slate-100/50">
                    <span className="material-symbols-outlined text-secondary text-5xl mb-5 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="font-headline font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-white/60">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Routes */}
            <section className="mb-16">
              <div className="flex justify-between items-end mb-12">
                <div>
                   <h2 className="text-[10px] font-black text-secondary tracking-[0.5em] uppercase mb-2">Destinos Destacados</h2>
                   <h2 className="font-headline text-4xl font-black text-primary tracking-tighter">Rutas Principales</h2>
                </div>
                <button className="text-secondary font-black text-xs uppercase tracking-widest border-b-[3px] border-secondary pb-1 hover:pb-2 transition-all">Ver catálogo completo</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {data.routes.map((route: any, i: number) => (
                  <div key={i} className="group overflow-hidden rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl transition-all duration-700 hover:-translate-y-3 shadow-slate-200/50">
                    <div className="h-64 overflow-hidden relative">
                      <img alt={route.to} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src={route.image} />
                      <div className="absolute top-8 left-8 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-2xl">Vendido Recientemente</div>
                    </div>
                    <div className="p-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-headline font-black text-3xl text-primary tracking-tighter">{route.from} — {route.to}</span>
                        <span className="text-secondary font-black text-3xl italic">${route.price.split('$')[1]}</span>
                      </div>
                      <div className="flex gap-8 text-slate-400 text-xs font-bold mb-10">
                        <div className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-xl text-secondary">timer</span> {route.duration}
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-xl text-secondary">star</span> {route.type}
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/booking/${id || 'loja'}?route=${route.from} — ${route.to}`)}
                        className="w-full py-6 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                      >
                         Reservar Ahora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4">
            <section className="sticky top-28 space-y-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-white">
                <h3 className="font-headline text-2xl font-black mb-10 text-primary tracking-tighter uppercase italic">Reseñas del Mes</h3>
                <div className="bg-primary text-white p-10 rounded-[2.5rem] mb-12 flex items-center gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="text-6xl font-black text-secondary">4.8</div>
                    <div>
                    <div className="flex text-secondary mb-2">
                        {[1,2,3,4].map(s => <span key={s} className="material-symbols-outlined text-lg filled-icon">star</span>)}
                        <span className="material-symbols-outlined text-lg">star_half</span>
                    </div>
                    <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Auditoría Logística 2024</span>
                    </div>
                </div>
                <div className="space-y-10">
                    {[
                    { user: 'Ricardo M.', comment: 'El servicio de Cooperativa Loja nunca decepciona. Los asientos son muy cómodos.', date: 'Hace 2 días' },
                    { user: 'Elena G.', comment: 'Muy seguro el viaje. El Wi-Fi fue aceptable.', date: 'Hace 1 semana' }
                    ].map((rev, i) => (
                    <div key={i} className="border-b border-slate-50 pb-10 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-4">
                        <span className="font-black text-primary text-md uppercase tracking-tighter">{rev.user}</span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase italic">{rev.date}</span>
                        </div>
                        <p className="text-md text-slate-500 font-medium italic leading-relaxed">"{rev.comment}"</p>
                    </div>
                    ))}
                </div>
                <button className="w-full mt-12 py-5 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-colors">Ver todas las opiniones</button>
              </div>
              
              {/* Promotion mini-banner */}
              <div className="bg-secondary p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="text-2xl font-black font-headline tracking-tighter leading-tight mb-4 italic">Boleto Digital QR</h4>
                  <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">Evita filas y sube directo al bus con tu ticket móvil. 100% ecológico.</p>
                  <button onClick={() => navigate('/my-tickets')} className="bg-white text-secondary px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Mis Boletos</button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-10">
              <span className="material-symbols-outlined text-secondary text-5xl">directions_bus</span>
              <span className="font-headline font-black text-4xl tracking-tighter uppercase italic">TransporteEcuador</span>
            </div>
            <p className="text-white/30 max-w-md mb-12 leading-relaxed font-medium text-lg italic">Redefiniendo la conectividad terrestre mediante una infraestructura tecnológica de vanguardia y un compromiso absoluto con el pasajero.</p>
          </div>
          <div>
            <h4 className="font-headline font-black text-xl mb-10 uppercase tracking-[0.2em] text-secondary">Plataforma</h4>
            <ul className="space-y-6 text-white/40 font-black text-xs uppercase tracking-widest">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Inicio</button></li>
              <li><button onClick={() => navigate('/virtual-terminal')} className="hover:text-white transition-colors">Andén Virtual</button></li>
              <li><button onClick={() => navigate('/terminal-map')} className="hover:text-white transition-colors">Rutas GPS</button></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* SCHEDULE MODAL (HORARIOS) */}
      {showSchedules && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowSchedules(false)}></div>
              <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative z-10 p-12 overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-10">
                      <div>
                         <h2 className="text-3xl font-black font-headline text-primary tracking-tighter">Próximas Salidas</h2>
                         <p className="text-Emerald-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                             En vivo: Terminal Cuenca
                         </p>
                      </div>
                      <button 
                        onClick={() => setShowSchedules(false)}
                        className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      {data.liveSchedules.map((s: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                              <div className="flex items-center gap-6">
                                  <div className="bg-primary text-white p-3 rounded-2xl font-black text-lg font-headline">{s.time}</div>
                                  <div>
                                      <p className="text-lg font-black text-primary leading-none uppercase italic">{s.destination}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Andén {s.platform}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                      s.status === 'boarding' ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 
                                      s.status === 'delayed' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                  }`}>
                                      {s.status === 'boarding' ? 'Embarcando' : s.status === 'delayed' ? 'Demorado' : 'A Tiempo'}
                                  </span>
                                  <button onClick={() => navigate(`/booking/${id || 'loja'}?route=Cuenca — ${s.destination}`)} className="p-3 rounded-xl bg-white text-primary shadow-sm hover:bg-primary hover:text-white transition-all">
                                      <span className="material-symbols-outlined text-sm">confirmation_number</span>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <button onClick={() => navigate(`/booking/${id || 'loja'}`)} className="w-full mt-12 py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20">Expandir todas las rutas</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default CooperativaDetail;

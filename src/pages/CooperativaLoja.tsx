import React from 'react';
import { useNavigate } from 'react-router-dom';

const CooperativaLoja = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* TopAppBar Shell */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa] dark:bg-[#00113a] bg-opacity-80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,11,58,0.06)] flex justify-between items-center px-6 py-4 mx-auto">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined text-primary text-3xl">directions_bus</span>
          <span className="font-headline font-black tracking-tighter text-2xl text-[#00113a] dark:text-[#f8f9fa]">The Kinetic Meridian</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/dashboard')} className="text-[#785900] font-bold font-headline transition-all duration-300">Explorar</button>
          <button onClick={() => navigate('/dashboard', { state: { view: 'search'} })} className="text-[#191c1d] dark:text-[#e1e3e4] hover:bg-[#e1e3e4]/50 font-headline transition-all duration-300 px-3 py-1 rounded-lg">Tickets</button>
          <button onClick={() => navigate('/terminal-schedule')} className="text-[#191c1d] dark:text-[#e1e3e4] hover:bg-[#e1e3e4]/50 font-headline transition-all duration-300 px-3 py-1 rounded-lg">Horarios</button>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="material-symbols-outlined text-primary hover:bg-[#e1e3e4]/50 p-2 rounded-full active:scale-95 transition-all">search</button>
          <button onClick={() => navigate('/profile')} className="material-symbols-outlined text-primary hover:bg-[#e1e3e4]/50 p-2 rounded-full active:scale-95 transition-all">account_circle</button>
        </div>
      </header>
      
      <main className="pt-24 pb-32">
        {/* Hero Section: Editorial Style */}
        <section className="relative px-6 mb-16 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl aspect-[21/9] bg-primary">
            <img alt="Luxury bus on Andean highway" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5PcZm4RI9l-ZL47rzgWQMMZ5Ep0WaJSRFskx6oSGQM9E_SCM4WRjmBZ7fJp41ssk7FL87NNEex8dPb_32uNyb-RrFFIPJBoP1kKZE8leN_ZZsiAKTnoVIYUlKfakF8ixZpvbMlib2EcWzrPInH9dsMvfEko7-k0i9sSeyR8MvK5KFlaHMfDZvlPPZgBX-3sGziYzcKyo3UdWdoUzh1EoGhxnygnDKuPLKdPm7aELswwcbqlD_JZx6ZINuanGII3nbbOTL7CdD0zE5" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-8 md:p-16">
              <span className="text-secondary-container font-headline font-bold uppercase tracking-[0.2em] mb-4">Cooperativa Loja</span>
              <h1 className="text-white font-headline text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-2xl leading-[1.1]">
                Excelencia y Tradición en Cada Kilómetro.
              </h1>
              <p className="text-white/80 font-body text-lg md:text-xl max-w-xl mb-8">
                Conectando el sur del Ecuador con el resto del país mediante un servicio premium de confort y seguridad inigualable.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/dashboard', { state: { view: 'search'} })} className="bg-secondary-container text-on-secondary-fixed font-bold px-8 py-4 rounded-xl shadow-lg active:scale-95 transition-all">Reservar Boleto</button>
                <button onClick={() => navigate('/dashboard', { state: { view: 'search'} })} className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold px-8 py-4 rounded-xl hover:bg-white/20 active:scale-95 transition-all">Ver Horarios</button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Service Overview & History */}
          <div className="lg:col-span-8">
            <section className="mb-16">
              <h2 className="font-headline text-3xl font-bold mb-6 text-primary text-left">Nuestra Trayectoria</h2>
              <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg text-left">
                <p>
                  Fundada en el corazón de la Centinela del Sur, Cooperativa Loja ha sido el pilar del transporte nacional por más de 60 años. Nuestra historia es una de constante innovación, transformando el concepto de viaje en autobús en una experiencia de hospitalidad sobre ruedas.
                </p>
                <p>
                  Priorizamos la seguridad por encima de todo. Nuestra flota cuenta con monitoreo satelital en tiempo real, conductores certificados con amplia experiencia en rutas andinas y sistemas de frenado de última generación para garantizar la tranquilidad de su familia.
                </p>
              </div>
              {/* Amenities Bento Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-3">wifi</span>
                  <span className="font-headline font-bold text-sm uppercase tracking-wider">Wi-Fi High-Speed</span>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-3">ac_unit</span>
                  <span className="font-headline font-bold text-sm uppercase tracking-wider">Climatización</span>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-3">airline_seat_recline_extra</span>
                  <span className="font-headline font-bold text-sm uppercase tracking-wider">Asientos 160°</span>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-3">usb</span>
                  <span className="font-headline font-bold text-sm uppercase tracking-wider">Carga USB</span>
                </div>
              </div>
            </section>

            {/* Fleet & Routes */}
            <section className="mb-16">
              <div className="flex justify-between items-end mb-8">
                <h2 className="font-headline text-3xl font-bold text-primary">Flota y Rutas Principales</h2>
                <button onClick={() => navigate('/dashboard', { state: { view: 'search'} })} className="text-secondary font-bold text-sm uppercase tracking-widest border-b-2 border-secondary pb-1">Ver todas las rutas</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {/* Route Card 1 */}
                <div className="group overflow-hidden rounded-2xl bg-surface-container-lowest border-none shadow-[0_12px_40px_rgba(0,11,58,0.04)] transition-all duration-300 hover:translate-y-[-4px]">
                  <div className="h-48 overflow-hidden relative">
                    <img alt="Quito skyline" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOmyCh39wty3ZJEqWHZ5SY_P8v_4_0xduQLx1dQpihsWBXw3V938l5u5Ri1c_4CzOw9WGsh_bTTsQfZNOAUqYP5Y-ETukuA6sbuXhxoQ_LzSUJwMg5VQ7cYxkkWeQlOXCpwwFJojv7s5XgOBXTDjSx9mtyJcTMHvUF1sRWIGXROs5dp6Y5BHAz4vuARSS-ckZ9r7umOk_Ac_pEQIM_J5DXqg7VCE8hOtt9P6zb-OvObwUsrAvHnR1IMvjHuadOuXZR3ckpBP9Wpu6g" />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Más Popular</div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-headline font-bold text-xl">Quito — Cuenca</span>
                      <span className="text-secondary font-black text-xl">$15.00</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-on-surface-variant text-sm mb-6">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">schedule</span> 8h 30m
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">airline_seat_recline_normal</span> Luxury
                      </div>
                    </div>
                    <button onClick={() => navigate('/dashboard', { state: { view: 'search'} })} className="w-full py-3 rounded-lg bg-surface-container text-primary font-bold hover:bg-primary hover:text-white transition-colors">Reservar Ahora</button>
                  </div>
                </div>

                {/* Route Card 2 */}
                <div className="group overflow-hidden rounded-2xl bg-surface-container-lowest border-none shadow-[0_12px_40px_rgba(0,11,58,0.04)] transition-all duration-300 hover:translate-y-[-4px]">
                  <div className="h-48 overflow-hidden relative">
                    <img alt="Guayaquil riverside" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEI-uwzYeIIi28WnVngp2alWpHDD3NL07SR5hzSqz2vYYqKh7fi2GhzBGw6ORAyE52_SsPIYPqRmPNBhDgQiFnc2UMiJkczxOp0ZeK0iuKA0Y9oz14iKYD2UNhSckKqCp4XI5usT7JLPaRbM0gI3FHMyO6tmDJNUE-QJiN0AukVW8_iIaqXrpzQhmOCvP0ffLCDYKzfEydov60f3lkWQLxPZEbEOcI3Xw04llBtKg9AzLZQ54fKvRclvXHr4i392wyWVXciZsVSbfU" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-headline font-bold text-xl">Guayaquil — Loja</span>
                      <span className="text-secondary font-black text-xl">$12.50</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-on-surface-variant text-sm mb-6">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">schedule</span> 7h 00m
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">airline_seat_recline_normal</span> Ejecutivo
                      </div>
                    </div>
                    <button onClick={() => navigate('/dashboard', { state: { view: 'search'} })} className="w-full py-3 rounded-lg bg-surface-container text-primary font-bold hover:bg-primary hover:text-white transition-colors">Reservar Ahora</button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Ratings & Reviews */}
          <div className="lg:col-span-4 text-left">
            <section className="sticky top-28 bg-surface-container-low rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,11,58,0.05)] border border-white">
              <h3 className="font-headline text-2xl font-bold mb-8 text-primary">Opiniones</h3>
              {/* Average Score Card */}
              <div className="bg-primary text-white p-6 rounded-2xl mb-8 flex items-center gap-6">
                <div className="text-5xl font-black text-secondary-container">4.8</div>
                <div>
                  <div className="flex text-secondary-container mb-1">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                  </div>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Basado en 2,400+ viajes</span>
                </div>
              </div>
              
              {/* Individual Reviews */}
              <div className="space-y-8">
                <div className="border-b border-outline-variant/20 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-primary">Ricardo M.</span>
                    <span className="text-xs text-on-surface-variant">Hace 2 días</span>
                  </div>
                  <div className="flex text-amber-500 scale-75 origin-left mb-2">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <p className="text-sm text-on-surface-variant italic leading-relaxed">
                    "El servicio de Cooperativa Loja nunca decepciona. Los asientos de la unidad Luxury son increíbles para viajes largos."
                  </p>
                </div>
                
                <div className="border-b border-outline-variant/20 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-primary">Elena G.</span>
                    <span className="text-xs text-on-surface-variant">Hace 1 semana</span>
                  </div>
                  <div className="flex text-amber-500 scale-75 origin-left mb-2">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                  </div>
                  <p className="text-sm text-on-surface-variant italic leading-relaxed">
                    "Muy seguro el viaje. El Wi-Fi fue algo lento al pasar por el Cajas, pero el resto impecable."
                  </p>
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-white border border-outline-variant text-primary font-bold rounded-xl hover:bg-primary-container hover:text-white transition-all">Ver todos los comentarios</button>
            </section>
          </div>
        </div>
      </main>

      {/* BottomNavBar Shell (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#f8f9fa]/90 dark:bg-[#00113a]/90 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,11,58,0.08)] z-50 rounded-t-3xl">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center bg-[#785900] text-white rounded-[1rem] px-5 py-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">explore</span>
          <span className="font-body font-semibold text-[11px] uppercase tracking-widest mt-1">Explorar</span>
        </button>
        <button onClick={() => navigate('/dashboard', { state: { view: 'search'} })} className="flex flex-col items-center justify-center text-[#191c1d] dark:text-[#e1e3e4] opacity-70 hover:opacity-100 transition-opacity active:scale-90">
          <span className="material-symbols-outlined">confirmation_number</span>
          <span className="font-body font-semibold text-[11px] uppercase tracking-widest mt-1">Tickets</span>
        </button>
        <button onClick={() => navigate('/terminal-schedule')} className="flex flex-col items-center justify-center text-[#191c1d] dark:text-[#e1e3e4] opacity-70 hover:opacity-100 transition-opacity active:scale-90">
          <span className="material-symbols-outlined">alt_route</span>
          <span className="font-body font-semibold text-[11px] uppercase tracking-widest mt-1">Horarios</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-[#191c1d] dark:text-[#e1e3e4] opacity-70 hover:opacity-100 transition-opacity active:scale-90">
          <span className="material-symbols-outlined">person</span>
          <span className="font-body font-semibold text-[11px] uppercase tracking-widest mt-1">Perfil</span>
        </button>
      </nav>

      {/* Detailed Footer */}
      <footer className="bg-primary text-white py-20 text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-secondary-container text-4xl">directions_bus</span>
              <span className="font-headline font-black text-2xl tracking-tighter">The Kinetic Meridian</span>
            </div>
            <p className="text-white/60 max-w-sm mb-8 leading-relaxed">
              Elevando el estándar del transporte terrestre en Ecuador. Tecnología, confort y seguridad para el viajero moderno.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-xl">share</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-xl">language</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl mb-6">Compañía</h4>
            <ul className="space-y-4 text-white/60">
              <li><button className="hover:text-secondary-container transition-colors">Sobre Nosotros</button></li>
              <li><button className="hover:text-secondary-container transition-colors">Terminales</button></li>
              <li><button className="hover:text-secondary-container transition-colors">Servicios Corporativos</button></li>
              <li><button className="hover:text-secondary-container transition-colors">Trabaja con Nosotros</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl mb-6">Soporte</h4>
            <ul className="space-y-4 text-white/60">
              <li><button className="hover:text-secondary-container transition-colors">Centro de Ayuda</button></li>
              <li><button className="hover:text-secondary-container transition-colors">Términos de Servicio</button></li>
              <li><button className="hover:text-secondary-container transition-colors">Privacidad</button></li>
              <li><button className="hover:text-secondary-container transition-colors">Contacto</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          © 2024 The Kinetic Meridian Transit Ecosystem. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default CooperativaLoja;

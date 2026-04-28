import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const History = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleViewPDF = (trip: { from: string; to: string; date: string; time: string; unit: string; coop: string }) => {
    const content = `COMPROBANTE DE VIAJE\nRuta: ${trip.from} → ${trip.to}\nFecha: ${trip.date} a las ${trip.time}\n${trip.unit} • ${trip.coop}\nEmitido por TransporteEcuador`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `comprobante_${trip.from}_${trip.to}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoading(false);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body pb-20">
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa] dark:bg-[#00113a] bg-opacity-80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,11,58,0.06)] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined text-primary text-3xl">directions_bus</span>
          <span className="text-xl font-black text-blue-950 dark:text-white uppercase tracking-wider font-headline">MOVU</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-sm font-bold text-primary hover:bg-slate-200/50 px-4 py-2 rounded-lg transition-colors">Volver al Panel</button>
      </header>

      <main className="pt-24 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div>
            <h1 className="text-5xl font-extrabold font-headline text-primary tracking-tight leading-none mb-2">Mis Viajes</h1>
            <p className="text-on-surface-variant font-medium opacity-80">Revisa tu historial de tickets y rutas recientes.</p>
          </div>
        </div>

        <section className="space-y-6 text-left">
          {/* Trip Card 1 */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,17,58,0.04)] border-l-4 border-secondary flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:translate-x-1 transition-transform">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-surface-container-high rounded-xl flex items-center justify-center text-secondary font-black text-2xl">
                CL
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl">Cuenca → Quito</h3>
                <p className="text-on-surface-variant text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span> 12 de Abril, 2024 • 08:30 AM
                </p>
                <p className="text-on-surface-variant text-sm font-bold">Unidad 104 • Cooperativa Loja</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Completado</span>
              <div className="flex gap-2">
                <button onClick={() => handleViewPDF({ from: 'Cuenca', to: 'Quito', date: '12 Abril 2024', time: '08:30 AM', unit: 'Unidad 104', coop: 'Cooperativa Loja' })} className="px-4 py-2 bg-surface-container-high text-primary font-bold text-xs rounded-lg hover:bg-surface-container-highest transition-colors">Ver PDF</button>
                <button onClick={() => navigate('/dashboard', { state: { view: 'search' } })} className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-container transition-colors">Comprar de Nuevo</button>
              </div>
            </div>
          </div>

          {/* Trip Card 2 */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,17,58,0.04)] border-l-4 border-primary flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:translate-x-1 transition-transform">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-surface-container-high rounded-xl flex items-center justify-center text-primary font-black text-2xl">
                TA
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl">Cuenca → Guayaquil</h3>
                <p className="text-on-surface-variant text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span> 05 de Abril, 2024 • 14:15 PM
                </p>
                <p className="text-on-surface-variant text-sm font-bold">Unidad 22 • Transportes Azuay</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Completado</span>
              <div className="flex gap-2">
                <button onClick={() => handleViewPDF({ from: 'Cuenca', to: 'Guayaquil', date: '05 Abril 2024', time: '14:15 PM', unit: 'Unidad 22', coop: 'Transportes Azuay' })} className="px-4 py-2 bg-surface-container-high text-primary font-bold text-xs rounded-lg hover:bg-surface-container-highest transition-colors">Ver PDF</button>
                <button onClick={() => navigate('/dashboard', { state: { view: 'search' } })} className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-container transition-colors">Comprar de Nuevo</button>
              </div>
            </div>
          </div>
        </section>

        {/* Empty state if needed */}
        {/* <div className="mt-20 text-center py-20 bg-surface-container-low rounded-[3rem] border-2 border-dashed border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">confirmation_number</span>
          <h2 className="text-2xl font-bold text-primary mb-2">No tienes viajes registrados</h2>
          <p className="text-on-surface-variant mb-6">Tu historial de tickets aparecerá aquí una vez realices tu primer viaje.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Explorar Destinos</button>
        </div> */}
      </main>

      {/* Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white flex justify-around items-center px-4 pt-2 pb-6 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,17,58,0.08)] z-50">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-slate-400 px-4 py-1.5 hover:text-amber-600 transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-tighter mt-1">Inicio</span>
        </button>
        <button onClick={() => navigate('/dashboard', { state: { view: 'search' } })} className="flex flex-col items-center justify-center text-slate-400 px-4 py-1.5 hover:text-amber-600 transition-all">
          <span className="material-symbols-outlined">route</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-tighter mt-1">Rutas</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-amber-50 text-amber-700 rounded-xl px-4 py-1.5 transition-all">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-tighter mt-1">Viajes</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-slate-400 px-4 py-1.5 hover:text-amber-600 transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-tighter mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default History;

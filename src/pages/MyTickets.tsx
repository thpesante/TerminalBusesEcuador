import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const [userInitial, setUserInitial] = useState('U');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/'); return; }
      setUserInitial((user.displayName || user.email || 'U').charAt(0).toUpperCase());
      setIsLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const tickets = [
    { id: 'TKT-12904', coop: 'Cooperativa Loja', from: 'Cuenca', to: 'Quito', date: '24 Oct 2026', time: '10:30 PM', seat: '12', price: '$15.25', status: 'active' },
    { id: 'TKT-11855', coop: 'Turismo Oriental', from: 'Cuenca', to: 'Guayaquil', date: '15 Oct 2026', time: '08:00 AM', seat: '04', price: '$8.25', status: 'expirado' }
  ];

  const handleDownloadPDF = (ticket: typeof tickets[0]) => {
    const content = `BOLETO DIGITAL - ${ticket.id}\n${ticket.coop}\nRuta: ${ticket.from} → ${ticket.to}\nFecha: ${ticket.date} ${ticket.time}\nAsiento: ${ticket.seat}\nTotal: ${ticket.price}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${ticket.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async (ticket: typeof tickets[0]) => {
    const text = `Mi viaje: ${ticket.from} → ${ticket.to} el ${ticket.date} a las ${ticket.time}. Asiento ${ticket.seat}. Reservado con TransporteEcuador.`;
    if (navigator.share) {
      await navigator.share({ title: `Boleto ${ticket.id}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Información del boleto copiada al portapapeles');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased pt-24 pb-32">
       {/* TopAppBar */}
       <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,11,58,0.06)] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <span className="text-xl font-extrabold tracking-tighter text-primary font-headline">Mis Boletos</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold border-2 border-white">{userInitial}</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h1 className="text-4xl font-black font-headline text-primary tracking-tighter">Tu Historial de Viaje</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 italic">Accede a tus tickets digitales para el abordaje</p>
            </div>
            <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                <span className="text-primary font-black text-xl">{tickets.length}</span>
            </div>
        </div>

        <div className="space-y-8">
            {tickets.map((t) => (
                <div key={t.id} className="bg-white rounded-[3rem] shadow-xl border border-slate-50 overflow-hidden flex flex-col md:flex-row shadow-slate-200/50 hover:shadow-2xl transition-all group">
                    {/* QR Section */}
                    <div className="md:w-64 bg-slate-50 p-12 flex flex-col items-center justify-center border-r border-slate-100 relative">
                        <div className="w-32 h-32 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 group-hover:scale-105 transition-transform">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.id}`} alt="QR" className="w-full h-full opacity-80" />
                        </div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mt-8">{t.id}</p>
                        
                        {/* Status badge */}
                        <div className={`absolute top-6 left-6 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${t.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {t.status}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 p-10 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black font-headline text-primary tracking-tighter">{t.from} — {t.to}</h3>
                                <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-2">{t.coop}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-primary font-headline leading-none">{t.price}</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">TOTAL PAGADO</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                            <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">FECHA</p><p className="font-bold text-primary text-sm">{t.date}</p></div>
                            <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">SALIDA</p><p className="font-bold text-primary text-sm">{t.time}</p></div>
                            <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">ASIENTO</p><p className="font-black text-secondary uppercase text-sm"># {t.seat}</p></div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                              onClick={() => handleDownloadPDF(t)}
                              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">download</span>
                              Descargar
                            </button>
                            <button
                              onClick={() => handleShare(t)}
                              className="flex-1 py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">share</span>
                              Compartir
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-20 p-12 bg-primary rounded-[3.5rem] relative overflow-hidden text-center shadow-2xl shadow-primary/30">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <h3 className="text-white text-3xl font-black font-headline tracking-tighter mb-4 italic">¿Necesitas ayuda con tu viaje?</h3>
             <p className="text-white/60 font-medium text-sm mb-10 max-w-sm mx-auto">Nuestro equipo de soporte está disponible 24/7 para resolver cualquier inconveniente con tus boletos.</p>
              <button
                onClick={() => window.open('mailto:soporte@transporteecuador.ec?subject=Ayuda con mi boleto')}
                className="bg-secondary text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all"
              >
                Contactar Soporte
              </button>
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <footer className="lg:hidden fixed bottom-0 left-0 w-full h-24 bg-white border-t border-slate-100 flex justify-around items-center px-4 pb-4 z-50">
            <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 text-slate-300 tracking-tighter">
                <span className="material-symbols-outlined">home</span>
                <span className="text-[8px] font-black uppercase">Inicio</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-primary tracking-tighter">
                <span className="material-symbols-outlined">confirmation_number</span>
                <span className="text-[8px] font-black uppercase">Boletos</span>
            </button>
            <div className="w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center -translate-y-6"><span className="material-symbols-outlined">qr_code_scanner</span></div>
            <button onClick={() => navigate('/terminal-map')} className="flex flex-col items-center gap-1 text-slate-300 tracking-tighter">
                <span className="material-symbols-outlined">map</span>
                <span className="text-[8px] font-black uppercase">Mapa</span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-slate-300 tracking-tighter">
                <span className="material-symbols-outlined">person</span>
                <span className="text-[8px] font-black uppercase">Perfil</span>
            </button>
      </footer>
    </div>
  );
};

export default MyTickets;

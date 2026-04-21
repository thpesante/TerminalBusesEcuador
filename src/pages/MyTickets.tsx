import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface Ticket {
  id: string;
  origen: string;
  destino: string;
  hora: string;
  precio: number;
  asiento: number;
  estado: string;
  createdAt: any;
}

const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInitial, setUserInitial] = useState('U');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
        return;
      }
      setUserInitial(user.email?.charAt(0).toUpperCase() || 'U');

      // Escuchamos los tickets reales del usuario
      const q = query(
        collection(db, 'tickets'),
        where('pasajero.uid', '==', user.uid)
      );

      const unsubDocs = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ticket[];
        // Ordenamos localmente para evitar error de índice de Firestore si no existe aún
        const sorted = list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setTickets(sorted);
        setIsLoading(false);
      }, (error) => {
        console.error("Firestore Error in MyTickets:", error);
        setIsLoading(false);
      });

      return () => unsubDocs();
    });

    return () => unsubAuth();
  }, [navigate]);

  const handleDownloadTicket = (t: Ticket) => {
    const content = `BOLETO DIGITAL - ${t.id}\nRuta: ${t.origen} -> ${t.destino}\nAsiento: ${t.asiento}\nPrecio: $${(t.precio || 0).toFixed(2)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ticket_${t.id}.txt`;
    a.click();
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-[#f8fafc]"><div className="w-12 h-12 border-4 border-[#00216e] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body text-slate-800 pt-24 pb-32">
       <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-slate-100 transition-all text-[#00216e]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-xl font-black tracking-tighter text-[#00216e] font-headline uppercase italic">Mis Boletos</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#00216e] flex items-center justify-center text-white font-bold">{userInitial}</div>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-10">
        <div className="flex items-end justify-between">
            <div>
                <h1 className="text-4xl font-black font-headline text-[#00216e] tracking-tighter uppercase italic">Tu Bóveda de Viajes</h1>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-2 italic">Aquí residen tus comprobantes digitales activos e históricos</p>
            </div>
            <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00216e] text-2xl">confirmation_number</span>
                <span className="text-2xl font-black text-[#00216e] font-headline">{tickets.length}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
            {tickets.map((t) => (
               <div key={t.id} className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all group">
                  {/* QR Logic */}
                  <div className="md:w-64 bg-slate-50 p-10 flex flex-col items-center justify-center border-r border-slate-100 relative">
                      <div className="w-32 h-32 bg-white p-4 rounded-3xl shadow-lg border border-slate-100 group-hover:scale-110 transition-transform">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.id}`} alt="QR" className="w-full h-full opacity-60" />
                      </div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-8">ID:{t.id.slice(-8).toUpperCase()}</p>
                      <div className="absolute top-6 left-8 bg-[#00216e] text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">ACTIVO</div>
                  </div>

                  <div className="flex-1 p-10 space-y-8">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <h3 className="text-2xl font-black font-headline text-[#00216e] tracking-tighter uppercase">{t.destino}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desde: {t.origen}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-3xl font-black text-[#00216e] font-headline">$ {(t.precio || 0).toFixed(2)}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl">
                         <div>
                            <p className="text-[8px] font-black text-slate-300 uppercase mb-1">HORARIO</p>
                            <p className="font-black text-[#00216e] text-sm">{t.hora}</p>
                         </div>
                         <div className="border-l border-slate-200 px-4">
                            <p className="text-[8px] font-black text-slate-300 uppercase mb-1">ASIENTO</p>
                            <p className="font-black text-blue-600 text-sm"># {t.asiento}</p>
                         </div>
                         <div className="border-l border-slate-200 px-4">
                            <p className="text-[8px] font-black text-slate-300 uppercase mb-1">ESTADO</p>
                            <span className="text-[9px] font-black text-green-600 uppercase">VALIDADO</span>
                         </div>
                      </div>

                      <div className="flex gap-4">
                         <button onClick={() => handleDownloadTicket(t)} className="flex-1 bg-[#00216e] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Descargar PDF
                         </button>
                         <button className="flex-1 bg-white border border-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                            <span className="material-symbols-outlined text-sm">share</span>
                            Compartir
                         </button>
                      </div>
                  </div>
               </div>
            ))}

            {tickets.length === 0 && (
              <div className="p-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                 <span className="material-symbols-outlined text-6xl text-slate-200">sentiment_dissatisfied</span>
                 <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Aún no has realizado ningún viaje</p>
                 <button onClick={() => navigate('/dashboard')} className="mt-8 bg-[#00216e] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Comprar mi primer boleto</button>
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default MyTickets;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';

interface Company {
  id: string;
  nombre: string;
  ruc_empresa: string;
  logo?: string;
  oficina?: string;
  descripcion?: string;
  lema?: string;
}

interface Trip {
  id: string;
  destino: string;
  origen: string;
  hora: string;
  precio: number;
  estado: string;
}

const CooperativaDetail: React.FC = () => {
  const { id } = useParams(); // Puede ser el RUC o el ID del documento
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyAndTrips = async () => {
      try {
        // 1. Buscar la empresa en 'users' (donde role == OFICINA)
        // Intentar primero por RUC si el id parece un RUC
        let q = query(collection(db, 'users'), where('ruc_empresa', '==', id));
        let snap = await getDocs(q);

        if (snap.empty) {
          // Si no, intentar por ID directo
          const snapId = await getDocs(query(collection(db, 'users'), where('role', '==', 'OFICINA')));
          const found = snapId.docs.find(d => d.id === id);
          if (found) {
            setCompany({ id: found.id, ...found.data() } as Company);
          }
        } else {
          setCompany({ id: snap.docs[0].id, ...snap.docs[0].data() } as Company);
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    fetchCompanyAndTrips();
  }, [id]);

  useEffect(() => {
    if (company?.ruc_empresa) {
      const qTrips = query(collection(db, 'trips'), where('ruc_empresa', '==', company.ruc_empresa));
      const unsubTrips = onSnapshot(qTrips, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        destino: doc.data().destino,
        hora: doc.data().hora,
        estado: doc.data().estado,
        discoBus: doc.data().discoBus
      })) as Trip[];
      setTrips(list);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error in VirtualTerminalView:", error);
      setLoading(false);
    });
      return () => unsubTrips();
    }
  }, [company]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-white"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen font-body text-slate-800">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
           <span className="text-xl font-black font-headline text-primary uppercase italic tracking-tighter">TransporteEcuador</span>
        </div>
        <button onClick={() => navigate(-1)} className="bg-slate-100 text-slate-400 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00216e] hover:text-white transition-all">Regresar</button>
      </header>

      <main className="pt-24 pb-32">
        {/* Banner Hero */}
        <section className="px-6 mb-16 max-w-7xl mx-auto">
           <div className="relative h-[450px] rounded-[4rem] overflow-hidden bg-[#00113a] shadow-2xl">
              <img 
                src={company?.logo || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200'}
                className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                alt="hero"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00113a] to-transparent p-12 flex flex-col justify-end">
                 <h1 className="text-white text-6xl md:text-8xl font-black font-headline italic tracking-tighter leading-none mb-4 uppercase">
                    {company?.nombre || 'Cooperativa'}
                 </h1>
                 <p className="text-blue-300 text-xl font-medium italic opacity-80 max-w-2xl">
                    {company?.lema || 'Excelencia y Tradición en cada kilómetro del territorio nacional.'}
                 </p>
                 <div className="flex gap-4 mt-10">
                    <div className="bg-[#ffe07f] text-[#00216e] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">Aliado Verificado</div>
                    <div className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">RUC: {company?.ruc_empresa || '-----------'}</div>
                 </div>
              </div>
           </div>
        </section>

        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
           <div className="lg:col-span-8 space-y-16">
              <section>
                 <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-4">Sobre la empresa</h2>
                 <p className="text-2xl text-slate-500 font-medium leading-relaxed italic">
                    {company?.descripcion || 'Esta cooperativa forma parte de la red de transporte interprovincial de alta eficiencia, garantizando puntualidad y seguridad en todas sus frecuencias diarias.'}
                 </p>
              </section>

              <section>
                 <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-10">Frecuencias en Vivo</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {trips.length === 0 ? (
                       <div className="col-span-2 p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                          <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No hay frecuencias activas por el momento</p>
                       </div>
                    ) : (
                       trips.map(t => (
                         <div key={t.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 group hover:shadow-2xl transition-all">
                            <div className="flex justify-between items-start mb-8">
                               <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destino</p>
                                  <h3 className="text-4xl font-black font-headline text-[#00216e] uppercase tracking-tighter italic">{t.destino}</h3>
                               </div>
                               <div className="text-right">
                                  <p className="text-2xl font-black text-[#00216e] font-headline">$ {(t.precio || 0).toFixed(2)}</p>
                               </div>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                               <div className="flex items-center gap-4">
                                  <span className="material-symbols-outlined text-blue-400">schedule</span>
                                  <span className="font-black text-slate-800">{t.hora}</span>
                               </div>
                               <button 
                                 onClick={() => navigate('/booking/' + company?.ruc_empresa)}
                                 className="bg-[#00216e] text-white px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-900/10"
                               >
                                  Comprar
                               </button>
                            </div>
                         </div>
                       ))
                    )}
                 </div>
              </section>
           </div>

           <aside className="lg:col-span-4 space-y-8">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-50 sticky top-28">
                 <h4 className="text-2xl font-black font-headline text-[#00216e] uppercase italic mb-8">Seguridad Integral</h4>
                 <div className="space-y-6">
                    {[
                       { i: 'vitals', l: 'Monitoreo GPS 24/7' },
                       { i: 'verified_user', l: 'Conductores Certificados' },
                       { i: 'support_agent', l: 'Atención en Ruta' }
                    ].map(feat => (
                       <div key={feat.l} className="flex items-center gap-4 group">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-[#00216e] group-hover:text-white transition-all">
                             <span className="material-symbols-outlined">{feat.i}</span>
                          </div>
                          <span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">{feat.l}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </aside>
        </div>
      </main>
    </div>
  );
};

export default CooperativaDetail;

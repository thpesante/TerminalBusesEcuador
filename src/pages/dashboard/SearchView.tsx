import React, { useState, useEffect } from 'react';
import PaymentModal from '../../components/PaymentModal';
import { db } from '../../firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';

interface Trip {
  id: string;
  destino: string;
  origen: string;
  hora: string;
  precio: number;
  discoBus: string;
  placaBus: string;
  ruc_empresa: string;
  estado: string;
  capacidad: number;
}

interface SearchViewProps {
  setView: (view: any) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ setView }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchamos todos los viajes disponibles
    const q = query(collection(db, 'trips'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
        setTrips(list.filter(t => t.estado !== 'DESPACHADO'));
      } else {
        setTrips([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error in SearchView:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleBuy = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setView('tracking');
  };

  return (
    <div className="animate-fade-in relative">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tight mb-2 uppercase italic leading-none">Marketplace de Viajes</h1>
            <p className="text-on-surface-variant text-lg font-body lowercase italic">Visualizando todas las frecuencias activas en tiempo real.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-primary">filter_list</span>
              <span className="text-xs font-black uppercase text-slate-400">Filtrar Rutas</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8">
           <div className="bg-[#00216e] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-60">Filtro Rápido</h3>
              <p className="text-xl font-headline font-bold leading-tight">Encuentra tu próximo destino ahora.</p>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:rotate-12 transition-all">explore</span>
           </div>

           <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#00216e] mb-4">Destinos Comunes</h4>
              <div className="space-y-4">
                 {['Quito', 'Guayaquil', 'Cuenca', 'Manta'].map(city => (
                   <div key={city} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-all">
                      <span className="material-symbols-outlined text-sm text-blue-400">location_on</span>
                      <span className="text-xs font-bold text-slate-600">{city}</span>
                   </div>
                 ))}
              </div>
           </div>
        </aside>

        {/* Results List */}
        <div className="lg:col-span-9 space-y-8">
          {loading ? (
             <div className="p-20 text-center animate-pulse">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Consultando frecuencias...</p>
             </div>
          ) : trips.length === 0 ? (
             <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-4xl text-slate-300">upcoming</span>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">No hay viajes programados por el momento</p>
             </div>
          ) : (
             trips.map(trip => (
               <div key={trip.id} className="bg-white rounded-[3rem] p-4 shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative">
                  <div className="flex flex-col md:flex-row items-center gap-8 p-6">
                     <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#00216e]">
                              <span className="material-symbols-outlined text-3xl">directions_bus</span>
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Salida: {trip.origen || 'T. Terrestre'}</p>
                              <h3 className="text-2xl font-black font-headline text-[#00216e] italic tracking-tighter uppercase">{trip.destino}</h3>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-10">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horario</span>
                              <span className="text-xl font-black text-slate-800">{trip.hora}</span>
                           </div>
                           <div className="h-10 w-px bg-slate-100"></div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidad</span>
                              <span className="text-xl font-black text-blue-500">#{trip.discoBus}</span>
                           </div>
                        </div>
                     </div>

                     <div className="w-full md:w-64 bg-slate-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-4 border border-slate-100 group-hover:bg-[#ffe07f] transition-all">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-[#00216e]">Desde</p>
                        <p className="text-4xl font-black text-[#00216e] font-headline">$ {(trip.precio || 0).toFixed(2)}</p>
                        <button 
                          onClick={() => handleBuy(trip)}
                          className="w-full bg-[#00216e] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10 active:scale-95 transition-all"
                        >
                           Comprar Ticket
                        </button>
                     </div>
                  </div>
                  {/* Status Badges */}
                  <div className="absolute top-6 right-8 flex gap-2">
                     <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">{trip.estado}</span>
                  </div>
               </div>
             ))
          )}
        </div>
      </div>

      {selectedTrip && (
        <PaymentModal 
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
          trip={selectedTrip}
        />
      )}
    </div>
  );
};

export default SearchView;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

interface Trip {
  id: string;
  destino: string;
  origen: string;
  hora: string;
  precio: number;
  discoBus: string;
  ruc_empresa: string;
}

const BookingFlow: React.FC = () => {
  const { id: coopId } = useParams(); // RUC de la empresa
  const navigate = useNavigate();
  const [step, setStep] = useState<'schedule' | 'seats' | 'payment' | 'success'>('schedule');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cargar Viajes Reales de esta Cooperativa
    const q = query(collection(db, 'trips'), where('ruc_empresa', '==', coopId), where('estado', '==', 'PROGRAMADO'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
      setTrips(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [coopId]);

  useEffect(() => {
    // 2. Cargar Asientos Ocupados cuando se selecciona un viaje
    if (selectedTrip) {
      const q = query(collection(db, 'tickets'), where('tripId', '==', selectedTrip.id), where('estado', '==', 'ACTIVO'));
      const unsub = onSnapshot(q, (snapshot) => {
        const seats = snapshot.docs.map(doc => doc.data().asiento);
        setOccupiedSeats(seats);
      });
      return () => unsub();
    }
  }, [selectedTrip]);

  const handleFinalize = async () => {
    if (!selectedTrip || !selectedSeat || !auth.currentUser) return;
    setStep('payment');
    
    try {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userSnap.data();

      // Crear Ticket
      const ticketRef = await addDoc(collection(db, 'tickets'), {
        tripId: selectedTrip.id,
        ruc_empresa: selectedTrip.ruc_empresa,
        origen: selectedTrip.origen,
        destino: selectedTrip.destino,
        hora: selectedTrip.hora,
        pasajero: {
          uid: auth.currentUser.uid,
          nombre: userData?.nombre || 'Pasajero',
        },
        asiento: selectedSeat,
        precio: selectedTrip.precio,
        estado: 'ACTIVO',
        createdAt: serverTimestamp()
      });

      // Registrar en Caja
      await addDoc(collection(db, 'cash_transactions'), {
        ruc_empresa: selectedTrip.ruc_empresa,
        monto: selectedTrip.precio,
        tipo: 'INGRESO',
        concepto: `Venta Online - ${selectedTrip.destino}`,
        metodo: 'DIGITAL',
        vendedorId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });

      setStep('success');
    } catch (e) {
      console.error(e);
      alert("Error al procesar reserva");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-primary"><span className="material-symbols-outlined">arrow_back</span></button>
            <h2 className="text-xl font-black font-headline text-primary uppercase italic tracking-tighter">Reserva Premium</h2>
         </div>
         <div className="hidden md:flex gap-6">
            {['Horario', 'Asiento', 'Pago', 'Exito'].map((s, i) => (
              <div key={s} className={`flex items-center gap-2 ${['schedule','seats','payment','success'].indexOf(step) >= i ? 'text-primary' : 'text-slate-300'}`}>
                 <span className="text-[10px] font-black uppercase tracking-widest">{s}</span>
                 {i < 3 && <div className="w-8 h-px bg-slate-200"></div>}
              </div>
            ))}
         </div>
      </header>

      <main className="max-w-4xl mx-auto px-6">
         {step === 'schedule' && (
           <div className="animate-fade-in">
              <h1 className="text-4xl font-black font-headline tracking-tighter text-[#00216e] mb-10 uppercase italic">Selecciona tu Frecuencia</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {trips.map(trip => (
                   <div key={trip.id} onClick={() => setSelectedTrip(trip)} className={`p-8 rounded-[3rem] border-2 cursor-pointer transition-all ${selectedTrip?.id === trip.id ? 'border-[#ffe07f] bg-white shadow-2xl' : 'border-transparent bg-white shadow-sm hover:border-slate-100'}`}>
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-2xl font-black font-headline text-[#00216e]">{trip.hora}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{trip.origen} → {trip.destino}</p>
                         </div>
                         <p className="text-2xl font-black text-blue-500 font-headline">$ {trip.precio.toFixed(2)}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <button disabled={!selectedTrip} onClick={() => setStep('seats')} className="w-full bg-[#00216e] text-white py-5 rounded-2xl font-black mt-12 shadow-xl hover:-translate-y-1 transition-all disabled:opacity-30 uppercase tracking-widest text-xs">Continuar Selección</button>
           </div>
         )}

         {step === 'seats' && (
           <div className="animate-fade-in flex flex-col items-center">
              <h2 className="text-3xl font-black font-headline text-[#00216e] mb-8 uppercase italic tracking-tighter w-full text-left">Mapa de Ocupación Real</h2>
              
              <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-8 border-slate-100 w-full max-w-[340px] grid grid-cols-4 gap-4 relative">
                 <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-100 rounded-full"></div>
                 {Array.from({ length: 40 }, (_, i) => i + 1).map(num => (
                    <div 
                      key={num} 
                      onClick={() => !occupiedSeats.includes(num) && setSelectedSeat(num)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black cursor-pointer transition-all
                        ${occupiedSeats.includes(num) ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : selectedSeat === num ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-slate-50 text-slate-400 hover:bg-blue-50'}
                      `}
                    >
                       {num}
                    </div>
                 ))}
              </div>

              <div className="w-full mt-10 grid grid-cols-2 gap-4">
                 <button onClick={() => setStep('schedule')} className="py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Atrás</button>
                 <button disabled={!selectedSeat} onClick={handleFinalize} className="bg-[#00216e] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-30">Pagar Reserva</button>
              </div>
           </div>
         )}

         {step === 'success' && (
           <div className="animate-fade-in flex flex-col items-center py-20 text-center">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl mb-8"><span className="material-symbols-outlined text-5xl">verified</span></div>
              <h2 className="text-5xl font-black font-headline text-[#00216e] italic tracking-tighter uppercase mb-4">¡Reserva Exitosa!</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-12">Tu viaje ha sido procesado y el asiento #{selectedSeat} está asignado.</p>
              <button onClick={() => navigate('/my-tickets')} className="bg-[#00216e] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:-translate-y-1 transition-all">Ver mis Boletos</button>
           </div>
         )}
      </main>
    </div>
  );
};

export default BookingFlow;

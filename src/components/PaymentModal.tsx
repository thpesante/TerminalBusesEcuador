import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trip: any; // El objeto trip completo para denormalización
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, trip }) => {
  const [step, setStep] = useState<'selection' | 'card_form' | 'processing' | 'success'>('selection');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  if (!isOpen || !trip) return null;

  const handlePayphone = () => {
    setStep('processing');
    processRealTicket();
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    processRealTicket();
  };

  const processRealTicket = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No hay usuario autenticado");

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userData = userSnap.data();

      // 2. Crear el Ticket Real en Firestore (Denormalizado)
      await addDoc(collection(db, 'tickets'), {
        tripId: trip.id,
        ruc_empresa: trip.ruc_empresa,
        origen: trip.origen || 'T. Terrestre',
        destino: trip.destino || 'Desconocido',
        hora: trip.hora || '--:--',
        pasajero: {
          uid: user.uid,
          nombre: userData?.nombre || userData?.name || 'Pasajero Web',
          cedula: userData?.cedula || '9999999999'
        },
        precio: trip.precio,
        metodo: 'SISTEMA-CLIENTE',
        tarifa: 'ADULTO',
        estado: 'ACTIVO',
        createdAt: serverTimestamp(),
        asiento: Math.floor(Math.random() * 40) + 1 
      });

      // 3. Registrar Transacción en Caja de la Empresa
      await addDoc(collection(db, 'cash_transactions'), {
        ruc_empresa: trip.ruc_empresa,
        monto: trip.precio,
        tipo: 'INGRESO',
        concepto: `Venta Online - ${trip.destino}`,
        metodo: 'DIGITAL',
        vendedorId: user.uid,
        createdAt: serverTimestamp()
      });

      setStep('success');
      setTimeout(() => {
          onSuccess();
          onClose();
          setStep('selection');
      }, 3000);

    } catch (e) {
      console.error(e);
      alert("Error al procesar ticket");
      setStep('selection');
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#00113a]/90 backdrop-blur-xl animate-fade-in text-white">
      <div className="bg-white text-slate-800 w-full max-w-lg rounded-[4rem] shadow-2xl overflow-hidden relative border border-white/20">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-[#00216e] p-2 rounded-full z-10"><span className="material-symbols-outlined">close</span></button>

        <div className="p-10 md:p-14">
            {step === 'selection' && (
                <div className="animate-fade-in text-center">
                    <h2 className="text-4xl font-black text-[#00216e] font-headline mb-2 uppercase italic tracking-tighter leading-none">Confirmar Pago</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">Viaje hacia {trip.destino}</p>
                    
                    <div className="bg-slate-50 p-10 rounded-[3rem] mb-10 flex flex-col items-center border border-slate-100">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Total</span>
                        <span className="text-6xl font-black text-[#00216e] font-headline">$ {trip.precio.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handlePayphone} className="bg-slate-50 p-8 rounded-[2.5rem] flex flex-col items-center gap-4"><img src="https://payphone.app/wp-content/uploads/2019/12/logo-payphone.png" alt="Payphone" className="w-20" /></button>
                        <button onClick={() => setStep('card_form')} className="bg-[#00216e] p-8 rounded-[2.5rem] text-white flex flex-col items-center gap-4"><span className="material-symbols-outlined text-4xl text-[#ffe07f]">credit_card</span><span className="text-[10px] font-black uppercase tracking-widest">Tarjeta</span></button>
                    </div>
                </div>
            )}

            {step === 'card_form' && (
                <div className="animate-fade-in">
                    <button onClick={() => setStep('selection')} className="text-[#00216e] font-black text-[10px] uppercase tracking-widest mb-8 flex items-center gap-2 outline-none">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Regresar
                    </button>
                    <form className="space-y-6" onSubmit={handleCardPayment}>
                        <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Titular</label>
                             <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold uppercase text-[#00216e]" placeholder="Nombre..." required />
                        </div>
                        <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Tarjeta</label>
                             <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold text-center tracking-[4px] text-lg text-[#00216e]" placeholder="0000 0000 0000 0000" maxLength={19} required />
                        </div>
                        <button type="submit" className="w-full bg-[#00216e] text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-900/30 transition-all active:scale-95 text-[12px] uppercase tracking-widest mt-6">Confirmar Pago</button>
                    </form>
                </div>
            )}

            {step === 'processing' && (
                <div className="py-24 flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-20 h-20 border-8 border-slate-100 border-t-[#00216e] rounded-full animate-spin mb-10"></div>
                    <h3 className="text-3xl font-black text-[#00216e] font-headline uppercase italic">Procesando...</h3>
                </div>
            )}

            {step === 'success' && (
                <div className="py-20 flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl mb-12 animate-bounce"><span className="material-symbols-outlined text-6xl">verified</span></div>
                    <h3 className="text-4xl font-black text-[#00216e] font-headline uppercase italic tracking-tighter">Boleto Generado</h3>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

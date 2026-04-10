import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const SEATS = Array.from({ length: 44 }, (_, i) => ({
  id: i + 1,
  isOccupied: [5, 12, 18, 22, 30, 31].includes(i + 1),
}));

const BookingFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: coopId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const routeName = queryParams.get('route') || 'Ruta General';

  const [step, setStep] = useState<'schedule' | 'seats' | 'payment' | 'success'>('schedule');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const schedules = [
    { time: '08:00 AM', price: 15.00, available: 12 },
    { time: '10:30 AM', price: 15.00, available: 5 },
    { time: '02:00 PM', price: 15.00, available: 20 },
    { time: '07:30 PM', price: 18.50, available: 15 },
    { time: '10:00 PM', price: 18.50, available: 8 },
  ];

  const handleSeatToggle = (seatId: number) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalPrice = (selectedSeats.length * (schedules.find(s => s.time === selectedTime)?.price || 0)).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 font-body text-on-surface antialiased pt-24 pb-20">
      {/* Top Navigation Progress */}
      <div className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-slate-100 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-50">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="text-xl font-black font-headline text-primary tracking-tighter">Reserva de Pasaje</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{routeName}</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Horarios', 'Asientos', 'Pago', 'Confirmación'].map((s, i) => {
            const currentIdx = ['schedule', 'seats', 'payment', 'success'].indexOf(step);
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i <= currentIdx ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${i <= currentIdx ? 'text-primary' : 'text-slate-300'}`}>{s}</span>
                {i < 3 && <div className="w-8 h-px bg-slate-100"></div>}
              </div>
            );
          })}
        </div>
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-slate-50">
            <span className="material-symbols-outlined text-slate-400">close</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* STEP 1: SCHEDULING */}
        {step === 'schedule' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black font-headline text-primary mb-8 tracking-tighter">Selecciona tu horario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map((sch) => (
                <div 
                  key={sch.time}
                  onClick={() => setSelectedTime(sch.time)}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between
                    ${selectedTime === sch.time ? 'border-secondary bg-white shadow-2xl scale-102' : 'border-transparent bg-white shadow-lg hover:border-slate-100'}
                  `}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedTime === sch.time ? 'bg-secondary text-white' : 'bg-slate-50 text-slate-400'}`}>
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black font-headline text-primary leading-none">{sch.time}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Disponibles: {sch.available} asientos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-secondary">${sch.price.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Precios c/u</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              disabled={!selectedTime}
              onClick={() => setStep('seats')}
              className="w-full mt-12 py-5 bg-primary text-white rounded-[2rem] font-black font-headline text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              Continuar a Selección de Asientos
            </button>
          </div>
        )}

        {/* STEP 2: SEATS DIAGRAM */}
        {step === 'seats' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
            <h2 className="text-3xl font-black font-headline text-primary mb-2 tracking-tighter w-full text-left">Elige tus asientos</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10 w-full text-left italic">Piso Superior • Vista Panorámica</p>
            
            {/* Legend */}
            <div className="flex gap-6 mb-12 bg-white px-8 py-4 rounded-full shadow-sm border border-slate-100">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-100 border border-slate-200"></div> <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Libre</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-secondary"></div> <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Elegido</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-300"></div> <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Ocupado</span></div>
            </div>

            {/* Bus Shell Diagram */}
            <div className="relative w-full max-w-[340px] bg-white rounded-[3.5rem] border-[12px] border-slate-100 p-10 pt-24 pb-16 shadow-2xl flex flex-col items-center">
                {/* Cabin area */}
                <div className="absolute top-8 w-1/2 h-4 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
                
                {/* Seats Grid (4 per row) */}
                <div className="grid grid-cols-4 gap-4 w-full">
                    {SEATS.map((seat) => (
                        <React.Fragment key={seat.id}>
                            <div 
                                onClick={() => !seat.isOccupied && handleSeatToggle(seat.id)}
                                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all cursor-pointer
                                    ${seat.isOccupied ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 
                                      selectedSeats.includes(seat.id) ? 'bg-secondary text-white shadow-xl shadow-secondary/30 scale-110' : 
                                      'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}
                                `}
                            >
                                {seat.id}
                            </div>
                            {seat.id % 2 === 0 && seat.id % 4 !== 0 && <div className="w-4"></div>}
                        </React.Fragment>
                    ))}
                </div>
                
                {/* Rear area */}
                <div className="mt-12 w-full flex justify-around">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300"><span className="material-symbols-outlined">wc</span></div>
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300"><span className="material-symbols-outlined">coffee</span></div>
                </div>
            </div>

            <div className="w-full bg-white mt-12 p-8 rounded-[2.5rem] shadow-xl border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                    <p className="text-4xl font-headline font-black text-primary leading-none">${totalPrice}</p>
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] mt-2">Asientos seleccionados: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Ninguno'}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={() => setStep('schedule')} className="px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Atrás</button>
                    <button 
                        disabled={selectedSeats.length === 0}
                        onClick={() => setStep('payment')} 
                        className="flex-1 px-12 py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        Procesar Pago
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 'payment' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-3xl font-black font-headline text-primary mb-8 tracking-tighter">Método de Pago</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {[
                    { id: 'credit_card', label: 'Tarjeta de Crédito', icon: 'credit_card' },
                    { id: 'transfer', label: 'Transferencia Bancaria', icon: 'account_balance' },
                    { id: 'payphone', label: 'Payphone', icon: 'smartphone' },
                    { id: 'qr', label: 'Billetera Digital QR', icon: 'qr_code_2' }
                ].map((m) => (
                    <div 
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-10 rounded-[2.5rem] border-2 flex items-center gap-6 cursor-pointer transition-all
                            ${paymentMethod === m.id ? 'border-primary bg-white shadow-2xl' : 'border-transparent bg-white shadow-lg hover:border-slate-100'}
                        `}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === m.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                            <span className="material-symbols-outlined">{m.icon}</span>
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest text-primary">{m.label}</span>
                    </div>
                ))}
             </div>
             
             <div className="bg-white p-10 rounded-[3rem] shadow-2xl space-y-8 border border-slate-50">
                <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <span>Subtotal ({selectedSeats.length} pasajeros)</span>
                    <span className="text-primary">${totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <span>Tasa Judicial / Terminal</span>
                    <span className="text-primary">$0.25</span>
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-primary uppercase tracking-tighter">Monto Total</span>
                    <span className="text-3xl font-black text-secondary font-headline">${(parseFloat(totalPrice) + 0.25).toFixed(2)}</span>
                </div>
             </div>

             <div className="mt-12 flex gap-4">
                <button onClick={() => setStep('seats')} className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">Cancelar</button>
                <button 
                    onClick={() => setStep('success')}
                    className="flex-[2] py-5 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    Finalizar y Generar Ticket
                </button>
             </div>
          </div>
        )}

        {/* STEP 4: SUCCESS / TICKET */}
        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-8 animate-bounce-subtle">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
             </div>
             <h2 className="text-5xl font-black font-headline text-primary mb-4 tracking-tighter text-center">¡Buen viaje!</h2>
             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-12 text-center">Tu boleto digital ha sido generado con éxito</p>
             
             {/* Virtual Ticket */}
             <div className="w-full max-w-[400px] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative">
                <div className="bg-primary p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.4em] mb-4">Boarding Pass • Ecuador</p>
                    <h3 className="text-white text-3xl font-black font-headline italic tracking-tighter">{coopId?.toUpperCase()}</h3>
                </div>
                
                <div className="flex justify-center -mt-8 relative z-10">
                    <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-xl border border-slate-50">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TICKET-XCZ-12345" alt="QR" className="w-full h-full" />
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                        <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">ORIGEN</p><p className="font-black text-primary text-md">Terminal Cuenca</p></div>
                        <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">DESTINO</p><p className="font-black text-primary text-md">{routeName.split(' — ')[1] || 'Quito'}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">FECHA</p><p className="font-black text-primary text-md">Hoy, 24 Oct</p></div>
                        <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">HORA</p><p className="font-black text-primary text-md">{selectedTime}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">ASIENTO(S)</p><p className="font-black text-secondary text-lg">{selectedSeats.join(', ')}</p></div>
                        <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">TOTAL</p><p className="font-black text-primary text-lg">${(parseFloat(totalPrice) + 0.25).toFixed(2)}</p></div>
                    </div>
                </div>

                <div className="flex-1 h-12 bg-slate-50 flex items-center justify-center">
                   <p className="text-[8px] font-black text-slate-300 tracking-[0.5em] uppercase">Validación en Puerta</p>
                </div>
             </div>

             <div className="mt-16 flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <button 
                  onClick={() => navigate('/my-tickets')}
                  className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
                >
                    Ir a Mis Boletos
                </button>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-12 py-5 bg-white text-primary border border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                    Volver al Inicio
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingFlow;

import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: string;
  cooperativa: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, amount, cooperativa }) => {
  const [step, setStep] = useState<'selection' | 'card_form' | 'processing' | 'success'>('selection');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  if (!isOpen) return null;

  const handlePayphone = () => {
    setStep('processing');
    simulateSuccess();
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    simulateSuccess();
  };

  const simulateSuccess = () => {
    setTimeout(() => {
        setStep('success');
        setTimeout(() => {
            onSuccess();
            onClose();
            // Reset for next use
            setStep('selection');
            setCardNumber('');
            setExpDate('');
            setCvv('');
            setCardHolder('');
        }, 2500);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden relative border border-white/20">
        <button 
            onClick={onClose} 
            className="absolute top-8 right-8 text-slate-400 hover:text-primary transition-all p-2 hover:bg-slate-100 rounded-full z-10"
        >
            <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-8 md:p-12">
            {step === 'selection' && (
                <div className="animate-fade-in text-left">
                    <h2 className="text-4xl font-black text-primary font-headline mb-2 leading-tight">Método de Pago</h2>
                    <p className="text-slate-500 font-medium mb-10">Confirma tu viaje con {cooperativa}.</p>
                    
                    <div className="bg-primary/5 p-8 rounded-[2.5rem] mb-10 flex justify-between items-center border border-primary/10">
                        <div>
                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] block mb-1">Total a Transferir</span>
                            <span className="text-4xl font-black text-primary font-headline">${amount} <span className="text-sm font-bold opacity-40">USD</span></span>
                        </div>
                        <div className="text-right">
                             <div className="flex items-center gap-2 mb-1 justify-end">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pago Seguro</span>
                             </div>
                             <span className="text-sm font-bold text-slate-400 font-body">IVA Incluido</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={handlePayphone}
                            className="bg-slate-50 border-2 border-transparent hover:border-[#f25e24] p-8 rounded-[2rem] flex flex-col items-center gap-4 transition-all group"
                        >
                            <img src="https://payphone.app/wp-content/uploads/2019/12/logo-payphone.png" alt="Payphone" className="w-16 grayscale group-hover:grayscale-0 transition-all" />
                            <div className="text-center">
                                <h4 className="font-black text-slate-700 font-headline text-lg">Payphone</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Billetera Digital</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setStep('card_form')}
                            className="bg-slate-50 border-2 border-transparent hover:border-primary p-8 rounded-[2rem] flex flex-col items-center gap-4 transition-all group"
                        >
                            <div className="w-16 h-12 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-5xl">credit_card</span>
                            </div>
                            <div className="text-center">
                                <h4 className="font-black text-slate-700 font-headline text-lg">Tarjeta</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Débito o Crédito</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {step === 'card_form' && (
                <div className="animate-fade-in text-left">
                    <button onClick={() => setStep('selection')} className="flex items-center gap-2 text-primary font-bold text-xs mb-6 hover:underline">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> REGRESAR
                    </button>
                    <h2 className="text-3xl font-black text-primary font-headline mb-8 leading-tight">Datos de Tarjeta</h2>
                    
                    <form className="space-y-6" onSubmit={handleCardPayment}>
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Nombre del Titular</label>
                             <input 
                                type="text" 
                                value={cardHolder}
                                onChange={e => setCardHolder(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-bold uppercase tracking-wider"
                                placeholder="JUAN PEREZ"
                                required
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Número de Tarjeta</label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    value={cardNumber}
                                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/20 font-bold text-lg tracking-[0.2em]"
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={19}
                                    required
                                />
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">payments</span>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Expira (MM/YY)</label>
                                <input 
                                    type="text" 
                                    value={expDate}
                                    onChange={e => setExpDate(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-bold text-center"
                                    placeholder="01/29"
                                    maxLength={5}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">CVV</label>
                                <input 
                                    type="password" 
                                    value={cvv}
                                    onChange={e => setCvv(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-bold text-center"
                                    placeholder="•••"
                                    maxLength={3}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 font-headline tracking-widest mt-4"
                        >
                            PAGAR ${amount} USD
                        </button>
                    </form>
                </div>
            )}

            {step === 'processing' && (
                <div className="py-20 flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="relative w-32 h-32 mb-10">
                        <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-[6px] border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-4xl animate-pulse">lock</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-primary font-headline leading-none">Validando Transacción</h3>
                    <p className="text-slate-500 mt-4 font-body max-w-xs">Tu pago está siendo procesado bajo estándares de seguridad bancaria.</p>
                </div>
            )}

            {step === 'success' && (
                <div className="py-16 flex flex-col items-center justify-center text-center animate-bounce-in">
                    <div className="w-32 h-32 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-10 relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                        <span className="material-symbols-outlined text-6xl filled-icon">check_circle</span>
                    </div>
                    <h3 className="text-4xl font-black text-emerald-600 font-headline uppercase tracking-tighter leading-none">¡BOLETO GENERADO!</h3>
                    <p className="text-slate-500 mt-6 font-medium px-12 leading-relaxed font-body">Gracias por confiar en <span className="text-primary font-bold">TransporteEcuador</span>. Buen viaje a {cardHolder || 'tu destino'}.</p>
                    
                    <div className="mt-8 flex gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

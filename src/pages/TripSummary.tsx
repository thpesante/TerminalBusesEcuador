import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TripSummary: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tripData = location.state?.tripData;

    return (
        <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-6 text-on-surface">
            <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-fade-in">
                <div className="bg-gradient-to-br from-[#3755c3] to-[#607cec] p-12 text-center text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 0 L100 100 M100 0 L0 100" stroke="white" strokeWidth="0.5" />
                        </svg>
                    </div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">task_alt</span>
                    </div>
                    <h1 className="text-3xl font-black font-headline mb-2">¡Misión Cumplida!</h1>
                    <p className="text-white/80 font-medium">El viaje ha sido finalizado con éxito y los datos han sido almacenados.</p>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen</span>
                            <p className="font-bold text-lg">{tripData?.origin || 'Quito'}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destino</span>
                            <p className="font-bold text-lg">{tripData?.destination || 'Guayaquil'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pasajeros Finales</span>
                            <p className="font-bold text-lg">{tripData?.passengers || '42'}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora de Cierre</span>
                            <p className="font-bold text-lg">{new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <div className="bg-surface-container-low p-6 rounded-2xl flex items-center gap-4 border border-slate-200">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary">Sincronización Completa</p>
                            <p className="text-xs text-slate-500 font-medium font-body">Todo el manifiesto y registros de seguridad están en la nube.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/driver-dashboard')}
                        className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Volver al Panel
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-tighter">MOVU System v4.0.2 • Hecho con orgullo en Ecuador</p>
        </div>
    );
};

export default TripSummary;

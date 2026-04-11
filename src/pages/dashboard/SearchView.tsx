import React, { useState } from 'react';
import PaymentModal from '../../components/PaymentModal';

interface SearchViewProps {
  setView: (view: any) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ setView }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const handleBuy = (trip: any) => {
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
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tight mb-2">Selecciona tu Viaje</h1>
            <p className="text-on-surface-variant text-lg font-body">Encuentra las mejores opciones desde <span className="font-bold text-primary">Cuenca</span> hacia <span className="font-bold text-primary">Quito</span></p>
          </div>
          <div className="flex gap-2">
            <div className="bg-surface-container-high px-4 py-2 rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              <span className="text-sm font-bold font-label uppercase">Hoy, 24 Oct</span>
            </div>
            <div className="bg-surface-container-high px-4 py-2 rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">group</span>
              <span className="text-sm font-bold font-label uppercase">1 Pasajero</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8">
          <section>
            <h3 className="text-xs font-black font-label uppercase tracking-widest text-outline mb-4">Cooperativas</h3>
            <div className="space-y-2">
              {['Turismo Oriental', 'Alianza', 'Flota Imbabura', 'Trans. Occidentales'].map((name) => (
                <label key={name} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high transition-colors shadow-sm">
                  <input defaultChecked className="rounded text-primary focus:ring-primary border-outline-variant" type="checkbox"/>
                  <span className="text-sm font-medium font-body">{name}</span>
                </label>
              ))}
            </div>
          </section>
          
          <section className="bg-primary p-6 rounded-3xl text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h4 className="font-headline font-bold text-xl mb-2">¿Necesitas ayuda?</h4>
              <p className="text-sm opacity-80 mb-4 font-body">Nuestro soporte técnico está disponible 24/7 para tu viaje.</p>
              <button onClick={() => window.open('mailto:soporte@transporteecuador.ec')} className="w-full bg-secondary-container text-on-secondary-container font-bold py-3 rounded-xl text-sm transition-transform active:scale-95 font-headline">Contactar Soporte</button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">support_agent</span>
            </div>
          </section>
        </aside>

        {/* Results List */}
        <div className="lg:col-span-9 space-y-6">
          <RouteCard 
            name="Turismo Oriental" 
            price="12.50" 
            departure="08:30 AM" 
            arrival="04:15 PM"
            seats={12}
            status="En Camino"
            onBuy={() => handleBuy({ name: 'Turismo Oriental', price: '12.50' })}
          />
          <RouteCard 
            name="Alianza" 
            price="10.00" 
            departure="09:15 AM" 
            arrival="05:00 PM"
            seats={5}
            status="En Andén"
            onBuy={() => handleBuy({ name: 'Alianza', price: '10.00' })}
          />
          <RouteCard 
            name="Flota Imbabura" 
            price="15.00" 
            departure="10:00 AM" 
            arrival="05:45 PM"
            seats={2}
            status="Retrasado 10 min"
            isDelayed
            onBuy={() => handleBuy({ name: 'Flota Imbabura', price: '15.00' })}
          />
           <RouteCard 
            name="Trans. Occidentales" 
            price="11.50" 
            departure="11:30 AM" 
            arrival="07:15 PM"
            seats={8}
            status="En Andén"
            onBuy={() => handleBuy({ name: 'Trans. Occidentales', price: '11.50' })}
          />
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={selectedTrip?.price || '0.00'}
        cooperativa={selectedTrip?.name || ''}
      />
    </div>
  );
};

const RouteCard = ({ name, price, departure, arrival, seats, status, isDelayed, onBuy }: any) => (
  <div className="bg-surface-container-lowest rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-transparent hover:border-primary/10">
    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">directions_bus</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-primary">{name}</h3>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-500 text-xs filled-icon">star</span>
                <span className="text-xs font-bold text-on-surface-variant font-body">4.8 (120 reseñas)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {['wifi', 'ac_unit', 'bolt'].map((icon) => (
              <span key={icon} className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold font-label uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">{icon}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <span className="block text-xs font-black font-label text-outline uppercase tracking-tighter mb-1">Tarifa Completa</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-headline text-primary">${price}</span>
            <span className="text-xs text-on-surface-variant font-body">USD</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between bg-surface-container-low rounded-[24px] p-6">
        <div className="relative">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-outline-variant/30"></div>
          <div className="space-y-6 relative">
            <div className="flex items-start gap-6">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 shadow-lg shadow-primary/20">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div>
                <span className="block text-xl font-black font-headline text-primary">{departure}</span>
                <span className="text-sm font-medium text-on-surface-variant font-body">Terminal Terrestre Cuenca</span>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center z-10 shadow-lg shadow-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div>
                <span className="block text-xl font-black font-headline text-primary">{arrival}</span>
                <span className="text-sm font-medium text-on-surface-variant font-body">Terminal Quitumbe (Quito)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className={`flex-1 px-4 py-3 rounded-2xl flex items-center gap-3 ${isDelayed ? 'bg-error-container/20' : 'bg-emerald-500/10'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isDelayed ? 'bg-error' : 'bg-emerald-500'}`}></div>
            <span className={`text-xs font-bold font-label uppercase ${isDelayed ? 'text-on-error-container' : 'text-emerald-700'}`}>
              {status} • {seats} asientos
            </span>
          </div>
          <button 
            onClick={onBuy}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold font-headline transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
          >
            Comprar Boleto
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default SearchView;

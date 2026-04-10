import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import MapBoxComponent from '../components/MapBoxComponent';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [driverData, setDriverData] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState('ruta'); // ruta, unidad, historial
  
  // Real location simulation
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([-79.2042, -3.9931]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'CONDUCTOR') {
          setDriverData(userDoc.data());
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let interval: any;
    if (isSharingLocation) {
        // Simple simulation of movement north-west
        interval = setInterval(() => {
            setCurrentCoords(prev => [prev[0] + 0.0001, prev[1] + 0.0001]);
        }, 5000);
    }
    return () => clearInterval(interval);
  }, [isSharingLocation]);

  const toggleLocation = async () => {
    const newState = !isSharingLocation;
    setIsSharingLocation(newState);
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isLive: newState,
        lastLocationUpdate: new Date().toISOString(),
        coords: currentCoords
      });
    }
  };

  const handleLogout = () => signOut(auth);

  if (!driverData) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-on-surface font-body pb-24 md:pb-0">
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm h-16 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black">
            {driverData?.disco || '00'}
          </div>
          <div>
            <h1 className="font-black text-primary font-headline leading-none">Unidad {driverData?.disco}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{driverData?.cooperativa}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLocation}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${isSharingLocation ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-sm">{isSharingLocation ? 'location_on' : 'location_off'}</span>
            {isSharingLocation ? 'EN RUTA' : 'OFFLINE'}
          </button>
          <button onClick={handleLogout} className="p-2 text-error hover:bg-error/10 rounded-full transition-all">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route & Status */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-primary font-headline mb-6">Próximo Viaje</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-low p-6 rounded-3xl relative">
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Origen</span>
                <p className="text-2xl font-black text-primary font-headline">Loja</p>
                <p className="text-sm font-medium text-slate-500">Terminal Santa Rosa</p>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-4xl">trending_flat</span>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Estimado: 2H 15M</span>
              </div>
              <div className="flex-1 text-center md:text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Destino</span>
                <p className="text-2xl font-black text-primary font-headline">Cuenca</p>
                <p className="text-sm font-medium text-slate-500">Terminal Terrestre</p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pasajeros</span>
                <p className="text-4xl font-black text-primary font-headline">28 / 42</p>
              </div>
              <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora Salida</span>
                <p className="text-4xl font-black text-primary font-headline">14:30</p>
              </div>
              <button 
                onClick={() => setIsReady(!isReady)}
                className={`p-6 rounded-2xl flex flex-col items-center gap-2 transition-all shadow-lg ${isReady ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white border-2 border-primary text-primary'}`}
              >
                <span className="material-symbols-outlined">{isReady ? 'check_circle' : 'offline_pin'}</span>
                <span className="font-black uppercase tracking-widest text-xs">{isReady ? 'LISTO PARA SALIR' : 'MARCAR COMO LISTO'}</span>
              </button>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-primary font-headline mb-6">Mapa en Tiempo Real</h2>
            <div className="h-96 w-full rounded-3xl overflow-hidden border border-slate-100">
                <MapBoxComponent center={currentCoords} zoom={15} markers={[{ lngLat: currentCoords, type: 'bus', title: `Unidad ${driverData?.disco}` }]} />
            </div>
          </section>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <button className="w-full bg-secondary-container text-on-secondary-container p-8 rounded-[2rem] shadow-lg flex flex-col items-center gap-4 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-6xl">qr_code_scanner</span>
            <div className="text-center">
              <h3 className="text-xl font-black font-headline">ESCANEAR BOLETO</h3>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest mt-1">Validar QR de Pasajero</p>
            </div>
          </button>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-6">Herramientas en Ruta</h4>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all text-primary font-bold">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">report_problem</span>
                </div>
                Reportar Problema Vial
              </button>
              <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all text-primary font-bold">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">map</span>
                </div>
                Abrir GPS del Destino
              </button>
              <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all text-primary font-bold">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                Chat con Administración
              </button>
            </div>
          </div>

          <button 
            onClick={() => alert("ALERTA SOS ENVIADA. Contactando 911 y buses de la cooperativa en un radio de 10km.")}
            className="w-full bg-tertiary-container text-white p-8 rounded-[2rem] shadow-xl flex flex-col items-center gap-4 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-6xl filled-icon">emergency</span>
            <div className="text-center">
              <h3 className="text-xl font-black font-headline tracking-tighter">BOTÓN DE PÁNICO</h3>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Alerta Inmediata 911</p>
            </div>
          </button>
        </div>
      </main>

      {/* Driver Tabs (Mobile Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl">
        <button onClick={() => setActiveTab('ruta')} className={`flex flex-col items-center justify-center px-6 py-2 ${activeTab === 'ruta' ? 'text-primary' : 'text-slate-400'}`}>
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Ruta</span>
        </button>
        <button onClick={() => setActiveTab('unidad')} className={`flex flex-col items-center justify-center px-6 py-2 ${activeTab === 'unidad' ? 'text-primary' : 'text-slate-400'}`}>
          <span className="material-symbols-outlined">directions_bus</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Unidad</span>
        </button>
        <button onClick={() => setActiveTab('historial')} className={`flex flex-col items-center justify-center px-6 py-2 ${activeTab === 'historial' ? 'text-primary' : 'text-slate-400'}`}>
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Viajes</span>
        </button>
      </nav>
    </div>
  );
};

export default DriverDashboard;

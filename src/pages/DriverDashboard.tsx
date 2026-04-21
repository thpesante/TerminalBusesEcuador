import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import MapBoxComponent from '../components/MapBoxComponent';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [driverData, setDriverData] = useState<any>(null);
  const [unitData, setUnitData] = useState<any>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(true);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([-78.4720, -0.1900]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Get Live User Data
        const userRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setDriverData(data);
                
                // 2. If user has unit assigned, fetch unit data
                if (data.unidadAsignada) {
                    const unitRef = doc(db, 'units', data.unidadAsignada);
                    getDoc(unitRef).then(docSnap => {
                        if (docSnap.exists()) setUnitData(docSnap.data());
                    });
                }
            }
        });

        return () => unsubUser();
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let interval: any;
    if (isSharingLocation) {
      interval = setInterval(() => {
        // Simulating slow movement along a route
        setCurrentCoords(prev => [prev[0] + 0.00002, prev[1] + 0.00001]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isSharingLocation]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleFinalizeTrip = async () => {
    if (!auth.currentUser) return;
    
    const tripSummary = {
        driverId: auth.currentUser.uid,
        driverName: driverData?.chofer || driverData?.name || 'Conductor',
        disco: driverData?.discoAsignado || 'S/N',
        placa: driverData?.placaAsignada || 'S/P',
        ruc_empresa: driverData?.ruc_empresa || '',
        endTime: new Date().toISOString(),
        status: 'COMPLETADO'
    };

    try {
      await addDoc(collection(db, 'history_units'), tripSummary);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isLive: false,
        lastTrip: serverTimestamp()
      });
      setIsSharingLocation(false);
      navigate('/trip-summary', { state: { tripData: tripSummary } });
    } catch (error) {
       console.error("Error al finalizar:", error);
       alert("Error al finalizar el despacho.");
    }
  };

  if (!driverData) return (
    <div className="flex justify-center items-center h-screen bg-[#f7f9fb]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#3755c3]"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] text-[#191c1e] font-body">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-slate-100 flex flex-col py-8 z-40 hidden lg:flex">
        <div className="px-8 mb-12">
          <h1 className="text-xl font-black text-[#191c1e] mb-1 italic">ORCHESTRATOR</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3755c3]">Consola de Conductor</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/driver-dashboard')} className="w-full flex items-center gap-4 py-4 text-[#191c1e] font-black border-l-4 border-[#3755c3] bg-blue-50/50 pl-6 transition-all">
            <span className="material-symbols-outlined filled-icon text-[#3755c3]">dashboard</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Centro de Control</span>
          </button>
          <button onClick={() => navigate('/history')} className="w-full flex items-center gap-4 py-4 text-slate-400 pl-6 hover:text-[#3755c3] transition-all">
            <span className="material-symbols-outlined">history</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Historial</span>
          </button>
          <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-4 py-4 text-slate-400 pl-6 hover:text-[#3755c3] transition-all">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Mi Perfil</span>
          </button>
        </nav>
        
        <div className="px-8 mt-auto flex flex-col gap-4">
          <button 
            onClick={handleFinalizeTrip}
            className="w-full bg-red-600 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-1 font-black transition-all hover:bg-black active:scale-95 shadow-xl shadow-red-900/20"
          >
            <span className="material-symbols-outlined">stop_circle</span>
            <span className="text-[9px] uppercase tracking-widest">Finalizar Guardia</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-4 py-4 text-slate-400 hover:text-red-500 transition-colors w-full pl-2">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-[10px] uppercase font-black tracking-widest">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <header className="w-full sticky top-0 z-50 bg-[#f7f9fb]/90 backdrop-blur-xl flex justify-between items-center px-10 py-6 border-b border-slate-100">
           <div>
              <p className="text-[9px] font-black text-[#3755c3] uppercase tracking-[0.3em] mb-1">Unidad en Operación</p>
              <h2 className="text-xl font-black text-[#191c1e] uppercase">Disco {driverData?.discoAsignado || 'S/N'} • {driverData?.placaAsignada || 'S/P'}</h2>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-[#191c1e] uppercase italic">{driverData?.chofer || driverData?.name}</p>
                <p className="text-[9px] uppercase tracking-tighter text-emerald-500 font-bold">Estado: En Línea</p>
              </div>
              <img alt="Avatar" className="h-14 w-14 rounded-2xl object-cover border-4 border-white shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbrhwU4f0GXBaq1IZk0QQwpWPRcJbZr8mfTfglSzhdYP08fOfiBpUgU4y1W12LuNJoTIjT9D2Ovk9WbnQ1fvIq7xbv7mdSF9-56WmaTCfRaLiAI5iLZjrGQyZz5OWfnbGTB9bNfSWwvKKqG5ANxhSWMe2Wbo3x54Emuaoeg_30w-PCAlcb2Tet4dybgIkGvdmP_VbkXABi8mf_LcsEK0YiisuoqE_txlJb7D-FZsuDPwnfvon0OntNrRbhwEeHMMfsz2Lvn7O9SQb-"/>
           </div>
        </header>

        <div className="p-10 space-y-10 max-w-[1600px]">
           {/* Live Tracking Map */}
           <section className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-[#191c1e] italic uppercase tracking-tighter decoration-[#3755c3] decoration-4 underline underline-offset-8">Telemática en Vivo</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Sincronizado vía Satélite • GPS Activo</p>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setIsSharingLocation(!isSharingLocation)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isSharingLocation ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {isSharingLocation ? 'GPS: Transmitiendo' : 'GPS: Pausado'}
                    </button>
                 </div>
              </div>
              <div className="h-[500px] w-full rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-inner">
                <MapBoxComponent center={currentCoords} zoom={15} markers={[{ lngLat: currentCoords, type: 'bus', title: `Disco ${driverData?.discoAsignado}` }]} />
              </div>
           </section>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Unit Summary Card */}
              <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between">
                 <div>
                    <h4 className="text-[10px] font-black text-[#3755c3] uppercase tracking-[0.2em] mb-10 italic">Especificaciones del Activo</h4>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                            <span className="text-[10px] font-black text-slate-300 uppercase">Marca/Modelo</span>
                            <span className="text-sm font-black text-[#191c1e] uppercase">{unitData?.marca} {unitData?.modelo}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                            <span className="text-[10px] font-black text-slate-300 uppercase">Capacidad</span>
                            <span className="text-sm font-black text-[#191c1e] uppercase">{unitData?.capacidad} Asientos</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                            <span className="text-[10px] font-black text-slate-300 uppercase">Asignado a:</span>
                            <span className="text-xs font-black text-[#3755c3] uppercase">{unitData?.empresa_ruc}</span>
                        </div>
                    </div>
                 </div>
                 <div className="mt-12 bg-slate-900 text-white rounded-3xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black opacity-50 uppercase mb-1">Disco</p>
                        <p className="text-2xl font-black">{driverData?.discoAsignado || '000'}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined">airport_shuttle</span>
                    </div>
                 </div>
              </div>

              {/* Passenger Status */}
              <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-10">
                    <h4 className="text-[10px] font-black text-[#3755c3] uppercase tracking-[0.2em] italic">Bitácora de Pasajeros</h4>
                    <button onClick={() => navigate('/qr-scanner')} className="bg-[#191c1e] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Scanner de Abordaje</button>
                  </div>
                  
                  <div className="space-y-4">
                     {[
                        { name: 'Ricardo Mendez', seat: '12', dest: 'Terminal Quitumbe', time: '12:45' },
                        { name: 'Lucia Ferriz', seat: '05', dest: 'Terminal Carcelén', time: '13:00' }
                     ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] hover:bg-blue-50/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-[#3755c3] text-lg shadow-sm">{p.seat}</div>
                                <div>
                                    <p className="text-sm font-black text-[#191c1e] uppercase">{p.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Boleto Digital Verificado</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-[#3755c3] uppercase tracking-widest">{p.dest}</p>
                                <p className="text-lg font-black text-slate-900 mt-1">{p.time}hs</p>
                            </div>
                        </div>
                     ))}
                  </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;

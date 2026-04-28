import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import MapBoxComponent from '../components/MapBoxComponent';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [driverData, setDriverData] = useState<any>(null);
  const [unitData, setUnitData] = useState<any>(null);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(true);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([-78.4720, -0.1900]);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [tripStatus, setTripStatus] = useState<'PARQUEADO' | 'ANDEN' | 'ABORDAJE' | 'ABORDANDO' | 'RUTA'>('PARQUEADO');
  const [showChecklist, setShowChecklist] = useState(true);
  const [checklist, setChecklist] = useState({ limpio: false, llantas: false, luces: false, motor: false, frenos: false });
  const [showBusDiagram, setShowBusDiagram] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real-time passengers based on occupied seats
  const [passengers, setPassengers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Get Live User Data
        const userRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setDriverData(data);

            // 2. If user has unit assigned, fetch unit data & active trip
            if (data.unidadAsignada) {
              const unitRef = doc(db, 'units', data.unidadAsignada);
              onSnapshot(unitRef, (uSnap) => {
                if (uSnap.exists()) setUnitData(uSnap.data());
              });

              // Query Active Trip
              const tripsRef = collection(db, 'trips');
              const q = query(tripsRef, where('busId', '==', data.unidadAsignada), where('estado', '==', 'PROGRAMADO'));
              onSnapshot(q, (tSnap) => {
                if (!tSnap.empty) {
                  const trip = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() };
                  setActiveTrip(trip);
                  
                  // Map occupied seats to passenger list (simplified)
                  if (trip.asientosOcupados) {
                    const mapped = trip.asientosOcupados.map((seat: string, idx: number) => ({
                       id: idx,
                       name: `Pasajero ${seat}`,
                       seat: seat,
                       dest: trip.destino,
                       status: 'WAITING',
                       time: trip.hora
                    }));
                    setPassengers(mapped);
                  }
                }
              });
            }

            // 3. Load Persisted Trip State
            if (data.currentTrip) {
              if (data.currentTrip.checklist) setChecklist(data.currentTrip.checklist);
              if (data.currentTrip.status) {
                setTripStatus(data.currentTrip.status);
                setShowChecklist(data.currentTrip.status === 'PARQUEADO');
              }
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
    window.location.replace('/');
  };

  const updateTripState = async (newStatus?: string, newChecklist?: any) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(userRef, {
        'currentTrip.status': newStatus || tripStatus,
        'currentTrip.checklist': newChecklist || checklist,
        'currentTrip.updatedAt': new Date().toISOString()
      });
    } catch (e) {
      console.error("Error persisting trip state", e);
    }
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
        lastTrip: serverTimestamp(),
        currentTrip: null // Limpiamos el viaje activo al finalizar
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
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-white border-r border-slate-100 flex flex-col py-8 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-8 mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-[#191c1e] mb-1 italic">MOVU</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3755c3]">Consola Conductor</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/driver-dashboard')} className="w-full flex items-center gap-4 py-4 text-[#191c1e] font-black border-l-4 border-[#3755c3] bg-blue-50/50 pl-6 transition-all">
            <span className="material-symbols-outlined filled-icon text-[#3755c3]">dashboard</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Centro de Control</span>
          </button>
          <button onClick={() => navigate('/unit-registration')} className="w-full flex items-center gap-4 py-4 text-slate-400 pl-6 hover:text-[#3755c3] transition-all">
            <span className="material-symbols-outlined">edit_square</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Editar Unidad</span>
          </button>
          <button onClick={() => navigate('/driver-schedule')} className="w-full flex items-center gap-4 py-4 text-slate-400 pl-6 hover:text-[#3755c3] transition-all">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Horario de Rutas</span>
          </button>
          <button onClick={() => navigate('/driver-reports')} className="w-full flex items-center gap-4 py-4 text-slate-400 pl-6 hover:text-[#3755c3] transition-all">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Reportes</span>
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
      <main className="lg:ml-64 flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        <header className="w-full sticky top-0 z-30 bg-[#f7f9fb]/90 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#3755c3]">
               <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <p className="text-[9px] font-black text-[#3755c3] uppercase tracking-[0.3em] mb-1">Unidad en Operación</p>
              <h2 className="text-lg md:text-xl font-black text-[#191c1e] uppercase">Disco {driverData?.discoAsignado || 'S/N'} • <span className="hidden md:inline">{driverData?.placaAsignada || 'S/P'}</span></h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-[#191c1e] uppercase italic">{driverData?.chofer || driverData?.name}</p>
              <div className="flex items-center justify-end gap-1 text-amber-500">
                <span className="material-symbols-outlined text-sm filled-icon">star</span>
                <span className="text-[10px] font-black uppercase">4.9 Calificación</span>
              </div>
              <p className="text-[9px] uppercase tracking-tighter text-emerald-500 font-bold mt-1">Estado: En Línea</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#3755c3] to-[#1e2e6b] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl border-4 border-white">
              {(driverData?.chofer || driverData?.name || 'C').charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10 space-y-6 md:space-y-10 max-w-full overflow-hidden">
          {/* Pre-Trip Checklist Overlay */}
          {showChecklist && (
            <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl border-4 border-[#3755c3]/10 relative overflow-hidden animate-in zoom-in-95 duration-500">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#3755c3]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                 <h3 className="text-2xl md:text-3xl font-black text-[#191c1e] uppercase italic tracking-tighter mb-2">Protocolo de Salida</h3>
                 <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-6 md:mb-10">Inspección Obligatoria de Seguridad • Disco {driverData?.discoAsignado}</p>
                 <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {Object.keys(checklist).map((key) => (
                      <button 
                        key={key}
                        onClick={async () => {
                          const newChecklist = { ...checklist, [key]: !checklist[key as keyof typeof checklist] };
                          setChecklist(newChecklist);
                          await updateTripState(undefined, newChecklist);
                        }}
                        className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col md:flex-row items-center gap-2 md:gap-6 transition-all border-2 ${checklist[key as keyof typeof checklist] ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-lg shadow-emerald-900/10' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                      >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">
                          {checklist[key as keyof typeof checklist] ? 'check_circle' : 'circle'}
                        </span>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center">{key}</span>
                      </button>
                    ))}
                 </div>

                 <button 
                   disabled={!Object.values(checklist).every(v => v)}
                   onClick={async () => { 
                     setShowChecklist(false); 
                     setTripStatus('ANDEN'); 
                     await updateTripState('ANDEN');
                     alert("Estado: UNIDAD EN ANDÉN. Listo para iniciar procesos."); 
                   }}
                   className="mt-8 md:mt-12 w-full py-5 md:py-6 bg-[#3755c3] text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#3755c3]/40 disabled:opacity-30 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-95"
                 >
                   Completar Inspección
                 </button>
               </div>
            </div>
          )}

          {!showChecklist && (
            <>
              {/* Trip Control Center */}
              <section className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 md:gap-8 mb-10">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                       <span className="px-3 md:px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest animate-pulse">{tripStatus}</span>
                       <span className="text-slate-300 font-bold text-[10px] md:text-xs tracking-tighter">Viaje #TX-9901</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-[#191c1e] italic uppercase tracking-tighter">Consola de Ruta</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <button 
                      onClick={async () => { setTripStatus('ABORDAJE'); await updateTripState('ABORDAJE'); alert("Notificando a pasajeros: LISTO PARA ABORDAJE"); }}
                      className={`px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${tripStatus === 'ANDEN' ? 'bg-[#3755c3] text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                    >
                      Listo Abordaje
                    </button>
                    <button 
                      onClick={async () => { setTripStatus('ABORDANDO'); await updateTripState('ABORDANDO'); alert("Estado: ABORDANDO UNIDAD"); }}
                      className={`px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${tripStatus === 'ABORDAJE' ? 'bg-[#3755c3] text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                    >
                      Abordando
                    </button>
                    <button 
                      onClick={async () => { setTripStatus('RUTA'); await updateTripState('RUTA'); alert("Estado: EN RUTA. Sincronizando con Satélite."); }}
                      className={`px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${tripStatus === 'ABORDANDO' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                    >
                      Iniciar Ruta
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">
                   {/* Mini Telemática Map */}
                   <div className={`relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-inner transition-all duration-700 group ${isMapExpanded ? 'lg:col-span-4 h-[400px] md:h-[600px]' : 'lg:col-span-1 h-[200px] md:h-[300px]'}`}>
                      <MapBoxComponent center={currentCoords} zoom={isMapExpanded ? 16 : 14} markers={[{ lngLat: currentCoords, type: 'bus', title: `Disco ${driverData?.discoAsignado}` }]} />
                      <button 
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-[#191c1e] hover:bg-[#3755c3] hover:text-white transition-all active:scale-90"
                      >
                        <span className="material-symbols-outlined">{isMapExpanded ? 'close_fullscreen' : 'open_in_full'}</span>
                      </button>
                   </div>

                   {/* Quick Stats Grid */}
                   <div className={isMapExpanded ? "hidden" : "lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8"}>
                      <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Terminal Salida</p>
                          <p className="text-base md:text-lg font-black text-[#191c1e]">Terminal Cuenca</p>
                          <p className="text-[10px] md:text-xs font-bold text-[#3755c3] mt-1">Salida: {activeTrip?.hora || '12:45'}hs</p>
                        </div>
                        <span className="material-symbols-outlined text-3xl md:text-4xl text-slate-200">logout</span>
                      </div>
                      <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Próxima Parada</p>
                          <p className="text-base md:text-lg font-black text-emerald-600">{activeTrip?.destino || 'Terminal Quitumbe'}</p>
                          <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1">Llegada Est: {activeTrip?.horaLlegada || '24:45'}hs</p>
                        </div>
                        <span className="material-symbols-outlined text-3xl md:text-4xl text-slate-200">login</span>
                      </div>
                   </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                {/* Unit Summary Card */}
                <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col justify-between group">
                  <div>
                    <h4 className="text-[10px] font-black text-[#3755c3] uppercase tracking-[0.2em] mb-10 italic">Especificaciones del Activo</h4>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                        <span className="text-[10px] font-black text-slate-300 uppercase">Marca/Modelo</span>
                        <span className="text-sm font-black text-[#191c1e] uppercase">{unitData?.marca} {unitData?.modelo}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                        <span className="text-[10px] font-black text-slate-300 uppercase">Capacidad Total</span>
                        <span className="text-sm font-black text-[#191c1e] uppercase">{unitData?.capacidad || 45} Asientos</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                        <span className="text-[10px] font-black text-emerald-500 uppercase">Asientos Ocupados</span>
                        <span className="text-sm font-black text-emerald-600 uppercase">{activeTrip?.asientosOcupados?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                        <span className="text-[10px] font-black text-[#3755c3] uppercase">Asientos Libres</span>
                        <span className="text-sm font-black text-[#3755c3] uppercase">{(unitData?.capacidad || 45) - (activeTrip?.asientosOcupados?.length || 0)}</span>
                      </div>
                    </div>
                    <button onClick={() => setShowBusDiagram(true)} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3755c3] transition-all">Ver Diagrama Completo</button>
                  </div>
                  <div className="mt-12 bg-slate-900 text-white rounded-3xl p-6 flex items-center justify-between group-hover:bg-[#3755c3] transition-colors">
                    <div>
                      <p className="text-[9px] font-black opacity-50 uppercase mb-1">Unidad #</p>
                      <p className="text-2xl font-black">{driverData?.discoAsignado || '12'}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined">airport_shuttle</span>
                    </div>
                  </div>
                </div>

                {/* Passenger Status */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6 mb-6 md:mb-10">
                    <div>
                      <h4 className="text-[10px] md:text-xs font-black text-[#3755c3] uppercase tracking-[0.2em] italic">Bitácora de Pasajeros</h4>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-1">A bordo: {passengers.filter(p => p.status === 'BOARDED').length} • Pendientes: {passengers.filter(p => p.status === 'WAITING').length}</p>
                    </div>
                    <button onClick={() => navigate('/qr-scanner')} className="bg-[#191c1e] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20 w-full sm:w-auto">Scanner de Abordaje</button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                    {passengers.map((p, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          if(p.status === 'WAITING') {
                            alert(`ALERTA: Recoger a ${p.name} en la siguiente parada habilitada.`);
                          }
                        }}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] transition-all cursor-pointer border-2 ${p.status === 'BOARDED' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-transparent hover:bg-amber-50/50 hover:border-amber-200'}`}
                      >
                        <div className="flex items-center gap-4 md:gap-6 mb-2 md:mb-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-base md:text-lg shadow-sm ${p.status === 'BOARDED' ? 'bg-emerald-500 text-white' : 'bg-white text-[#3755c3]'}`}>{p.seat}</div>
                          <div>
                            <p className="text-xs md:text-sm font-black text-[#191c1e] uppercase line-clamp-1">{p.name}</p>
                            <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-tighter mt-1 ${p.status === 'BOARDED' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                              {p.status === 'BOARDED' ? 'A BORDO • Verificado' : 'PENDIENTE • Recoger en Ruta'}
                            </p>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-[9px] md:text-[10px] font-black text-[#3755c3] uppercase tracking-widest truncate max-w-[150px]">{p.dest}</p>
                          <div className="flex items-center justify-start md:justify-end gap-2 mt-1">
                             <span className="material-symbols-outlined text-sm md:text-base text-slate-300">alarm</span>
                             <span className="text-base md:text-lg font-black text-slate-900">{p.time}hs</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Bus Diagram Modal */}
      {showBusDiagram && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-primary/40 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl h-[95vh] md:h-[90vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-6 md:p-10 border-b border-slate-100 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="text-xl md:text-3xl font-black text-[#191c1e] uppercase italic tracking-tighter">Diagrama</h3>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-2">{unitData?.marca} {unitData?.modelo} • Disco {unitData?.disco}</p>
                 </div>
                 <button onClick={() => setShowBusDiagram(false)} className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all shrink-0">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-12 bg-slate-50">
                 <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center items-center lg:items-start">
                    {/* Render Floors */}
                    {['inferior', 'superior'].map(floor => (
                       unitData?.topologia?.[floor] && Object.keys(unitData.topologia[floor]).length > 0 && (
                        <div key={floor} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 w-full max-w-sm">
                          <p className="text-[9px] font-black text-[#3755c3] uppercase tracking-widest mb-6 md:mb-8 text-center">Piso {floor === 'inferior' ? '1' : '2'}</p>
                          <div className="grid grid-cols-4 gap-2 md:gap-3 bg-slate-100 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200">
                             {Object.values(unitData.topologia[floor]).sort((a: any, b: any) => (a.row * 4 + a.col) - (b.row * 4 + b.col)).map((cell: any) => {
                                const isOccupied = activeTrip?.asientosOcupados?.includes(cell.label);
                                return (
                                  <div 
                                    key={cell.id} 
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                                      cell.type === 'seat' 
                                        ? isOccupied 
                                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                          : 'bg-white text-slate-300 border border-slate-200'
                                        : cell.type === 'bathroom' ? 'bg-amber-100 text-amber-600'
                                        : cell.type === 'entrance' ? 'bg-blue-100 text-blue-600'
                                        : 'bg-transparent border border-dashed border-slate-200'
                                    }`}
                                  >
                                    {cell.type === 'seat' ? cell.label : cell.type === 'bathroom' ? 'WC' : ''}
                                  </div>
                                );
                             })}
                          </div>
                        </div>
                       )
                    ))}
                 </div>
              </div>
              
              <div className="p-6 md:p-8 bg-slate-900 text-white flex justify-center gap-6 md:gap-10 shrink-0">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full"></div>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-60">Ocupado</span>
                 </div>
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-white border border-white/20 rounded-full"></div>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-60">Libre</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;

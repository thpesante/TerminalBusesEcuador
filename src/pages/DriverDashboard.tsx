import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import MapBoxComponent from '../components/MapBoxComponent';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [driverData, setDriverData] = useState<any>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(true);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([-78.4720, -0.1900]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && (userDoc.data().role === 'CONDUCTOR' || userDoc.data().role === 'CHOFER')) {
          setDriverData(userDoc.data());
        } else {
          // If no driver data found, use mock for demo or redirect
          setDriverData({
            name: user.displayName || 'Alex Rivera',
            disco: '148',
            cooperativa: 'Trans. Occidentales',
            idDespachador: '9942'
          });
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
      interval = setInterval(() => {
        setCurrentCoords(prev => [prev[0] + 0.00005, prev[1] + 0.00005]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isSharingLocation]);

  const handleLogout = () => signOut(auth);

  const handleFinalizeTrip = async () => {
    if (auth.currentUser) {
      const tripSummary = {
        driverId: auth.currentUser.uid,
        driverName: driverData?.name || 'Alex Rivera',
        disco: driverData?.disco || '148',
        cooperativa: driverData?.cooperativa || 'Trans. Occidentales',
        origin: 'Terminal Norte, Quito',
        destination: 'Terminal Terrestre, Guayaquil',
        passengers: 42,
        endTime: new Date().toISOString()
      };
      
      try {
        // Save to global trips history
        await addDoc(collection(db, 'trips'), tripSummary);
        
        // Update driver status in Firebase
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          isLive: false,
          lastTrip: tripSummary
        });

        setIsSharingLocation(false);
        navigate('/trip-summary', { state: { tripData: tripSummary } });
      } catch (error) {
        console.error("Error al finalizar la unidad:", error);
        alert("Error al guardar los datos. Intente nuevamente.");
      }
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
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#f2f4f6] dark:bg-slate-900 flex flex-col py-8 z-40 hidden lg:flex">
        <div className="px-8 mb-10">
          <h1 className="text-lg font-black text-[#191c1e] dark:text-white mb-1">Centro de Comando</h1>
          <p className="text-[0.6875rem] uppercase tracking-wider text-[#45464d] font-medium">Logística Ecuador</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-4 py-3 text-[#191c1e] dark:text-white font-bold border-l-4 border-[#3755c3] pl-4 transition-all" href="#">
            <span className="material-symbols-outlined">directions_bus</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Vista de Flota</span>
          </a>
          <a className="flex items-center gap-4 py-3 text-[#45464d] dark:text-slate-500 pl-4 hover:text-[#3755c3] transition-all" href="#">
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Horario</span>
          </a>
          <a className="flex items-center gap-4 py-3 text-[#45464d] dark:text-slate-500 pl-4 hover:text-[#3755c3] transition-all" href="#">
            <span className="material-symbols-outlined">assignment_ind</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Registros</span>
          </a>
        </nav>
        <div className="px-8 mt-auto pt-8 border-t border-slate-200">
          <button 
            onClick={handleFinalizeTrip}
            className="w-full bg-gradient-to-br from-[#ba1a1a] to-[#93000a] text-white py-4 rounded-xl flex flex-col items-center justify-center gap-1 font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-error/20"
          >
            <span className="material-symbols-outlined">stop_circle</span>
            <span className="text-[10px] uppercase tracking-widest">Finalizar Unidad</span>
          </button>
          <div className="mt-6">
            <button onClick={handleLogout} className="flex items-center gap-4 py-3 text-[#45464d] hover:text-[#ba1a1a] transition-colors w-full text-left">
              <span className="material-symbols-outlined">logout</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="lg:ml-64 flex-1 flex flex-col min-w-0">
        {/* TopAppBar */}
        <header className="w-full sticky top-0 z-50 bg-[#f7f9fb]/80 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-slate-100">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-[#191c1e]">Panel del Conductor</span>
            <div className="relative group hidden md:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>search</span>
              <input className="bg-[#eceef0] border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-[#3755c3]/50 transition-all font-medium" placeholder="Buscar manifiesto..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-[#f2f4f6] transition-colors relative">
              <span className="material-symbols-outlined text-[#45464d]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#191c1e]">{driverData?.name}</p>
                <p className="text-[10px] uppercase tracking-tighter text-[#45464d] font-bold">Unidad {driverData?.disco}</p>
              </div>
              <img alt="Avatar" className="h-10 w-10 rounded-full object-cover border-2 border-[#3755c3]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbrhwU4f0GXBaq1IZk0QQwpWPRcJbZr8mfTfglSzhdYP08fOfiBpUgU4y1W12LuNJoTIjT9D2Ovk9WbnQ1fvIq7xbv7mdSF9-56WmaTCfRaLiAI5iLZjrGQyZz5OWfnbGTB9bNfSWwvKKqG5ANxhSWMe2Wbo3x54Emuaoeg_30w-PCAlcb2Tet4dybgIkGvdmP_VbkXABi8mf_LcsEK0YiisuoqE_txlJb7D-FZsuDPwnfvon0OntNrRbhwEeHMMfsz2Lvn7O9SQb-"/>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1600px] text-left">
          {/* Active Route Header */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden border border-slate-100">
            <div className="absolute top-0 right-0 p-6">
              <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Ruta en Curso
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-3">
                <h2 className="text-[10px] font-black text-[#45464d] uppercase tracking-[0.2em] mb-3">Origen Actual</h2>
                <p className="text-3xl font-black text-[#191c1e] font-headline">Loja</p>
                <p className="text-[#3755c3] font-black text-xs mt-1">SAL 08:45 AM</p>
              </div>
              
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="w-full flex items-center gap-6">
                  <span className="material-symbols-outlined text-[#3755c3] filled-icon">radio_button_checked</span>
                  <div className="flex-1 h-3 bg-[#eceef0] rounded-full relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 left-0 h-full w-[65%] bg-gradient-to-r from-[#3755c3] to-[#607cec] rounded-full"></div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">location_on</span>
                </div>
                <div className="mt-6 flex gap-10">
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#45464d] mb-1">Restante</p>
                    <p className="font-black text-lg">285 KM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#45464d] mb-1">ETA</p>
                    <p className="font-black text-lg">13:20 PM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#45464d] mb-1">Velocidad</p>
                    <p className="font-black text-lg">82 KM/H</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 text-right">
                <h2 className="text-[10px] font-black text-[#45464d] uppercase tracking-[0.2em] mb-3">Destino Final</h2>
                <p className="text-3xl font-black text-[#191c1e] font-headline">Cuenca</p>
                <p className="text-slate-400 font-black text-xs mt-1">LLEG 13:45 PM</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Area: Map & Manifest */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-[#191c1e]">Ruta en Tiempo Real</h3>
                    <p className="text-xs font-bold text-[#45464d] uppercase tracking-widest mt-1">Unidad: SCANIA K410 - {driverData?.disco}</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="w-10 h-10 rounded-xl bg-[#f2f4f6] flex items-center justify-center text-[#191c1e] hover:bg-slate-200 transition-all">
                      <span className="material-symbols-outlined">my_location</span>
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-[#f2f4f6] flex items-center justify-center text-[#191c1e] hover:bg-slate-200 transition-all">
                      <span className="material-symbols-outlined">fullscreen</span>
                    </button>
                  </div>
                </div>
                <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100">
                  <MapBoxComponent center={currentCoords} zoom={15} markers={[{ lngLat: currentCoords, type: 'bus', title: `Unidad ${driverData?.disco}` }]} />
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
                <div className="p-8 flex justify-between items-center bg-gradient-to-r from-white to-[#f2f4f6]">
                  <h3 className="text-2xl font-black text-[#191c1e]">Manifiesto de Pasajeros</h3>
                  <button className="flex items-center gap-2 bg-[#191c1e] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-black active:scale-95 shadow-lg">
                    <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                    Escaneo de Abordaje
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#f2f4f6]">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d]">Pasajero</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d]">Asiento</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d]">Destino</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d]">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Elena Rodriguez', seat: '1A', destination: 'Cuenca', status: 'ABORDADO', color: 'emerald' },
                        { name: 'Marcus Chen', seat: '2B', destination: 'Oña', status: 'POR ABORDAR', color: 'amber' },
                        { name: 'Sofia Villalobos', seat: '4A', destination: 'Saraguro', status: 'PENDIENTE', color: 'slate' }
                      ].map((p, i) => (
                        <tr key={i} className="hover:bg-[#f7f9fb] transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-black text-sm text-[#191c1e]">{p.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">ID: 0233482-{i}</p>
                          </td>
                          <td className="px-8 py-6 font-black text-sm">{p.seat}</td>
                          <td className="px-8 py-6 text-sm font-bold text-[#45464d]">{p.destination}</td>
                          <td className="px-8 py-6">
                            <span className={`bg-${p.color}-50 text-${p.color}-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-${p.color}-100`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar: Checklists & Alerts */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d] mb-8">Protocolo de Seguridad</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Sistemas Hidráulicos', icon: 'safety_check', checked: true },
                    { label: 'Monitoreo de Llantas', icon: 'tire_repair', checked: true },
                    { label: 'Tacógrafo Digital', icon: 'speed', checked: false },
                    { label: 'Cabina Sanitizada', icon: 'cleaning_services', checked: false }
                  ].map((item, i) => (
                    <label key={i} className="flex items-center justify-between p-5 bg-[#f7f9fb] rounded-2xl cursor-pointer hover:bg-[#eceef0] transition-all group">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-[#3755c3] group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="text-sm font-black text-[#191c1e] tracking-tight">{item.label}</span>
                      </div>
                      <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 rounded-md border-slate-200 text-[#3755c3] focus:ring-[#3755c3]" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d] mb-6">Estado del Tráfico</h3>
                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100 group">
                  <img alt="Traffic Map" className="w-full h-full object-cover grayscale contrast-125 opacity-40 group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANsMHFU5nNHddtVm39xi2O43WpMgBFdbO7spdibZh84PWlY4RkxJibSTZhoI0G7yOm2Wg1-WPtWKN2IPiux7ed0OY7Qtf0SjrkS6FdBTmGbXrFiMzV3Q1tuLYEud2InIOrC9Ohnnv9RyN6D_QbChJR6M4QvqPBHJXmKCxheXTMkE_--XpRXtUhMCMQbgqdEq8467euwuUVYnbtYaUFLfjUkVUh70ZSDrgbxA3kzu1gSuxODNnCdTjpiuHfvLnfyst-wgAEjJRrhEzY"/>
                  <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <p className="text-white text-xs font-black tracking-tight mb-1">Vía Alóag-Santo Domingo</p>
                    <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Tráfico Fluido
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => alert("ALERTA SOS ENVIADA. Contactando 911 y buses cercanos.")}
                className="w-full py-10 rounded-[2.5rem] bg-[#ba1a1a] text-white flex flex-col items-center justify-center gap-3 group transition-all hover:scale-[1.02] shadow-2xl shadow-[#ba1a1a]/20"
              >
                <span className="material-symbols-outlined text-6xl group-hover:animate-pulse">emergency</span>
                <span className="font-black uppercase tracking-[0.3em] text-[10px]">Señal de Emergencia</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Finalize Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleFinalizeTrip}
          className="w-16 h-16 bg-error text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">stop_circle</span>
        </button>
      </div>
    </div>
  );
};

export default DriverDashboard;

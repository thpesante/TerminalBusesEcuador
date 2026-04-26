import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Notificaciones() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'municipio_notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(list);
      if (list.length > 0 && !selectedNotif) setSelectedNotif(list[0]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleResolve = async (id: string) => {
    await updateDoc(doc(db, 'municipio_notifications', id), {
        status: 'RESUELTO',
        resolvedAt: serverTimestamp()
    });
    alert("NOTIFICACIÓN MARCADA COMO RESUELTA");
  };

  const handleNuevaAlerta = async () => {
    try {
      await addDoc(collection(db, 'municipio_notifications'), {
        title: 'ALERTA MANUAL DETECTADA VÍA OPERADOR',
        message: 'Incidencia reportada de manera manual en el Centro de Notificaciones. Pendiente de revisión técnica.',
        type: 'info',
        level: 'NIVEL DE REVISIÓN',
        status: 'NUEVO',
        timeStr: 'Borrador',
        fullDate: new Date().toLocaleString(),
        location: 'No especificada',
        createdAt: serverTimestamp()
      });
      alert('Se ha registrado una nueva alerta en el panel.');
    } catch (e) {
      alert("Error al crear alerta manual");
    }
  };

  const handleContactarMando = () => {
    alert("Iniciando conexión cifrada con el Comando Central de Emergencias, espere...");
  };

  return (
    <div className="bg-[#0d0d0d] text-[#e5e2e1] h-screen flex flex-col font-body">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-tertiary-container rounded-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary-container text-lg">explore</span>
            </div>
            <div className="text-xl font-headline font-black tracking-tighter text-tertiary-fixed-dim uppercase">GESTION TURISTICA</div>
          </div>
          <nav className="hidden lg:flex items-center gap-8 font-body uppercase text-[10px] tracking-widest">
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/dashboard">Dashboard</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/turismo">Turismo</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/data-intel">Datos</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/agenda">Agenda</Link>
            <Link className="text-tertiary-fixed-dim border-b-2 border-tertiary-container pb-1" to="/municipio/notifications">Notificaciones</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/perfil">Perfil</Link>
          </nav>
        </div>
        <button onClick={handleNuevaAlerta} className="px-5 h-9 bg-tertiary-container text-on-tertiary font-headline font-black text-[9px] tracking-widest uppercase rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-lg">Nueva Alerta</button>
      </header>

      <main className="pt-20 h-full flex overflow-hidden">
        <section className="w-full md:w-[450px] bg-[#0e0e0e] border-r border-[#353534]/30 flex flex-col shadow-2xl relative z-10">
          <div className="p-6 border-b border-white/5 bg-[#131313]">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button className="px-6 py-2 bg-[#ff535b] text-white rounded-full text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">Todas</button>
              <button className="px-6 py-2 bg-[#1c1b1b] text-[#e4bebc] hover:bg-[#353534] rounded-full text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">Críticas</button>
              <button className="px-6 py-2 bg-[#1c1b1b] text-[#e4bebc] hover:bg-[#353534] rounded-full text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">Movilidad</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-[#e4bebc]/20 uppercase tracking-[0.4em] mb-6 italic">Monitor de Alertas Activas</h3>
              <div className="space-y-6">
                {notifications.map(n => (
                  <div key={n.id} onClick={() => setSelectedNotif(n)} className={`group p-6 rounded-sm cursor-pointer transition-all border-l-4 shadow-xl ${selectedNotif?.id === n.id ? 'bg-[#ff535b]/10 border-[#ff535b]' : 'bg-[#1c1b1b] border-transparent hover:border-[#3cd7ff]'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`material-symbols-outlined text-2xl ${n.type === 'error' ? 'text-[#ff535b]' : 'text-[#3cd7ff]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{n.type === 'error' ? 'error' : 'info'}</span>
                      <span className="text-[9px] font-mono text-[#e4bebc]/20 uppercase">{n.timeStr || 'Hace poco'}</span>
                    </div>
                    <h4 className="text-sm font-black text-[#e5e2e1] uppercase italic tracking-tighter">{n.title}</h4>
                    <p className="text-[11px] text-[#e4bebc]/40 mt-3 line-clamp-2 uppercase italic leading-relaxed">{n.message}</p>
                    {n.status === 'RESUELTO' && <div className="mt-4 text-[8px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-1"><span className="material-symbols-outlined text-xs">task_alt</span> RESUELTO</div>}
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-center py-20 opacity-20 font-black text-[10px] uppercase">No hay notificaciones...</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto bg-[#131313] relative">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[#ff535b]/5 blur-[150px] rounded-full pointer-events-none"></div>
          {selectedNotif ? (
            <div className="max-w-4xl mx-auto p-12 md:p-20 relative z-10">
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <span className={`px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest ${selectedNotif.type === 'error' ? 'bg-[#ff535b] text-white' : 'bg-[#3cd7ff] text-[#001453]'}`}>
                    {selectedNotif.level || 'NIVEL CRÍTICO 1'}
                  </span>
                  <span className="text-[#e4bebc]/20 text-[10px] font-mono tracking-widest uppercase">SYSLOG ID: {selectedNotif.id}</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-[#e5e2e1] tracking-tighter leading-none mb-8 italic uppercase">{selectedNotif.title}</h1>
                <div className="flex items-center gap-10 text-[#e4bebc]/40 italic">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedNotif.fullDate || 'Oct 24, 2023 - 12:45'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedNotif.location || 'Cuenca Hub Central'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-[#1c1b1b] p-10 rounded-sm border-t-2 border-white/5 shadow-2xl">
                    <h2 className="text-[10px] font-black text-[#ffb3b1] tracking-[0.4em] uppercase mb-8 italic">Análisis Estructural de Situación</h2>
                    <p className="text-[#e5e2e1]/80 text-lg leading-relaxed mb-8 uppercase italic font-light">
                      {selectedNotif.message}
                    </p>
                    <div className="p-6 bg-[#0e0e0e] rounded-sm border border-white/5">
                      <p className="text-[10px] text-[#ffb3b1] font-black uppercase tracking-widest mb-2 italic">Protocolo Sugerido:</p>
                      <p className="text-[11px] text-[#e4bebc]/40 italic uppercase leading-loose">
                        Implementar bloqueo perimetral de 2km. Desviar tráfico hacia la zona sur. Notificar a bomberos (Unidades 04, 12 y 19).
                      </p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <div className="bg-[#0e0e0e] rounded-sm border border-white/5 h-full min-h-[350px] relative overflow-hidden shadow-2xl">
                    <img alt="Detail Map" className="w-full h-full object-cover opacity-40 grayscale group-hover:scale-105 transition-all duration-[2s]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFKllWmCW3dd4oW17-Q8icpV--KJt543mpYd8gQHLdXBiXhp4O5A5I8NyXHsweySN35OF-9syFqe96O_Yf5Fe_IKKyJL5Cx6MicrUcXkRcP_ph24yv_I1A20OWnIx2s3A3TnAUb4Ts9vHcy0AHU0jxLqNSV5pEUqCHLCdE9vVhf_WWAkwYa3LF-sL9JAeh-2MQqTd3Q1fhGCST7RFRl8-zCHm9gRUTwTtDR2dO1czQu4CcWacxLsROxx3i7YkxolYoQSyc1jXpwL0"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-2.5 h-2.5 bg-[#ff535b] rounded-full animate-pulse shadow-[0_0_15px_#ff535b]"></span>
                        <span className="text-[9px] font-black text-white uppercase italic tracking-[0.2em]">Punto de Incidencia</span>
                      </div>
                      <p className="text-[10px] text-[#e4bebc]/30 italic uppercase">Coord: 2°50'S 79°13'W</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-12 border-t border-white/5">
                <button onClick={handleContactarMando} className="flex items-center gap-3 px-8 py-4 bg-[#ff535b] text-white rounded-sm font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl">
                  <span className="material-symbols-outlined text-lg">emergency</span>
                  Contactar Centro de Mando
                </button>
                <button onClick={() => handleResolve(selectedNotif.id)} className="flex items-center gap-3 px-8 py-4 bg-[#1c1b1b] border border-[#ffdb3c] text-[#ffdb3c] rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-[#ffdb3c]/10 transition-all">
                   <span className="material-symbols-outlined text-lg">verified</span>
                   Finalizar Incidencia
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
               <span className="material-symbols-outlined text-9xl">notifications_active</span>
               <p className="text-xl font-black uppercase tracking-[0.5em] mt-10 italic">Seleccione Notificación</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

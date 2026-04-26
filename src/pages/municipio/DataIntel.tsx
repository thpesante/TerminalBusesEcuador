import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function DataIntel() {
  const [demographics, setDemographics] = useState({
    kids: 15,
    young: 42,
    adults: 38,
    seniors: 20,
    male: 52,
    female: 48
  });
  
  const [flowData, setFlowData] = useState([30, 50, 80, 100, 85, 70, 95, 60]);

  useEffect(() => {
    // Sync with real-time data if available
    const unsub = onSnapshot(collection(db, 'municipio_data_intel'), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data.demographics) setDemographics(data.demographics);
        if (data.flow) setFlowData(data.flow);
      }
    });
    return () => unsub();
  }, []);

  const handleEmergencyTrigger = async () => {
    try {
      await addDoc(collection(db, 'municipio_notifications'), {
        title: 'ALERTA INTEL: ANOMALÍA EN FLUJO DE PASAJEROS',
        message: 'El sistema de inteligencia de datos ha detectado una anomalía masiva en la densidad poblacional. Requiere revisión.',
        type: 'error',
        level: 'NIVEL DE OBSERVACIÓN',
        status: 'ACTIVO',
        location: 'Red de Transporte (Global)',
        createdAt: serverTimestamp()
      });
      alert("ALERTA DE INTELIGENCIA GENERADA - NOTIFICACIÓN ENVIADA AL COMANDO CENTRAL");
    } catch (e) {
      alert("Error al emitir alerta de emergencia");
    }
  };

  return (
    <div className="bg-[#0d0d0d] text-[#e5e2e1] min-h-screen flex flex-col font-body">
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
            <Link className="text-tertiary-fixed-dim border-b-2 border-tertiary-container pb-1" to="/municipio/data-intel">Datos</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/agenda">Agenda</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/notifications">Notificaciones</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/perfil">Perfil</Link>
          </nav>
        </div>
        <button onClick={handleEmergencyTrigger} className="px-5 h-9 bg-tertiary-container text-on-tertiary font-headline font-black text-[9px] tracking-widest uppercase rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-lg">Emergencia</button>
      </header>

      <main className="flex-1 min-h-screen pt-28">
        <div className="p-8 space-y-12 max-w-[1600px] mx-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#3cd7ff] font-black tracking-[0.3em] text-[10px] uppercase italic">Centro de Mando Digital</span>
              <span className="text-[#e5e2e1]/20 pb-1">•</span>
              <span className="text-[#e4bebc]/60 font-manrope text-[10px] uppercase font-black tracking-widest italic">V2.4 STATUS: OPTIMAL</span>
            </div>
            <h2 className="text-5xl font-black text-[#e5e2e1] uppercase italic tracking-tighter">Centro de Inteligencia de Datos</h2>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 bg-[#1c1b1b] rounded-lg overflow-hidden relative group border border-white/5 shadow-2xl">
              <div className="absolute top-8 left-8 z-10 space-y-2">
                <h3 className="text-xs font-black text-[#e5e2e1] uppercase tracking-[0.3em] italic">Origen de Pasajeros</h3>
                <p className="text-[10px] text-[#e4bebc]/60 uppercase italic tracking-widest">Mapa de calor en tiempo real - Sectorización Urbana</p>
              </div>
              <div className="absolute top-8 right-8 z-10">
                <span className="bg-[#131313] px-5 py-2 text-[10px] font-black text-[#3cd7ff] rounded-sm border border-[#3cd7ff]/20 italic shadow-2xl">LIVE: 14,203 ACTIVOS</span>
              </div>
              <div className="w-full h-[550px] bg-[#0e0e0e] relative overflow-hidden">
                <img alt="Heatmap" className="w-full h-full object-cover opacity-50 mix-blend-screen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO8XtCdfdc34f_-I0HWt-OAvBRSAoFJ__qFg7I9GTbHZI-WB__SRGkHqOdTTIv4sgF-B45mDQnEadAnwwX8lwHfGGTDtkDDCSmHjQtoipl4Cm1lhl0t1gSIlcbuDfJdh5B-qCZt-sNfP5rJh3-2m_pJKghwzsNaEBwNMV944ynqcIKtopBE5-RTUVedcz4KuGAEN-0OWzpbPmnuaz3cEydEXQwpgUgaZL4hzinVdQh8-CwHtb-TGQgXrFUKdV69X--YKkAUHdeet0"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>
                <div className="absolute top-[40%] left-[50%] flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#ffb3b1]/10 animate-pulse border-2 border-[#ffb3b1] flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#ffb3b1] rounded-full shadow-[0_0_20px_#ffb3b1]"></div>
                  </div>
                  <span className="text-[10px] font-black text-[#ffb3b1] mt-3 bg-[#131313]/90 px-4 py-1.5 rounded-sm uppercase italic tracking-widest">Sector El Barranco</span>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
              <div className="bg-[#2a2a2a] p-10 rounded-lg border-t border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e4bebc]/50 italic">Distribución Etaria</span>
                  <span className="material-symbols-outlined text-[#fff9ef] text-3xl">groups</span>
                </div>
                <div className="space-y-8">
                  {[
                    { label: '18-24 AÑOS', val: demographics.young, col: '#ffb3b1' },
                    { label: '25-45 AÑOS', val: demographics.adults, col: '#3cd7ff' },
                    { label: '45+ AÑOS', val: demographics.seniors, col: '#ffe16d' }
                  ].map(item => (
                    <div key={item.label} className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span>{item.label}</span>
                        <span style={{ color: item.col }}>{item.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#0e0e0e] rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-[1.5s]" style={{ width: `${item.val}%`, backgroundColor: item.col }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1c1b1b] p-10 rounded-lg relative overflow-hidden group shadow-2xl border border-white/5">
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">flight_takeoff</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e4bebc]/50 block mb-8 italic">Motivos de Tránsito</span>
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  {[
                    { label: 'Turismo', val: '64%', color: '#e5e2e1' },
                    { label: 'Negocios', val: '22%', color: '#3cd7ff' },
                    { label: 'Estudios', val: '14%', color: '#fff9ef' }
                  ].map(m => (
                    <div key={m.label} className="bg-[#0e0e0e]/50 p-5 rounded-sm border border-white/5">
                      <p className="text-3xl font-black text-[#e5e2e1] italic tracking-tighter" style={{ color: m.color }}>{m.val}</p>
                      <p className="text-[10px] font-black text-[#e4bebc]/40 uppercase tracking-widest mt-2">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 bg-[#1c1b1b] p-12 rounded-lg border border-white/5 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                  <h3 className="text-2xl font-black text-[#e5e2e1] uppercase italic tracking-tighter">Flujo de Pasajeros por Hora</h3>
                  <p className="text-[11px] text-[#3cd7ff] font-black uppercase tracking-[0.2em] mt-2 italic opacity-60">Ciclo Operativo Diario - Red de Transporte Cuenca</p>
                </div>
                <div className="flex gap-10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#3cd7ff] rounded-full shadow-[0_0_10px_#3cd7ff]"></div>
                    <span className="text-[10px] font-black text-[#e4bebc] uppercase tracking-widest">TEMPO REAL</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#353534] rounded-full border border-white/10"></div>
                    <span className="text-[10px] font-black text-[#e4bebc]/40 uppercase tracking-widest">PROMEDIO HISTÓRICO</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between h-64 gap-3 md:gap-8 px-4">
                {flowData.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="w-full bg-[#131313] rounded-t-sm h-full relative overflow-hidden border border-white/5">
                      <div 
                        className={`absolute inset-x-0 bottom-0 transition-all duration-[2s] group-hover:brightness-125 ${v >= 90 ? 'bg-[#ff535b] shadow-[0_0_30px_#ff535b]' : 'bg-[#3cd7ff] shadow-[0_0_20px_#3cd7ff]'}`} 
                        style={{ height: `${v}%` }}
                      ></div>
                      {v >= 95 && <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#ff535b] text-[#131313] text-[9px] font-black px-2 py-0.5 rounded-full z-10">PICO</div>}
                    </div>
                    <span className="text-[10px] font-black text-[#e4bebc]/40 uppercase tracking-widest">{6 + (i * 2)}:00</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 bg-[#2a2a2a] p-10 rounded-lg flex items-center gap-12 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="relative w-40 h-40 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewbox="0 0 36 36">
                  <circle className="stroke-[#0e0e0e]" cx="18" cy="18" fill="none" r="16" strokeWidth="4"></circle>
                  <circle className="stroke-[#ffb3b1]" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${demographics.male}, 100`} strokeWidth="4" strokeLinecap="round"></circle>
                  <circle className="stroke-[#3cd7ff]" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${demographics.female}, 100`} strokeDashoffset={`-${demographics.male}`} strokeWidth="4" strokeLinecap="round"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[#e5e2e1] italic leading-none">{demographics.male}%</span>
                  <span className="text-[9px] font-black text-[#e4bebc]/40 uppercase mt-1">Masc</span>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <h3 className="text-sm font-black text-[#e5e2e1] uppercase tracking-[0.3em] italic mb-6">Equilibrio Demográfico</h3>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-[#ffb3b1] rounded-full"></div>
                    <span className="text-[10px] text-[#e4bebc] font-black uppercase tracking-widest">HOMBRES</span>
                  </div>
                  <span className="text-lg font-black italic">{demographics.male}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-[#3cd7ff] rounded-full"></div>
                    <span className="text-[10px] text-[#e4bebc] font-black uppercase tracking-widest">MUJERES</span>
                  </div>
                  <span className="text-lg font-black italic">{demographics.female}%</span>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 bg-[#1c1b1b] p-10 rounded-lg border-l-8 border-[#ffdb3c] shadow-2xl">
              <h3 className="text-sm font-black text-[#e5e2e1] uppercase tracking-[0.3em] mb-10 italic">Puntos de Acceso en Red</h3>
              <div className="flex justify-between items-center">
                <div className="text-center group cursor-pointer">
                  <span className="material-symbols-outlined text-[#e5e2e1] text-4xl mb-4 transition-transform group-hover:scale-125">smartphone</span>
                  <p className="text-4xl font-black text-[#e5e2e1] italic tracking-tighter">88%</p>
                  <p className="text-[10px] font-black text-[#e4bebc]/40 uppercase mt-2 tracking-widest">Móvil</p>
                </div>
                <div className="h-20 w-[1px] bg-white/10"></div>
                <div className="text-center group cursor-pointer">
                  <span className="material-symbols-outlined text-[#e5e2e1] text-4xl mb-4 transition-transform group-hover:scale-125">laptop</span>
                  <p className="text-4xl font-black text-[#e5e2e1] italic tracking-tighter">12%</p>
                  <p className="text-[10px] font-black text-[#e4bebc]/40 uppercase mt-2 tracking-widest">Desktop</p>
                </div>
                <div className="h-20 w-[1px] bg-white/10 text-transparent">|</div>
                <div className="text-center">
                  <span className="material-symbols-outlined text-[#ff535b] text-4xl mb-4 animate-pulse">broadcast_tower</span>
                  <p className="text-[9px] font-black text-[#e4bebc]/40 uppercase tracking-[0.2em]">Sincronización Regional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

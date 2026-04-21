import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function CuencaDashboard() {
  const { userData } = useAuth();
  const [metrics, setMetrics] = useState({
    pasajeros: '0',
    eventos: 0,
    emergenciaNivel: 'NIVEL 01',
    emergenciaStatus: 'BAJO RIESGO'
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Real-time Metrics (Aggregated or mock stats for Cuenca)
    const unsubMetrics = onSnapshot(collection(db, 'municipio_metrics'), (snap) => {
      if (!snap.empty) {
        setMetrics(snap.docs[0].data() as any);
      }
    });

    // 2. Fetch Infrastructure Projects
    const unsubProjects = onSnapshot(collection(db, 'municipio_projects'), (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Fetch System Alerts
    const qAlerts = query(collection(db, 'municipio_notifications'), orderBy('createdAt', 'desc'), limit(3));
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubMetrics();
      unsubProjects();
      unsubAlerts();
    };
  }, []);

  const handleEmergencyTrigger = () => {
    alert("PROTOCOLO DE EMERGENCIA ACTIVADO - NOTIFICANDO A TODAS LAS UNIDADES");
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] font-body min-h-screen selection:bg-[#ffb3b1]/30">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131313]/40 backdrop-blur-xl border-b border-[#e5e2e1]/15 shadow-[0_20px_50px_rgba(255,179,177,0.08)]">
        <div className="flex items-center gap-10 h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2a2a2a] rounded-sm flex items-center justify-center">
              <img alt="Escudo de Cuenca" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuAubMUBunt7wxsKfRGGmOMTsanz1plnzj1X881EsUvuwcPGPNJB-44U3VmrSBRYy2ZQzxTovhAZZEUKqMWPDr1-NPNlZLlZuXlmOCPf2WcbV47ooKNgpa-HVJoANk_JNcvuBaNlo0lvUwx4DZ9vAE-N0MQG71j-Bi7HC3iicdL9lluW9rb75a-QDwBbYnyyrOvP7tAO2i1exFiqLHjthZ1q16IFxlFIsDzSuSVrfgF79y4YL-zFc75qWNd4zdYUrhkOePmrHlPs4"/>
            </div>
            <h1 className="text-xl font-manrope font-black tracking-tighter text-[#ffb3b1] uppercase">MUNICIPIO DE CUENCA</h1>
          </div>
          <nav className="hidden xl:flex items-center gap-8 h-full">
            <Link to="/municipio/dashboard" className="text-[#ffb3b1] border-b-2 border-[#ff535b] pb-1 font-headline font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              Panel de Control
            </Link>
            <Link to="/municipio/turismo" className="text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors font-inter uppercase text-[10px] tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">explore</span>
              Gestión Turística
            </Link>
            <Link to="/municipio/data-intel" className="text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors font-inter uppercase text-[10px] tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">monitoring</span>
              Inteligencia de Datos
            </Link>
            <Link to="/municipio/agenda" className="text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors font-inter uppercase text-[10px] tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">event</span>
              Agenda de la Ciudad
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-6 h-full">
          <div className="hidden lg:flex items-center bg-[#1c1b1b] px-4 py-2 rounded-sm border border-[#5b403f]/10">
            <span className="material-symbols-outlined text-[#e4bebc] text-lg">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-[10px] font-label tracking-widest text-[#e5e2e1] uppercase w-48" placeholder="BUSCAR INDICADOR..." type="text"/>
          </div>
          <div className="flex items-center gap-4 border-l border-[#5b403f]/20 pl-6 h-10">
            <Link to="/municipio/notifications" className="relative group cursor-pointer">
              <span className="material-symbols-outlined text-[#e4bebc] hover:text-[#ffb3b1] transition-colors">notifications</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ffb3b1] rounded-full border border-[#131313]"></span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-[#e5e2e1] tracking-tight font-manrope uppercase">{userData?.nombre || 'Alcalde de Cuenca'}</p>
              <p className="text-[8px] text-[#3cd7ff] font-label tracking-widest">SISTEMA ACTIVO</p>
            </div>
            <Link to="/municipio/perfil">
               <img alt="Perfil" className="w-10 h-10 rounded-sm object-cover border border-[#ffb3b1]/20" src={userData?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDQezjk0zqL27ULxtlHmjDOGm-5RRTP4G8vOlpq_HY2nsKFs2to2L2PjZ3LEorvsRrmp2ryWBDLklI7kiJYR-jBIACV_djYHl3U80rZsf0s6_1E1j_Q5lwJaZxYM6n-w7mhDo_7PfXMl-BGQoDLTV6AmmCfBQ2ovSvbq-Q_lYFTGpr55y2gJiWNWCpc3jRGOgcd-brXvkPdVPS19mcY2qUc5VIe_B5v_Q9sG7RecBK-uoFSbaajsbUb1ycPqoAmj0NnPkCxDEiaLqk"}/>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="mb-12">
            <span className="text-[#ffb3b1] text-[10px] font-bold tracking-[0.3em] uppercase">Monitor Central v4.0</span>
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-5xl font-black font-headline text-[#e5e2e1] mt-2 tracking-tighter uppercase italic">Panel de Control Estratégico</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#ffb3b1] to-transparent mt-4"></div>
              </div>
              <button 
                onClick={handleEmergencyTrigger}
                className="px-8 py-3 bg-[#ff535b] text-[#5b000e] font-headline font-black text-[10px] tracking-widest rounded-sm shadow-[0_10px_20px_-10px_rgba(255,83,91,0.5)] hover:scale-105 active:scale-95 transition-all uppercase"
              >
                Respuesta Emergencia
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Pasajeros Card */}
              <div className="bg-[#1c1b1b] p-8 rounded-sm relative overflow-hidden group border border-[#353534]/30">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <span className="material-symbols-outlined text-7xl">directions_bus</span>
                </div>
                <p className="text-[10px] font-black text-[#e4bebc] tracking-widest uppercase italic">Pasajeros Totales (Hoy)</p>
                <div className="flex items-end gap-3 mt-6">
                  <span className="text-6xl font-black font-headline text-[#e5e2e1] tracking-tighter">{metrics.pasajeros}</span>
                  <span className="text-[#3cd7ff] text-xs font-bold mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span> +12%
                  </span>
                </div>
                <div className="mt-8 h-1 w-full bg-[#353534]">
                  <div className="h-full bg-[#3cd7ff] w-3/4 shadow-[0_0_15px_rgba(60,215,255,0.4)]"></div>
                </div>
              </div>

              {/* Eventos Card */}
              <div className="bg-[#1c1b1b] p-8 rounded-sm relative overflow-hidden group border border-[#353534]/30">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <span className="material-symbols-outlined text-7xl">event_available</span>
                </div>
                <p className="text-[10px] font-black text-[#e4bebc] tracking-widest uppercase italic">Eventos Activos</p>
                <div className="flex items-end gap-3 mt-6">
                  <span className="text-6xl font-black font-headline text-[#e9c400] tracking-tighter">{metrics.eventos}</span>
                  <span className="text-[#ffe16d] text-[10px] font-black mb-2 uppercase tracking-widest opacity-40">En ejecución</span>
                </div>
              </div>

              {/* Emergencia Card */}
              <div className="bg-[#ff535b] p-8 rounded-sm relative overflow-hidden group border border-[#ff535b]/20">
                <div className="absolute top-0 right-0 p-6 opacity-20 text-[#5b000e]">
                  <span className="material-symbols-outlined text-7xl">warning</span>
                </div>
                <p className="text-[10px] font-black text-[#5b000e] tracking-widest uppercase">Estado Territorial</p>
                <div className="flex items-center gap-6 mt-6">
                  <span className="text-4xl font-black font-headline text-[#5b000e]">{metrics.emergenciaNivel}</span>
                  <div className="bg-[#5b000e]/20 px-4 py-1.5 rounded-full animate-pulse border border-[#5b000e]/10">
                    <span className="text-[10px] font-black text-[#5b000e] uppercase">{metrics.emergenciaStatus}</span>
                  </div>
                </div>
                <p className="mt-6 text-[11px] text-[#5b000e] font-black italic leading-relaxed uppercase tracking-tight">Sistemas en línea. Monitoreo constante de caudales de ríos y movilidad urbana activado.</p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="bg-[#1c1b1b] rounded-sm h-full flex flex-col relative overflow-hidden border border-[#5b403f]/10">
                <div className="p-8 flex justify-between items-center z-10 bg-gradient-to-b from-[#131313] to-transparent">
                  <div>
                    <h3 className="text-xs font-black text-[#e5e2e1] tracking-[0.3em] uppercase">Visualización Estratégica Territorial</h3>
                    <p className="text-[10px] text-[#e4bebc] mt-2 uppercase italic opacity-60">Cuenca Hub Central - Mapa Topológico de Servicios</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-5 py-2 bg-[#353534] text-[10px] font-black text-[#e5e2e1] uppercase rounded-sm border border-[#5b403f]/20 hover:bg-[#ff535b] transition-all">Tráfico</button>
                    <button className="px-5 py-2 bg-[#009ebe]/20 text-[#3cd7ff] text-[10px] font-black uppercase rounded-sm border border-[#3cd7ff]/30">Sensores</button>
                  </div>
                </div>

                <div className="flex-1 w-full bg-[#0a0a0a] relative group">
                  <img alt="Map" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-[2s]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy1A9WdrXzLhKB9v5tdF67R1MiJGaAcp40quSRVuojzK80Jpmm_0VMMHAykNOI9OTu9qoXboK8fjQsIJiU1Kkdxzb7iKHJFCnZ_L1u0FpSkwa1y8eifQo_rJo3X0d6n6siLaKPKdUus_wLOuiPbk7IcXqCfYUlGtvxP1fPrBbZl0YfYnS5V3utsDjRv4wvQeiDx4wuSwQe5cKNzQIKex3I1aXslFC4Ywu_i4wyWlybqzFAhU3B1lqbZvUDV30YMJ39uFv5MXVH-7Y"/>
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-[#ffb3b1]/10 rounded-full blur-[80px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-[#3cd7ff]/10 rounded-full blur-[100px]"></div>
                  </div>
                </div>

                <div className="p-6 bg-[#0e0e0e] flex items-center gap-10 overflow-x-auto no-scrollbar border-t border-[#5b403f]/10">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-2.5 h-2.5 bg-[#ffb3b1] rounded-full shadow-[0_0_10px_#ffb3b1]"></div>
                    <span className="text-[10px] font-black text-[#e4bebc] uppercase italic">Incidentes Viales</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-2.5 h-2.5 bg-[#3cd7ff] rounded-full shadow-[0_0_10px_#3cd7ff]"></div>
                    <span className="text-[10px] font-black text-[#e4bebc] uppercase italic">Tranvía Activo</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-2.5 h-2.5 bg-[#ffdb3c] rounded-full shadow-[0_0_10px_#ffdb3c]"></div>
                    <span className="text-[10px] font-black text-[#e4bebc] uppercase italic">Mantenimiento</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div className="bg-[#1c1b1b] p-8 rounded-sm border border-[#353534]/40 shadow-2xl">
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-[#353534]">
                  <h3 className="text-xs font-black text-[#e5e2e1] tracking-[0.3em] uppercase italic">Proyectos de Infraestructura 2024</h3>
                  <span className="text-[9px] font-black text-[#3cd7ff] uppercase cursor-pointer hover:tracking-[0.4em] transition-all">Ver PDF Reporte</span>
                </div>
                <div className="space-y-6">
                  {projects.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-4 border-b border-[#353534]/30 hover:bg-[#201f1f] px-4 rounded-sm transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[#201f1f] rounded-sm flex items-center justify-center border border-[#353534] group-hover:border-[#ffb3b1]">
                          <span className="material-symbols-outlined text-[#ffb3b1]">{p.icon || 'construction'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#e5e2e1] uppercase italic tracking-tighter">{p.nombre}</p>
                          <p className="text-[10px] text-[#e4bebc] uppercase opacity-50">{p.detalles}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-[#e5e2e1] font-headline italic tracking-tighter">{p.avance}%</p>
                        <div className="w-32 h-1.5 bg-[#0e0e0e] mt-2 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#ffb3b1] to-[#ff535b]" style={{ width: `${p.avance}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-[10px] font-black uppercase text-center py-10 opacity-20">Sincronizando Proyectos...</p>}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5">
              <div className="bg-[#1c1b1b] p-8 rounded-sm border border-[#353534]/40 h-full">
                <h3 className="text-xs font-black text-[#e5e2e1] tracking-[0.3em] uppercase mb-10 italic">Alertas de Estado Crítico</h3>
                <div className="space-y-6">
                  {alerts.map(a => (
                    <div key={a.id} className={`p-6 bg-[#201f1f] rounded-sm flex gap-6 border-l-4 ${a.type === 'error' ? 'border-[#ff535b]' : 'border-[#3cd7ff]'}`}>
                      <span className={`material-symbols-outlined text-2xl ${a.type === 'error' ? 'text-[#ff535b]' : 'text-[#3cd7ff]'}`}>{a.type === 'error' ? 'error_outline' : 'check_circle'}</span>
                      <div>
                        <p className="text-sm font-black text-[#e5e2e1] uppercase italic tracking-tighter">{a.title}</p>
                        <p className="text-[11px] text-[#e4bebc] mt-2 leading-relaxed uppercase opacity-80">{a.message}</p>
                        <p className="text-[9px] text-[#ffb3b1] font-black mt-4 uppercase tracking-[0.2em]">{a.timeAgo || 'Hace pocos minutos'}</p>
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && <p className="text-[10px] font-black uppercase text-center py-10 opacity-20">No hay alertas activas</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#131313]/90 backdrop-blur-xl border-t border-[#5b403f]/15 flex justify-around items-center py-4 z-50">
        <Link to="/municipio/dashboard" className="flex flex-col items-center text-[#ffb3b1]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[8px] font-black tracking-widest mt-1 uppercase">Panel</span>
        </Link>
        <Link to="/municipio/turismo" className="flex flex-col items-center text-[#e4bebc]/60">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[8px] font-black tracking-widest mt-1 uppercase">Turismo</span>
        </Link>
        <Link to="/municipio/data-intel" className="flex flex-col items-center text-[#e4bebc]/60">
          <span className="material-symbols-outlined">monitoring</span>
          <span className="text-[8px] font-black tracking-widest mt-1 uppercase">Datos</span>
        </Link>
        <Link to="/municipio/agenda" className="flex flex-col items-center text-[#e4bebc]/60">
          <span className="material-symbols-outlined">event</span>
          <span className="text-[8px] font-black tracking-widest mt-1 uppercase">Agenda</span>
        </Link>
      </nav>
    </div>
  );
}

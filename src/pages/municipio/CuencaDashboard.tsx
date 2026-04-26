import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
  collection, onSnapshot, query, limit, orderBy, addDoc, serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function CuencaDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalBanners: 0,
    activeBanners: 0,
    totalViews: 0,
    totalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time banners
    const unsubBanners = onSnapshot(
      query(collection(db, 'municipio_banners'), orderBy('createdAt', 'desc')),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        setBanners(list);
        const activeBanners = list.filter((b) => b.active).length;
        const totalViews = list.reduce((acc, b) => acc + (b.views || 0), 0);
        setStats(prev => ({ ...prev, totalBanners: list.length, activeBanners, totalViews }));
      }
    );

    // Real-time events
    const now = new Date().toISOString().slice(0, 16);
    const unsubEvents = onSnapshot(
      query(collection(db, 'municipio_events'), orderBy('createdAt', 'desc')),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        setEvents(list);
        const activeEvents = list.filter((e) => !e.datetime || e.datetime >= now).length;
        setStats(prev => ({ ...prev, totalEvents: list.length, activeEvents }));
        setLoading(false);
      }
    );

    // Real-time alerts
    const qAlerts = query(collection(db, 'municipio_notifications'), orderBy('createdAt', 'desc'), limit(5));
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setAlerts(list);
      setStats(prev => ({ ...prev, totalAlerts: list.length }));
    });

    // Real-time projects
    const unsubProjects = onSnapshot(collection(db, 'municipio_projects'), (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubBanners();
      unsubEvents();
      unsubAlerts();
      unsubProjects();
    };
  }, []);

  const handleEmergencyTrigger = async () => {
    try {
      await addDoc(collection(db, 'municipio_notifications'), {
        title: 'ALERTA METROPOLITANA: EMERGENCIA ACTIVADA',
        message: 'Protocolo general de emergencia activado desde el Centro de Mando.',
        type: 'error',
        level: 'NIVEL CRÍTICO 1',
        status: 'ACTIVO',
        location: 'Centro Histórico',
        createdAt: serverTimestamp()
      });
      alert('PROTOCOLO DE EMERGENCIA ACTIVADO');
    } catch {
      alert('Error al emitir alerta');
    }
  };

  const upcomingEvents = events.filter(e => e.datetime && e.datetime >= new Date().toISOString().slice(0, 16)).slice(0, 4);
  const topBanners = [...banners].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

  return (
    <div className="bg-[#0d0d0d] text-[#e5e2e1] min-h-screen font-body">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-tertiary-container rounded-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary-container text-lg">explore</span>
            </div>
            <div className="text-xl font-headline font-black tracking-tighter text-tertiary-fixed-dim uppercase">GESTION TURISTICA</div>
          </div>
          <nav className="hidden lg:flex items-center gap-8 font-body uppercase text-[10px] tracking-widest">
            <Link className="text-tertiary-fixed-dim border-b-2 border-tertiary-container pb-1" to="/municipio/dashboard">Dashboard</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/turismo">Turismo</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/data-intel">Datos</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/agenda">Agenda</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/notifications">Notificaciones</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/perfil">Perfil</Link>
          </nav>
        </div>
        <button
          onClick={handleEmergencyTrigger}
          className="px-5 h-9 bg-tertiary-container text-on-tertiary font-headline font-black text-[9px] tracking-widest uppercase rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-lg"
        >
          Emergencia
        </button>
      </header>

      <main className="pt-28 pb-24 px-6 md:px-10 max-w-[1600px] mx-auto">

        {/* Page title */}
        <div className="mb-12">
          <span className="text-tertiary-fixed-dim text-[10px] font-bold tracking-[0.3em] uppercase">Monitor Central — Tiempo Real</span>
          <h1 className="text-5xl font-black font-headline text-white mt-2 tracking-tighter uppercase italic">Panel de Control</h1>
          <div className="w-20 h-1 bg-tertiary-container mt-4 rounded-full"></div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Destinos Turísticos', value: stats.totalBanners, sub: `${stats.activeBanners} activos`, icon: 'explore', color: 'text-secondary-container' },
            { label: 'Total Impresiones', value: stats.totalViews, sub: 'Clics en destinos', icon: 'visibility', color: 'text-on-primary-container' },
            { label: 'Eventos en Agenda', value: stats.totalEvents, sub: `${stats.activeEvents} próximos`, icon: 'event', color: 'text-tertiary-fixed-dim' },
            { label: 'Alertas Activas', value: stats.totalAlerts, sub: 'Notificaciones emitidas', icon: 'notifications_active', color: 'text-error' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[#181818] rounded-lg p-7 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
              <span className={`material-symbols-outlined text-4xl ${kpi.color} opacity-20 absolute right-4 top-4`}>{kpi.icon}</span>
              <p className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-4">{kpi.label}</p>
              <p className={`text-5xl font-black font-headline tracking-tighter ${kpi.color}`}>
                {loading ? '—' : kpi.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/30 mt-3 uppercase font-black tracking-wider">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">

          {/* ── TOP DESTINOS POR IMPRESIONES ── */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-[#181818] rounded-lg border border-white/5 overflow-hidden shadow-2xl h-full">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Top Destinos por Impresiones</h2>
                  <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Datos reales · municipio_banners</p>
                </div>
                <Link to="/municipio/turismo" className="text-[9px] font-black text-secondary-container uppercase tracking-widest hover:brightness-110 transition-all">
                  Ver todos →
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {topBanners.length === 0 && (
                  <p className="text-center py-16 text-white/20 font-black text-[10px] uppercase tracking-widest">
                    {loading ? 'Cargando destinos...' : 'No hay destinos registrados'}
                  </p>
                )}
                {topBanners.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-6 px-8 py-5 hover:bg-white/[0.03] transition-all group">
                    <span className="text-2xl font-black text-white/10 font-headline w-6 shrink-0">#{i + 1}</span>
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white uppercase italic tracking-tighter truncate">{b.title}</p>
                      <p className="text-[10px] text-white/40 mt-1 font-black uppercase tracking-widest">{b.category || 'General'} · {b.canton || 'Cuenca'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black font-headline text-secondary-container italic">{(b.views || 0).toLocaleString()}</p>
                      <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-1">impresiones</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${b.active ? 'bg-secondary-container shadow-[0_0_10px]' : 'bg-white/10'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ALERTAS RECIENTES ── */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-[#181818] rounded-lg border border-white/5 overflow-hidden shadow-2xl h-full">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Alertas Recientes</h2>
                  <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">municipio_notifications</p>
                </div>
                <Link to="/municipio/notifications" className="text-[9px] font-black text-tertiary-fixed-dim uppercase tracking-widest hover:brightness-110 transition-all">
                  Ver todas →
                </Link>
              </div>
              <div className="divide-y divide-white/5 overflow-y-auto max-h-[420px]">
                {alerts.length === 0 && (
                  <p className="text-center py-16 text-white/20 font-black text-[10px] uppercase tracking-widest">
                    {loading ? 'Cargando alertas...' : 'No hay alertas activas'}
                  </p>
                )}
                {alerts.map(a => (
                  <div key={a.id} className={`flex gap-5 px-6 py-5 border-l-4 hover:bg-white/[0.03] transition-all ${a.type === 'error' ? 'border-error' : 'border-primary-container'}`}>
                    <span className={`material-symbols-outlined text-2xl mt-0.5 shrink-0 ${a.type === 'error' ? 'text-error' : 'text-on-primary-container'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {a.type === 'error' ? 'error' : 'info'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white uppercase italic tracking-tight leading-snug">{a.title}</p>
                      <p className="text-[10px] text-white/40 mt-2 leading-relaxed uppercase line-clamp-2">{a.message}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-[8px] font-black px-2.5 py-1 uppercase rounded-full tracking-widest ${a.status === 'RESUELTO' ? 'bg-white/5 text-white/30' : 'bg-tertiary-container/20 text-tertiary-fixed-dim'}`}>
                          {a.status || 'ACTIVO'}
                        </span>
                        <span className="text-[9px] text-white/20 font-black uppercase">{a.location || ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PRÓXIMOS EVENTOS ── */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-[#181818] rounded-lg border border-white/5 overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Próximos Eventos en Agenda</h2>
                  <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Datos reales · municipio_events</p>
                </div>
                <Link to="/municipio/agenda" className="text-[9px] font-black text-tertiary-fixed-dim uppercase tracking-widest hover:brightness-110 transition-all">
                  Gestionar →
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {upcomingEvents.length === 0 && (
                  <p className="text-center py-16 text-white/20 font-black text-[10px] uppercase tracking-widest">
                    {loading ? 'Cargando eventos...' : 'No hay eventos próximos'}
                  </p>
                )}
                {upcomingEvents.map(ev => (
                  <div key={ev.id} className={`flex items-center gap-6 px-8 py-5 border-l-4 hover:bg-white/[0.03] transition-all ${ev.alert ? 'border-error' : 'border-primary-container'}`}>
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      {ev.imageUrl
                        ? <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-white/20">event</span></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        {ev.alert && <span className="material-symbols-outlined text-error text-sm">warning</span>}
                        <span className="text-[9px] font-black uppercase tracking-widest text-on-primary-container bg-primary-container/10 px-2.5 py-1 rounded-full">{ev.category || 'General'}</span>
                      </div>
                      <p className="text-sm font-black text-white uppercase italic tracking-tight truncate">{ev.title}</p>
                      <p className="text-[10px] text-white/30 mt-1 uppercase font-black tracking-widest">{ev.canton || 'Cuenca'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-black text-white/60 uppercase tracking-widest">
                        {ev.datetime ? new Date(ev.datetime).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }) : '—'}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1 uppercase font-black">
                        {ev.datetime ? new Date(ev.datetime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PROYECTOS ── */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-[#181818] rounded-lg border border-white/5 overflow-hidden shadow-2xl h-full">
              <div className="px-8 py-6 border-b border-white/5">
                <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Proyectos de Infraestructura</h2>
                <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">municipio_projects</p>
              </div>
              <div className="p-6 space-y-5">
                {projects.length === 0 && (
                  <p className="text-center py-10 text-white/20 font-black text-[10px] uppercase tracking-widest">Sin proyectos registrados</p>
                )}
                {projects.map(p => (
                  <div key={p.id} className="flex items-center gap-5 p-4 bg-white/[0.03] rounded-lg border border-white/5 hover:border-white/10 transition-all group">
                    <div className="w-11 h-11 bg-[#111] rounded-lg flex items-center justify-center border border-white/5 shrink-0">
                      <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg">{p.icon || 'construction'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-white uppercase italic tracking-tight truncate">{p.nombre}</p>
                      <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-tertiary-fixed-dim to-tertiary-container rounded-full transition-all duration-700"
                          style={{ width: `${p.avance || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-lg font-black font-headline text-white/70 italic shrink-0">{p.avance || 0}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RESUMEN GLOBAL ── */}
          <div className="col-span-12">
            <div className="bg-[#181818] rounded-lg border border-white/5 p-8">
              <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] italic mb-8">Resumen Global · Plataforma Municipal</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Destinos Registrados', value: stats.totalBanners, icon: 'place', color: 'text-secondary-container' },
                  { label: 'Destinos Activos (Visibles)', value: stats.activeBanners, icon: 'toggle_on', color: 'text-secondary-container' },
                  { label: 'Impresiones / Clics Totales', value: stats.totalViews, icon: 'bar_chart', color: 'text-on-primary-container' },
                  { label: 'Eventos en Agenda', value: stats.totalEvents, icon: 'calendar_month', color: 'text-tertiary-fixed-dim' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-5 p-5 bg-white/[0.03] rounded-lg border border-white/5">
                    <span className={`material-symbols-outlined text-3xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{s.label}</p>
                      <p className={`text-3xl font-black font-headline italic tracking-tighter mt-1 ${s.color}`}>{loading ? '—' : s.value.toLocaleString()}</p>
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
}

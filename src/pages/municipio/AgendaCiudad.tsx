import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function AgendaCiudad() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'municipio_events'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
        if (selectedEvent.id) {
            await updateDoc(doc(db, 'municipio_events', selectedEvent.id), {
                ...selectedEvent,
                updatedAt: serverTimestamp()
            });
        } else {
            await addDoc(collection(db, 'municipio_events'), {
                ...selectedEvent,
                createdAt: serverTimestamp()
            });
        }
        setSelectedEvent(null);
        alert("Evento sincronizado con la Agenda Urbana");
    } catch (err) { alert("Error al guardar"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar este evento de la agenda oficial?")) {
        await deleteDoc(doc(db, 'municipio_events', id));
        setSelectedEvent(null);
    }
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col overflow-hidden font-body">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131313]/40 backdrop-blur-xl border-b border-[#e5e2e1]/15 shadow-[0_20px_50px_rgba(255,179,177,0.08)]">
        <div className="flex items-center gap-12 h-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#ff535b] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#5b000e] text-lg">account_balance</span>
            </div>
            <div className="text-xl font-manrope font-black tracking-tighter text-[#ffb3b1] uppercase leading-tight">MUNICIPIO DE CUENCA</div>
          </div>
          <nav className="flex items-center gap-8 h-full text-[10px] font-black uppercase tracking-widest">
            <Link className="text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors" to="/municipio/dashboard">Panel de Control</Link>
            <Link className="text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors" to="/municipio/turismo">Gestión Turística</Link>
            <Link className="text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors" to="/municipio/data-intel">Inteligencia de Datos</Link>
            <Link className="text-[#ffb3b1] border-b-2 border-[#ff535b] font-black pb-1" to="/municipio/agenda">Agenda de la Ciudad</Link>
          </nav>
        </div>
        <div className="flex items-center gap-8">
          <div className="relative hidden md:block">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#e4bebc]/30 text-sm">search</span>
            <input className="bg-[#0e0e0e] border-none rounded-sm py-3 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest w-72 h-10 text-[#e5e2e1]" placeholder="Buscar eventos..." type="text"/>
          </div>
          <button className="bg-[#ff535b] text-[#5b000e] px-6 py-2 rounded-sm font-black text-[9px] tracking-[0.2em] uppercase shadow-lg shadow-[#ff535b]/20">EMERGENCIA</button>
        </div>
      </header>

      <main className="mt-20 w-full flex flex-1 overflow-hidden bg-[#131313]">
        <div className="flex-1 flex overflow-hidden">
          <section className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <div className="mb-16">
              <h1 className="text-5xl font-black tracking-tighter text-[#e5e2e1] mb-2 uppercase italic">Gestor de la Agenda Urbana</h1>
              <p className="text-[#e4bebc]/40 font-black tracking-widest uppercase text-[10px] italic">Supervisión y programación de hitos metropolitanos.</p>
            </div>

            <div className="space-y-20 pb-24">
              <div>
                <div className="flex items-center gap-6 mb-10">
                  <span className="text-xs font-black tracking-[0.4em] text-[#ffb3b1] uppercase">PRÓXIMOS HITOS</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid gap-6">
                  {events.map(event => (
                    <div key={event.id} onClick={() => setSelectedEvent(event)} className={`bg-[#1c1b1b] p-8 flex gap-8 relative overflow-hidden group hover:bg-[#201f1f] transition-all border-l-4 cursor-pointer shadow-2xl ${event.alert ? 'border-[#ff535b]' : 'border-[#3cd7ff]'}`}>
                      <div className="w-40 h-40 flex-shrink-0 bg-[#0e0e0e] overflow-hidden rounded-sm border border-white/5">
                        <img alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={event.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCwrp5oGdS6J7ajgGCniIXoVIsqavOBGraWFXjwUzaFISuGVhBzS19EvYtYMlq9FVvZZugjEPyVea0LlR6Zq9fHPrzeQiWhe8eBr4Lcu8gYFwSBnl_asu7swhy-JhDJ7Gir2PsyRO8M66Fbtfn90-Lh8SN9OP8rs-QpdE2npJK89LhKxIyzAEuVDyqyQPv4tbTatmAOHGcUJHPwmjkuJk1IKeTFkwTuk0KRcXd81tOWw5HYjZLAqAwDvM2Ay4lbyR54tBFBHlpa0Ho"}/>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className={`px-4 py-1.5 text-[9px] font-black tracking-widest uppercase rounded-sm inline-flex items-center gap-2 ${event.alert ? 'bg-[#ff535b]/10 text-[#ffb3b1]' : 'bg-[#3cd7ff]/10 text-[#3cd7ff]'}`}>
                              {event.alert && <span className="material-symbols-outlined text-[14px]">warning</span>}
                              {event.category || 'General'}
                            </div>
                            <span className="text-[10px] font-mono text-[#e4bebc]/20 uppercase">ID: CNK-{event.id.slice(0,4)}</span>
                          </div>
                          <h3 className="text-2xl font-black text-[#e5e2e1] uppercase italic tracking-tighter">{event.title}</h3>
                        </div>
                        <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-[#e4bebc]/60">
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span> {event.time || '19:00 - 22:00'}</span>
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> {event.location || 'Distrito Central'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && <p className="text-center py-20 opacity-20 uppercase font-black text-xs tracking-widest">Sincronizando Agenda Urbana...</p>}
                </div>
              </div>
            </div>
          </section>

          <aside className="w-[500px] bg-[#0e0e0e] border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-10">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black tracking-tighter text-[#e5e2e1] uppercase italic">Editor de Eventos</h2>
                {selectedEvent && (
                    <button onClick={() => setSelectedEvent(null)} className="text-[#e4bebc]/40 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                )}
              </div>
              <form onSubmit={handleSave} className="space-y-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Título del Evento</label>
                  <input required className="w-full bg-[#1c1b1b] border-0 border-b-2 border-[#ffdb3c]/20 py-4 px-0 text-xl font-black text-[#e5e2e1] uppercase italic tracking-tighter focus:ring-0 focus:border-[#ffdb3c] outline-none" type="text" value={selectedEvent?.title || ''} onChange={e => setSelectedEvent({...selectedEvent, title: e.target.value})}/>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Categoría</label>
                    <select className="w-full bg-[#1c1b1b] border-0 border-b-2 border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] p-4 focus:ring-0" value={selectedEvent?.category || 'Cultura'} onChange={e => setSelectedEvent({...selectedEvent, category: e.target.value})}>
                      <option>Cultura</option>
                      <option>Movilidad</option>
                      <option>Ambiente</option>
                      <option>Social</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input checked={selectedEvent?.alert || false} onChange={e => setSelectedEvent({...selectedEvent, alert: e.target.checked})} type="checkbox" className="sr-only peer"/>
                      <div className="w-10 h-5 bg-[#353534] peer-checked:bg-[#ff535b] rounded-full transition-all">
                        <div className={`w-3 h-3 bg-white rounded-full mt-1 ml-1 transition-all ${selectedEvent?.alert ? 'translate-x-5' : ''}`}></div>
                      </div>
                      <span className="ml-3 text-[9px] font-black tracking-widest text-[#e4bebc]/50 uppercase">Alerta Vial</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Fecha / Hora</label>
                    <input className="w-full bg-[#1c1b1b] border-0 border-b-2 border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] p-4" type="text" value={selectedEvent?.time || ''} onChange={e => setSelectedEvent({...selectedEvent, time: e.target.value})} placeholder="Ej: 15 Oct, 10:00 AM"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Ubicación</label>
                    <input className="w-full bg-[#1c1b1b] border-0 border-b-2 border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] p-4" type="text" value={selectedEvent?.location || ''} onChange={e => setSelectedEvent({...selectedEvent, location: e.target.value})} placeholder="Ej: Parque Calderón"/>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Descripción Técnica</label>
                  <textarea className="w-full bg-[#1c1b1b] border-0 border-b-2 border-white/5 text-[11px] font-black uppercase tracking-widest text-[#e4bebc]/60 p-4 min-h-[150px]" value={selectedEvent?.description || ''} onChange={e => setSelectedEvent({...selectedEvent, description: e.target.value})}></textarea>
                </div>

                <div className="pt-10 flex gap-4">
                  <button className="flex-1 bg-[#ffdb3c] text-[#221b00] py-5 font-black text-xs tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all shadow-2xl" type="submit">
                    Guardar Cambios
                  </button>
                  {selectedEvent?.id && (
                    <button onClick={() => handleDelete(selectedEvent.id)} className="px-8 border border-white/10 text-[#ff535b] hover:bg-[#ff535b]/10 transition-all rounded-sm flex items-center" type="button">
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="mt-auto p-10 bg-[#1c1b1b]/30">
               <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <div className="text-[8px] font-black tracking-[0.3em] text-[#e4bebc]/20 uppercase mb-2">ÚLTIMA SINCRONIZACIÓN</div>
                    <div className="text-[9px] font-mono text-[#e4bebc]/40 italic">2024.10.14 | 22:15:09</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black tracking-[0.3em] text-[#e4bebc]/20 uppercase mb-2">OPERADOR ACTIVO</div>
                    <div className="text-[9px] font-mono text-[#e4bebc]/40 italic">USR_MUNICIPAL_ADMIN</div>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </main>

      <button onClick={() => setSelectedEvent({ title: '', category: 'Cultura', alert: false })} className="fixed bottom-10 right-10 w-16 h-16 bg-[#ff535b] text-[#5b000e] flex items-center justify-center rounded-sm shadow-[0_20px_50px_rgba(255,83,91,0.4)] hover:scale-110 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}

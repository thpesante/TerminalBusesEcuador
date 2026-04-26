import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AgendaCiudad() {
  const { userData } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showMassiveModal, setShowMassiveModal] = useState(false);
  const [massiveData, setMassiveData] = useState<any[]>([]);
  const [isMassiveSaving, setIsMassiveSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'municipio_events'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDownloadTemplate = () => {
    const headers = ["Titulo", "Categoria", "Alerta(SI/NO)", "Fecha", "Ubicacion", "Descripcion", "UrlImagen"];
    const data = [
      ["Ejemplo Evento", "Cultura", "NO", "2026-12-31T20:00", "Parque Central", "Un evento increible", "https://ejemplo.com/img.jpg"]
    ];
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
      XLSX.writeFile(wb, "plantilla_agenda.xlsx");
    });
  };

  const handleMassiveUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const XLSX = await import('xlsx');
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      const previewData: any[] = [];
      for (let i = 1; i < data.length; i++) {
        const cols = data[i];
        if (!cols || cols.length === 0) continue;
        
        if (cols.length >= 1) {
          previewData.push({
            title: cols[0] || '',
            category: cols[1] || 'Cultura',
            alert: (cols[2] || '').toString().toUpperCase() === "SI",
            datetime: cols[3] || '',
            location: cols[4] || '',
            description: cols[5] || '',
            imageUrl: cols[6] || ''
          });
        }
      }
      setMassiveData(previewData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveMassive = async () => {
    if (massiveData.length === 0) return;
    setIsMassiveSaving(true);
    try {
      for (const item of massiveData) {
        await addDoc(collection(db, 'municipio_events'), {
           ...item,
           canton: userData?.canton || 'Cuenca',
           createdAt: serverTimestamp()
        });
      }
      alert("Eventos creados exitosamente");
      setShowMassiveModal(false);
      setMassiveData([]);
    } catch (e) {
      alert("Error al crear eventos masivamente");
    } finally {
      setIsMassiveSaving(false);
    }
  };

  const handleEmergencyTrigger = async () => {
    try {
      await addDoc(collection(db, 'municipio_notifications'), {
        title: 'ALERTA MUNICIPAL: AGENDA URBANA',
        message: 'Reporte de emergencia asociado a los eventos de la agenda urbana. Desplegando agentes de movilidad.',
        type: 'error',
        level: 'NIVEL CRÍTICO 1',
        status: 'ACTIVO',
        location: 'Distrito Central',
        createdAt: serverTimestamp()
      });
      alert("ALERTA DE EMERGENCIA GENERADA - NOTIFICACIÓN ENVIADA AL COMANDO CENTRAL");
    } catch (e) {
      alert("Error al emitir alerta de emergencia");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const storageRef = ref(storage, `agenda/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSelectedEvent({ ...selectedEvent, imageUrl: url });
    } catch (err) {
      console.error(err);
      alert("Error al subir imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!selectedEvent.title || !selectedEvent.datetime || !selectedEvent.location || !selectedEvent.description || !selectedEvent.imageUrl) {
        alert("Por favor rellene todos los campos obligatorios y suba una imagen de manera obligatoria.");
        return;
    }
    
    try {
        if (selectedEvent.id) {
            await updateDoc(doc(db, 'municipio_events', selectedEvent.id), {
                ...selectedEvent,
                updatedAt: serverTimestamp()
            });
        } else {
            await addDoc(collection(db, 'municipio_events'), {
                ...selectedEvent,
                canton: userData?.canton || 'Cuenca',
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

  const now = new Date();
  const sortedEvents = events
    .map(ev => ({ ...ev, isExpired: new Date(ev.datetime) < now }))
    .sort((a, b) => {
        if (a.isExpired === b.isExpired) return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        return a.isExpired ? 1 : -1;
    });

  return (
    <div className="bg-[#0d0d0d] text-[#e5e2e1] min-h-screen flex flex-col overflow-hidden font-body">
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
            <Link className="text-tertiary-fixed-dim border-b-2 border-tertiary-container pb-1" to="/municipio/agenda">Agenda</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/notifications">Notificaciones</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/perfil">Perfil</Link>
          </nav>
        </div>
        <button onClick={handleEmergencyTrigger} className="px-5 h-9 bg-tertiary-container text-on-tertiary font-headline font-black text-[9px] tracking-widest uppercase rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-lg">Emergencia</button>
      </header>

      <main className="mt-20 w-full flex flex-1 overflow-hidden bg-[#131313]">
        <div className="flex-1 flex overflow-hidden">
          <section className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-[#e5e2e1] mb-2 uppercase italic">Gestor de la Agenda Urbana</h1>
                <p className="text-[#e4bebc]/40 font-black tracking-widest uppercase text-[10px] italic">Supervisión y programación de hitos metropolitanos.</p>
              </div>
              {!selectedEvent && (
                  <div className="flex gap-4">
                      <button onClick={() => setShowMassiveModal(true)} className="bg-[#3cd7ff] text-[#0b3842] px-8 py-4 flex items-center gap-3 font-black text-xs tracking-widest rounded-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(60,215,255,0.2)] uppercase italic">
                          <span className="material-symbols-outlined">table_view</span>
                          Crear Masivo
                      </button>
                      <button onClick={() => setSelectedEvent({ title: '', category: 'Cultura', alert: false })} className="bg-[#ff535b] text-[#5b000e] px-8 py-4 flex items-center gap-3 font-black text-xs tracking-widest rounded-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,83,91,0.2)] uppercase italic">
                          <span className="material-symbols-outlined">add_circle</span>
                          Nuevo Evento
                      </button>
                  </div>
              )}
            </div>

            <div className="space-y-20 pb-24">
              <div>
                <div className="flex items-center gap-6 mb-10">
                  <span className="text-xs font-black tracking-[0.4em] text-[#ffb3b1] uppercase">PRÓXIMOS HITOS</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>

                {loading ? (
                    <p className="text-center py-20 opacity-20 uppercase font-black text-xs tracking-widest">Sincronizando Agenda Urbana...</p>
                ) : (
                    <div className="grid gap-6">
                      {sortedEvents.map(event => (
                        <div key={event.id} className={`bg-[#1c1b1b] p-8 flex gap-8 relative overflow-hidden group hover:bg-[#201f1f] transition-all border-l-4 shadow-2xl ${event.isExpired ? 'border-gray-600 opacity-50' : event.alert ? 'border-[#ff535b]' : 'border-[#3cd7ff]'}`}>
                          
                          <button 
                             onClick={() => setSelectedEvent(event)} 
                             className="absolute top-4 right-4 w-10 h-10 bg-white/5 hover:bg-[#ffdb3c] hover:text-[#221b00] rounded-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                             title="Editar evento"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>

                          <div className="w-40 h-40 flex-shrink-0 bg-[#0e0e0e] overflow-hidden rounded-sm border border-white/5 relative">
                            {event.isExpired && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 font-black text-[#ff535b] tracking-widest text-[10px] uppercase">Expirado</div>}
                            <img alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={event.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCwrp5oGdS6J7ajgGCniIXoVIsqavOBGraWFXjwUzaFISuGVhBzS19EvYtYMlq9FVvZZugjEPyVea0LlR6Zq9fHPrzeQiWhe8eBr4Lcu8gYFwSBnl_asu7swhy-JhDJ7Gir2PsyRO8M66Fbtfn90-Lh8SN9OP8rs-QpdE2npJK89LhKxIyzAEuVDyqyQPv4tbTatmAOHGcUJHPwmjkuJk1IKeTFkwTuk0KRcXd81tOWw5HYjZLAqAwDvM2Ay4lbyR54tBFBHlpa0Ho"}/>
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <div className={`px-4 py-1.5 text-[9px] font-black tracking-widest uppercase rounded-sm inline-flex items-center gap-2 ${event.isExpired ? 'bg-gray-600/10 text-gray-400' : event.alert ? 'bg-[#ff535b]/10 text-[#ffb3b1]' : 'bg-[#3cd7ff]/10 text-[#3cd7ff]'}`}>
                                  {event.alert && <span className="material-symbols-outlined text-[14px]">warning</span>}
                                  {event.category || 'General'}
                                </div>
                                <span className="text-[10px] font-mono text-[#e4bebc]/20 uppercase">ID: CNK-{event.id.slice(0,4)}</span>
                              </div>
                              <h3 className="text-2xl font-black text-[#e5e2e1] uppercase italic tracking-tighter pr-12">{event.title}</h3>
                            </div>
                            <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-[#e4bebc]/60">
                              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span> {event.datetime ? new Date(event.datetime).toLocaleString() : 'Sin Fecha'}</span>
                              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> {event.location || 'Distrito Central'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {events.length === 0 && <p className="text-center py-20 opacity-20 uppercase font-black text-xs tracking-widest">No hay eventos en la agenda.</p>}
                    </div>
                )}
              </div>
            </div>
          </section>

          {selectedEvent && (
            <aside className="w-[500px] flex-shrink-0 bg-[#0e0e0e] border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-40 relative">
              <div className="p-10">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-2xl font-black tracking-tighter text-[#e5e2e1] uppercase italic">Editor de Eventos</h2>
                  <button onClick={() => setSelectedEvent(null)} className="text-[#e4bebc]/40 hover:text-white transition-colors">
                      <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleSave} className="space-y-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Título del Evento *</label>
                    <input required className="w-full bg-[#1c1b1b] border-0 border-b-2 border-[#ffdb3c]/20 py-4 px-4 text-xl font-black text-[#e5e2e1] uppercase italic tracking-tighter focus:ring-0 focus:border-[#ffdb3c] outline-none" type="text" value={selectedEvent?.title || ''} onChange={e => setSelectedEvent({...selectedEvent, title: e.target.value})}/>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Categoría *</label>
                      <select required className="w-full bg-[#1c1b1b] border-0 border-b-2 border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] p-4 focus:ring-0 outline-none" value={selectedEvent?.category || 'Cultura'} onChange={e => setSelectedEvent({...selectedEvent, category: e.target.value})}>
                        <option value="Cultura">Cultura</option>
                        <option value="Movilidad">Movilidad</option>
                        <option value="Ambiente">Ambiente</option>
                        <option value="Social">Social</option>
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
                      <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Fecha / Hora *</label>
                      <input required className="w-full bg-[#1c1b1b] border-0 border-b-2 border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] p-4 outline-none" type="datetime-local" value={selectedEvent?.datetime || ''} onChange={e => setSelectedEvent({...selectedEvent, datetime: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Ubicación *</label>
                      <input required className="w-full bg-[#1c1b1b] border-0 border-b-2 border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] p-4 outline-none" type="text" value={selectedEvent?.location || ''} onChange={e => setSelectedEvent({...selectedEvent, location: e.target.value})} placeholder="Ej: Parque Calderón"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic">Descripción Técnica *</label>
                    <textarea required className="w-full bg-[#1c1b1b] border-0 border-b-2 border-white/5 text-[11px] font-black uppercase tracking-widest text-[#e4bebc]/60 p-4 min-h-[150px] outline-none" value={selectedEvent?.description || ''} onChange={e => setSelectedEvent({...selectedEvent, description: e.target.value})}></textarea>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase italic mb-2 block">Imagen del Evento (Elegante) *</label>
                    <div className="flex flex-col gap-4">
                        {selectedEvent?.imageUrl && (
                            <img src={selectedEvent.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-sm border border-white/10" />
                        )}
                        <label className="bg-[#1c1b1b] hover:bg-[#201f1f] text-[#ffb3b1] border border-[#ff535b]/20 px-4 py-3 text-center cursor-pointer font-black text-[9px] tracking-[0.2em] uppercase rounded-sm transition-all duration-300 w-full flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">image</span>
                            {isUploading ? 'Subiendo...' : (selectedEvent?.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen Obligatoria')}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading}/>
                        </label>
                    </div>
                  </div>

                  <div className="pt-10 flex gap-4">
                    <button className="flex-1 bg-[#ffdb3c] text-[#221b00] py-5 font-black text-xs tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all shadow-2xl disabled:opacity-50" disabled={isUploading} type="submit">
                      Guardar Evento
                    </button>
                    {selectedEvent?.id && (
                      <button onClick={() => handleDelete(selectedEvent.id)} className="px-8 border border-white/10 text-[#ff535b] hover:bg-[#ff535b]/10 transition-all rounded-sm flex items-center" type="button">
                          <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </aside>
          )}
        </div>
      </main>

      {showMassiveModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-[#0e0e0e] border border-white/10 w-full max-w-5xl max-h-[85vh] rounded-xl flex flex-col shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#1c1b1b] rounded-t-xl">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Creación Masiva de Eventos</h2>
              <button onClick={() => { setShowMassiveModal(false); setMassiveData([]); }} className="text-white/50 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 flex-1 overflow-auto custom-scrollbar space-y-8">
              <div className="flex gap-8 items-start">
                <div className="flex-1 bg-[#1c1b1b] p-6 rounded-xl border border-white/5">
                  <h3 className="text-sm font-black text-[#ffbd3c] mb-4 uppercase tracking-widest">1. Descargar Formulario</h3>
                  <p className="text-xs text-white/50 mb-6">Descarga el archivo excel (.xlsx), complétalo sin modificar la cabecera y guárdalo.</p>
                  <button type="button" onClick={handleDownloadTemplate} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg flex items-center gap-3 text-xs font-bold transition-all border border-white/10">
                    <span className="material-symbols-outlined text-lg">download</span>
                    Descargar Plantilla Excel
                  </button>
                </div>
                
                <div className="flex-1 bg-[#1c1b1b] p-6 rounded-xl border border-white/5">
                  <h3 className="text-sm font-black text-[#3cd7ff] mb-4 uppercase tracking-widest">2. Cargar Información</h3>
                  <p className="text-xs text-white/50 mb-6">Sube el archivo .xlsx con los datos completados. Verifica la vista previa antes de guardar.</p>
                  <label className="bg-[#3cd7ff] hover:brightness-110 text-[#0b3842] px-6 py-3 rounded-lg flex items-center justify-center gap-3 text-xs font-black uppercase cursor-pointer transition-all w-fit shadow-lg">
                    <span className="material-symbols-outlined text-lg">upload</span>
                    Subir Archivo Excel
                    <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleMassiveUploadFile} />
                  </label>
                </div>
              </div>

              {massiveData.length > 0 && (
                <div className="bg-[#1c1b1b] rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Vista Previa ({massiveData.length} eventos)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-white/5 text-white/50 font-black uppercase tracking-widest">
                        <tr>
                          <th className="p-4">Título</th>
                          <th className="p-4">Categoría</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Ubicación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-white/80 divide-white/5">
                        {massiveData.map((d, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="p-4">{d.title}</td>
                            <td className="p-4">{d.category}</td>
                            <td className="p-4">{d.datetime}</td>
                            <td className="p-4">{d.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-[#1c1b1b] rounded-b-xl flex justify-end gap-4">
              <button type="button" onClick={() => { setShowMassiveModal(false); setMassiveData([]); }} className="px-6 py-3 text-white/60 hover:text-white font-bold text-xs">Cancelar</button>
              <button 
                type="button"
                onClick={handleSaveMassive} 
                disabled={massiveData.length === 0 || isMassiveSaving} 
                className="bg-[#ff535b] disabled:opacity-50 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-black text-xs uppercase shadow-lg shadow-[#ff535b]/20"
              >
                {isMassiveSaving ? 'Guardando...' : 'Crear Eventos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

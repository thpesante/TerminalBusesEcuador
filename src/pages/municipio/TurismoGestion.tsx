import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TurismoGestion() {
  const { userData } = useAuth();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDest, setSelectedDest] = useState<any>(null);
  const [stats, setStats] = useState({ activeCount: 0, totalViews: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('');
  const [customCategory, setCustomCategory] = useState(false);
  const [showMassiveModal, setShowMassiveModal] = useState(false);
  const [massiveData, setMassiveData] = useState<any[]>([]);
  const [isMassiveSaving, setIsMassiveSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'municipio_banners'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDestinations(list);
      
      const active = list.filter((b: any) => b.active).length;
      const views = list.reduce((acc, curr) => acc + (curr.views || 0), 0);
      setStats({ activeCount: active, totalViews: views });
    });
    return () => unsub();
  }, []);

  const handleDownloadTemplate = () => {
    const headers = ["Titulo", "Categoria", "Descripcion", "ComoLlegar", "UrlMapa", "Horarios", "UrlImagen"];
    const data = [
      ["Ejemplo Destino", "Naturaleza", "Un lugar hermoso", "En bus desde central", "https://maps.google.com/ejemplo", "/horarios/ejemplo", "https://ejemplo.com/img.jpg"]
    ];
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
      XLSX.writeFile(wb, "plantilla_turismo.xlsx");
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
            category: cols[1] || 'Naturaleza',
            description: cols[2] || '',
            directions: cols[3] || '',
            mapUrl: cols[4] || '',
            schedule: cols[5] || '',
            imageUrl: cols[6] || '',
            active: true,
            views: 0,
            amenities: []
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
        await addDoc(collection(db, 'municipio_banners'), {
           ...item,
           canton: userData?.canton || 'Cuenca',
           createdAt: serverTimestamp()
        });
      }
      alert("Destinos creados exitosamente");
      setShowMassiveModal(false);
      setMassiveData([]);
    } catch (e) {
      alert("Error al crear destinos masivamente");
    } finally {
      setIsMassiveSaving(false);
    }
  };

  const handleEmergencyTrigger = async () => {
    try {
      await addDoc(collection(db, 'municipio_notifications'), {
        title: 'ALERTA MUNICIPAL: ZONA TURÍSTICA',
        message: 'Reporte de emergencia en zona de alta afluencia turística. Coordinando con centros de atención.',
        type: 'error',
        level: 'NIVEL CRÍTICO 1',
        status: 'ACTIVO',
        location: 'Red Turística Cuenca',
        createdAt: serverTimestamp()
      });
      alert("ALERTA DE EMERGENCIA GENERADA - NOTIFICACIÓN ENVIADA AL COMANDO CENTRAL");
    } catch (e) {
      alert("Error al emitir alerta de emergencia");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'municipio_banners', id), { active: !currentStatus });
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('¿Eliminar este destino turístico?')){
        await deleteDoc(doc(db, 'municipio_banners', id));
        setSelectedDest(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSelectedDest({...selectedDest, imageUrl: url});
    } catch (err) {
      console.error(err);
      alert("Error al subir banner: " + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleAmenity = (name: string) => {
    const amenities = selectedDest?.amenities || [];
    if (amenities.includes(name)) {
        setSelectedDest({...selectedDest, amenities: amenities.filter((a: string) => a !== name)});
    } else {
        setSelectedDest({...selectedDest, amenities: [...amenities, name]});
    }
  };

  const addCustomAmenity = () => {
    if(!customAmenity.trim()) return;
    const amenities = selectedDest?.amenities || [];
    if (!amenities.includes(customAmenity.trim())) {
      setSelectedDest({...selectedDest, amenities: [...amenities, customAmenity.trim()]});
    }
    setCustomAmenity('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedDest) return;

    if(!selectedDest.title || !selectedDest.description || !selectedDest.directions || !selectedDest.imageUrl) {
        alert("Por favor complete los campos obligatorios: Nombre, Sobre el destino, Cómo llegar e Imagen de Banner");
        return;
    }

    try {
        const destData = {
           ...selectedDest,
           category: selectedDest.category || 'Naturaleza',
           views: selectedDest.views || 0,
           active: selectedDest.active ?? true,
           amenities: selectedDest.amenities || [],
           canton: userData?.canton || 'Cuenca',
        };

        if (selectedDest.id) {
            await updateDoc(doc(db, 'municipio_banners', selectedDest.id), {
                ...destData,
                updatedAt: serverTimestamp()
            });
        } else {
            await addDoc(collection(db, 'municipio_banners'), {
                ...destData,
                createdAt: serverTimestamp()
            });
        }
        setSelectedDest(null);
        alert("Destino guardado y publicado en la sección de Turismo!");
    } catch (err) {
        alert("Error al guardar destino");
    }
  };

  const defaultAmenities = ['Estadía', 'Comida', 'Fotos'];
  const commonCategories = ['Naturaleza', 'Arquitectura', 'Comida', 'Cultura', 'Publicidad', 'Actividades', 'Deportes'];

  return (
    <div className="bg-[#0d0d0d] text-[#e5e2e1] min-h-screen flex flex-col font-body h-screen overflow-hidden">
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
            <Link className="text-tertiary-fixed-dim border-b-2 border-tertiary-container pb-1" to="/municipio/turismo">Turismo</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/data-intel">Datos</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/agenda">Agenda</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/notifications">Notificaciones</Link>
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/perfil">Perfil</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={handleEmergencyTrigger} className="px-4 h-9 bg-[#ff535b] text-[#5b000e] font-manrope font-black tracking-widest text-[9px] rounded-sm shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase">Emergencia</button>
        </div>
      </header>

      <main className="flex-1 flex mt-20 w-full overflow-hidden bg-[#131313]">
        <section className="flex-1 p-10 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="text-[#ffb3b1] font-label text-[10px] tracking-[0.2em] font-bold uppercase mb-2 block italic">Módulo de Promoción Regional</span>
              <h1 className="text-5xl font-black tracking-tighter text-[#e5e2e1] uppercase italic">Gestión Turística <span className="text-[#ffb3b1]">y Destinos</span></h1>
            </div>
            
            <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
              {!selectedDest && (
                <div className="flex gap-4">
                  <button onClick={() => setShowMassiveModal(true)} className="bg-[#ffdb3c] text-[#221b00] px-8 py-4 flex items-center gap-3 font-black text-xs tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,219,60,0.3)] uppercase">
                      <span className="material-symbols-outlined">table_view</span>
                      Crear Masivo
                  </button>
                  <button onClick={() => { setSelectedDest({ category: 'Naturaleza' }); setCustomCategory(false); }} className="bg-[#3cd7ff] text-[#0b3842] px-8 py-4 flex items-center gap-3 font-black text-xs tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(60,215,255,0.3)] uppercase">
                      <span className="material-symbols-outlined">add_circle</span>
                      Nuevo Destino
                  </button>
                </div>
              )}
              <div className="flex gap-10 bg-[#1c1b1b] p-6 rounded-xl border border-[#353534]/30 shadow-2xl">
                  <div className="text-right border-r border-[#353534] pr-10">
                     <div className="text-[9px] text-[#e4bebc]/50 uppercase font-black tracking-widest">Impacto / Clics Totales</div>
                     <div className="text-3xl font-black text-[#3cd7ff] italic tracking-tighter">{stats.totalViews}</div>
                  </div>
                  <div className="text-right">
                     <div className="text-[9px] text-[#e4bebc]/50 uppercase font-black tracking-widest">Destinos Activos</div>
                     <div className="text-3xl font-black text-[#ffe16d] italic tracking-tighter">{stats.activeCount}</div>
                  </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-10 pb-20">
            {destinations.map(banner => (
              <article key={banner.id} className="group relative bg-[#1c1b1b] overflow-hidden rounded-[2rem] transition-all duration-500 hover:translate-y-[-8px] border border-[#353534]/30 shadow-2xl flex flex-col">
                <div className="h-[300px] relative overflow-hidden">
                  <img alt={banner.title} className="w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-100" src={banner.imageUrl || 'https://via.placeholder.com/800x600?text=Sin+Imagen'}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/20 to-transparent"></div>
                  
                  <div className="absolute top-6 left-6">
                    <span className="py-1.5 px-4 rounded-full bg-[#ffdb3c] text-[#221b00] text-[9px] font-black uppercase tracking-widest shadow-lg">
                      {banner.category || 'Naturaleza'}
                    </span>
                  </div>

                  <button 
                     onClick={(e) => { e.stopPropagation(); setSelectedDest(banner); }}
                     className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-[#ffdb3c] hover:text-[#221b00] rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                  >
                     <span className="material-symbols-outlined">edit</span>
                  </button>

                  <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-md">{banner.title}</h3>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                        <p className="text-sm text-[#e5e2e1]/70 leading-relaxed font-medium line-clamp-2">{banner.description}</p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-[#353534] flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <span className="material-symbols-outlined text-[#ff535b] text-xl">visibility</span>
                            <div>
                                <p className="text-[9px] font-black text-[#e4bebc]/40 tracking-widest uppercase">Impresiones/Clics</p>
                                <p className="text-lg font-black text-white italic">{banner.views || 0}</p>
                            </div>
                        </div>

                        <button onClick={() => handleToggleActive(banner.id, banner.active)} className="relative inline-flex items-center cursor-pointer ml-auto">
                            <div className={`w-12 h-6 rounded-full transition-all ${banner.active ? 'bg-[#ff535b]' : 'bg-[#353534]'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${banner.active ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>
              </article>
            ))}
            
            {destinations.length === 0 && <div className="col-span-full text-center py-20 text-[#e4bebc]/30 uppercase font-black text-xs tracking-widest">Aún no hay destinos registrados</div>}
          </div>
        </section>

        {selectedDest && (
            <aside className="w-[600px] flex-shrink-0 bg-[#0e0e0e] border-l border-[#353534] flex flex-col overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.8)] z-40 relative">
               <div className="p-10">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-black tracking-tighter text-[#e5e2e1] uppercase italic">Editor Turístico</h2>
                        <button onClick={() => setSelectedDest(null)} className="text-[#e4bebc]/40 hover:text-[#ff535b] transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#ff535b]/10">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-10">
                        {/* Img Upload First */}
                        <div className="space-y-3">
                            <div className="h-48 w-full border-2 border-dashed border-[#353534] rounded-2xl overflow-hidden relative group">
                                {selectedDest.imageUrl ? (
                                    <img src={selectedDest.imageUrl} alt="Banner" className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#e4bebc]/30">
                                        <span className="material-symbols-outlined text-4xl mb-2">image</span>
                                        <span className="text-[10px] font-black tracking-widest uppercase">Sin Banner</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="bg-[#ffdb3c] text-[#221b00] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        {isUploading ? 'Subiendo...' : 'Seleccionar Imagen *'}
                                    </span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading}/>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase">Nombre del Destino *</label>
                                <input required className="w-full bg-[#1c1b1b] border-0 border-b-2 border-[#ffdb3c]/20 py-4 px-4 text-xl font-black text-[#e5e2e1] focus:border-[#ffdb3c] outline-none placeholder:text-[#e5e2e1]/20 font-serif italic" type="text" value={selectedDest.title || ''} onChange={e => setSelectedDest({...selectedDest, title: e.target.value})} placeholder="Ej. Parque Nacional Cajas" />
                            </div>

                            <div className="col-span-2 space-y-3">
                                <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase">Categoría</label>
                                {!customCategory ? (
                                    <div className="flex items-center gap-4 border-b-2 border-white/5 pb-2">
                                        <select className="flex-1 bg-transparent border-0 text-sm font-black uppercase tracking-widest text-[#ffb3b1] focus:ring-0 outline-none appearance-none" value={selectedDest.category || 'Naturaleza'} onChange={e => setSelectedDest({...selectedDest, category: e.target.value})}>
                                            {commonCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <button type="button" onClick={() => setCustomCategory(true)} className="text-[9px] px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 font-bold uppercase tracking-widest">Otra</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <input className="w-full bg-[#1c1b1b] border-0 border-b-2 border-[#3cd7ff] py-3 text-sm font-black text-[#e5e2e1] outline-none" type="text" placeholder="Escribe categoría (1ra letra Mayúscula)" value={selectedDest.category || ''} onChange={e => {
                                            const val = e.target.value;
                                            const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                                            setSelectedDest({...selectedDest, category: capitalized});
                                        }} autoFocus/>
                                        <button type="button" onClick={() => { setCustomCategory(false); setSelectedDest({...selectedDest, category: 'Naturaleza'}); }} className="self-end text-[9px] text-[#ff535b] font-bold uppercase">Volver a lista</button>
                                    </div>
                                )}
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase">Sobre el destino *</label>
                                <textarea required className="w-full h-24 bg-[#1c1b1b] rounded-xl border border-white/5 p-4 text-sm text-[#e5e2e1]/80 outline-none focus:border-[#ffb3b1]/50 resize-none font-medium leading-relaxed" placeholder="Ej. Más de 200 lagunas glaciares en un entorno de páramo místico..." value={selectedDest.description || ''} onChange={e => setSelectedDest({...selectedDest, description: e.target.value})}></textarea>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase">Cómo llegar *</label>
                                <textarea required className="w-full h-20 bg-[#1c1b1b] rounded-xl border border-white/5 p-4 text-sm text-[#e5e2e1]/80 outline-none focus:border-[#ffdb3c]/50 resize-none font-medium leading-relaxed" placeholder="Ej. A solo 45 min de Cuenca. Salen buses directos cada hora..." value={selectedDest.directions || ''} onChange={e => setSelectedDest({...selectedDest, directions: e.target.value})}></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase">Ver Ruta en Mapa (URL)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-[#e4bebc]/30">map</span>
                                    <input className="w-full bg-[#1c1b1b] rounded-lg border border-white/5 py-3 pl-10 pr-3 text-xs text-[#e5e2e1] outline-none focus:border-[#ffb3b1]" type="url" placeholder="Google Maps URL" value={selectedDest.mapUrl || ''} onChange={e => setSelectedDest({...selectedDest, mapUrl: e.target.value})}/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase">Buscar Horarios (Link / Texto)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-[#e4bebc]/30">schedule</span>
                                    <input className="w-full bg-[#1c1b1b] rounded-lg border border-white/5 py-3 pl-10 pr-3 text-xs text-[#e5e2e1] outline-none focus:border-[#3cd7ff]" type="text" placeholder="/horarios/cajas o URL" value={selectedDest.schedule || ''} onChange={e => setSelectedDest({...selectedDest, schedule: e.target.value})}/>
                                </div>
                            </div>

                            <div className="col-span-2 space-y-4 pt-4 border-t border-[#353534]">
                                <label className="text-[10px] font-black tracking-widest text-[#e4bebc]/30 uppercase">Amenidades</label>
                                <div className="flex gap-3 flex-wrap">
                                    {defaultAmenities.concat(
                                      (selectedDest.amenities || []).filter((a:string) => !defaultAmenities.includes(a))
                                    ).map((amenity: string) => {
                                        const isSelected = (selectedDest.amenities || []).includes(amenity);
                                        return (
                                            <button 
                                              type="button"
                                              key={amenity}
                                              onClick={() => toggleAmenity(amenity)}
                                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-[#ffb3b1] text-[#5b000e]' : 'bg-[#1c1b1b] text-[#e4bebc]/50 border border-white/5 hover:border-white/20'}`}
                                            >
                                                {isSelected && <span className="material-symbols-outlined text-[10px] mr-1 align-text-top">check</span>}
                                                {amenity}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <input 
                                       type="text" 
                                       value={customAmenity} 
                                       onChange={e => setCustomAmenity(e.target.value)} 
                                       placeholder="Escribe otra amenidad..."
                                       onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                                       className="flex-1 bg-[#1c1b1b] border border-white/5 py-2 px-4 rounded-xl text-xs text-white outline-none focus:border-[#3cd7ff]"
                                    />
                                    <button type="button" onClick={addCustomAmenity} className="w-10 h-10 bg-[#3cd7ff] rounded-xl text-[#0b3842] flex items-center justify-center hover:brightness-110">
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex gap-4">
                            <button className="flex-1 bg-[#ff535b] text-white py-5 rounded-2xl font-black text-xs tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,83,91,0.3)] min-w-[200px]" type="submit" disabled={isUploading}>
                                {isUploading ? 'Guardando...' : 'Guardar y Publicar'}
                            </button>
                            {selectedDest.id && (
                                <button type="button" onClick={() => handleDelete(selectedDest.id)} className="w-[80px] border border-[#ff535b]/30 text-[#ff535b] hover:bg-[#ff535b]/10 transition-all rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            )}
                        </div>
                    </form>
               </div>
            </aside>
        )}
      </main>

      {showMassiveModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-[#0e0e0e] border border-white/10 w-full max-w-5xl max-h-[85vh] rounded-[2rem] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#1c1b1b]">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Creación Masiva de Destinos</h2>
              <button onClick={() => { setShowMassiveModal(false); setMassiveData([]); }} className="text-white/50 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 flex-1 overflow-auto custom-scrollbar space-y-8">
              <div className="flex gap-8 items-start">
                <div className="flex-1 bg-[#1c1b1b] p-6 rounded-[1.5rem] border border-white/5">
                  <h3 className="text-sm font-black text-[#ffbd3c] mb-4 uppercase tracking-widest">1. Descargar Formulario</h3>
                  <p className="text-xs text-white/50 mb-6">Descarga el archivo excel (.xlsx), complétalo sin modificar la cabecera y guárdalo.</p>
                  <button type="button" onClick={handleDownloadTemplate} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border border-white/10">
                    <span className="material-symbols-outlined text-lg">download</span>
                    Descargar Plantilla Excel
                  </button>
                </div>
                
                <div className="flex-1 bg-[#1c1b1b] p-6 rounded-[1.5rem] border border-white/5">
                  <h3 className="text-sm font-black text-[#3cd7ff] mb-4 uppercase tracking-widest">2. Cargar Información</h3>
                  <p className="text-xs text-white/50 mb-6">Sube el archivo .xlsx con los datos completados. Verifica la vista previa antes de guardar.</p>
                  <label className="bg-[#3cd7ff] hover:brightness-110 text-[#0b3842] px-6 py-3 rounded-xl flex items-center justify-center gap-3 text-xs font-black uppercase cursor-pointer transition-all w-fit shadow-lg">
                    <span className="material-symbols-outlined text-lg">upload</span>
                    Subir Archivo Excel
                    <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleMassiveUploadFile} />
                  </label>
                </div>
              </div>

              {massiveData.length > 0 && (
                <div className="bg-[#1c1b1b] rounded-[1.5rem] border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Vista Previa ({massiveData.length} destinos)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-white/5 text-white/50 font-black uppercase tracking-widest">
                        <tr>
                          <th className="p-4">Título</th>
                          <th className="p-4">Categoría</th>
                          <th className="p-4">Cómo Llegar</th>
                          <th className="p-4">Horarios</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-white/80 divide-white/5">
                        {massiveData.map((d, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="p-4">{d.title}</td>
                            <td className="p-4">{d.category}</td>
                            <td className="p-4">{d.directions.substring(0,20)}...</td>
                            <td className="p-4">{d.schedule}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-[#1c1b1b] flex justify-end gap-4">
              <button type="button" onClick={() => { setShowMassiveModal(false); setMassiveData([]); }} className="px-6 py-3 text-white/60 hover:text-white font-bold text-xs">Cancelar</button>
              <button 
                type="button"
                onClick={handleSaveMassive} 
                disabled={massiveData.length === 0 || isMassiveSaving} 
                className="bg-[#ff535b] disabled:opacity-50 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase shadow-lg shadow-[#ff535b]/20"
              >
                {isMassiveSaving ? 'Guardando...' : 'Crear Destinos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

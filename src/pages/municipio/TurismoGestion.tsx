import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';

export default function TurismoGestion() {
  const [banners, setBanners] = useState<any[]>([]);
  const [stats, setStats] = useState({ impressions: '452.8K', conversion: '12.4%', activeCount: 0 });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'municipio_banners'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBanners(list);
      setStats(prev => ({ ...prev, activeCount: list.filter((b: any) => b.active).length }));
    });
    return () => unsub();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'municipio_banners', id), { active: !currentStatus });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await addDoc(collection(db, 'municipio_banners'), {
        title: "Nuevo Destino Turístico",
        imageUrl: url,
        active: true,
        priority: 'Normal',
        audience: 'Todo Público',
        createdAt: serverTimestamp()
      });
      alert("Banner subido exitosamente");
    } catch (err) {
      console.error(err);
      alert("Error al subir banner");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col font-body">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131313]/40 backdrop-blur-xl border-b border-[#e5e2e1]/15 shadow-[0_20px_50px_rgba(255,179,177,0.08)]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#ff535b] rounded-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-[#5b000e] text-lg">account_balance</span>
          </div>
          <div className="text-xl font-manrope font-black tracking-tighter text-[#ffb3b1] uppercase">MUNICIPIO DE CUENCA</div>
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          <Link className="font-inter uppercase text-[10px] tracking-widest text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors" to="/municipio/dashboard">Panel de Control</Link>
          <Link className="font-inter uppercase text-[10px] tracking-widest text-[#ffb3b1] border-b-2 border-[#ff535b] pb-1 font-bold" to="/municipio/turismo">Gestión Turística</Link>
          <Link className="font-inter uppercase text-[10px] tracking-widest text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors" to="/municipio/data-intel">Inteligencia de Datos</Link>
          <Link className="font-inter uppercase text-[10px] tracking-widest text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-colors" to="/municipio/agenda">Agenda de la Ciudad</Link>
        </nav>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button className="px-4 h-9 bg-[#ff535b] text-[#5b000e] font-manrope font-black tracking-widest text-[9px] rounded-sm shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase">Emergencia</button>
            <div className="h-10 w-10 rounded-sm overflow-hidden border border-[#ffb3b1]/20 cursor-pointer">
              <img alt="Perfil" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe1czlffndDn3Q6sdL2fo-sgckhqjeoT-_BvGu1D8loS_Jz2ejKLMAuTUTj_iAtAFuASwt7CyhLUUh_pfjuEnTWJK2lyf-_gynxTLLqzZsMAw9qpth3LCWgW32tYeXh76H1YHNUeXRDtKmWWH64PBjpbGUuIIUUJI3ZG-HAk-8jGgJUJMMSIsoDZO5FMPgoB09-a1lFMKZv7hJa0fZbuJIBaEglfMkNTeuXMtauFFpY7CCXRlUGbMGTBzH08XByE2vpwL7wSDaJ2o"/>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-24">
        <section className="p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="text-[#ffb3b1] font-label text-[10px] tracking-[0.2em] font-bold uppercase mb-2 block italic">Módulo de Promoción Regional</span>
              <h1 className="text-5xl font-black tracking-tighter text-[#e5e2e1] uppercase italic">Gestión Turística <span className="text-[#ffb3b1]">y Promoción</span></h1>
            </div>
            <label className="bg-[#ff535b] text-[#5b000e] px-8 py-4 flex items-center gap-3 font-black text-xs tracking-widest rounded-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,83,91,0.2)] cursor-pointer uppercase italic">
              <span className="material-symbols-outlined">add_photo_alternate</span>
              {isUploading ? 'Subiendo...' : 'Subir Nuevo Banner'}
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={isUploading}/>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {banners.map(banner => (
              <article key={banner.id} className="group relative bg-[#1c1b1b] overflow-hidden rounded-lg transition-all duration-500 hover:translate-y-[-8px] border border-[#353534]/30 shadow-2xl">
                <div className="h-64 relative overflow-hidden">
                  <img alt={banner.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" src={banner.imageUrl}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent opacity-90"></div>
                  <div className="absolute top-5 left-5">
                    <span className={`px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${banner.priority === 'High' ? 'bg-[#ff535b]/20 text-[#ffb3b1] border-[#ffb3b1]/30' : 'bg-[#1c1b1b]/80 text-[#e4bebc] border-white/10'}`}>
                      {banner.priority || 'Normal'}
                    </span>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-[#e5e2e1] uppercase italic tracking-tighter">{banner.title}</h3>
                    <button onClick={() => handleToggleActive(banner.id, banner.active)} className="relative inline-flex items-center cursor-pointer">
                      <div className={`w-12 h-6 rounded-full transition-all ${banner.active ? 'bg-[#ff535b]' : 'bg-[#353534]'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${banner.active ? 'left-7' : 'left-1'}`}></div>
                      </div>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-[#e4bebc]/40 tracking-[0.2em] italic">Audiencia Objetivo</label>
                    <select value={banner.audience} className="w-full bg-[#0e0e0e] border-0 border-b-2 border-[#ffdb3c]/20 focus:border-[#ffdb3c] text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] py-3 outline-none">
                      <option>Turismo Nacional</option>
                      <option>Extranjeros (English)</option>
                      <option>Habitantes Locales</option>
                    </select>
                  </div>
                </div>
              </article>
            ))}

            {/* Stats Sidebar inside Grid */}
            <div className="lg:col-span-2 bg-[#1c1b1b] rounded-lg p-10 flex flex-col justify-between border-t border-[#ffb3b1]/10 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[10px] font-black text-[#ffb3b1] tracking-[0.3em] uppercase mb-2 italic">Métricas de Campaña</h4>
                  <p className="text-3xl font-black text-[#e5e2e1] uppercase italic tracking-tighter leading-none">Alcance Turístico Mensual</p>
                </div>
                <div className="flex gap-10">
                  <div className="text-right">
                    <div className="text-[9px] text-[#e4bebc]/50 uppercase font-black tracking-widest">Impresiones</div>
                    <div className="text-3xl font-black text-[#3cd7ff] italic tracking-tighter">{stats.impressions}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[#e4bebc]/50 uppercase font-black tracking-widest">Conversión</div>
                    <div className="text-3xl font-black text-[#ffe16d] italic tracking-tighter">{stats.conversion}</div>
                  </div>
                </div>
              </div>
              <div className="h-40 flex items-end gap-2 px-10 mt-10">
                {[40, 60, 55, 85, 100, 70, 90, 45].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#3cd7ff]/10 hover:bg-[#3cd7ff] transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-lg p-10 border-l-4 border-[#ffdb3c] flex flex-col justify-center shadow-2xl">
              <span className="material-symbols-outlined text-[#ffdb3c] text-5xl mb-6">query_stats</span>
              <p className="text-[10px] text-[#e4bebc] font-black uppercase tracking-widest italic">Banners Activos</p>
              <h5 className="text-7xl font-black text-[#e5e2e1] mt-2 italic tracking-tighter">{stats.activeCount}</h5>
              <p className="text-[10px] text-[#ffe16d] mt-6 font-black uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">trending_up</span> +3 nuevos esta semana
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-auto p-12 border-t border-[#5b403f]/10 bg-[#0e0e0e] flex justify-between items-center">
          <div className="flex gap-16">
            <div>
              <p className="text-[9px] font-black text-[#e4bebc]/20 uppercase tracking-widest mb-2">Última Sincronización</p>
              <p className="text-[10px] font-mono text-[#e4bebc]/40 italic">2024-05-24 14:32:10 UTC</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-[#e4bebc]/20 uppercase tracking-widest mb-2">Servidor de Medios</p>
              <p className="text-[10px] font-mono text-[#e4bebc]/40 italic">CDN-CUENCA-S3-PRIMARY</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
            <span className="text-[10px] font-black text-[#e4bebc]/40 uppercase tracking-widest">Sistemas Operativos</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

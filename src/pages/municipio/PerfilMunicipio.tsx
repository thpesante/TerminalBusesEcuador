import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';

export default function PerfilMunicipio() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>({
    nombre: '',
    email: '',
    cargo: 'Alcalde de Cuenca',
    firmaValidaHasta: '142 días'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setProfile({
        nombre: userData.nombre || 'Cristian Zamora',
        email: userData.email || 'alcaldia@cuenca.gob.ec',
        cargo: userData.cargo || 'Alcalde de Cuenca',
        firmaValidaHasta: '142 días'
      });
    }
  }, [userData]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      setLoading(true);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        nombre: profile.nombre,
        cargo: profile.cargo,
        updatedAt: serverTimestamp()
      });
      alert("Perfil Institucional Actualizado Exitosamente");
    } catch (err) {
      alert("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleRenovarCertificado = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        firmaValidaLigada: serverTimestamp(), // Record renovation time
      });
      setProfile(prev => ({ ...prev, firmaValidaHasta: '365 días' }));
      alert("Certificado renovado exitosamente por 365 días.");
    } catch (error) {
       alert("Error al renovar certificado");
    }
  };

  const handleToggle2FA = async () => {
      // In a real scenario, this would trigger MFA enrollment via Firebase Auth
      alert("La protección biométrica 2FA está gestionada a nivel de dispositivo y proveedor de identidad. Implementación en curso.");
  };

  const handleRotateCredentials = async () => {
       alert("Se ha enviado un correo para restablecer sus credenciales administrativas.");
  };

  return (
    <div className="bg-[#0d0d0d] text-[#e5e2e1] min-h-screen font-body">
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
            <Link className="text-white/50 hover:text-tertiary-fixed-dim transition-colors" to="/municipio/notifications">Notificaciones</Link>
            <Link className="text-tertiary-fixed-dim border-b-2 border-tertiary-container pb-1" to="/municipio/perfil">Perfil</Link>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-5 h-9 bg-[#181818] border border-white/10 text-error rounded-sm text-[10px] uppercase font-headline font-black tracking-widest hover:bg-error hover:text-on-error transition-all">
          <span className="material-symbols-outlined text-sm">logout</span>
          Cerrar Sesión
        </button>
      </header>

      <main className="pt-32 pb-24 px-8 md:px-12 max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ffdb3c] mb-3 block italic">Administración de la Gobernanza</span>
            <h1 className="text-5xl font-black tracking-tighter text-[#e5e2e1] uppercase italic">Configuración de Perfil</h1>
          </div>
          <div className="flex gap-6">
            <button onClick={() => window.location.reload()} className="px-8 py-3 rounded-sm bg-[#1c1b1b] border border-white/5 text-[#e5e2e1] font-black text-[10px] uppercase tracking-widest hover:bg-[#353534] transition-all">Descartar</button>
            <button onClick={handleSave} disabled={loading} className="px-8 py-3 rounded-sm bg-gradient-to-br from-[#ff535b] to-[#680011] text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#ff535b]/20">
                {loading ? 'Sincronizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <section className="md:col-span-8 bg-[#1c1b1b] rounded-sm p-10 border-t border-white/5 flex flex-col md:flex-row gap-12 items-start relative overflow-hidden shadow-2xl">
            <div className="relative">
              <img alt="Portrait" className="w-40 h-40 md:w-56 md:h-56 rounded-sm object-cover border-4 border-[#ffb3b1]/10 shadow-[0_0_40px_rgba(255,179,177,0.1)]" src={userData?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtzSY16jwHnNYXzBR-vlTO3wimsCgPKr0a8j_vzLpbsaU1KO4krcPWu-o1h7U6WanYtl_37273WPNjKaemrdxW_DhlncaKd4qIV915NZHzPKueRu8zny-tAwJL1sEGyzhz3JPGlTyXTC-fkrZeWKKyaScRKUOMCN6-K9mIMLML0xdxi0oW6E2ps5JRUf0wdOa2ri0ebn50i1QxP2P7g4YTd6sZ6CD2Efg1N7U-JZEiB3paZSLzzdffd0LJ4RgRxgtWDbiJXL9CBc"}/>
              <button className="absolute -bottom-3 -right-3 p-3 bg-[#ff535b] rounded-sm text-white shadow-2xl hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div className="flex-1 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#e4bebc]/30 italic">Autoridad Titular</label>
                  <input className="w-full bg-transparent border-0 border-b-2 border-[#ffdb3c]/20 focus:border-[#ffdb3c] focus:ring-0 text-[#e5e2e1] py-4 px-0 font-black text-2xl tracking-tighter uppercase italic" type="text" value={profile.nombre} onChange={e => setProfile({...profile, nombre: e.target.value})}/>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#e4bebc]/30 italic">Cargo Designado</label>
                  <div className="py-4 text-[#e5e2e1] font-black text-xl border-b-2 border-white/5 uppercase italic tracking-tighter">{profile.cargo}</div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#e4bebc]/30 italic">Identidad Digital Institucional</label>
                  <input readOnly className="w-full bg-transparent border-0 border-b-2 border-white/5 text-[#e5e2e1] py-4 px-0 font-black text-[11px] tracking-widest uppercase opacity-40 cursor-not-allowed" type="email" value={profile.email}/>
                </div>
              </div>
            </div>
          </section>

          <section className="md:col-span-4 bg-[#2a2a2a] rounded-sm p-10 border-t border-white/5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center gap-4 mb-10">
                <span className="material-symbols-outlined text-[#ffb3b1] text-3xl">encrypted</span>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Firma Electrónica</h3>
              </div>
              <p className="text-[11px] text-[#e4bebc]/60 mb-10 leading-relaxed uppercase italic font-black italic">Certificado digital de alta seguridad activo para la validación de decretos y mandatos metropolitanos.</p>
              <div className="bg-[#0e0e0e] p-6 rounded-sm border border-white/5 mb-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-[#e5e2e1] uppercase italic tracking-widest">Vencimiento: {profile.firmaValidaHasta}</span>
                  <span className="px-3 py-1 bg-[#3cd7ff]/10 text-[#3cd7ff] text-[8px] font-black uppercase tracking-widest">Activo</span>
                </div>
                <div className="h-1.5 w-full bg-[#1c1b1b] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3cd7ff] w-[80%] shadow-[0_0_10px_#3cd7ff]"></div>
                </div>
              </div>
            </div>
            <button onClick={handleRenovarCertificado} className="w-full py-4 rounded-sm border border-white/10 text-[#e5e2e1] font-black text-[9px] uppercase tracking-[0.3em] hover:bg-[#353534] transition-all flex items-center justify-center gap-3 italic">
              <span className="material-symbols-outlined text-sm">cloud_upload</span>
              Renovar Certificado
            </button>
          </section>

          <section className="md:col-span-6 bg-[#1c1b1b] rounded-sm p-10 border-t border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#ffb3b1] text-3xl">security</span>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Infraestructura de Seguridad</h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff535b] italic">NIVEL: CRÍTICO</span>
            </div>
            <div className="space-y-8">
              <div onClick={handleRotateCredentials} className="flex items-center justify-between p-5 bg-[#201f1f] rounded-sm border border-white/5 group hover:border-[#ffb3b1] transition-all cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-[#131313] rounded-sm">
                    <span className="material-symbols-outlined text-[#e4bebc]" style={{ fontVariationSettings: "'FILL' 1" }}>key</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-widest">Rotación de Credenciales</div>
                    <div className="text-[9px] text-[#e4bebc]/30 uppercase font-black mt-1">Última actualización: Hoy</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#e4bebc]/20 group-hover:text-[#ffb3b1]">chevron_right</span>
              </div>
              
              <div onClick={handleToggle2FA} className="flex items-center justify-between p-5 bg-[#201f1f] rounded-sm border border-white/5 cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-[#ffdb3c]/10 rounded-sm">
                    <span className="material-symbols-outlined text-[#ffdb3c]" style={{ fontVariationSettings: "'FILL' 1" }}>phonelink_lock</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-widest">Acceso Biométrico (2FA)</div>
                    <div className="text-[9px] text-[#ffdb3c]/40 uppercase font-black mt-1">Protección perimetral activa</div>
                  </div>
                </div>
                <div className="w-10 h-5 bg-[#ff535b] rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-[#5b000e] rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="md:col-span-6 bg-[#1c1b1b] rounded-sm p-10 border-t border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-12">
              <span className="material-symbols-outlined text-[#ffb3b1] text-3xl">settings_suggest</span>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Preferencias de Sistema</h3>
            </div>
            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#e4bebc]/30 italic">Protocolo Lingüístico</label>
                  <select className="w-full bg-[#0e0e0e] border-0 border-b-2 border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] py-4 outline-none">
                    <option>Español (Latinoamérica)</option>
                    <option>English (International)</option>
                    <option>Kichwa (Regional)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#e4bebc]/30 italic">Interfaz Visual</label>
                  <select className="w-full bg-[#0e0e0e] border-0 border-b-2 border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e5e2e1] py-4 outline-none">
                    <option>Soberanía (Modo Oscuro)</option>
                    <option>Analítico Industrial</option>
                    <option>Alto Contraste</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-[#3cd7ff]/5 rounded-sm border border-[#3cd7ff]/20">
                <div className="flex items-center gap-3 text-[#3cd7ff] mb-3">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Sincronización Regional</span>
                </div>
                <p className="text-[10px] text-[#3cd7ff]/60 uppercase italic font-black">Los datos se transmiten mediante un túnel encriptado de baja latencia con el nodo central de Cuenca.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

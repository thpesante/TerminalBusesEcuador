import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../../firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function PerfilMunicipio() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Basic Profile State
  const [profile, setProfile] = useState<any>({ nombre: '', email: '', cargo: 'Gestión de Datos' });

  // Modal States
  const [showPassModal, setShowPassModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  // Form States
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passStep, setPassStep] = useState(1); // 1: Verify, 2: New Pass

  const [currentEmailPass, setCurrentEmailPass] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailStep, setEmailStep] = useState(1);

  const [twoFACode, setTwoFACode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [twoFAStep, setTwoFAStep] = useState(1); // 1: Info, 2: Verify

  // Banner States
  const [banners, setBanners] = useState<any[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (userData) {
      setProfile({
        nombre: userData.name || userData.nombre || 'Administrador',
        email: userData.email || '',
        cargo: 'Gestión de Datos',
      });
    }
    const unsubBanners = onSnapshot(collection(db, 'bannerterminal'), (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubBanners();
  }, [userData]);

  // --- RE-AUTHENTICATION HELPER ---
  const reauthenticate = async (password: string) => {
    if (!auth.currentUser || !auth.currentUser.email) return false;
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (error) {
      alert("Contraseña actual incorrecta.");
      return false;
    }
  };

  // --- PASSWORD FLOW ---
  const handleVerifyPass = async () => {
    setLoading(true);
    const success = await reauthenticate(currentPass);
    if (success) setPassStep(2);
    setLoading(false);
  };

  const handleChangePass = async () => {
    if (newPass !== confirmPass) return alert("Las contraseñas no coinciden.");
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPass);
        alert("¡Contraseña cambiada con éxito!");
        setShowPassModal(false);
        setPassStep(1);
        setCurrentPass(''); setNewPass(''); setConfirmPass('');
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  // --- EMAIL FLOW ---
  const handleVerifyEmailPass = async () => {
    setLoading(true);
    const success = await reauthenticate(currentEmailPass);
    if (success) setEmailStep(2);
    setLoading(false);
  };

  const handleChangeEmail = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, newEmail);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { email: newEmail });
        alert("¡Correo electrónico actualizado con éxito!");
        setShowEmailModal(false);
        setEmailStep(1);
        setCurrentEmailPass(''); setNewEmail('');
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  // --- 2FA FLOW (SIMULATED FB STYLE) ---
  const handleStart2FA = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setTwoFAStep(2);
    console.log("DEBUG: Código 2FA enviado al correo:", code);
    alert(`Se ha enviado un código de 6 dígitos a ${profile.email} (Simulado: ${code})`);
  };

  const handleVerify2FA = async () => {
    if (twoFACode === sentCode) {
      setLoading(true);
      const userRef = doc(db, 'users', auth.currentUser?.uid || '');
      await updateDoc(userRef, { twoFAEnabled: true });
      alert("¡Autenticación de dos pasos activada correctamente!");
      setShow2FAModal(false);
      setTwoFAStep(1);
      setLoading(false);
    } else {
      alert("Código incorrecto.");
    }
  };

  // --- BANNER UPLOAD ---
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    try {
      setUploadingBanner(true);
      const storageRef = ref(storage, `terminal_banners/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      await addDoc(collection(db, 'bannerterminal'), {
        url,
        nombre: file.name,
        subidoPor: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      alert("Banner subido con éxito.");
    } catch (error) {
      alert("Error al subir banner.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.replace('/');
  };

  return (
    <div className="bg-[#0d0d0d] text-[#e5e2e1] min-h-screen font-body relative">
      {/* Lightbox Preview */}
      {previewBanner && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-10 animate-in fade-in duration-300" onClick={() => setPreviewBanner(null)}>
          <img src={previewBanner} className="max-w-full max-h-full rounded-xl shadow-2xl object-contain border border-white/10" />
          <button className="absolute top-10 right-10 text-white hover:scale-125 transition-transform">
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
        </div>
      )}

      {/* MODALES DE SEGURIDAD */}
      {showPassModal && (
        <div className="fixed inset-0 z-[150] bg-[#0d0d0d]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="bg-[#1c1b1b] w-full max-w-md p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-4">
              <span className="material-symbols-outlined text-[#ff535b]">lock_reset</span>
              Cambiar Contraseña
            </h3>

            {passStep === 1 ? (
              <div className="space-y-6">
                <p className="text-[11px] text-white/40 uppercase font-black italic">Paso 1: Valida tu identidad colocando tu contraseña actual.</p>
                <input
                  type="password"
                  placeholder="Contraseña Actual"
                  className="w-full bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl text-sm font-black outline-none focus:border-[#ff535b] transition-all"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                />
                <div className="flex gap-4">
                  <button onClick={() => setShowPassModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Cancelar</button>
                  <button onClick={handleVerifyPass} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Verificar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-[11px] text-emerald-400 uppercase font-black italic">Paso 2: Identidad verificada. Ingresa tu nueva clave.</p>
                <input
                  type="password"
                  placeholder="Nueva Contraseña"
                  className="w-full bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl text-sm font-black outline-none focus:border-[#ff535b] transition-all"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirmar Nueva Contraseña"
                  className="w-full bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl text-sm font-black outline-none focus:border-[#ff535b] transition-all"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
                <button
                  disabled={!newPass || newPass !== confirmPass || loading}
                  onClick={handleChangePass}
                  className="w-full py-5 bg-[#ff535b] hover:bg-[#ff7076] disabled:opacity-20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-[#ff535b]/20"
                >
                  Confirmar Cambio
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 z-[150] bg-[#0d0d0d]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="bg-[#1c1b1b] w-full max-w-md p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-4">
              <span className="material-symbols-outlined text-[#3cd7ff]">mail</span>
              Actualizar Correo
            </h3>

            {emailStep === 1 ? (
              <div className="space-y-6">
                <p className="text-[11px] text-white/40 uppercase font-black italic">Por seguridad, confirma tu contraseña para cambiar el correo.</p>
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="w-full bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl text-sm font-black outline-none focus:border-[#3cd7ff] transition-all"
                  value={currentEmailPass}
                  onChange={(e) => setCurrentEmailPass(e.target.value)}
                />
                <div className="flex gap-4">
                  <button onClick={() => setShowEmailModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Cancelar</button>
                  <button onClick={handleVerifyEmailPass} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Verificar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-[11px] text-[#3cd7ff] uppercase font-black italic">Ingresa la nueva dirección de correo institucional.</p>
                <input
                  type="email"
                  placeholder="Nuevo Correo"
                  className="w-full bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl text-sm font-black outline-none focus:border-[#3cd7ff] transition-all"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <button
                  disabled={!newEmail || loading}
                  onClick={handleChangeEmail}
                  className="w-full py-5 bg-[#3cd7ff] text-[#0d0d0d] hover:bg-[#6be2ff] disabled:opacity-20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                >
                  Actualizar Correo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {show2FAModal && (
        <div className="fixed inset-0 z-[150] bg-[#0d0d0d]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="bg-[#1c1b1b] w-full max-w-md p-10 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
            <span className="material-symbols-outlined text-6xl text-[#ffdb3c] mb-6 animate-pulse">phonelink_lock</span>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Autenticación 2 Pasos</h3>

            {twoFAStep === 1 ? (
              <div className="space-y-8">
                <p className="text-[11px] text-white/40 uppercase font-black leading-relaxed italic">Activaremos un escudo de seguridad. Recibirás un código único en tu correo para validar cada inicio de sesión.</p>
                <button onClick={handleStart2FA} className="w-full py-5 bg-[#ffdb3c] text-[#0d0d0d] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Empezar Configuración</button>
                <button onClick={() => setShow2FAModal(false)} className="text-[9px] font-black uppercase text-white/20 tracking-widest">En otro momento</button>
              </div>
            ) : (
              <div className="space-y-8">
                <p className="text-[11px] text-[#ffdb3c] uppercase font-black italic">Ingresa el código enviado a tu correo.</p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  className="w-full bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl text-2xl font-black text-center tracking-[0.5em] outline-none focus:border-[#ffdb3c]"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                />
                <button onClick={handleVerify2FA} className="w-full py-5 bg-[#ffdb3c] text-[#0d0d0d] rounded-2xl text-[10px] font-black uppercase tracking-widest">Validar y Activar</button>
              </div>
            )}
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-tertiary-container rounded-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary-container text-lg">explore</span>
            </div>
            <div className="text-xl font-headline font-black tracking-tighter text-tertiary-fixed-dim uppercase">GESTIÓN TURÍSTICA</div>
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
        <header className="mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ffdb3c] mb-3 block italic">Centro de Control de Identidad</span>
          <h1 className="text-6xl font-black tracking-tighter text-[#e5e2e1] uppercase italic">Perfil Municipal</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* PERFIL BASICO */}
          <section className="lg:col-span-8 bg-[#1c1b1b] rounded-[2rem] p-12 border border-white/5 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden shadow-2xl">
            <div className="relative group">
              <img alt="Portrait" className="w-48 h-48 rounded-[2rem] object-cover border-4 border-[#ffb3b1]/10 shadow-2xl transition-transform group-hover:scale-105" src={userData?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtzSY16jwHnNYXzBR-vlTO3wimsCgPKr0a8j_vzLpbsaU1KO4krcPWu-o1h7U6WanYtl_37273WPNjKaemrdxW_DhlncaKd4qIV915NZHzPKueRu8zny-tAwJL1sEGyzhz3JPGlTyXTC-fkrZeWKKyaScRKUOMCN6-K9mIMLML0xdxi0oW6E2ps5JRUf0wdOa2ri0ebn50i1QxP2P7g4YTd6sZ6CD2Efg1N7U-JZEiB3paZSLzzdffd0LJ4RgRxgtWDbiJXL9CBc"} />
            </div>
            <div className="flex-1 w-full space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Autoridad Titular</label>
                  <p className="text-3xl font-black text-white uppercase italic tracking-tighter">{profile.nombre}</p>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Cargo Designado</label>
                  <p className="text-xl font-black text-[#ffdb3c] uppercase italic tracking-tighter">{profile.cargo}</p>
                </div>
              </div>
              <div className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
                <div className="bg-[#0d0d0d] px-6 py-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm text-[#3cd7ff]">verified</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{profile.email}</span>
                </div>
              </div>
            </div>
          </section>

          {/* BANNERS TERMINAL */}
          <section className="lg:col-span-4 bg-[#1c1b1b] rounded-[2rem] p-10 border border-white/5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#ffb3b1] text-3xl">gallery_thumbnail</span>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Banners Terminal</h3>
              </div>
            </div>

            <div className="flex-grow space-y-4 mb-8 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
              {banners.map(b => (
                <div key={b.id} className="group relative bg-[#0e0e0e] p-3 rounded-2xl border border-white/5 hover:border-[#ffb3b1] transition-all cursor-pointer" onClick={() => setPreviewBanner(b.url)}>
                  <div className="flex items-center gap-4">
                    <img src={b.url} className="w-12 h-12 object-cover rounded-xl" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[9px] font-black uppercase truncate text-white/80">{b.nombre}</p>
                      <p className="text-[8px] text-[#3cd7ff] uppercase font-black">Activo en Terminal</p>
                    </div>
                    <span className="material-symbols-outlined text-white/10 group-hover:text-white transition-colors">visibility</span>
                  </div>
                </div>
              ))}
            </div>

            <label className="cursor-pointer w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 border border-white/5 italic">
              <span className="material-symbols-outlined text-sm">{uploadingBanner ? 'autorenew' : 'add_photo_alternate'}</span>
              {uploadingBanner ? 'Subiendo...' : 'Añadir Banner'}
              <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} />
            </label>
          </section>

          {/* SEGURIDAD TOTAL */}
          <section className="lg:col-span-6 bg-[#1c1b1b] rounded-[2rem] p-12 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#ffb3b1] text-4xl">security</span>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Seguridad y Acceso</h3>
              </div>
              <span className="bg-[#ff535b]/10 text-[#ff535b] px-4 py-2 rounded-xl text-[10px] font-black tracking-widest italic">CRÍTICO</span>
            </div>

            <div className="space-y-6">
              <div onClick={() => { setPassStep(1); setShowPassModal(true); }} className="flex items-center justify-between p-6 bg-[#0d0d0d] rounded-2xl border border-white/5 hover:border-[#ff535b] transition-all cursor-pointer group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-[#ff535b]/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ff535b] text-3xl">vpn_key</span>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-white">Contraseña</h4>
                    <p className="text-[10px] text-white/30 uppercase font-black italic">Último cambio: Hace 30 días</p>
                  </div>
                </div>
                <button className="bg-white/5 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-[#ff535b] group-hover:text-white transition-all">Cambiar</button>
              </div>

              <div onClick={() => { setEmailStep(1); setShowEmailModal(true); }} className="flex items-center justify-between p-6 bg-[#0d0d0d] rounded-2xl border border-white/5 hover:border-[#3cd7ff] transition-all cursor-pointer group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-[#3cd7ff]/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#3cd7ff] text-3xl">alternate_email</span>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-white">Correo Institucional</h4>
                    <p className="text-[10px] text-white/30 uppercase font-black italic">{profile.email}</p>
                  </div>
                </div>
                <button className="bg-white/5 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-[#3cd7ff] group-hover:text-[#0d0d0d] transition-all">Editar</button>
              </div>

              <div onClick={() => setShow2FAModal(true)} className="flex items-center justify-between p-6 bg-[#0d0d0d] rounded-2xl border border-white/5 hover:border-[#ffdb3c] transition-all cursor-pointer group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-[#ffdb3c]/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ffdb3c] text-3xl">phonelink_lock</span>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-white">Verificación 2 Pasos</h4>
                    <p className={`text-[10px] uppercase font-black italic ${userData?.twoFAEnabled ? 'text-emerald-400' : 'text-white/30'}`}>
                      {userData?.twoFAEnabled ? 'Protección Activa' : 'Protección Inactiva'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${userData?.twoFAEnabled ? 'bg-emerald-500' : 'bg-[#ff535b]'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${userData?.twoFAEnabled ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </section>

          {/* PREFERENCIAS */}
          <section className="lg:col-span-6 bg-[#1c1b1b] rounded-[2rem] p-12 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-12">
              <span className="material-symbols-outlined text-[#ffb3b1] text-4xl">settings_suggest</span>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Preferencias de Sistema</h3>
            </div>
            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Idioma del Nodo</label>
                  <select className="w-full bg-[#0d0d0d] border border-white/5 text-[11px] font-black uppercase tracking-widest text-white p-5 rounded-2xl outline-none focus:border-[#ffdb3c] appearance-none">
                    <option>Español (Cuenca Central)</option>
                    <option>Quichua (Regional)</option>
                    <option>English (Direct Link)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Interfaz Cognitiva</label>
                  <select className="w-full bg-[#0d0d0d] border border-white/5 text-[11px] font-black uppercase tracking-widest text-white p-5 rounded-2xl outline-none focus:border-[#ffdb3c] appearance-none">
                    <option>Soberanía (Dark Edition)</option>
                    <option>Alto Impacto (Analítico)</option>
                  </select>
                </div>
              </div>

              <div className="p-8 bg-[#3cd7ff]/5 rounded-[1.5rem] border border-[#3cd7ff]/20">
                <div className="flex items-center gap-4 text-[#3cd7ff] mb-4">
                  <span className="material-symbols-outlined text-2xl">sensors</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Transmisión de Datos Segura</span>
                </div>
                <p className="text-[10px] text-[#3cd7ff]/60 uppercase italic font-black leading-relaxed">Conectado mediante túnel cuántico encriptado al servidor central de la Gobernación de Azuay.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [successMsg, setSuccessMsg] = useState('');
  const [notifState, setNotifState] = useState({ alertas: true, promociones: false, seguridad: true });
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setName(data.nombre || data.name || '');
          setPhone(data.celular || data.phone || '');
          setAddress(data.canton || '');
        }
        setIsLoading(false);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        nombre: name, celular: phone, canton: address
      });
      setSuccessMsg('¡Información actualizada correctamente!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e); alert('Error al actualizar');
    } finally { setIsSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setSuccessMsg('Correo de restablecimiento enviado. Revisa tu bandeja.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")) {
      try {
        const user = auth.currentUser;
        if (user) {
          await deleteDoc(doc(db, 'users', user.uid));
          await deleteUser(user);
          navigate('/');
        }
      } catch (e) {
        alert("Para eliminar tu cuenta debes haber iniciado sesión recientemente. Por favor, cierra sesión e ingresa de nuevo.");
      }
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-surface"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body pb-32">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-6">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="font-headline font-black text-2xl tracking-tighter text-primary uppercase">TransporteEcuador</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="material-symbols-outlined text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-all">close</button>
      </header>

      <main className="pt-24 px-4 md:px-8 max-w-4xl mx-auto text-left">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Menu */}
          <aside className="w-full md:w-64 space-y-2">
            {[
              { id: 'personal', label: 'Información Personal', icon: 'person' },
              { id: 'seguridad', label: 'Seguridad', icon: 'shield' },
              { id: 'notificaciones', label: 'Notificaciones', icon: 'notifications' },
              { id: 'viajes', label: 'Preferencias de Viaje', icon: 'airplane_ticket' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-headline font-bold text-sm ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <div className="pt-8">
              <button 
                onClick={async () => { await signOut(auth); window.location.replace('/'); }}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-error hover:bg-error/5 transition-all font-headline font-bold text-sm"
              >
                <span className="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
            {activeTab === 'personal' && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-black text-primary font-headline mb-8">Mis Datos</h2>
                <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-primary-container rounded-3xl flex items-center justify-center text-on-primary-container text-4xl font-black">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">camera_alt</span>
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{name || 'Usuario'}</h3>
                    <p className="text-slate-400 font-medium">{userData?.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg border border-emerald-100">Cédula Validada</span>
                    </div>
                  </div>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUpdate}>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-semibold"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Celular</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-semibold"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Cédula de Identidad</label>
                    <input 
                      type="text" 
                      value={userData?.cedula || ''}
                      disabled
                      className="bg-slate-50 text-slate-400 border-none rounded-2xl py-4 px-6 cursor-not-allowed font-semibold"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Canton / Ciudad</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-semibold"
                    />
                  </div>

                  {successMsg && (
                    <div className="md:col-span-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {successMsg}
                    </div>
                  )}
                  <div className="md:col-span-2 pt-8">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-primary text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 font-headline"
                    >
                      {isSaving ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'seguridad' && (
              <div className="animate-fade-in space-y-12">
                <div>
                  <h2 className="text-3xl font-black text-primary font-headline mb-4">Seguridad</h2>
                  <p className="text-slate-500 font-medium">Administra el acceso y la protección de tu cuenta.</p>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                      <div className="flex gap-4">
                        <span className="material-symbols-outlined text-primary">lock_reset</span>
                        <div>
                          <h4 className="font-bold">Contraseña</h4>
                          <p className="text-xs text-slate-400 font-medium">Cambia tu clave de acceso</p>
                        </div>
                      </div>
                      <button onClick={handleChangePassword} className="text-primary font-bold text-sm hover:underline uppercase tracking-widest">Cambiar</button>
                    </div>
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-primary">devices</span>
                      <div>
                        <h4 className="font-bold">Sesiones Activas</h4>
                        <p className="text-xs text-slate-400 font-medium">1 dispositivo conectado</p>
                      </div>
                    </div>
                    <button className="text-primary font-bold text-sm hover:underline uppercase tracking-widest">Cerrar otras</button>
                  </div>
                </div>

                <div className="pt-12 border-t border-slate-100">
                  <h3 className="text-xl font-bold text-error mb-4 font-headline uppercase tracking-widest">ZONA DE PELIGRO</h3>
                  <p className="text-slate-400 text-sm mb-6">Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.</p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="bg-error-container text-on-error-container px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-error hover:text-white transition-all"
                  >
                    ELIMINAR MI CUENTA PERMANENTEMENTE
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notificaciones' && (
              <div className="animate-fade-in space-y-8">
                <h2 className="text-3xl font-black text-primary font-headline mb-8">Notificaciones</h2>
                <div className="space-y-6">
                  {([
                    { key: 'alertas', label: 'Alertas de Viaje', desc: 'Recibe avisos sobre la llegada de tu bus.' },
                    { key: 'promociones', label: 'Promociones', desc: 'Descuentos exclusivos y ofertas de temporada.' },
                    { key: 'seguridad', label: 'Seguridad', desc: 'Alertas de inicio de sesión y cambios de cuenta.' }
                  ] as { key: keyof typeof notifState; label: string; desc: string }[]).map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-primary">{item.label}</h4>
                        <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifState(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${notifState[item.key] ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow ${notifState[item.key] ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

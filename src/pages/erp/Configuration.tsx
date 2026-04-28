import React, { useState, useEffect, useRef } from 'react';
import ERPSidebar from '../../components/erp/ERPSidebar';
import ERPTopBar from '../../components/erp/ERPTopBar';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, serverTimestamp, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { ecuadorProvinces, type Province } from '../../components/erp/ecuadorData';
import { validarCedula } from '../../utils/validators';

const getSecondaryAuth = () => {
  const name = 'SecondaryApp';
  let app;
  if (!getApps().find(a => a.name === name)) {
    app = initializeApp(auth.app.options, name);
  } else {
    app = getApp(name);
  }
  return getAuth(app);
};

const secondaryAuth = getSecondaryAuth();

interface Representative {
  identificacion: string;
  nombre: string;
}

interface Establishment {
  numeroEstablecimiento: string;
  nombreFantasiaComercial: string | null;
  direccionCompleta: string;
  estado: string;
  tipoEstablecimiento: string;
  matriz: string;
}

interface CompanyData {
  numeroRuc: string;
  razonSocial: string;
  estadoContribuyenteRuc: string;
  actividadEconomicaPrincipal: string;
  tipoContribuyente: string;
  regimen: string;
  obligadoLlevarContabilidad: string;
  agenteRetencion: string;
  contribuyenteEspecial: string;
  fechaUltimaActualizacion: string;
  representantesLegales: Representative[];
  informacionFechasContribuyente: {
    fechaInicioActividades: string;
    fechaActualizacion: string;
  };
  establecimientos: Establishment[];
}

export default function Configuration() {
  const { userData } = useAuth();
  const adminRuc = userData?.ruc_empresa || userData?.ruc || '';

  const [ruc, setRuc] = useState(adminRuc);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAllEst, setShowAllEst] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!adminRuc) return;
    const fetchConfig = async () => {
      const docRef = doc(db, 'companies', adminRuc);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as CompanyData;
        setCompanyData(data);
        if (!ruc) setRuc(data.numeroRuc);
      }
    };
    fetchConfig();
  }, [adminRuc]);

  const handleSRILookup = async () => {
    if (ruc.length !== 13) {
      setMessage({ text: 'RUC Inválido.', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: 'Consultando SRI...', type: 'info' });
    try {
      const proxyUrl = 'https://infoplacas.herokuapp.com/';
      const targetUrl = `https://aggregator.cipherbyte.ec/company/${ruc}`;
      const response = await fetch(proxyUrl + targetUrl);
      const data = await response.json();
      setCompanyData(data);
      setMessage({ text: 'Sincronización completa.', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error en conexión.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!companyData || !auth.currentUser) return;
    setLoading(true);
    try {
      const selectedRuc = companyData.numeroRuc;
      await setDoc(doc(db, 'companies', selectedRuc), { ...companyData, updatedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, 'users', auth.currentUser.uid), { 
        ruc_empresa: selectedRuc, 
        role: 'OFICINA', 
        rol: 'OFICINA',
        permissions: { 
          terminal: true, fleet: true, ticketing: true, routing: true, 
          invoicing: true, reports: true, 'cash-close': true, settings: true 
        }
      }, { merge: true });
      for (const est of companyData.establecimientos) {
        await setDoc(doc(db, 'offices', `${selectedRuc}_${est.numeroEstablecimiento}`), {
          ruc_empresa: selectedRuc, codigo: est.numeroEstablecimiento, nombre: est.nombreFantasiaComercial || companyData.razonSocial,
          direccion: est.direccionCompleta, estado: est.estado, lastSync: new Date().toISOString()
        });
      }
      setMessage({ text: '¡Configuración vinculada con éxito!', type: 'success' });
      setTimeout(() => window.location.reload(), 2000); 
    } catch (error: any) {
      setMessage({ text: `Error al vincular: ${error.message}`, type: 'error' });
    } finally { setLoading(false); }
  };

  const establishmentsToShow = showAllEst ? (companyData?.establecimientos || []) : (companyData?.establecimientos || []).slice(0, 6);

  return (
    <div className="flex bg-[#f8fafc] min-h-screen text-[#1e293b] font-body">
      <ERPSidebar activePath="/erp/settings" />
      <main className="flex-1 ml-64 pt-16">
        <ERPTopBar title="Configuración de la Empresa" />
        <div className="p-8 max-w-7xl mx-auto space-y-10">
          <header className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#00216e] text-white flex items-center justify-center shadow-2xl">
                <span className="material-symbols-outlined text-3xl">domain_verification</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase text-[#00216e] font-headline">Configuración</h1>
            </div>
            <button onClick={handleSaveToDatabase} disabled={!companyData || loading} className="bg-[#00216e] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-30">Guardar Cambios</button>
          </header>

          <section className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Consulta de RUC</label>
                <div className="flex gap-4">
                  <input value={ruc} onChange={(e) => setRuc(e.target.value)} className="flex-1 bg-slate-50 border-2 border-transparent focus:border-[#00216e]/20 rounded-2xl h-16 px-8 font-black text-2xl outline-none" />
                  <button onClick={handleSRILookup} className="px-10 bg-[#00216e] text-white rounded-2xl font-black text-xs uppercase hover:brightness-125 transition-all">Consultar</button>
                </div>
              </div>
              {companyData && (
                <div className="lg:col-span-12 p-10 bg-[#00216e]/5 rounded-[2.5rem] border border-[#00216e]/10">
                  <p className="text-4xl font-black font-headline text-[#00216e] uppercase leading-tight">{companyData.razonSocial}</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#00216e] uppercase">Sucursales SRI</h2>
              <button onClick={() => setShowAllEst(!showAllEst)} className="px-6 py-2 bg-blue-50 text-[#00216e] rounded-xl font-black text-[10px]">{showAllEst ? 'Ver Menos' : 'Ver Todo'}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {establishmentsToShow.map(est => (
                <div key={est.numeroEstablecimiento} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                   <span className="text-[10px] font-black text-[#00216e] bg-[#00216e]/10 px-3 py-1 rounded-full"># {est.numeroEstablecimiento}</span>
                   <h4 className="text-xs font-black uppercase text-slate-800 mt-4 leading-tight">{est.nombreFantasiaComercial || 'PUNTO DE VENTA'}</h4>
                </div>
              ))}
            </div>
          </section>

          <UserManagement companyRuc={adminRuc} offices={companyData?.establecimientos || []} />

          {message.text && (
            <div className="fixed bottom-10 right-10 z-[100] p-6 rounded-2xl shadow-2xl bg-white border-l-8 border-[#00216e] animate-in slide-in-from-right-10">
               <p className="text-xs font-black uppercase text-[#00216e]">{message.text}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function UserManagement({ companyRuc, offices }: { companyRuc: string, offices: Establishment[] }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Modal Temp states
  const [tempPermissions, setTempPermissions] = useState<any>({});
  const [tempEnabled, setTempEnabled] = useState(true);

  // Form states
  const [newCedula, setNewCedula] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newApellido, setNewApellido] = useState('');
  const [newFechaNac, setNewFechaNac] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newOffice, setNewOffice] = useState('');
  const [idValidated, setIdValidated] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCanton, setSelectedCanton] = useState('');

  const availableCantons = ecuadorProvinces.find(p => p.name === selectedProvince)?.cantons || [];

  const fetchUsers = async () => {
    if (!companyRuc) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('ruc_empresa', '==', companyRuc));
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { if (companyRuc) fetchUsers(); }, [companyRuc]);

  const handleOpenModal = (user: any) => {
    setEditingUser(user);
    setTempPermissions(user.permissions || {});
    setTempEnabled(user.enabled !== false);
  };

  const handleVerifyId = async () => {
    if (!validarCedula(newCedula)) {
      alert("Cédula ecuatoriana inválida (Algoritmo Módulo 10). Verifique los dígitos.");
      return;
    }
    
    try {
      const proxyUrl = 'https://infoplacas.herokuapp.com/';
      const targetUrl = 'https://si.secap.gob.ec/sisecap/logeo_web/json/busca_persona_registro_civil.php';
      const params = new URLSearchParams();
      params.append('documento', newCedula); params.append('tipo', '1');
      const response = await fetch(proxyUrl + targetUrl, { method: 'POST', body: params });
      const data = await response.json();
      if (data && data.nombres) {
        setNewNombre(data.nombres); setNewApellido(data.apellidos); setNewFechaNac(data.fechaNacimiento || '');
        setIdValidated(true);
      }
    } catch (error) { console.error(error); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idValidated) return alert("Valide cédula");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ruc_empresa: companyRuc, nombre: newNombre, apellido: newApellido, email: newEmail,
        role: 'OFICINA', officeId: newOffice, enabled: true,
        provincia: selectedProvince, canton: selectedCanton,
        permissions: { terminal: true, fleet: true, ticketing: true, routing: true, invoicing: true, reports: true, 'cash-close': true, settings: false },
        createdAt: serverTimestamp()
      });
      setShowAddForm(false); fetchUsers();
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleSavePermissions = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        enabled: tempEnabled,
        permissions: tempPermissions
      });
      fetchUsers();
      setEditingUser(null);
    } catch (error) { alert("Error al guardar"); } finally { setLoading(false); }
  };

  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between px-2">
         <h2 className="text-2xl font-black text-[#00216e] uppercase">Staff Autorizado</h2>
         <button onClick={() => setShowAddForm(!showAddForm)} className="px-8 py-4 bg-white border border-slate-200 text-[#00216e] hover:bg-[#00216e] hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase shadow-sm">
           {showAddForm ? 'Cerrar' : 'Crear Operador'}
         </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-200 animate-in slide-in-from-top-6 duration-700">
           <form onSubmit={handleCreateUser} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-[#00216e]">Cédula</label>
                  <div className="flex gap-2">
                    <input value={newCedula} onChange={(e) => setNewCedula(e.target.value)} className="flex-1 bg-slate-50 border-2 rounded-2xl h-14 px-8 font-bold outline-none font-sans" />
                    <button type="button" onClick={handleVerifyId} className="px-6 bg-[#00216e] text-white rounded-xl font-black text-[10px] uppercase">Validar</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-[#00216e]">Sucursal</label>
                  <select value={newOffice} onChange={(e) => setNewOffice(e.target.value)} className="w-full bg-slate-50 border-2 rounded-2xl h-14 px-8 font-bold outline-none font-sans appearance-none">
                    <option value="">SELECCIONAR OFICINA</option>
                    {offices.map(o => <option key={o.numeroEstablecimiento} value={o.numeroEstablecimiento}>{o.numeroEstablecimiento} - {o.nombreFantasiaComercial || 'OFI'}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-[#00216e]">Provincia</label>
                  <select 
                    value={selectedProvince} 
                    onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCanton(''); }} 
                    className="w-full bg-slate-50 border-2 rounded-2xl h-14 px-8 font-bold outline-none font-sans appearance-none"
                  >
                    <option value="">SELECCIONAR PROVINCIA</option>
                    {ecuadorProvinces.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-[#00216e]">Cantón</label>
                  <select 
                    value={selectedCanton} 
                    onChange={(e) => setSelectedCanton(e.target.value)} 
                    disabled={!selectedProvince}
                    className="w-full bg-slate-50 border-2 rounded-2xl h-14 px-8 font-bold outline-none font-sans appearance-none disabled:opacity-50"
                  >
                    <option value="">SELECCIONAR CANTÓN</option>
                    {availableCantons.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-4">
                   <label className="text-[11px] font-black uppercase text-slate-400">Nombre Completo</label>
                   <input value={`${newNombre} ${newApellido}`} readOnly className="w-full bg-slate-100 rounded-2xl h-14 px-8 font-black uppercase italic font-sans" />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                   <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="bg-slate-50 border-2 rounded-2xl h-14 px-8 font-bold font-sans text-sm" placeholder="Correo" />
                   <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="bg-slate-50 border-2 rounded-2xl h-14 px-8 font-bold font-sans text-sm" placeholder="Password" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="px-16 py-5 bg-[#00216e] text-white font-black text-xs uppercase rounded-[2rem] shadow-2xl transition-all">Registrar Acceso Operativo</button>
           </form>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sans">
        {users.map((user) => (
          <button 
            key={user.id} 
            onClick={() => handleOpenModal(user)} 
            className={`bg-white p-10 rounded-[3rem] border text-left w-full transition-all group relative overflow-hidden ${user.enabled === false ? 'opacity-50 grayscale' : 'border-slate-100 shadow-sm hover:border-[#00216e]/40'}`}
          >
             <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-3xl bg-[#00216e]/5 text-[#00216e] flex items-center justify-center font-black text-2xl shadow-inner">{user.nombre?.[0]}</div>
                <div>
                  <h4 className="text-lg font-black text-[#00216e] uppercase leading-none mb-2">{user.nombre}</h4>
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-black uppercase text-slate-400">ID: {user.cedula}</p>
                    {user.provincia && (
                      <p className="text-[9px] font-black uppercase text-blue-500/60 tracking-tight">
                        {user.provincia} • {user.canton}
                      </p>
                    )}
                  </div>
                </div>
             </div>
             <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl group-hover:bg-[#00216e]/5 transition-colors">
                <span className="text-[10px] font-black uppercase text-[#00216e] tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {user.officeId ? `Oficina ${user.officeId}` : 'Administración'}
                </span>
                <span className={`text-[9px] font-black uppercase ${user.enabled === false ? 'text-red-500' : 'text-green-500'}`}>{user.enabled === false ? 'Inactivo' : 'Activo'}</span>
             </div>
          </button>
        ))}
      </div>

      {/* Permissions Modal - Refined for Batch Saving & Accessibility */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
              <div className="p-10 bg-[#00216e] text-white flex-shrink-0">
                <div className="flex justify-between items-start">
                   <div>
                     <h3 className="text-3xl font-black font-headline uppercase leading-tight">Módulos del Sistema</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Configuración de: {editingUser.nombre} {editingUser.apellido}</p>
                   </div>
                   <button onClick={() => setEditingUser(null)} className="material-symbols-outlined hover:bg-white/10 p-2 rounded-full transition-all" aria-label="Cerrar modal">close</button>
                </div>
              </div>

              <div className="p-10 space-y-10 overflow-y-auto flex-1 custom-scrollbar">
                {/* Account Status Toggle */}
                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                   <div>
                      <p className="text-base font-black text-[#00216e] uppercase">Estatus de Cuenta</p>
                      <p className="text-[10px] opacity-60 uppercase font-black tracking-widest mt-1">Capacidad de Ingreso al ERP</p>
                   </div>
                   <button 
                    onClick={() => setTempEnabled(!tempEnabled)}
                    className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${tempEnabled ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}
                   >
                    {tempEnabled ? '✅ Habilitado' : '🚫 Inhabilitado'}
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                     <span className="h-px w-8 bg-slate-200"></span>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Privilegios y Menús</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'terminal', label: 'Consola Terminal', icon: 'terminal' },
                        { key: 'fleet', label: 'Flota en Vivo', icon: 'directions_bus' },
                        { key: 'ticketing', label: 'Taquilla Boletos', icon: 'confirmation_number' },
                        { key: 'routing', label: 'Rutas Digitales', icon: 'map' },
                        { key: 'invoicing', label: 'Fact. Electrónica', icon: 'receipt_long' },
                        { key: 'reports', label: 'Telemetría Reportes', icon: 'analytics' },
                        { key: 'cash-close', label: 'Control de Caja', icon: 'point_of_sale' },
                        { key: 'settings', label: 'Ajustes Maestro', icon: 'settings' }
                      ].map((item) => (
                        <button 
                          key={item.key}
                          onClick={() => setTempPermissions({ ...tempPermissions, [item.key]: !tempPermissions[item.key] })}
                          className={`p-6 rounded-3xl border-2 flex items-center gap-4 transition-all text-left group ${tempPermissions[item.key] ? 'border-[#00216e] bg-[#00216e]/5 text-[#00216e]' : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
                        >
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${tempPermissions[item.key] ? 'bg-[#00216e] text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'}`}>
                             <span className="material-symbols-outlined text-lg">{tempPermissions[item.key] ? 'check' : item.icon }</span>
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4 flex-shrink-0">
                 <button onClick={() => setEditingUser(null)} className="flex-1 py-5 border-2 border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all">Cancelar</button>
                 <button 
                  onClick={handleSavePermissions}
                  disabled={loading}
                  className="flex-[2] py-5 bg-[#00216e] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#00216e]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                   {loading ? <span className="animate-spin material-symbols-outlined text-sm">sync</span> : <span className="material-symbols-outlined text-sm">cloud_done</span>}
                   {loading ? 'Sincronizando...' : 'Guardar y Vincular'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </section>
  );
}

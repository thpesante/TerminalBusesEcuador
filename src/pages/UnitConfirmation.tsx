import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const UnitConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setIsSaving(true);
    setError('');
    try {
      await addDoc(collection(db, 'units'), {
        cooperativa: 'Alpha Trans-Continental S.A.',
        modelo: 'AeroCoach X-200',
        chasis: 'VN-99201-9X',
        configuracion: 'EJECUTIVO-48',
        despachador: 'Marcus Thorne',
        licencia: '3381-DL-44',
        conductorId: auth.currentUser?.uid || 'guest',
        estado: 'activo',
        registradoEn: serverTimestamp(),
      });
      navigate('/driver-dashboard');
    } catch (e: any) {
      setError('Error al guardar: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-body antialiased min-h-screen">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-[#f7f9fb] flex justify-between items-center px-8 py-4 border-b border-[#eceef0]">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-[#191c1e]">The Orchestrator</span>
          <div className="h-6 w-[1px] bg-[#c6c6cd] opacity-30"></div>
          <span className="font-bold text-[#191c1e]">Resumen y Confirmación Final</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => window.open('mailto:soporte@orchestrator.ec')} className="flex items-center gap-2 text-[#45464d] hover:bg-[#f2f4f6] transition-colors px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined">help_outline</span>
            <span className="text-[10px] font-black uppercase tracking-wider">Soporte</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Title */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#3755c3]">verified</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3755c3]">Paso Final</span>
          </div>
          <h1 className="text-4xl font-black text-[#191c1e] mb-4 tracking-tight">Verificación de Precisión</h1>
          <p className="text-[#45464d] max-w-2xl leading-relaxed font-medium">
            Por favor verifique los parámetros de orquestación antes de finalizar el registro. La precisión asegura la continuidad operativa en toda la red logística de Ecuador.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Company & Logistics Hub */}
            <div className="bg-white rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 shadow-sm border border-slate-100">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-[#45464d]">corporate_fare</span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d]">Entidad Logística</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nombre de la Cooperativa</p>
                    <p className="text-xl font-bold text-[#191c1e]">Alpha Trans-Continental S.A.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">ID de Registro</p>
                      <p className="font-mono text-sm font-bold">ATC-9942-XQ</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Centro Operativo</p>
                      <p className="text-sm font-bold">Terminal Central Nord</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-48 h-48 rounded-2xl bg-[#eceef0] overflow-hidden flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="Modern logistics warehouse"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6lB-dbPHWPwFLoL6gkATw3I1sKvsiUzMd3-ha7MxjpagAF_t_Nthx07lGk1CkVjznBnZrII4J7EEiirCkZh3rHmA7bM92wYpO1iRv4Lu7Yh5N-KW_YsFhoPmt6toFBIo92Qum7v_VbHImwJ0fIgrhjbwOC49w2IqlGef9KHhKqjpck4PkJm1PhuSXZdR27j22Arq3WYeBoeLQ5hJJ6YqEQOPPwUtHNrOfjOQZafwK_UQdlhHylRVyIGc0-4_em5cTP_0bbdoYOv_e"
                />
              </div>
            </div>

            {/* Driver & Asset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-[#45464d]">badge</span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d]">Despachador Principal</h3>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#d0e1fb] overflow-hidden flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt="Dispatcher"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0qwEUxlk2hVu8Pub_9o7ATWvVJ8-Sl4l1-kKggYjtczITVDV3tUSptTS02M2Xpah4xNQvNZ_-PtW9BlaDux-VJDt7xfQTebIvqQ-lKqZS7hhiURIhmbx7PdifPv3CuoKkceSRFjQchuwKlOSLhorkOUW2QzSaewM0vMt3dl3ZohMRIKJ7SpWa3ArUDg1XajU7rly4uv6An9E7rz2fjHOTNwETHvGr7MBTRZiKRx0colWIMfEFcqx2rHXMTn2vT5HwLRho70QoA2Ai"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#191c1e]">Marcus Thorne</p>
                    <p className="text-xs font-bold text-[#45464d]">Licencia #3381-DL-44</p>
                  </div>
                </div>
                <div className="bg-[#f2f4f6] p-4 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contacto</p>
                  <p className="text-xs font-bold">m.thorne@orchestrator.logistics</p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border-l-4 border-[#3755c3]">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-[#45464d]">directions_bus</span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d]">Especificaciones del Activo</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Modelo', value: 'AeroCoach X-200', mono: false },
                    { label: 'Chasis', value: 'VN-99201-9X', mono: true },
                    { label: 'Combustible', value: 'Hidrógeno-Eléctrico', mono: false },
                    { label: 'Configuración', value: 'EJECUTIVO-48', badge: true },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between items-end ${i < 3 ? 'border-b border-[#eceef0]' : ''} pb-3`}>
                      <span className="text-xs font-bold text-[#45464d]">{row.label}</span>
                      {row.badge
                        ? <span className="bg-[#eceef0] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{row.value}</span>
                        : <span className={`font-bold text-sm ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seat Map Preview */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45464d]">event_seat</span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d]">Topología de Asientos</h3>
                </div>
                <button
                  onClick={() => navigate('/seat-designer')}
                  className="text-[#3755c3] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Modificar Rejilla
                </button>
              </div>
              <div className="bg-[#f2f4f6] p-8 rounded-2xl">
                <div className="max-w-xs mx-auto grid grid-cols-4 gap-2">
                  <div className="col-span-1 bg-[#d8dadc] rounded-lg h-10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-[#45464d]">steering_wheel</span>
                  </div>
                  <div className="col-span-3"></div>
                  {[
                    { label: '1A', occ: true }, { label: '1B', occ: true }, { label: '', empty: true }, { label: '1C', occ: false },
                    { label: '2A', occ: true }, { label: '2B', occ: true }, { label: '', empty: true }, { label: '2C', occ: true },
                    { label: '3A', occ: false }, { label: '3B', occ: true }, { label: '', empty: true }, { label: '3C', occ: true },
                    { label: '4A', occ: true }, { label: '4B', occ: true }, { label: '', empty: true }, { label: '4C', occ: false },
                  ].map((s, i) => (
                    s.empty
                      ? <div key={i} className="h-10"></div>
                      : <div key={i} className={`h-10 rounded-lg flex items-center justify-center text-[10px] font-black ${s.occ ? 'bg-[#191c1e] text-white' : 'bg-[#d0e1fb] text-[#54647a]'}`}>{s.label}</div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#191c1e] rounded-md"></div>
                    <span className="text-[10px] font-black text-[#45464d] uppercase tracking-widest">Ocupado/Fijo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#d0e1fb] rounded-md"></div>
                    <span className="text-[10px] font-black text-[#45464d] uppercase tracking-widest">Disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="col-span-12 lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-gradient-to-br from-[#3755c3] to-[#607cec] text-white rounded-[2rem] p-8 shadow-2xl shadow-[#3755c3]/30">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6">Envío Final</h3>
              <p className="text-sm opacity-80 mb-10 leading-relaxed font-medium">
                Al hacer clic en confirmar, usted certifica que todos los datos de activos y asignaciones de personal cumplen con los Protocolos del Orchestrator.
              </p>
              {error && <p className="text-red-400 text-xs font-bold mb-4">{error}</p>}
              <button
                onClick={handleConfirm}
                disabled={isSaving}
                className="w-full bg-white text-[#001453] font-black py-5 rounded-2xl hover:bg-[#f2f4f6] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 text-[10px] uppercase tracking-widest disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Confirmar Registro'}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/seat-designer')}
                className="w-full mt-4 text-white border border-white/20 font-black py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-lg">keyboard_backspace</span>
                Regresar
              </button>
            </div>

            {/* System Validation */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#45464d] mb-6">Validación del Sistema</h4>
              <div className="space-y-4">
                {[
                  'Chequeo de Cumplimiento Pasado',
                  'Credenciales de Conductor Validadas',
                  'Topología de Asientos Verificada',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-xs font-bold text-[#191c1e]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Banner */}
            <div className="relative overflow-hidden rounded-[2rem] h-44 group shadow-xl">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Luxury bus dashboard"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF_5KBN3FEEk6_MOI3QeT1XliEDfvOPV9XfMaDJwmWs3Iyl1UNhYgNV0XYW3OZFcNPXKweVgSF-bb3LtkA6IpnbtJYtdl6s0noR7gqF5H64DE8h99jepjVHWCxT9zSL7FstZXUtcpB72gG1aXndvxV3XNw5fmJ7QGXqH1aQ1I8_SrfM9h2mMHxkecWfs-wN2XdQgBnhrk4T22_D3bIDKz77oPBIuSZCfmQ6QiMuedM0XZ3HEveeKN6GoHry9ycKLG4H-rqRLZvA8eS"
              />
              <div className="absolute inset-0 bg-[#001453]/50 flex items-end p-6">
                <p className="text-[10px] text-white font-black uppercase tracking-widest">Inteligencia de Flota 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-[#eceef0] py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-black text-[#191c1e] uppercase tracking-tighter">The Orchestrator</span>
            <p className="text-[10px] font-bold text-[#45464d] uppercase tracking-widest">Suite de Gestión Logística Global</p>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-[#45464d]">
            <a className="hover:text-[#3755c3] transition-colors" href="#">Protocolo de Seguridad</a>
            <a className="hover:text-[#3755c3] transition-colors" href="#">Política de Privacidad</a>
            <a className="hover:text-[#3755c3] transition-colors" href="#">Estado de Infraestructura</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UnitConfirmation;

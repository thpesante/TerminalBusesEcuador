import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, isDemoMode } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { validarCedula, validarRUC } from '../utils/validators';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [identificacion, setIdentificacion] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [celular, setCelular] = useState('');
  const [provincia, setProvincia] = useState('');
  const [canton, setCanton] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');
    const isRuc = identificacion.length === 13;
    const isCedula = identificacion.length === 10;

    if (!isRuc && !isCedula) {
      setError('Ingrese 10 dígitos para Cédula o 13 para RUC.');
      return;
    }

    if (isCedula && !validarCedula(identificacion)) {
      setError('Cédula inválida (Algoritmo Módulo 10).');
      return;
    }

    if (isRuc && !validarRUC(identificacion)) {
      setError('RUC inválido (Debe terminar en 001).');
      return;
    }

    setLoading(true);

    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (identificacion === '0103869137') {
        setNombre('PEDRO ARMANDO');
        setApellido('PESANTEZ');
        setFechaNacimiento('1990-05-15');
      } else if (isRuc) {
        setNombre('TRANSPORTES ECUADOR S.A.');
        setApellido('');
        setFechaNacimiento('');
      } else {
        setNombre('USUARIO');
        setApellido('DE PRUEBA');
        setFechaNacimiento('1995-10-20');
      }
      setIsValidated(true);
      setLoading(false);
      return;
    }

    try {
      const proxyUrl = 'https://infoplacas.herokuapp.com/';
      let targetUrl = '';
      let params = new URLSearchParams();

      if (isRuc) {
        // API RUC
        targetUrl = `https://aggregator.cipherbyte.ec/company/${identificacion}`;
        const response = await fetch(proxyUrl + targetUrl);
        const data = await response.json();
        if (data && data.razonSocial) {
          setNombre(data.razonSocial);
          setApellido('');
          setFechaNacimiento('');
          setIsValidated(true);
        } else {
          throw new Error('No se encontró el RUC.');
        }
      } else {
        // API Cédula
        targetUrl = 'https://si.secap.gob.ec/sisecap/logeo_web/json/busca_persona_registro_civil.php';
        params.append('documento', identificacion);
        params.append('tipo', '1');
        const response = await fetch(proxyUrl + targetUrl, { method: 'POST', body: params });
        const data = await response.json();
        if (data && data.nombres) {
          setNombre(data.nombres);
          setApellido(data.apellidos);
          setFechaNacimiento(data.fechaNacimiento || '');
          setIsValidated(true);
        } else {
          throw new Error('No se encontró la Cédula.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al validar la identidad.');
      setIsValidated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidated) {
      setError('Primero debes validar tu identidad');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        identificacion,
        cedula: identificacion,
        nombre,
        apellido,
        fechaNacimiento,
        email,
        celular,
        provincia,
        canton,
        role: 'CLIENTE',
        createdAt: new Date().toISOString()
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-primary tracking-tight font-headline">TransporteEcuador</span>
        </div>
        <div className="hidden md:flex gap-2">
          <div className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 transition-colors px-3 py-2 rounded-lg cursor-pointer">
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm font-medium">Soporte</span>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-4 md:px-0">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Side: Visual/Context */}
          <div className="hidden md:flex md:col-span-5 flex-col gap-6 sticky top-24">
            <div className="bg-primary p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-[160px]">directions_bus</span>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight mb-4 tracking-tighter">Bienvenido a la red de transporte más grande del país.</h1>
              <p className="text-on-primary-container text-lg font-light opacity-90 leading-relaxed">Únete hoy y comienza a disfrutar de viajes seguros y conectados en todo el Ecuador.</p>
              <div className="mt-12 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <span className="material-symbols-outlined text-secondary-container">verified_user</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Seguridad Total</h3>
                    <p className="text-xs opacity-70">Identidad validada automáticamente.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <span className="material-symbols-outlined text-secondary-container">speed</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Acceso Rápido</h3>
                    <p className="text-xs opacity-70">Emisión de boletos en segundos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-2 font-headline">Crear nueva cuenta</h2>
                <p className="text-slate-500 text-sm font-body">Ingresa tu identificación para validar tus datos.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                {error && (
                  <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Identificación (Cédula o RUC)</label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <input
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface font-semibold placeholder:font-normal placeholder:text-slate-400"
                        maxLength={13}
                        placeholder="Ej: 1712345678 o 1712345678001"
                        type="text"
                        value={identificacion}
                        onChange={(e) => setIdentificacion(e.target.value)}
                        required
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">badge</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={loading || identificacion.length < 10}
                      className="bg-primary text-white px-6 rounded-2xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {loading ? '...' : 'Verificar'}
                    </button>
                  </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${isValidated ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre / Razón Social</label>
                    <div className="bg-surface-container border-none rounded-2xl py-4 px-4 text-on-surface-variant font-black uppercase">
                      {nombre || '---'}
                    </div>
                  </div>
                  {apellido && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Apellidos</label>
                      <div className="bg-surface-container border-none rounded-2xl py-4 px-4 text-on-surface-variant font-black uppercase">
                        {apellido}
                      </div>
                    </div>
                  )}
                  {fechaNacimiento && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Fecha de Nacimiento</label>
                      <div className="bg-surface-container border-none rounded-2xl py-4 px-4 text-on-surface-variant font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {fechaNacimiento}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`space-y-4 pt-4 border-t border-surface-container-high transition-all duration-300 ${isValidated ? 'block' : 'hidden'}`}>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                        placeholder="usuario@ejemplo.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">alternate_email</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                          placeholder="••••••••"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Celular</label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-body"
                          placeholder="0987654321"
                          type="tel"
                          value={celular}
                          onChange={(e) => setCelular(e.target.value)}
                          required
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">smartphone</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    className={`w-full bg-gradient-to-r from-primary to-primary-container text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-headline ${(!isValidated || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    type="submit"
                    disabled={!isValidated || loading}
                  >
                    <span>{loading ? 'Procesando...' : 'Finalizar Registro'}</span>
                    <span className="material-symbols-outlined">how_to_reg</span>
                  </button>
                  <p className="text-center mt-6 text-sm text-slate-400 font-body">
                    ¿Ya tienes una cuenta? <Link className="text-primary font-bold hover:underline" to="/">Inicia Sesión</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 border-t border-surface-container-high bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-slate-400 text-xs font-medium">© 2024 TransporteEcuador - Todos los derechos reservados</span>
        </div>
      </footer>
    </div>
  );
};

export default Register;

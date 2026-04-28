import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, isDemoMode } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');

  // Hardening states
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ a: 0, b: 0, result: 0 });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  // Recovery states
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryAccount, setRecoveryAccount] = useState<any>(null);

  useEffect(() => {
    generateCaptcha();
    // Cargar bloqueos previos si existen
    const savedLock = localStorage.getItem(`lock_${email}`);
    if (savedLock) {
      const lockTime = parseInt(savedLock);
      if (lockTime > Date.now()) {
        setLockUntil(lockTime);
      }
    }
  }, []);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    setCaptchaQuestion({ a, b, result: a + b });
    setCaptchaAnswer('');
  };

  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    if (newAttempts >= 3) {
      const lockTime = Date.now() + 5 * 60 * 1000; // 5 minutos
      setLockUntil(lockTime);
      localStorage.setItem(`lock_${email}`, lockTime.toString());
      setErrorMSG("Cuenta bloqueada temporalmente por 5 minutos tras 3 intentos fallidos.");
    } else {
      setErrorMSG(`Credenciales incorrectas. Intento ${newAttempts} de 3.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMSG('');

    // Check Lock
    if (lockUntil && Date.now() < lockUntil) {
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000 / 60);
      setErrorMSG(`Cuenta bloqueada. Intenta en ${remaining} minutos.`);
      return;
    }

    // Check Captcha
    if (parseInt(captchaAnswer) !== captchaQuestion.result) {
      setErrorMSG("CAPTCHA incorrecto. Intenta de nuevo.");
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (email.includes('bus')) navigate('/driver-dashboard');
      else if (email.includes('oficina') || email.includes('erp')) navigate('/erp/ticketing');
      else if (email.includes('datos')) navigate('/datos-dashboard');
      else navigate('/dashboard');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        setErrorMSG("Acceso denegado: El usuario no tiene un perfil registrado.");
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      const userData = userDocSnap.data();
      const userRole = userData?.role || userData?.rol;

      if (!userRole) {
        setErrorMSG("Acceso denegado: No cuentas con un rol verificado asignado.");
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      // Reset attempts on success
      setFailedAttempts(0);
      localStorage.removeItem(`lock_${email}`);

      switch (userRole) {
        case 'CLIENTE': navigate('/dashboard'); break;
        case 'BUS': navigate('/driver-dashboard'); break;
        case 'OFICINA': navigate('/erp/ticketing'); break;
        case 'DATOS': navigate('/datos-dashboard'); break;
        default:
          setErrorMSG(`Acceso denegado: Rol '${userRole}' no reconocido.`);
          await auth.signOut();
      }

    } catch (error: any) {
      console.error("Error de autenticación:", error);
      handleFailedAttempt();
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMSG('');

    try {
      // Intentar enviar el correo de recuperación directamente a Firebase Auth
      await sendPasswordResetEmail(auth, email);

      // Adicionalmente buscamos en Firestore para mostrar el nombre (opcional pero amigable)
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setRecoveryAccount(userData);
      }

      setRecoveryStep(2);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setErrorMSG("No se encontró ninguna cuenta asociada a este correo.");
      } else {
        setErrorMSG("Error al procesar la solicitud. Verifique su conexión.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden">

      <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-[0_12px_40px_rgba(0,17,58,0.06)]">
        <Link to="/" className="text-xl font-black text-blue-950 uppercase tracking-wider font-headline cursor-pointer">
          MOVU
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8 text-slate-500 font-medium font-headline">
            <Link to="/destinos" className="hover:text-blue-900 transition-colors">Destinos</Link>
            <Link to="/horarios" className="hover:text-blue-900 transition-colors">Horarios</Link>
            <Link to="/company-register" className="hover:text-blue-900 transition-colors">Compañías</Link>
            <Link to="/register" className="text-blue-900 font-bold">Registro</Link>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-blue-900 hover:bg-slate-200/50 transition-colors rounded-full">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-blue-900 hover:bg-slate-200/50 transition-colors rounded-full">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover brightness-[0.85]"
            alt="Fondo de viaje"
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1920"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-primary/20" />
        </div>

        <div className="relative z-10 max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center py-16">
          <div className="text-white space-y-6 hidden lg:block">
            <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container font-bold text-xs uppercase tracking-widest rounded-full">
              Ecosistema Digital
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight font-headline">
              Tu viaje empieza{' '}
              <span className="text-secondary-fixed">aquí.</span>
            </h1>
            <p className="text-xl text-slate-100 max-w-lg leading-relaxed font-light">
              La plataforma oficial para viajar por todo el Ecuador. Seguridad validada y seguimiento en tiempo real en cada ruta.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl">
                <span
                  className="material-symbols-outlined text-secondary-fixed"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  verified_user
                </span>
                <span className="text-sm font-semibold">Identidad Protegida</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl">
                <span
                  className="material-symbols-outlined text-secondary-fixed"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  schedule
                </span>
                <span className="text-sm font-semibold">Tiempo Real</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl">
                <span
                  className="material-symbols-outlined text-secondary-fixed"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  qr_code_2
                </span>
                <span className="text-sm font-semibold">Boleto Digital</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest shadow-[0_24px_80px_rgba(0,17,58,0.14)] rounded-[2rem] p-8 md:p-10 border border-white/50 w-full max-w-md mx-auto lg:mx-0 lg:ml-auto transition-all">

            {view === 'login' ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-primary mb-2 font-headline">Acceso Seguro</h2>
                  <p className="text-on-surface-variant">Ingresa tus credenciales para continuar.</p>
                </div>

                {errorMSG && (
                  <div className="p-4 mb-6 bg-error-container border border-error/20 rounded-xl text-on-error-container text-sm font-bold flex items-center gap-2 animate-pulse">
                    <span className="material-symbols-outlined text-error">security</span>
                    {errorMSG}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Correo Electrónico</label>
                    <div className="relative group">
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-surface-container-low border-0 rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-primary text-on-surface outline-none transition-all" placeholder="usuario@ejemplo.com" required />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Contraseña</label>
                    <div className="relative group">
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-surface-container-low border-0 rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-primary text-on-surface outline-none transition-all" placeholder="••••••••" required />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                    </div>
                  </div>

                  {/* CAPTCHA SECTION - HORIZONTAL LAYOUT */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Seguridad</label>
                      <div className="bg-white px-3 py-2 rounded-lg font-black text-primary border border-slate-200 shadow-sm text-center text-sm whitespace-nowrap">
                        {captchaQuestion.a} + {captchaQuestion.b} = ?
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Respuesta</label>
                      <input
                        type="number"
                        value={captchaAnswer}
                        onChange={e => setCaptchaAnswer(e.target.value)}
                        className="w-full bg-white border-2 border-transparent focus:border-primary rounded-lg py-2 px-3 text-center font-bold outline-none shadow-sm text-sm"
                        placeholder="???"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-primary hover:underline">¿Olvidaste tu contraseña?</button>
                  </div>

                  <button disabled={isLoading || (lockUntil !== null && Date.now() < lockUntil)} type="submit" className="w-full text-white font-bold py-5 rounded-xl text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 bg-primary">
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <>Ingresar al Ecosistema <span className="material-symbols-outlined">shield</span></>}
                  </button>
                </form>
              </>
            ) : (
              /* FORGOT PASSWORD VIEW */
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="mb-8">
                  <button onClick={() => setView('login')} className="flex items-center gap-1 text-xs font-bold text-slate-400 mb-4 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Volver al Login
                  </button>
                  <h2 className="text-3xl font-bold text-primary mb-2 font-headline">Recuperar Cuenta</h2>
                  <p className="text-on-surface-variant">
                    {recoveryStep === 1 ? 'Ingresa tu correo para buscar tu perfil.' : 'Cuenta encontrada con éxito.'}
                  </p>
                </div>

                {errorMSG && (
                  <div className="p-4 mb-6 bg-error-container text-on-error-container text-sm font-bold rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined">warning</span> {errorMSG}
                  </div>
                )}

                {recoveryStep === 1 ? (
                  <form onSubmit={handleRecovery} className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Tu Correo Electrónico</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-surface-container-low border-0 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary text-on-surface outline-none" placeholder="ejemplo@correo.com" required />
                    </div>
                    <button disabled={isLoading} type="submit" className="w-full bg-primary text-white font-bold py-5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
                      {isLoading ? 'Buscando...' : <>Buscar mi Cuenta <span className="material-symbols-outlined">search</span></>}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="p-6 bg-green-50 border border-green-200 rounded-[2rem] flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-200">
                        <span className="material-symbols-outlined text-3xl">verified</span>
                      </div>
                      <p className="text-lg font-black text-green-800 uppercase tracking-tighter">{recoveryAccount?.nombre} {recoveryAccount?.apellido}</p>
                      <p className="text-xs text-green-600 font-bold opacity-70 mt-1">Usuario Identificado</p>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                      <p className="text-sm text-primary leading-relaxed">
                        Se ha enviado un enlace de recuperación a: <br />
                        <span className="font-bold underline">{email}</span>
                        <br /><br />
                        Por favor revisa tu bandeja de entrada (y la carpeta de spam).
                      </p>
                    </div>
                    <button onClick={() => setView('login')} className="w-full bg-primary text-white font-bold py-5 rounded-xl shadow-lg">Volver al Inicio</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Marca */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-xl font-black uppercase tracking-wider font-headline">
              MOVU
            </div>
            <p className="text-sm text-blue-200/70 leading-relaxed max-w-sm">
              Protegiendo el transporte del Ecuador con tecnología de vanguardia.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">

            <div>
              <h4 className="text-sm font-semibold mb-3 text-white">Compañía</h4>
              <nav className="flex flex-col gap-2 text-sm text-blue-200/70">
                <a href="#" className="hover:text-white transition">Sobre nosotros</a>
                <a href="#" className="hover:text-white transition">Terminales</a>
                <a href="#" className="hover:text-white transition">Prensa</a>
                <a href="#" className="hover:text-white transition">Contacto</a>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-white">Legal</h4>
              <nav className="flex flex-col gap-2 text-sm text-blue-200/70">
                <a href="#" className="hover:text-white transition">Términos</a>
                <a href="#" className="hover:text-white transition">Privacidad</a>
                <a href="#" className="hover:text-white transition">Datos</a>
                <a href="#" className="hover:text-white transition">Cookies</a>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-white">Servicios</h4>
              <nav className="flex flex-col gap-2 text-sm text-blue-200/70">
                <Link to="/horarios" className="hover:text-white transition">
                  Horarios
                </Link>
                <Link to="/destinos" className="hover:text-white transition">
                  Destinos
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-white">Soporte</h4>
              <nav className="flex flex-col gap-2 text-sm text-blue-200/70">
                <a href="#" className="hover:text-white transition">Chat</a>
                <a href="#" className="hover:text-white transition">Incidentes</a>
              </nav>
            </div>

          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-blue-200/50">
            <p>© 2024 MOVU. Todos los derechos reservados.</p>
            <div className="flex gap-5">
              <span>Hecho en Ecuador</span>
              <span>v4.0.2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;

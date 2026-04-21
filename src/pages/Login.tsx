import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, isDemoMode } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMSG('');
    setIsLoading(true);

    if (isDemoMode) {
      // Demo bypass (simulated default CLIENTE role if demo mode is strictly used without Firebase)
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

      // Verificamos el rol en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        setErrorMSG("Acceso denegado: El usuario no tiene un perfil registrado.");
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      const userData = userDocSnap.data();

      // Validación estricta de Rol verificado
      const userRole = userData?.role || userData?.rol; // Soportamos ambos por si acaso

      if (!userRole) {
        setErrorMSG("Acceso denegado: No cuentas con un rol verificado asignado.");
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      // Enrutamiento basado en el rol (RBAC)
      switch (userRole) {
        case 'CLIENTE':
          navigate('/dashboard');
          break;
        case 'BUS':
          navigate('/driver-dashboard');
          break;
        case 'OFICINA':
          navigate('/erp/ticketing');
          break;
        case 'DATOS':
          navigate('/datos-dashboard'); 
          break;
        default:
          setErrorMSG(`Acceso denegado: Rol '${userRole}' no reconocido.`);
          await auth.signOut();
      }

    } catch (error: any) {
      console.error("Error de autenticación:", error);
      setErrorMSG("Credenciales incorrectas o problema de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden">

      {/* ── TOP APP BAR ── */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-[0_12px_40px_rgba(0,17,58,0.06)]">
        <div className="text-xl font-black text-blue-950 uppercase tracking-wider font-headline">
          Meridian Transit
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8 text-slate-500 font-medium font-headline">
            <a href="#" className="hover:text-blue-900 transition-colors">Destinos</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Horarios</a>
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

      {/* ── HERO + LOGIN SECTION ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover brightness-[0.85]"
            alt="Bus moderno viajando por los Andes ecuatorianos al amanecer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMvWaipLWu6jfRy2GZ9cFgh-vVbsZBK57zwdsSCyemdOWrX18DJEwaUnnWczxAw85LPvvNm0dLEMce7HZh3dSUYQxNLIroNRNuZKfyUdg6ZQbt4L0cjGiEPs-UKfaR9PCrIgUMlbxatcnXUL3qxnKGeIUhWN45jiRUeFHstr-uT0EttIyIEpeZa8-m3IQdDbLFWAW1GHBn8jmJCwPGNwucw98FH4qkFeg-gFw--MwpvhXp96U0V1ir7c3KxzcjKYrc6iBbZzCwnQ_C"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-primary/20" />
        </div>

        <div className="relative z-10 max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center py-16">

          {/* ── LEFT: Text Content ── */}
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

          {/* ── RIGHT: Login Form Card ── */}
          <div className="bg-surface-container-lowest shadow-[0_24px_80px_rgba(0,17,58,0.14)] rounded-[2rem] p-8 md:p-10 border border-white/50 w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2 font-headline">¡Bienvenido!</h2>
              <p className="text-on-surface-variant">Ingresa para gestionar tus viajes.</p>
            </div>

            {/* Error Message */}
            {errorMSG && (
              <div className="p-4 mb-6 bg-error-container border border-error/20 rounded-xl text-on-error-container text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-error">error</span>
                {errorMSG}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-secondary text-on-surface placeholder:text-slate-400 outline-none transition-all"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors">
                    alternate_email
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-secondary text-on-surface placeholder:text-slate-400 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors">
                    lock
                  </span>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Info banner */}
              <div className="p-5 bg-primary-fixed/30 rounded-2xl flex gap-4 items-start border border-primary-fixed/50">
                <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                <div className="text-sm text-on-primary-fixed leading-snug">
                  <span className="font-bold block mb-1 uppercase text-[10px] tracking-wider">Acceso Seguro</span>
                  Tu sesión está protegida con autenticación cifrada y validación de identidad.
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                disabled={isLoading}
                type="submit"
                className="w-full text-white font-bold py-5 rounded-xl text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00113a 0%, #002366 100%)' }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Cargando...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-on-surface-variant">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Crea una ahora
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-primary py-16 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="text-2xl font-black uppercase tracking-wider mb-6 font-headline">Meridian Transit</div>
            <p className="text-blue-200/60 max-w-md leading-relaxed">
              La plataforma oficial de gestión de transporte interprovincial en Ecuador. Innovando para conectar familias, negocios y sueños.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-secondary-fixed">Compañía</h4>
            <nav className="flex flex-col gap-2 text-sm text-blue-200/80">
              <a href="#" className="hover:text-white transition-colors">Sobre nosotros</a>
              <a href="#" className="hover:text-white transition-colors">Terminales</a>
              <a href="#" className="hover:text-white transition-colors">Prensa</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-secondary-fixed">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm text-blue-200/80">
              <a href="#" className="hover:text-white transition-colors">Términos de servicio</a>
              <a href="#" className="hover:text-white transition-colors">Política de privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Seguridad de datos</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-200/40">
          <p>© 2024 Meridian Transit. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span>Hecho en Ecuador</span>
            <span>v4.0.2</span>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-2 pb-6 bg-white shadow-[0_-10px_30px_rgba(0,17,58,0.08)] rounded-t-3xl z-50">
        <div className="flex flex-col items-center justify-center text-slate-400 px-5 py-1.5">
          <span className="material-symbols-outlined">directions_bus</span>
          <span className="text-[11px] font-semibold uppercase tracking-tighter">Hub</span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-400 px-5 py-1.5">
          <span className="material-symbols-outlined">route</span>
          <span className="text-[11px] font-semibold uppercase tracking-tighter">Rutas</span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-400 px-5 py-1.5">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[11px] font-semibold uppercase tracking-tighter">Tracking</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-amber-50 text-amber-700 rounded-xl px-5 py-1.5">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            person
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-tighter">Perfil</span>
        </div>
      </nav>
    </div>
  );
};

export default Login;

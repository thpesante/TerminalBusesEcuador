import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

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

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error de autenticación:", error);
      setErrorMSG("Credenciales incorrectas o problema de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body overflow-x-hidden relative">
      {/* Background Hero */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-60 grayscale-[0.5]" 
          alt="Terminal Terrestre" 
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1600" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-transparent"></div>
      </div>

      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary-container text-4xl">directions_bus</span>
          <span className="font-headline font-black text-2xl tracking-tighter text-white uppercase">TransporteEcuador</span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-20 pb-12">
        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl w-full items-center">
          
          <div className="lg:col-span-7 text-left space-y-8 hidden lg:block">
            <span className="text-secondary-container font-headline font-bold uppercase tracking-[0.2em] mb-4 block">Ecosistema de Transporte Digital</span>
            <h1 className="text-white font-headline text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9]">
              Tu viaje <br />empieza <span className="text-secondary-container">Aquí.</span>
            </h1>
            <p className="text-white/70 text-xl max-w-xl leading-relaxed">
              La plataforma oficial para viajar por todo el Ecuador. Seguridad validada y seguimiento en tiempo real.
            </p>
          </div>

          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] shadow-2xl border border-white/20 text-left">
              <div className="mb-10">
                <h2 className="text-4xl font-black text-primary mb-2 font-headline">¡Bienvenido!</h2>
                <p className="text-on-surface-variant font-medium font-body">Ingresa para gestionar tus viajes.</p>
              </div>

              {errorMSG && (
                <div className="p-4 mb-6 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  {errorMSG}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-4">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-full px-8 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-body" 
                    placeholder="usuario@ejemplo.com" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-4">Contraseña</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-full px-8 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-body" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>

                <div className="flex justify-end pr-4">
                  <button type="button" className="text-xs font-bold text-primary hover:underline">¿Olvidaste tu contraseña?</button>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-black py-5 rounded-full text-lg uppercase tracking-widest shadow-xl flex justify-center items-center gap-3 group active:scale-95 transition-all disabled:opacity-50 mt-4 font-headline" 
                  type="submit"
                >
                  {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                  {!isLoading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                </button>
              </form>

              <p className="text-center mt-8 text-sm text-on-surface-variant font-medium font-body">
                ¿No tienes una cuenta? 
                <Link 
                  to="/register" 
                  className="text-primary font-bold hover:underline ml-1"
                >
                  Crea una ahora
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-8 w-full text-center text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] hidden md:block">
        © 2024 TransporteEcuador • Conectando el País
      </footer>
    </div>
  );
};

export default Login;

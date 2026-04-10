import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Sub-components
import HubView from './dashboard/HubView';
import SearchView from './dashboard/SearchView';
import TrackingView from './dashboard/TrackingView';
import NotificationsView from './dashboard/NotificationsView';

type DashboardView = 'hub' | 'search' | 'tracking' | 'notifications';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<DashboardView>('hub');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.view) {
      setView(location.state.view as DashboardView);
    }
  }, [location.state]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().nombre || userDoc.data().name || 'Usuario');
          } else {
            setUserName(user.email?.split('@')[0] || 'Perfil');
          }
        } catch(e) {
          console.error("Error al obtener datos del usuario", e);
        }
        setIsLoading(false);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-6">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('hub')}>
          <span className="text-2xl font-black text-primary tracking-tight font-headline">TransporteEcuador</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => setView('hub')}
            className={`text-sm font-headline font-semibold ${view === 'hub' ? 'text-primary border-b-2 border-primary py-1' : 'text-slate-500 hover:text-primary transition-colors'}`}
          >
            Inicio
          </button>
          <button 
            onClick={() => setView('search')}
            className={`text-sm font-headline font-semibold ${view === 'search' ? 'text-primary border-b-2 border-primary py-1' : 'text-slate-500 hover:text-primary transition-colors'}`}
          >
            Rutas
          </button>
          <button 
            onClick={() => navigate('/history')}
            className="text-slate-500 hover:bg-slate-100 transition-colors px-3 py-1 rounded-lg text-sm font-headline"
          >
            Mis Viajes
          </button>
          <button 
            onClick={() => navigate('/terminal-map')}
            className="text-slate-500 hover:bg-slate-100 transition-colors px-3 py-1 rounded-lg text-sm font-headline"
          >
            Terminales
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="text-slate-500 hover:bg-slate-100 transition-colors px-3 py-1 rounded-lg text-sm font-headline"
          >
            Perfil
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('notifications')}
            className={`p-2 rounded-full transition-all active:scale-90 ${view === 'notifications' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div 
             onClick={() => navigate('/profile')}
             className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary transition-all"
          >
             {userName.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-error hover:bg-error-container/20 rounded-full transition-all active:scale-90"
            title="Cerrar Sesión"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </nav>

      <main className={view === 'tracking' ? "pt-16 pb-24 md:pb-0" : "pt-24 pb-32 px-6 max-w-7xl mx-auto"}>
        {view === 'hub' && <HubView setView={setView} />}
        {view === 'search' && <SearchView setView={setView} />}
        {view === 'tracking' && <TrackingView />}
        {view === 'notifications' && <NotificationsView setView={setView} />}
      </main>

      {/* Panic Button (Persistent Floating) */}
      <button 
        onClick={() => alert("SOS: Enviando alerta al 911 y unidades cercanas...")}
        className="fixed right-6 bottom-32 md:bottom-12 z-[60] bg-tertiary-container text-white px-6 py-4 rounded-xl shadow-[0_20px_40px_rgba(131,0,21,0.3)] flex items-center gap-3 active:scale-95 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined filled-icon">emergency</span>
        <span className="font-black font-headline text-sm tracking-widest uppercase">Pánico</span>
      </button>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 backdrop-blur-xl shadow-[0_-20px_40px_rgba(25,28,29,0.06)] z-50 rounded-t-3xl">
        <button 
          onClick={() => setView('hub')}
          className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${view === 'hub' ? 'bg-secondary-container/20 text-secondary rounded-2xl' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined">directions_bus</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Inicio</span>
        </button>
        <button 
          onClick={() => setView('search')}
          className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${view === 'search' ? 'bg-secondary-container/20 text-secondary rounded-2xl' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined">map</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Rutas</span>
        </button>
        <button 
          onClick={() => navigate('/history')}
          className="flex flex-col items-center justify-center text-slate-400 px-4 py-2"
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Boletos</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center justify-center text-slate-400 px-4 py-2"
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;

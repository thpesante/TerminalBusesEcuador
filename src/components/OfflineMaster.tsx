import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { waitForPendingWrites } from 'firebase/firestore';

const OfflineMaster: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncing(true);
      
      // Intentar sincronización forzada de Firestore
      try {
        await waitForPendingWrites(db);
        console.log("Firestore sincronizado con éxito.");
      } catch (e) {
        console.error("Error sincronizando:", e);
      }
      
      setSyncing(false);
      // Ocultar banner después de unos segundos de éxito
      setTimeout(() => setShowBanner(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Registrar Service Worker para PWA / Cache
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registrado con éxito:', registration.scope);
        }).catch(err => {
          console.log('SW falló:', err);
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner && isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 transform ${showBanner || !isOnline ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`${isOnline ? 'bg-green-600' : 'bg-red-600'} text-white px-8 py-3 shadow-2xl flex items-center justify-between backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
             <span className="material-symbols-outlined text-sm animate-pulse">
                {isOnline ? 'wifi' : 'wifi_off'}
             </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">
              {isOnline ? 'Sistema Conectado' : 'Modo Offline Crítico'}
            </p>
            <p className="text-[11px] font-bold opacity-80">
              {isOnline 
                ? (syncing ? 'Sincronizando transacciones locales...' : 'Base de Datos Sincronizada (IndexedDB OK)') 
                : 'Trabajando localmente. Los datos se guardarán al volver la conexión.'}
            </p>
          </div>
        </div>
        
        {syncing && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-[9px] font-black uppercase tracking-widest">Sincronizando...</span>
          </div>
        )}
        
        {!isOnline && (
          <div className="bg-white/10 px-4 py-1 rounded-full border border-white/20">
             <span className="text-[10px] font-black uppercase tracking-tighter italic">Capacidad de Taquilla Activa</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineMaster;

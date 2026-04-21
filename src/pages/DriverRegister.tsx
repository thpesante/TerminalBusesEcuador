import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, isDemoMode } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const DriverRegister: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    cooperativa: '',
    ruc: '',
    email: '',
    password: '',
    celular: '',
    disco: '',
    placa: '',
    tipoBus: 'normal', // normal, ejecutivo, suite
    amenidades: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenidad = (amenidad: string) => {
    setFormData(prev => ({
      ...prev,
      amenidades: prev.amenidades.includes(amenidad)
        ? prev.amenidades.filter(a => a !== amenidad)
        : [...prev.amenidades, amenidad]
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/driver-dashboard');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        role: 'CONDUCTOR',
        createdAt: new Date().toISOString()
      });
      
      navigate('/driver-dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta de conductor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body">
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm h-16 flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-primary tracking-tight font-headline">TransporteEcuador <span className="text-secondary text-sm ml-2">CONDUCTORES</span></span>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-left">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                {[1, 2].map((i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-slate-100'}`}></div>
                ))}
              </div>
              <h1 className="text-3xl font-black text-primary font-headline">
                {step === 1 ? 'Registro de Conductor' : 'Datos de tu Unidad'}
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                {step === 1 ? 'Completa tu información profesional.' : 'Cuéntanos sobre el bus que manejas.'}
              </p>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-sm font-bold flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <form onSubmit={step === 2 ? handleRegister : (e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Cooperativa de Transporte</label>
                      <select 
                        name="cooperativa"
                        value={formData.cooperativa}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-semibold"
                        required
                      >
                        <option value="">Selecciona tu empresa...</option>
                        <option value="Loja">Cooperativa Loja</option>
                        <option value="Azuay">Transportes Azuay</option>
                        <option value="Imbabura">Flota Imbabura</option>
                        <option value="Occidental">Transportes Occidental</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">RUC de la Empresa</label>
                      <div className="relative group">
                        <input 
                          name="ruc"
                          value={formData.ruc}
                          onChange={handleInputChange}
                          onBlur={async () => {
                            if (formData.ruc === '0106797970' && isDemoMode) {
                              setFormData(prev => ({ ...prev, cooperativa: 'Loja' }));
                            }
                          }}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-semibold" 
                          placeholder="RUC de 13 dígitos"
                          maxLength={13}
                          required
                        />
                        {isDemoMode && formData.ruc === '0106797970' && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-1 rounded-full">
                            <span className="material-symbols-outlined text-xs">check</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Correo Electrónico</label>
                        <input 
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20" 
                          placeholder="tu@correo.com"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Celular</label>
                        <input 
                          name="celular"
                          value={formData.celular}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20" 
                          placeholder="09XXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Contraseña</label>
                      <input 
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20" 
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 font-headline mt-8"
                  >
                    <span>Siguiente Paso</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Número de Disco</label>
                        <input 
                          name="disco"
                          value={formData.disco}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-bold text-center text-2xl" 
                          placeholder="000"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Placa del Bus</label>
                        <input 
                          name="placa"
                          value={formData.placa}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 font-bold text-center text-2xl uppercase" 
                          placeholder="ABC-1234"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Tipo de Unidad</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Normal', 'Ejecutivo', 'Presidencial'].map((tipo) => (
                          <button
                            key={tipo}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, tipoBus: tipo.toLowerCase() }))}
                            className={`py-3 rounded-xl border-2 font-bold transition-all text-xs ${formData.tipoBus === tipo.toLowerCase() ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400'}`}
                          >
                            {tipo}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-label">Amenidades Disponibles</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'wifi', label: 'WiFi Gratis', icon: 'wifi' },
                          { id: 'ac', label: 'Aire Acondicionado', icon: 'ac_unit' },
                          { id: 'usb', label: 'Puertos USB', icon: 'bolt' },
                          { id: 'cine', label: 'Cine a Bordo', icon: 'tv' },
                          { id: 'banio', label: 'Baño', icon: 'wc' }
                        ].map((amenidad) => (
                          <button
                            key={amenidad.id}
                            type="button"
                            onClick={() => toggleAmenidad(amenidad.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold ${formData.amenidades.includes(amenidad.id) ? 'bg-secondary-container text-on-secondary-container border-secondary' : 'bg-slate-50 text-slate-400 border-transparent'}`}
                          >
                            <span className="material-symbols-outlined text-sm">{amenidad.icon}</span>
                            {amenidad.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-slate-100 text-slate-600 font-bold py-5 rounded-2xl hover:bg-slate-200 transition-all font-headline"
                    >
                      Atrás
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-[2] bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 font-headline"
                    >
                      <span>{loading ? 'Procesando...' : 'Finalizar Registro'}</span>
                      <span className="material-symbols-outlined">check_circle</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverRegister;

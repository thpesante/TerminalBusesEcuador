import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';

const UnitRegistration: React.FC = () => {
    const navigate = useNavigate();
    const { userData } = useAuth();
    
    // Form States
    const [placa, setPlaca] = useState('');
    const [disco, setDisco] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [coopRuc, setCoopRuc] = useState('');
    const [cedulaPropietario, setCedulaPropietario] = useState('');
    const [busType, setBusType] = useState('Normal');
    const [hasAssistant, setHasAssistant] = useState('Sí');
    const [seatingType, setSeatingType] = useState('Reclinables');
    const [hasCompartment, setHasCompartment] = useState(false);
    const [amenities, setAmenities] = useState<string[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [loadingDraft, setLoadingDraft] = useState(true);

    // Fetch existing info if any
    useEffect(() => {
        const fetchDraft = async () => {
            if (!userData) return;
            const tempId = `temp_${auth.currentUser?.uid}`;
            try {
                const draftSnap = await getDoc(doc(db, 'units_draft', tempId));
                if (draftSnap.exists()) {
                    const data = draftSnap.data();
                    setPlaca(data.placa || '');
                    setDisco(data.disco || '');
                    setMarca(data.marca || '');
                    setModelo(data.modelo || '');
                    setBusType(data.busType || 'Normal');
                    setHasAssistant(data.hasAssistant || 'Sí');
                    setSeatingType(data.seatingType || 'Reclinables');
                    setHasCompartment(data.hasCompartment || false);
                    setAmenities(data.amenities || []);
                    setCedulaPropietario(data.cedulaPropietario || '');
                }
            } catch (err) { console.error("Error al cargar borrador:", err); }
            finally { setLoadingDraft(false); }
        };
        fetchDraft();
    }, [userData]);

    // Pre-fill from Auth (Coop Name / RUC)
    useEffect(() => {
        if (userData) {
            setCoopRuc(`${userData.nombre_cooperativa || ''} / ${userData.ruc_empresa || ''}`);
        }
    }, [userData]);

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev => 
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const handleNext = async () => {
        if (!placa || !disco) {
            alert("Por favor ingrese al menos la placa y el número de disco.");
            return;
        }

        setIsSaving(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No hay sesión activa");

            const unitData = {
                placa,
                disco,
                marca,
                modelo,
                ruc_empresa: userData?.ruc_empresa || '',
                nombre_cooperativa: userData?.nombre_cooperativa || '',
                cedulaPropietario,
                busType,
                hasAssistant,
                seatingType,
                hasCompartment,
                amenities,
                creadoPor: user.uid,
                status: 'configuring',
                updatedAt: serverTimestamp()
            };

            // Creamos un ID temporal basado en el UID para que el diseñador lo encuentre
            const tempId = `temp_${user.uid}`;
            await setDoc(doc(db, 'units_draft', tempId), unitData);

            navigate('/seat-designer', { 
                state: { 
                    draftId: tempId,
                    unitData 
                } 
            });
        } catch (err: any) {
            console.error("Error guardando borrador:", err);
            setError("Error al guardar información: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#f7f9fb] text-[#191c1e] antialiased flex min-h-screen font-body justify-center">
            {/* Main Content - Expanded (removed sidebar) */}
            <main className="flex-grow min-h-screen max-w-7xl">
                {/* TopAppBar */}
                <header className="w-full sticky top-0 z-50 bg-[#f7f9fb]/80 backdrop-blur-md flex justify-between items-center px-12 py-6 border-b border-[#eceef0]">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined text-2xl">directions_bus</span>
                         </div>
                         <div>
                            <h2 className="font-headline tracking-tighter text-2xl font-black text-[#191c1e] italic">ORCHESTRATOR</h2>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Configuración de Nueva Unidad</p>
                         </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button onClick={() => navigate(-1)} className="text-slate-400 font-bold text-xs px-4 py-2 hover:bg-slate-100 rounded-xl transition-all">
                            DESCARTAR
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 opacity-30"></div>
                        <img
                            alt="Perfil"
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQmVVaEMf2q2-XylpDMelET_dYGtHoQO4QN5ZaPdMb-9B6gb5kCK8p7xNS89IDIa6M0hxnEd11kBdB6wfH-sNPMLB-MIKF7F_Iz_TgjQIkImTwCTODTXZEFZ9Vm8l6BK12ZdNBCF1QZxbo4ILPysz5ocWiABtwV-acpoCpZGDEeyf5wbgGalUQ6qhspIDSko3uRwUYtP2Ry-sHkScvg9EcjNVqd3r5eoGfhgCCTVccj3CMQQBNm0SzFpvSzDc3QCwH1-FDSkDWlAp2"
                        />
                    </div>
                </header>

                <div className="px-12 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Registration Form Section */}
                        <div className="col-span-12 lg:col-span-8 space-y-10">
                            {/* Identification Card */}
                            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                                <div className="mb-10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[#3755c3] text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Fase 01</h3>
                                        <p className="text-3xl font-black text-[#191c1e] tracking-tight">Ficha Técnica del Activo</p>
                                    </div>
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined text-3xl">badge</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#45464d] uppercase tracking-widest ml-1">Placa Nacional</label>
                                        <input
                                            className="w-full bg-[#f8fafc] border-2 border-transparent focus:border-blue-100 focus:bg-white px-6 py-4 rounded-2xl text-[#191c1e] font-black transition-all outline-none text-lg uppercase tracking-widest"
                                            placeholder="ABC-1234"
                                            type="text"
                                            value={placa}
                                            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#45464d] uppercase tracking-widest ml-1">Número de Disco</label>
                                        <input
                                            className="w-full bg-[#f8fafc] border-2 border-transparent focus:border-blue-100 focus:bg-white px-6 py-4 rounded-2xl text-[#191c1e] font-black transition-all outline-none text-lg"
                                            placeholder="045"
                                            type="text"
                                            value={disco}
                                            onChange={(e) => setDisco(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#45464d] uppercase tracking-widest ml-1">Marca del Fabricante</label>
                                        <input
                                            className="w-full bg-[#f8fafc] border-2 border-transparent focus:border-blue-100 focus:bg-white px-6 py-4 rounded-2xl text-[#191c1e] font-black transition-all outline-none"
                                            placeholder="Hino / Mercedes-Benz"
                                            type="text"
                                            value={marca}
                                            onChange={(e) => setMarca(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#45464d] uppercase tracking-widest ml-1">Modelo Comercial</label>
                                        <input
                                            className="w-full bg-[#f8fafc] border-2 border-transparent focus:border-blue-100 focus:bg-white px-6 py-4 rounded-2xl text-[#191c1e] font-black transition-all outline-none"
                                            placeholder="RK8J / Travego"
                                            type="text"
                                            value={modelo}
                                            onChange={(e) => setModelo(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 italic">Entidad Asignada</label>
                                        <input
                                            readOnly
                                            className="w-full bg-blue-50/30 border-2 border-blue-50 px-6 py-4 rounded-2xl text-[#3755c3] font-black outline-none cursor-default"
                                            value={coopRuc}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#45464d] uppercase tracking-widest ml-1">ID del Propietario</label>
                                        <input
                                            className="w-full bg-[#f8fafc] border-2 border-transparent focus:border-blue-100 focus:bg-white px-6 py-4 rounded-2xl text-[#191c1e] font-black transition-all outline-none"
                                            placeholder="1712345678"
                                            type="text"
                                            value={cedulaPropietario}
                                            onChange={(e) => setCedulaPropietario(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Technical Configuration Card */}
                            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                                <div className="mb-10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[#3755c3] text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Fase 02</h3>
                                        <p className="text-3xl font-black text-[#191c1e] tracking-tight">Parámetros Operacionales</p>
                                    </div>
                                    <span className="material-symbols-outlined text-blue-600 text-3xl">settings_input_component</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-[#45464d] uppercase tracking-widest ml-1">Arquitectura de Cabina</label>
                                        <div className="flex space-x-4">
                                            {['Normal', 'Dos Pisos'].map(type => (
                                                <button 
                                                    key={type}
                                                    onClick={() => setBusType(type)}
                                                    className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border-2 ${busType === type ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-[#45464d] uppercase tracking-widest ml-1">Personal de Bordo</label>
                                        <div className="flex space-x-4">
                                            {['Sí', 'No'].map(val => (
                                                <button 
                                                    key={val}
                                                    onClick={() => setHasAssistant(val)}
                                                    className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border-2 ${hasAssistant === val ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {val === 'Sí' ? 'Con Ayudante' : 'Solo Conductor'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-12 pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[#45464d] uppercase tracking-widest ml-1">Gama de Asientos</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Reclinables', 'Semi-reclinables', 'Básico'].map(cat => (
                                                <button 
                                                    key={cat}
                                                    onClick={() => setSeatingType(cat)}
                                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${seatingType === cat ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-blue-50/50 p-6 rounded-3xl">
                                        <div>
                                            <p className="text-[10px] font-black text-[#3755c3] uppercase tracking-widest">Compartimiento</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Bodega de carga pesada</p>
                                        </div>
                                        <button 
                                            onClick={() => setHasCompartment(!hasCompartment)}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${hasCompartment ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${hasCompartment ? 'translate-x-7' : 'translate-x-1'}`}></span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Amenities Checklist */}
                            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                                <div className="mb-10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[#3755c3] text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Fase 03</h3>
                                        <p className="text-3xl font-black text-[#191c1e] tracking-tight">Servicios Integrados</p>
                                    </div>
                                    <span className="material-symbols-outlined text-blue-600 text-3xl">hub</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                    {['wifi', 'music_note', 'tv', 'ac_unit', 'wc', 'usb'].map((icon) => {
                                        const label = icon === 'ac_unit' ? 'A/C' : icon.charAt(0).toUpperCase() + icon.slice(1).replace('_', ' ');
                                        const active = amenities.includes(icon);
                                        return (
                                            <button 
                                                key={icon}
                                                onClick={() => toggleAmenity(icon)}
                                                className={`flex items-center p-5 rounded-2xl transition-all border-2 ${active ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                <span className={`material-symbols-outlined mr-4 ${active ? 'text-blue-400' : 'text-slate-300'}`}>{icon}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        {/* Right Area: Status & Siguiente */}
                        <div className="col-span-12 lg:col-span-4">
                            <div className="sticky top-28 space-y-6">
                                <div className="bg-gradient-to-br from-[#00216e] to-[#001453] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                     <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 mb-10 italic">Estado del Proceso</h4>
                                     
                                     <div className="space-y-8 mb-12">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-blue-200/50 uppercase tracking-widest mb-1">Actualmente en</p>
                                                <p className="text-xl font-black italic">Registro Técnico</p>
                                            </div>
                                            <span className="bg-blue-500/20 px-4 py-1 rounded-full text-[10px] font-black text-blue-400">PASO 1/3</span>
                                        </div>
                                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                            <div className="w-1/3 h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                                        </div>
                                     </div>

                                     <p className="text-xs font-medium text-blue-200/60 leading-relaxed mb-10">
                                        La información técnica será validada por el despacho central del Terminal Digital. Asegúrese que la placa sea legible.
                                     </p>

                                     {error && <p className="text-red-400 text-xs font-black uppercase mb-6 bg-red-400/10 p-4 rounded-2xl">{error}</p>}

                                     <button
                                        onClick={handleNext}
                                        disabled={isSaving}
                                        className="w-full bg-white text-[#001453] font-black h-20 rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] group"
                                     >
                                        {isSaving ? 'Sincronizando...' : 'SIGUIENTE'}
                                        <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                     </button>
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-8 italic">Información Adicional</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <span className="material-symbols-outlined text-blue-600 text-lg">verified</span>
                                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Sus datos serán almacenados automáticamente en la nube privada de su cooperativa.</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <span className="material-symbols-outlined text-amber-500 text-lg">info</span>
                                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Podrá editar esta configuración técnica más tarde desde el centro de administración.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UnitRegistration;

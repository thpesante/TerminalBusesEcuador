import React, { useState, useEffect } from 'react';
import ERPSidebar from '../../components/erp/ERPSidebar';
import ERPTopBar from '../../components/erp/ERPTopBar';
import { db, auth } from '../../firebase';
import { collection, query, where, addDoc, serverTimestamp, onSnapshot, doc, updateDoc, getDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { validarCedula } from '../../utils/validators';
import { sequenceManager } from '../../services/SequenceManager';

interface Trip {
  id: string;
  destino: string;
  hora: string;
  precio: number;
  placaBus: string;
  discoBus: string;
  busId: string;
  asientosOcupados: string[];
  capacidad: number;
}

interface TicketData {
  cedula: string;
  nombre: string;
  asientos: string[];
  tarifa: string;
  precioUnitario: number;
}

export default function Ticketing() {
  const { userData } = useAuth();
  const rucEmpresa = userData?.ruc_empresa || '';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [unitTopology, setUnitTopology] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinalConsumer, setIsFinalConsumer] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [formData, setFormData] = useState<TicketData>({
    cedula: '',
    nombre: '',
    asientos: [],
    tarifa: 'ADULTO',
    precioUnitario: 0
  });

  const [message, setMessage] = useState('');

  // 1. Load Trips with selection synchronization
  useEffect(() => {
    if (!rucEmpresa) return;
    const qTrips = query(collection(db, 'trips'), where('ruc_empresa', '==', rucEmpresa));
    const unsub = onSnapshot(qTrips, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Trip[];
      setTrips(list);
      
      if (selectedTrip) {
          const freshData = list.find(t => t.id === selectedTrip.id);
          if (freshData) setSelectedTrip(freshData);
      } else if (list.length > 0) {
          setSelectedTrip(list[0]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [rucEmpresa, selectedTrip?.id]);

  // 2. Fetch Topology
  useEffect(() => {
    if (!selectedTrip?.busId) {
        setUnitTopology(null);
        return;
    }
    const fetchTopology = async () => {
        try {
            const snap = await getDoc(doc(db, 'units', selectedTrip.busId));
            if (snap.exists()) {
                setUnitTopology(snap.data().topologia);
            }
        } catch (e) { console.error("Error topology:", e); }
    };
    fetchTopology();
  }, [selectedTrip?.id]);

  // 3. Price Calc
  useEffect(() => {
    if (!selectedTrip) return;
    let base = selectedTrip.precio;
    if (formData.tarifa === 'TERCERA EDAD') base = base * 0.5;
    if (formData.tarifa === 'SOLO PARADA') base = 5.00;
    setFormData(prev => ({ ...prev, precioUnitario: base }));
  }, [formData.tarifa, selectedTrip?.precio]);

  const handleIdentityLookup = async () => {
    if (!validarCedula(formData.cedula)) {
      // Si no es cédula válida, no intentamos el scraper
      return;
    }
    try {
      const proxyUrl = 'https://infoplacas.herokuapp.com/';
      const targetUrl = 'https://si.secap.gob.ec/sisecap/logeo_web/json/busca_persona_registro_civil.php';
      const params = new URLSearchParams();
      params.append('documento', formData.cedula);
      params.append('tipo', '1');
      const response = await fetch(proxyUrl + targetUrl, { method: 'POST', body: params });
      const data = await response.json();
      if (data && data.nombres) {
        setFormData(prev => ({ ...prev, nombre: `${data.nombres} ${data.apellidos}` }));
        setDataLoaded(true);
      }
    } catch (e) { console.error("Error lookup", e); }
  };

  const handleSetFinalConsumer = () => {
    setIsFinalConsumer(!isFinalConsumer);
    if (!isFinalConsumer) {
        setFormData(prev => ({ ...prev, cedula: '9999999999', nombre: 'CONSUMIDOR FINAL' }));
        setDataLoaded(true);
    } else {
        setFormData(prev => ({ ...prev, cedula: '', nombre: '' }));
        setDataLoaded(false);
    }
  };

  const toggleSeat = (label: string) => {
    setFormData(prev => ({
        ...prev,
        asientos: prev.asientos.includes(label) 
            ? prev.asientos.filter(a => a !== label) 
            : [...prev.asientos, label]
    }));
  };

  const handleEmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || formData.asientos.length === 0 || !dataLoaded) {
      alert("Faltan datos del pasajero o selección de asientos.");
      return;
    }

    try {
      setIsProcessing(true);
      
      const tripRef = doc(db, 'trips', selectedTrip.id);
      const puntoEmision = userData?.officeId || '001';

      // Obtener números secuenciales para cada asiento
      const ticketNumbers: number[] = [];
      for (let i = 0; i < formData.asientos.length; i++) {
        const num = await sequenceManager.getNextNumber(rucEmpresa, puntoEmision);
        ticketNumbers.push(num);
      }

      // BLINDAJE TOTAL: Transacción Atómica
      await runTransaction(db, async (transaction) => {
        const tripDoc = await transaction.get(tripRef);
        if (!tripDoc.exists()) throw "El viaje no existe.";

        const currentOccupied = tripDoc.data().asientosOcupados || [];
        const alreadyTaken = formData.asientos.filter(s => currentOccupied.includes(s));

        if (alreadyTaken.length > 0) {
          throw `Error: Los asientos ${alreadyTaken.join(', ')} acaban de ser vendidos por otro usuario.`;
        }

        // 1. Bloqueo de asientos
        transaction.update(tripRef, {
          asientosOcupados: [...currentOccupied, ...formData.asientos]
        });

        // 2. Emitir boletos individuales
        formData.asientos.forEach((seatLabel, index) => {
          const ticketRef = doc(collection(db, 'tickets'));
          const ticketNumber = ticketNumbers[index];
          
          transaction.set(ticketRef, {
            tripId: selectedTrip.id,
            ruc_empresa: rucEmpresa,
            puntoEmision: puntoEmision,
            secuencial: ticketNumber,
            numeroBoleto: `${puntoEmision}-${ticketNumber.toString().padStart(9, '0')}`,
            pasajero: { cedula: formData.cedula, nombre: formData.nombre },
            asiento: seatLabel,
            tarifa: formData.tarifa,
            precio: formData.precioUnitario,
            vendedorId: auth.currentUser?.uid,
            createdAt: serverTimestamp()
          });

          const cashRef = doc(collection(db, 'cash_transactions'));
          transaction.set(cashRef, {
            ruc_empresa: rucEmpresa,
            tipo: 'INGRESO',
            concepto: `Boleto #${ticketNumber} - Asiento ${seatLabel} - ${selectedTrip.destino}`,
            monto: formData.precioUnitario,
            vendedorId: auth.currentUser?.uid,
            createdAt: serverTimestamp()
          });
        });
      });

      setMessage(`${formData.asientos.length} BOLETOS EMITIDOS CON ÉXITO`);
      setFormData({ cedula: '', nombre: '', asientos: [], tarifa: 'ADULTO', precioUnitario: 0 });
      setDataLoaded(false);
      setIsFinalConsumer(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) { 
      alert(typeof err === 'string' ? err : "Error en el proceso de venta transaccional."); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const totalVenta = formData.asientos.length * formData.precioUnitario;

  const getCellColor = (id: string, type: string) => {
    const isOccupied = selectedTrip?.asientosOcupados?.includes(id);
    const isSelected = formData.asientos.includes(id);
    
    if (isOccupied) return 'bg-red-500 text-white border-red-600 opacity-40 cursor-not-allowed';
    if (isSelected) return 'bg-[#ffe07f] text-[#001453] border-[#001453] shadow-lg scale-105 z-10';
    if (type === 'seat') return 'bg-white text-[#00216e] border-slate-50 hover:border-[#00216e]';
    if (type === 'bathroom') return 'bg-slate-900 text-white border-black';
    if (type === 'entrance') return 'bg-emerald-400 text-white border-emerald-500';
    return 'bg-transparent border-transparent cursor-default';
  };

  return (
    <div className="flex bg-[#f8fafc] text-slate-800 font-body min-h-screen">
      <ERPSidebar activePath="/erp/ticketing" />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <ERPTopBar title="Emisión de Boletos Electrónicos" />
        
        <div className="p-8 flex-1 overflow-y-auto">
           <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-10 pb-20">
              <section className="col-span-12 lg:col-span-7 space-y-10">
                 <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-12">
                       <h2 className="text-3xl font-black text-[#00216e] uppercase italic tracking-tighter decoration-[#ffe07f] decoration-8 underline underline-offset-8">Taquilla de Despacho</h2>
                       {message && <div className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] animate-bounce">{message}</div>}
                    </div>

                    <form onSubmit={handleEmitTicket} className="space-y-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-6 italic">Selección de Ruta Activa</label>
                          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-3 custom-scrollbar">
                             {trips.map(trip => (
                                <button key={trip.id} type="button" onClick={() => setSelectedTrip(trip)} className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${selectedTrip?.id === trip.id ? 'bg-[#00216e] border-[#00216e] text-white shadow-xl' : 'bg-[#f8fafc] border-transparent hover:border-slate-100 text-slate-500'}`}>
                                   <div className="flex items-center gap-6">
                                      <span className="material-symbols-outlined">{selectedTrip?.id === trip.id ? 'check_circle' : 'circle'}</span>
                                      <div>
                                         <p className="font-black text-lg uppercase italic tracking-tighter">{trip.destino}</p>
                                         <p className={`text-[9px] font-black uppercase tracking-widest ${selectedTrip?.id === trip.id ? 'text-blue-300' : 'text-slate-300'}`}>{trip.hora}hs • #{trip.discoBus}</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-2xl font-black font-headline italic tracking-tighter">$ {trip.precio}</p>
                                      <p className="text-[8px] font-black opacity-30 mt-1 uppercase">Tarifa Piso</p>
                                   </div>
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-6 italic">Asientos Marcados ({formData.asientos.length})</label>
                             <div className="w-full bg-[#f8fafc] min-h-[4rem] py-4 rounded-[2.5rem] flex flex-wrap gap-2 px-10 border border-slate-50">
                                {formData.asientos.map(a => (
                                    <span key={a} className="bg-[#00216e] text-white px-4 py-1.5 rounded-full text-[10px] font-black">#{a}</span>
                                ))}
                                {formData.asientos.length === 0 && <p className="text-[10px] font-black text-slate-200 uppercase mt-1">Haga click en los asientos</p>}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-6 italic">Categoría Tarifaria</label>
                             <select value={formData.tarifa} onChange={e => setFormData({...formData, tarifa: e.target.value})} className="w-full bg-[#f8fafc] h-16 rounded-[2rem] px-10 font-black text-xs uppercase text-[#00216e] outline-none border-2 border-transparent focus:border-blue-100">
                                <option value="ADULTO">ADULTO (100%)</option>
                                <option value="TERCERA EDAD">TERCERA EDAD (50%)</option>
                                <option value="SOLO PARADA">TARIFA PARADA</option>
                             </select>
                          </div>
                       </div>

                       <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-50 space-y-10">
                          <div className="flex flex-col gap-8">
                             <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-[#00216e] uppercase tracking-widest italic">Protocolo de Facturación</h4>
                                <button type="button" onClick={handleSetFinalConsumer} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isFinalConsumer ? 'bg-slate-900 text-white' : 'bg-white border text-slate-400'}`}>
                                   Usar Consumidor Final
                                </button>
                             </div>
                             
                             <div className="grid grid-cols-12 gap-8">
                                <div className="col-span-12 space-y-4">
                                   <label className="text-[9px] font-black text-slate-300 uppercase ml-6">Documento de Identidad (Cédula / RUC)</label>
                                   <div className="flex gap-4">
                                      <input disabled={isFinalConsumer} value={formData.cedula} onChange={e => { setFormData({...formData, cedula: e.target.value}); if (e.target.value.length === 10) handleIdentityLookup(); }} className="flex-1 bg-white h-20 rounded-[2.5rem] px-10 font-black text-xl text-[#00216e] outline-none border-2 border-transparent focus:border-blue-100 disabled:opacity-50 shadow-inner" placeholder="010XXXXXXX" />
                                      <button disabled={isFinalConsumer} type="button" onClick={handleIdentityLookup} className="w-20 h-20 bg-[#001453] text-white rounded-[2rem] flex items-center justify-center hover:bg-black transition-all shadow-xl shadow-blue-900/20">
                                         <span className="material-symbols-outlined text-2xl">person_search</span>
                                      </button>
                                   </div>
                                </div>
                                <div className="col-span-12 space-y-4">
                                   <label className="text-[9px] font-black text-slate-300 uppercase ml-6">Nombres y Apellidos Completos</label>
                                   <input disabled={isFinalConsumer} value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white h-20 rounded-[2.5rem] px-10 font-black uppercase text-lg text-[#00216e] italic disabled:opacity-50 outline-none border-2 border-transparent focus:border-blue-100 shadow-inner" placeholder="Ingrese nombre del pasajero..." />
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center justify-between p-10 bg-[#001453] rounded-[3rem] text-white shadow-2xl">
                          <div>
                            <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Cálculo de Transacción</p>
                            <p className="text-4xl font-black font-headline italic tracking-tighter">$ {totalVenta.toFixed(2)}</p>
                          </div>
                          <button type="submit" disabled={!dataLoaded || formData.asientos.length === 0 || isProcessing} className="bg-white text-[#001453] px-12 h-20 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:grayscale">
                            {isProcessing ? 'Sincronizando...' : `Vender ${formData.asientos.length} Boletos`}
                          </button>
                       </div>
                    </form>
                 </div>
              </section>

              <section className="col-span-12 lg:col-span-5 space-y-10">
                 <div className="bg-white rounded-[4rem] p-10 shadow-sm border border-slate-100 flex flex-col h-fit">
                    <div className="flex items-center justify-between mb-10">
                       <div>
                          <h3 className="text-xl font-black text-[#00216e] italic uppercase">Mapa de {selectedTrip?.placaBus || 'Unidad'}</h3>
                          <p className="text-[9px] font-black text-slate-300 uppercase mt-1">Disco {selectedTrip?.discoBus} • {selectedTrip?.capacidad} Pax</p>
                       </div>
                       <div className="w-14 h-14 bg-[#f8fafc] rounded-2xl flex items-center justify-center text-slate-300">
                          <span className="material-symbols-outlined text-3xl">grid_view</span>
                       </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-[3rem] p-10 relative border border-slate-100">
                        {unitTopology ? (
                            <div className="max-w-[320px] mx-auto space-y-6">
                               <p className="text-[8px] font-black text-center text-slate-400 mb-6 tracking-widest">INTERIOR CABINA SUPERIOR</p>
                               <div className="grid grid-cols-4 gap-3">
                                  {Object.values(unitTopology.superior || {}).sort((a:any, b:any) => a.row - b.row || a.col - b.col).map((c: any) => {
                                      const isOccupied = (selectedTrip?.asientosOcupados || []).includes(c.label);
                                      return (
                                        <button key={c.id} type="button" disabled={isOccupied || c.type !== 'seat'} onClick={() => toggleSeat(c.label)} className={`aspect-square rounded-2xl flex items-center justify-center text-[11px] font-black border-2 transition-all shadow-sm ${getCellColor(c.label, c.type)}`}>
                                           {c.type === 'seat' ? c.label : c.type === 'bathroom' ? 'WC' : c.type === 'entrance' ? 'ENT' : ''}
                                        </button>
                                      );
                                  })}
                               </div>
                               {unitTopology.inferior && Object.keys(unitTopology.inferior).length > 0 && (
                                  <>
                                     <div className="h-px bg-slate-200 my-10"></div>
                                     <p className="text-[8px] font-black text-center text-slate-400 mb-6 tracking-widest text-[#d946ef]">INTERIOR CABINA INFERIOR</p>
                                     <div className="grid grid-cols-4 gap-3">
                                        {Object.values(unitTopology.inferior || {}).sort((a:any, b:any) => a.row - b.row || a.col - b.col).map((c: any) => {
                                            const isOccupied = (selectedTrip?.asientosOcupados || []).includes(c.label);
                                            return (
                                              <button key={c.id} type="button" disabled={isOccupied || c.type !== 'seat'} onClick={() => toggleSeat(c.label)} className={`aspect-square rounded-2xl flex items-center justify-center text-[11px] font-black border-2 transition-all shadow-sm ${getCellColor(c.label, c.type)}`}>
                                                 {c.type === 'seat' ? c.label : c.type === 'bathroom' ? 'WC' : c.type === 'entrance' ? 'ENT' : ''}
                                              </button>
                                            );
                                        })}
                                     </div>
                                  </>
                               )}
                            </div>
                        ) : (
                            <div className="py-40 flex flex-col items-center justify-center opacity-10">
                               <span className="material-symbols-outlined text-8xl">settings_input_component</span>
                               <p className="text-[10px] font-black uppercase mt-6">Cargando Estructura...</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-6">
                       <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl">
                          <span className="text-2xl font-black text-[#00216e]">{selectedTrip ? (selectedTrip.capacidad - (selectedTrip.asientosOcupados?.length || 0)) : 0}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Libres</span>
                       </div>
                       <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl">
                          <span className="text-2xl font-black text-red-500">{selectedTrip?.asientosOcupados?.length || 0}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Ocupados</span>
                       </div>
                       <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl">
                          <span className="text-2xl font-black text-emerald-500">{(formData.asientos || []).length}</span>
                          <span className="text-[8px] font-black text-emerald-500/50 uppercase mt-1">Marcados</span>
                       </div>
                    </div>
                 </div>
              </section>
           </div>
        </div>
      </main>
    </div>
  );
}

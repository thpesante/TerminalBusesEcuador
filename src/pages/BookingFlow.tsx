import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface Trip {
  id: string;
  destino: string;
  origen: string;
  hora: string;
  precio: number;
  discoBus: string;
  ruc_empresa: string;
  busId: string;
  asientosOcupados?: string[];
  capacidad?: number;
}

interface Unit {
  id: string;
  amenities: string[];
  busType: string;
  capacidad: number;
  disco: string;
  marca: string;
  modelo: string;
  nombre_cooperativa: string;
  topologia: {
    superior: Record<string, any>;
    inferior?: Record<string, any>;
  };
}

const BookingFlow: React.FC = () => {
  const { id: rucEmpresa } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<'schedule' | 'details' | 'seats' | 'payment' | 'success'>('schedule');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch Trips
  useEffect(() => {
    if (!rucEmpresa) return;
    const q = query(collection(db, 'trips'), where('ruc_empresa', '==', rucEmpresa), where('estado', '==', 'PROGRAMADO'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
      setTrips(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [rucEmpresa]);

  // 2. Real-time occupied seats & trip data
  useEffect(() => {
    if (!selectedTrip?.id) return;
    const unsub = onSnapshot(doc(db, 'trips', selectedTrip.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Trip;
        setOccupiedSeats(data.asientosOcupados || []);
      }
    });
    return () => unsub();
  }, [selectedTrip?.id]);

  // 3. Fetch Unit Details
  useEffect(() => {
    if (!selectedTrip?.busId) return;
    const fetchUnit = async () => {
      const unitSnap = await getDoc(doc(db, 'units', selectedTrip.busId));
      if (unitSnap.exists()) {
        setSelectedUnit({ id: unitSnap.id, ...unitSnap.data() } as Unit);
      }
    };
    fetchUnit();
  }, [selectedTrip?.busId]);

  const handleConfirmSeats = async () => {
    if (!selectedTrip || selectedSeats.length === 0 || !auth.currentUser) {
      alert("Seleccione al menos un asiento.");
      return;
    }

    setIsProcessing(true);
    try {
      const tripRef = doc(db, 'trips', selectedTrip.id);

      await runTransaction(db, async (transaction) => {
        const tripDoc = await transaction.get(tripRef);
        if (!tripDoc.exists()) throw "El viaje no existe.";

        const currentOccupied = tripDoc.data().asientosOcupados || [];
        const alreadyTaken = selectedSeats.filter(s => currentOccupied.includes(s));

        if (alreadyTaken.length > 0) {
          throw `Lo sentimos, los asientos ${alreadyTaken.join(', ')} ya fueron reservados.`;
        }

        // Update trip with new occupied seats
        transaction.update(tripRef, {
          asientosOcupados: [...currentOccupied, ...selectedSeats]
        });

        // Create tickets
        for (const seat of selectedSeats) {
          const ticketRef = doc(collection(db, 'tickets'));
          transaction.set(ticketRef, {
            tripId: selectedTrip.id,
            ruc_empresa: selectedTrip.ruc_empresa,
            origen: selectedTrip.origen,
            destino: selectedTrip.destino,
            hora: selectedTrip.hora,
            pasajero: {
              uid: auth.currentUser?.uid,
              nombre: auth.currentUser?.displayName || 'Pasajero',
            },
            asiento: seat,
            precio: selectedTrip.precio,
            estado: 'ACTIVO',
            createdAt: serverTimestamp()
          });
        }

        // Register transaction in cash (optional depending on business logic for online sales)
        const cashRef = doc(collection(db, 'cash_transactions'));
        transaction.set(cashRef, {
          ruc_empresa: selectedTrip.ruc_empresa,
          monto: selectedTrip.precio * selectedSeats.length,
          tipo: 'INGRESO',
          concepto: `Venta Online - ${selectedTrip.destino} (Asientos: ${selectedSeats.join(', ')})`,
          metodo: 'DIGITAL',
          vendedorId: auth.currentUser?.uid,
          createdAt: serverTimestamp()
        });
      });

      setStep('success');
    } catch (e: any) {
      alert(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSeat = (label: string) => {
    if (occupiedSeats.includes(label)) return;
    setSelectedSeats(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDF8FF]">
      <div className="w-12 h-12 border-4 border-[#4A22CF] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // --- RENDERING SCREENS ---

  if (step === 'schedule') {
    return (
      <div className="min-h-screen bg-[#FDF8FF] pt-24 pb-12 px-6">
        <header className="fixed top-0 left-0 w-full z-50 bg-[#FDF8FF]/80 backdrop-blur-md px-8 py-6 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-[#4A22CF]"><span className="material-symbols-outlined font-bold">arrow_back</span></button>
          <h1 className="text-xl font-bold text-[#1C1A24]">Seleccionar Viaje</h1>
        </header>

        <main className="max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {trips.map(trip => (
              <button
                key={trip.id}
                onClick={() => { setSelectedTrip(trip); setStep('details'); }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-[#F7F1FF] flex justify-between items-center hover:scale-[1.02] transition-transform text-left w-full"
              >
                <div>
                  <p className="text-[#4A22CF] text-[10px] font-bold tracking-widest uppercase">SERVICIO EJECUTIVO</p>
                  <h3 className="text-2xl font-extrabold text-[#1C1A24] mt-1">{trip.origen} a {trip.destino}</h3>
                  <div className="flex gap-4 mt-3">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#484555] bg-[#F7F1FF] px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> {trip.hora}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#484555] bg-[#F7F1FF] px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-[14px]">directions_bus</span> Disco {trip.discoBus}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#484555]">DESDE</p>
                  <p className="text-2xl font-black text-[#4A22CF]">${trip.precio.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (step === 'details' && selectedTrip) {
    return (
      <div className="min-h-screen bg-[#FDF8FF] flex flex-col relative">
        {/* TopBar */}
        <header className="px-8 py-6 flex items-center justify-between">
          <button onClick={() => setStep('schedule')} className="text-[#4A22CF]">
            <span className="material-symbols-outlined font-bold">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-[#1C1A24]">Detalles del Viaje</h1>
          <button className="text-[#4A22CF]">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-32 space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <p className="text-[#4A22CF] text-[10px] font-bold tracking-[2px] uppercase">SERVICIO EJECUTIVO</p>
            <div className="flex justify-between items-end">
              <h2 className="text-4xl font-extrabold text-[#1C1A24] leading-tight">
                {selectedTrip.origen} a<br />{selectedTrip.destino}
              </h2>
              <div className="bg-[#4A22CF] text-white p-4 rounded-2xl shadow-lg flex flex-col items-center">
                <span className="text-[10px] font-bold opacity-80 uppercase">DESDE</span>
                <span className="text-2xl font-extrabold">${selectedTrip.precio.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="bg-[#F7F1FF] px-4 py-2 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-[#4A22CF]">schedule</span>
                <span className="text-xs font-semibold">{selectedTrip.hora} — Arribo estimado</span>
              </div>
              <div className="bg-[#F7F1FF] px-4 py-2 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-[#4A22CF]">calendar_today</span>
                <span className="text-xs font-semibold">Hoy</span>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-[#F7F1FF]">
              <p className="text-[10px] font-bold text-[#484555] uppercase">CONDUCTOR</p>
              <p className="text-base font-bold text-[#1C1A24] mt-1">Carlos Pérez</p>
              <p className="text-[11px] text-[#484555]">12 años exp.</p>
            </div>
            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-[#F7F1FF]">
              <p className="text-[10px] font-bold text-[#484555] uppercase">VEHÍCULO</p>
              <p className="text-base font-bold text-[#1C1A24] mt-1">Unidad {selectedTrip.discoBus}</p>
              <p className="text-[11px] text-[#484555]">{selectedUnit?.marca || 'Mercedes-Benz'}</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-[#F7F1FF] p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4A22CF]">hotel_class</span>
              <span className="font-bold text-[#1C1A24]">Servicios a Bordo</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(selectedUnit?.amenities || ['wifi', 'ac_unit']).map(amenity => (
                <div key={amenity} className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[#4A22CF] text-2xl">
                    {amenity === 'wifi' ? 'wifi' : amenity === 'ac_unit' ? 'ac_unit' : amenity === 'power' ? 'power' : 'star'}
                  </span>
                  <span className="text-[10px] font-bold uppercase">
                    {amenity === 'ac_unit' ? 'Clima' : amenity === 'power' ? 'Enchufe' : amenity === 'wifi' ? 'Wi-Fi' : amenity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Box */}
          <div className="relative h-48 rounded-3xl overflow-hidden bg-slate-200">
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A24]/80 to-transparent"></div>
            <p className="absolute bottom-4 left-4 text-white font-bold text-xl">Viaja con Comodidad</p>
          </div>
        </main>

        {/* FAB */}
        <button
          onClick={() => setStep('seats')}
          className="fixed bottom-8 right-8 bg-[#4A22CF] text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">event_seat</span>
          <span className="font-bold uppercase tracking-wide text-sm">Seleccionar Asientos</span>
        </button>
      </div>
    );
  }

  if (step === 'seats' && selectedTrip) {
    const totalAmount = selectedSeats.length * selectedTrip.precio;

    const renderDeck = (deck: Record<string, any>, title: string) => {
      if (!deck || Object.keys(deck).length === 0) return null;
      return (
        <div className="w-full flex flex-col items-center space-y-4">
          <p className="text-[9px] font-bold text-[#484555]/40 tracking-[2px] uppercase">{title}</p>
          <div className="grid grid-cols-4 gap-4 w-full max-w-[280px]">
            {Object.values(deck).sort((a, b) => a.row - b.row || a.col - b.col).map((cell: any) => {
              if (cell.type === 'empty' || cell.type === 'aisle') return <div key={cell.id} className="w-12 h-12"></div>;

              const isOccupied = occupiedSeats.includes(cell.label);
              const isSelected = selectedSeats.includes(cell.label);

              return (
                <button
                  key={cell.id}
                  disabled={isOccupied}
                  onClick={() => toggleSeat(cell.label)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold transition-all
                    ${isOccupied ? 'bg-[#DDD8E5]/40 text-black/20 cursor-not-allowed' :
                      isSelected ? 'bg-gradient-to-br from-[#4A22CF] to-[#6344E7] text-white shadow-lg scale-110' :
                        'bg-[#E5E0EE] text-[#484555] active:scale-95'}
                  `}
                >
                  {cell.type === 'seat' ? cell.label : cell.type === 'bathroom' ? 'WC' : cell.type === 'entrance' ? 'ENT' : ''}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
        <header className="px-8 py-6 flex items-center justify-between bg-[#FDF8FF]">
          <button onClick={() => setStep('details')} className="text-[#4A22CF]">
            <span className="material-symbols-outlined font-bold">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-[#1C1A24]">Detalles del Viaje</h1>
          <button className="text-[#484555]/60">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-48">
          {/* Route Summary */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-[#484555] tracking-[1.5px] uppercase">RUTA Y HORARIO</p>
              <h2 className="text-2xl font-extrabold text-[#1C1A24]">{selectedTrip.origen} a {selectedTrip.destino}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#484555]">BUS {selectedTrip.discoBus}</p>
              <p className="text-xl font-bold text-[#4519CA]">{selectedTrip.hora}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-[#F7F1FF] p-4 rounded-2xl flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#E5E0EE] rounded-md"></div>
              <span className="text-xs font-medium text-[#484555]">Libre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-[#4A22CF] to-[#6344E7] rounded-md"></div>
              <span className="text-xs font-medium text-[#484555]">Elegido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#DDD8E5]/40 rounded-md border border-[#DDD8E5]/50"></div>
              <span className="text-xs font-medium text-[#484555]">Ocupado</span>
            </div>
          </div>

          {/* Bus Body */}
          <div className="bg-[#F7F1FF] border border-black/5 rounded-[40px] py-10 px-4 flex flex-col items-center space-y-10">
            <div className="w-16 h-1 bg-[#E5E0EE] rounded-full"></div>
            <div className="flex items-center gap-2 text-[#484555]/40">
              <span className="material-symbols-outlined text-[14px]">directions_bus</span>
              <span className="text-[10px] font-bold tracking-[2px] uppercase">CABINA</span>
            </div>

            {/* Grid Generation based on topology */}
            {selectedUnit ? (
              <>
                {renderDeck(selectedUnit.topologia.superior, "BUS DE PISO SUPERIOR")}
                {selectedUnit.topologia.inferior && Object.keys(selectedUnit.topologia.inferior).length > 0 && (
                  <>
                    <div className="w-full h-px bg-black/5 border-t border-dashed border-black/10"></div>
                    {renderDeck(selectedUnit.topologia.inferior, "BUS DE PISO INFERIOR")}
                  </>
                )}
              </>
            ) : (
              <p className="text-xs font-bold opacity-20 py-20">Cargando Mapa...</p>
            )}

            <div className="flex items-center gap-2 text-[#484555]/40">
              <span className="text-[10px] font-bold tracking-[2px] uppercase">BAÑO</span>
              <span className="material-symbols-outlined text-[14px]">wc</span>
            </div>
          </div>


          {/* Current Selection Info */}
          {selectedSeats.length > 0 && (
            <div className="mt-8 bg-white p-5 rounded-2xl shadow-sm border border-[#F7F1FF] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#484555] uppercase">ASIENTO SELECCIONADO</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4A22CF] to-[#6344E7] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {selectedSeats[0]}
                  </div>
                  <p className="font-bold text-[#1C1A24]">
                    {selectedSeats.length > 1 ? `+${selectedSeats.length - 1} más` : 'Asignado'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#484555] uppercase">CARGOS</p>
                <p className="text-xl font-bold text-[#4519CA] mt-1">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Confirmation Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl rounded-t-[32px] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] border-t border-[#F7F1FF]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-xs text-[#484555]">Monto Total</p>
              <p className="text-3xl font-black text-[#1C1A24] tracking-tight">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-[#EBE6F3] px-4 py-2 rounded-full">
              <p className="text-[10px] font-bold text-[#1C1A24]">{selectedSeats.length} PASAJERO{selectedSeats.length !== 1 ? 'S' : ''}</p>
            </div>
          </div>
          <button
            disabled={selectedSeats.length === 0 || isProcessing}
            onClick={handleConfirmSeats}
            className="w-full bg-gradient-to-r from-[#4A22CF] to-[#6344E7] h-16 rounded-full text-white font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#4A22CF]/20 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Confirmar Selección
                <span className="material-symbols-outlined">keyboard_arrow_right</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#FDF8FF] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#4A22CF] text-white rounded-full flex items-center justify-center shadow-2xl mb-8">
          <span className="material-symbols-outlined text-5xl">verified</span>
        </div>
        <h2 className="text-4xl font-extrabold text-[#1C1A24] mb-4">¡Reserva Exitosa!</h2>
        <p className="text-[#484555] font-semibold text-sm max-w-xs mb-12 uppercase tracking-wide">
          Tu viaje ha sido procesado y tus asientos ({selectedSeats.join(', ')}) han sido asignados.
        </p>
        <button
          onClick={() => navigate('/perfil')}
          className="bg-[#4A22CF] text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-[#4A22CF]/20 hover:-translate-y-1 transition-all"
        >
          Ver mis Boletos
        </button>
      </div>
    );
  }

  return null;
};

export default BookingFlow;


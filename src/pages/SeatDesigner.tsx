import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type SeatStatus = 'available' | 'occupied' | 'restricted';
type SeatCategory = 'Primera Clase' | 'Ejecutivo' | 'Económica Plus' | 'Económica';

interface Seat {
  id: string;
  label: string;
  row: number;
  col: 'A' | 'B' | 'C' | 'D';
  status: SeatStatus;
  category: SeatCategory;
  amenities: string[];
  price: number;
}

type FloorType = 'superior' | 'inferior';

const CATEGORY_PRICES: Record<SeatCategory, number> = {
  'Primera Clase': 145,
  'Ejecutivo': 95,
  'Económica Plus': 65,
  'Económica': 40,
};

const AMENITY_OPTIONS = [
  { icon: 'bolt', label: 'Corriente' },
  { icon: 'wifi', label: 'Wi-Fi' },
  { icon: 'tv', label: 'Pantalla' },
  { icon: 'airline_seat_recline_extra', label: 'Espacio+' },
];

const generateDefaultSeats = (rows: number): Seat[] => {
  const seats: Seat[] = [];
  for (let r = 1; r <= rows; r++) {
    (['A', 'B', 'C', 'D'] as const).forEach(col => {
      seats.push({
        id: `${r}${col}`,
        label: `${r}${col}`,
        row: r,
        col,
        status: 'available',
        category: 'Ejecutivo',
        amenities: ['bolt'],
        price: 95,
      });
    });
  }
  return seats;
};

const PRESET_CONFIGS = {
  standard: { rows: 12, name: 'Estándar 2x2', seats: 48 },
  executive: { rows: 8, name: 'Ejecutivo 2x1', seats: 24 },
  custom: { rows: 10, name: 'Suite Personalizada', seats: 40 },
};

const SeatDesigner: React.FC = () => {
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState<FloorType>('superior');
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [superiorSeats, setSuperiorSeats] = useState<Seat[]>(generateDefaultSeats(12));
  const [inferiorSeats, setInferiorSeats] = useState<Seat[]>(generateDefaultSeats(6));
  const [activePreset, setActivePreset] = useState<'standard' | 'executive' | 'custom'>('standard');

  const seats = activeFloor === 'superior' ? superiorSeats : inferiorSeats;
  const setSeats = activeFloor === 'superior' ? setSuperiorSeats : setInferiorSeats;

  const selectedSeat = seats.find(s => s.id === selectedSeatId) ?? null;
  const rows = Array.from(new Set(seats.map(s => s.row))).sort((a, b) => a - b);
  const maxRow = rows.length > 0 ? Math.max(...rows) : 0;

  const updateSeat = useCallback((id: string, changes: Partial<Seat>) => {
    setSeats(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));
  }, [setSeats]);

  const toggleAmenity = (amenity: string) => {
    if (!selectedSeat) return;
    const has = selectedSeat.amenities.includes(amenity);
    updateSeat(selectedSeat.id, {
      amenities: has
        ? selectedSeat.amenities.filter(a => a !== amenity)
        : [...selectedSeat.amenities, amenity],
    });
  };

  const addRow = () => {
    const newRow = maxRow + 1;
    const newSeats: Seat[] = (['A', 'B', 'C', 'D'] as const).map(col => ({
      id: `${newRow}${col}`,
      label: `${newRow}${col}`,
      row: newRow,
      col,
      status: 'available',
      category: 'Ejecutivo',
      amenities: ['bolt'],
      price: 95,
    }));
    setSeats(prev => [...prev, ...newSeats]);
  };

  const removeLastRow = () => {
    if (maxRow <= 1) return;
    setSeats(prev => prev.filter(s => s.row !== maxRow));
    if (selectedSeat && selectedSeat.row === maxRow) setSelectedSeatId(null);
  };

  const autoNumber = () => {
    setSeats(prev => {
      const sorted = [...prev].sort((a, b) => a.row - b.row || a.col.localeCompare(b.col));
      return sorted.map(s => ({ ...s, label: `${s.row}${s.col}` }));
    });
  };

  const applyCategoryToAll = (category: SeatCategory) => {
    setSeats(prev => prev.map(s => ({ ...s, category, price: CATEGORY_PRICES[category] })));
  };

  const applyPreset = (preset: 'standard' | 'executive' | 'custom') => {
    setActivePreset(preset);
    const config = PRESET_CONFIGS[preset];
    setSuperiorSeats(generateDefaultSeats(config.rows));
    setInferiorSeats(generateDefaultSeats(Math.floor(config.rows / 2)));
    setSelectedSeatId(null);
  };

  const statusColor = (s: Seat, isSelected: boolean) => {
    if (isSelected) return 'bg-[#3755c3] text-white ring-4 ring-[#3755c3]/20 scale-105 shadow-lg';
    if (s.status === 'occupied') return 'bg-[#191c1e] text-white cursor-pointer hover:opacity-80';
    if (s.status === 'restricted') return 'bg-[#d8dadc] text-[#76777d] cursor-not-allowed';
    return 'bg-[#d0e1fb] text-[#3755c3] cursor-pointer hover:bg-[#3755c3] hover:text-white';
  };

  const cycleStatus = (seat: Seat) => {
    const cycle: SeatStatus[] = ['available', 'occupied', 'restricted'];
    const next = cycle[(cycle.indexOf(seat.status) + 1) % cycle.length];
    updateSeat(seat.id, { status: next });
  };

  const occupied = seats.filter(s => s.status === 'occupied').length;
  const total = seats.length;

  return (
    <div className="flex flex-col h-screen bg-[#f7f9fb] text-[#191c1e] font-body text-left overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center px-6 py-3 bg-[#f7f9fb] border-b border-slate-200 z-40">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/unit-registration')}
            className="p-2 rounded-xl text-[#45464d] hover:bg-[#eceef0] transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-black text-[#191c1e] truncate">Constructor de Asientos</h1>
            <p className="text-[10px] font-bold text-[#45464d] uppercase tracking-widest truncate">Volvo B11R Premium • {total} asientos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Floor Toggle */}
          <div className="flex gap-1 bg-[#e6e8ea] p-1 rounded-xl">
            {(['superior', 'inferior'] as FloorType[]).map(floor => (
              <button
                key={floor}
                onClick={() => { setActiveFloor(floor); setSelectedSeatId(null); }}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeFloor === floor ? 'bg-white text-[#191c1e] shadow-sm' : 'text-[#45464d]'}`}
              >
                Piso {floor === 'superior' ? 'Superior' : 'Inferior'}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/unit-confirmation')}
            className="flex items-center gap-2 bg-[#3755c3] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#001453] transition-all shadow-lg shadow-[#3755c3]/20 active:scale-95"
          >
            Finalizar Unidad
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL: Presets & Tools */}
        <aside className="w-56 flex-shrink-0 bg-[#f2f4f6] border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Presets */}
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#45464d] mb-3">Plantillas</h3>
              <div className="space-y-2">
                {(Object.entries(PRESET_CONFIGS) as [keyof typeof PRESET_CONFIGS, typeof PRESET_CONFIGS[keyof typeof PRESET_CONFIGS]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`w-full p-3 text-left rounded-xl transition-all border ${activePreset === key ? 'bg-white border-[#3755c3]/40 shadow-md shadow-[#3755c3]/10' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                  >
                    <p className={`text-xs font-black mb-1 ${activePreset === key ? 'text-[#3755c3]' : 'text-[#191c1e]'}`}>{cfg.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cfg.seats} Asientos</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Row Controls */}
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#45464d] mb-3">Filas ({maxRow} actuales)</h3>
              <div className="flex gap-2">
                <button
                  onClick={addRow}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-[#eceef0] transition-all"
                >
                  <span className="material-symbols-outlined text-sm text-[#3755c3]">add</span>
                  Fila
                </button>
                <button
                  onClick={removeLastRow}
                  disabled={maxRow <= 1}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-[#ba1a1a]/5 hover:text-[#ba1a1a] hover:border-[#ba1a1a]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                  Fila
                </button>
              </div>
            </div>

            {/* Tools */}
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#45464d] mb-3">Herramientas</h3>
              <div className="space-y-2">
                <button
                  onClick={autoNumber}
                  className="w-full flex items-center gap-2 p-3 bg-white rounded-xl text-[10px] font-black hover:bg-[#eceef0] border border-slate-100 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                  Auto-numeración
                </button>
                <button
                  onClick={() => setSeats(prev => prev.map(s => ({ ...s, status: 'available' })))}
                  className="w-full flex items-center gap-2 p-3 bg-white rounded-xl text-[10px] font-black hover:bg-[#eceef0] border border-slate-100 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Limpiar Estados
                </button>
              </div>
            </div>

            {/* Legend */}
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#45464d] mb-3">Leyenda</h3>
              <div className="space-y-2">
                {[
                  { color: 'bg-[#d0e1fb]', label: 'Disponible' },
                  { color: 'bg-[#191c1e]', label: 'Ocupado' },
                  { color: 'bg-[#3755c3]', label: 'Seleccionado' },
                  { color: 'bg-[#d8dadc]', label: 'Restringido' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-md flex-shrink-0 ${l.color}`}></div>
                    <span className="text-[10px] font-bold text-[#45464d]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="mt-auto p-4 bg-[#eceef0] border-t border-slate-200">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-black text-[#45464d] uppercase tracking-wider">Capacidad</span>
              <span className="text-[10px] font-black">{occupied} / {total}</span>
            </div>
            <div className="w-full bg-white h-2.5 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-[#3755c3] h-full rounded-full transition-all duration-500"
                style={{ width: total > 0 ? `${(occupied / total) * 100}%` : '0%' }}
              />
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-1 text-right">{total - occupied} disponibles</p>
          </div>
        </aside>

        {/* CENTER: Seat Canvas */}
        <div className="flex-1 overflow-auto bg-[#f8f9fa] flex justify-center p-6">
          <div className="w-full max-w-2xl">
            {/* Bus Frame */}
            <div className="relative bg-white rounded-[2rem] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)] border border-slate-100 p-6">
              {/* Driver Row */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#f2f4f6]">
                <div className="w-12 h-12 rounded-2xl bg-[#f2f4f6] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#45464d]">steering_wheel</span>
                </div>
                <div className="flex-1 h-px bg-[#f2f4f6]"></div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  Piso {activeFloor === 'superior' ? 'Superior' : 'Inferior'}
                </div>
              </div>

              {/* Seats Grid */}
              <div className="space-y-2">
                {/* Column headers */}
                <div className="grid grid-cols-[2rem_1fr_1fr_2rem_1fr_1fr] gap-2 mb-1">
                  <div></div>
                  <div className="text-center text-[9px] font-black text-slate-300 uppercase">A</div>
                  <div className="text-center text-[9px] font-black text-slate-300 uppercase">B</div>
                  <div></div>
                  <div className="text-center text-[9px] font-black text-slate-300 uppercase">C</div>
                  <div className="text-center text-[9px] font-black text-slate-300 uppercase">D</div>
                </div>

                {rows.map(row => {
                  const rowSeats = seats.filter(s => s.row === row);
                  const getS = (col: 'A' | 'B' | 'C' | 'D') => rowSeats.find(s => s.col === col);
                  return (
                    <div key={row} className="grid grid-cols-[2rem_1fr_1fr_2rem_1fr_1fr] gap-2 items-center">
                      {/* Row number */}
                      <div className="text-[10px] font-black text-slate-300 text-center">{row}</div>

                      {/* Seats A & B */}
                      {(['A', 'B'] as const).map(col => {
                        const s = getS(col);
                        if (!s) return <div key={col} className="h-10 rounded-xl bg-[#f2f4f6] border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#3755c3] transition-all" onClick={() => {/* add seat */}} />;
                        const isSelected = selectedSeatId === s.id;
                        return (
                          <button
                            key={col}
                            onClick={() => setSelectedSeatId(isSelected ? null : s.id)}
                            onContextMenu={e => { e.preventDefault(); cycleStatus(s); }}
                            title="Click: seleccionar | Click derecho: cambiar estado"
                            className={`h-10 rounded-xl text-[11px] font-black transition-all duration-150 ${statusColor(s, isSelected)}`}
                          >
                            {s.label}
                          </button>
                        );
                      })}

                      {/* Aisle */}
                      <div className="h-3 flex items-center justify-center">
                        <div className="w-1 h-full bg-[#f2f4f6] rounded-full mx-auto"></div>
                      </div>

                      {/* Seats C & D */}
                      {(['C', 'D'] as const).map(col => {
                        const s = getS(col);
                        if (!s) return <div key={col} className="h-10 rounded-xl bg-[#f2f4f6] border-2 border-dashed border-slate-200" />;
                        const isSelected = selectedSeatId === s.id;
                        return (
                          <button
                            key={col}
                            onClick={() => setSelectedSeatId(isSelected ? null : s.id)}
                            onContextMenu={e => { e.preventDefault(); cycleStatus(s); }}
                            title="Click: seleccionar | Click derecho: cambiar estado"
                            className={`h-10 rounded-xl text-[11px] font-black transition-all duration-150 ${statusColor(s, isSelected)}`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Add Row Button inline */}
                <button
                  onClick={addRow}
                  className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-slate-200 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:border-[#3755c3] hover:text-[#3755c3] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Agregar Fila
                </button>
              </div>

              {/* Tip */}
              <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-4">
                Click → Seleccionar &nbsp;|&nbsp; Click Derecho → Cambiar Estado
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Properties */}
        <aside className="w-64 flex-shrink-0 bg-[#f2f4f6] border-l border-slate-200 flex flex-col overflow-y-auto">
          {selectedSeat ? (
            <div className="p-4 space-y-6 flex-1">
              {/* Header chip */}
              <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#45464d]">Propiedades</h3>
                <span className="text-[9px] font-black bg-[#3755c3] text-white px-2.5 py-1 rounded-full uppercase">
                  Asiento {selectedSeat.label}
                </span>
              </div>

              {/* Label */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#45464d]">Etiqueta</label>
                <input
                  className="w-full bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3755c3] focus:border-transparent text-sm font-black p-3 outline-none transition-all"
                  value={selectedSeat.label}
                  onChange={e => updateSeat(selectedSeat.id, { label: e.target.value })}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#45464d]">Estado</label>
                <div className="flex gap-1.5 flex-wrap">
                  {(['available', 'occupied', 'restricted'] as SeatStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => updateSeat(selectedSeat.id, { status: st })}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${selectedSeat.status === st
                        ? st === 'available' ? 'bg-[#3755c3] text-white' : st === 'occupied' ? 'bg-[#191c1e] text-white' : 'bg-[#d8dadc] text-[#45464d]'
                        : 'bg-white border border-slate-200 text-[#45464d]'
                      }`}
                    >
                      {st === 'available' ? 'Libre' : st === 'occupied' ? 'Ocupado' : 'Restringido'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#45464d]">Categoría</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3755c3] text-xs font-black p-3 outline-none appearance-none transition-all"
                  value={selectedSeat.category}
                  onChange={e => {
                    const cat = e.target.value as SeatCategory;
                    updateSeat(selectedSeat.id, { category: cat, price: CATEGORY_PRICES[cat] });
                  }}
                >
                  {(Object.keys(CATEGORY_PRICES) as SeatCategory[]).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#45464d]">Amenidades</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {AMENITY_OPTIONS.map(({ icon, label }) => {
                    const active = selectedSeat.amenities.includes(icon);
                    return (
                      <button
                        key={icon}
                        onClick={() => toggleAmenity(icon)}
                        className={`flex items-center gap-1.5 p-2.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border ${active ? 'bg-[#191c1e] text-white border-[#191c1e]' : 'bg-white text-[#45464d] border-slate-200 hover:border-[#3755c3]'}`}
                      >
                        <span className="material-symbols-outlined text-sm">{icon}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#45464d]">Precio Base</label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#3755c3] transition-all">
                  <span className="px-3 text-[#3755c3] font-black text-sm">$</span>
                  <input
                    type="number"
                    className="flex-1 p-3 text-sm font-black outline-none border-none bg-transparent"
                    value={selectedSeat.price}
                    onChange={e => updateSeat(selectedSeat.id, { price: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              {/* Apply to all of category */}
              <button
                onClick={() => applyCategoryToAll(selectedSeat.category)}
                className="w-full bg-[#001453] text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#3755c3] transition-all shadow-lg"
              >
                Aplicar categoría a todos
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-[#eceef0] rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-300">event_seat</span>
              </div>
              <p className="text-xs font-black text-[#45464d] uppercase tracking-wider mb-2">Sin Selección</p>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Haz clic en cualquier asiento para editar sus propiedades.
              </p>
            </div>
          )}

          {/* Info panel */}
          <div className="p-4 bg-[#001453] m-4 rounded-2xl text-white flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm">info</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Consejo</span>
            </div>
            <p className="text-[10px] leading-relaxed opacity-80 font-medium">
              <strong>Click derecho</strong> en un asiento para cambiar su estado rápidamente.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SeatDesigner;

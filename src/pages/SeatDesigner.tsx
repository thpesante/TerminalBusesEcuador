import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

type CellType = 'seat' | 'bathroom' | 'entrance' | 'empty' | 'restricted';
type FloorType = 'superior' | 'inferior';

interface Cell {
  id: string; // "floor-row-col"
  label: string;
  row: number;
  col: number; // 0, 1, 2, 3 (for V, P, P, V)
  type: CellType;
}

const COLS = [0, 1, 2, 3]; // V, P, P, V layout

const SeatDesigner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const unitDataFromState = location.state?.unitData || {};

  const [activeFloor, setActiveFloor] = useState<FloorType>('superior');
  const [selectedCellIds, setSelectedCellIds] = useState<string[]>([]);
  const [draggedType, setDraggedType] = useState<CellType | null>(null);
  const [numberingDirection, setNumberingDirection] = useState<'LTR' | 'RTL'>('LTR');

  // Initialize Grids
  const createEmptyGrid = (rows: number, floor: FloorType) => {
    const grid: Record<string, Cell> = {};
    for (let r = 1; r <= rows; r++) {
      COLS.forEach(c => {
        const id = `${floor}-${r}-${c}`;
        grid[id] = { id, label: '', row: r, col: c, type: 'seat' };
      });
    }
    return grid;
  };

  const [superiorGrid, setSuperiorGrid] = useState(createEmptyGrid(12, 'superior'));
  const [inferiorGrid, setInferiorGrid] = useState(createEmptyGrid(6, 'inferior'));
  const [unitData, setUnitData] = useState(unitDataFromState);

  // Load from DB if possible
  useEffect(() => {
    const loadDraft = async () => {
      const draftId = location.state?.draftId || `temp_${auth.currentUser?.uid}`;
      try {
        const snap = await getDoc(doc(db, 'units_draft', draftId));
        if (snap.exists()) {
          const data = snap.data();
          if (data.grids) {
            setSuperiorGrid(data.grids.superior);
            setInferiorGrid(data.grids.inferior);
          }
          if (data) setUnitData(data);
        }
      } catch (err) { console.error("Error loading typography:", err); }
    };
    loadDraft();
  }, []);

  const grid = activeFloor === 'superior' ? superiorGrid : inferiorGrid;
  const setGrid = activeFloor === 'superior' ? setSuperiorGrid : setInferiorGrid;

  const getColLabel = (col: number) => ['V', 'P', 'P', 'V'][col];

  // Helper to re-number only 'seat' types with direction support
  const autoNumber = () => {
    const renumber = (currentGrid: Record<string, Cell>, start: number) => {
      let n = start;
      const sortedKeys = Object.keys(currentGrid).sort((a,b) => {
        const [, rA, cA] = a.split('-').map(Number);
        const [, rB, cB] = b.split('-').map(Number);
        if (rA !== rB) return rA - rB;
        // Direction logic
        return numberingDirection === 'LTR' ? cA - cB : cB - cA;
      });
      const nextGrid = { ...currentGrid };
      sortedKeys.forEach(k => {
        if (nextGrid[k].type === 'seat') {
          nextGrid[k] = { ...nextGrid[k], label: `${n++}` };
        } else {
          nextGrid[k] = { ...nextGrid[k], label: '' };
        }
      });
      return { nextGrid, lastNum: n };
    };

    setSuperiorGrid(prev => {
        const res = renumber(prev, 1);
        setInferiorGrid(infPrev => renumber(infPrev, res.lastNum).nextGrid);
        return res.nextGrid;
    });
  };

  const toggleSelect = (id: string, multi: boolean) => {
    if (multi) {
      setSelectedCellIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setSelectedCellIds([id]);
    }
  };

  const deleteSelected = () => {
    setGrid(prev => {
      const next = { ...prev };
      selectedCellIds.forEach(id => {
        if (next[id]) next[id] = { ...next[id], type: 'empty', label: '' };
      });
      return next;
    });
    setSelectedCellIds([]);
  };

  const deleteRow = (rowNum: number) => {
    setGrid(prev => {
      const next = { ...prev };
      COLS.forEach(c => {
        const id = `${activeFloor}-${rowNum}-${c}`;
        if (next[id]) next[id] = { ...next[id], type: 'empty', label: '' };
      });
      return next;
    });
  };

  const handleDrop = (id: string) => {
    if (!draggedType) return;
    setGrid(prev => ({
      ...prev,
      [id]: { ...prev[id], type: draggedType, label: '' }
    }));
    setDraggedType(null);
  };

  const handleFinalize = async () => {
    const draftId = location.state?.draftId || `temp_${auth.currentUser?.uid}`;
    try {
        const draftRef = doc(db, 'units_draft', draftId);
        
        // Si es Normal, solo guardamos el superior (Cabina Única)
        const finalGrids = unitData.busType === 'Normal' 
            ? { superior: superiorGrid, inferior: {} }
            : { superior: superiorGrid, inferior: inferiorGrid };

        await updateDoc(draftRef, {
            grids: finalGrids,
            status: 'topography_complete',
            updatedAt: serverTimestamp()
        });
        
        navigate('/unit-confirmation', { 
          state: { 
            draftId,
            unitData, 
            grids: finalGrids 
          } 
        });
    } catch (err) {
        console.error("Error al guardar topografía:", err);
        alert("Error al sincronizar con la nube.");
    }
  };

  const rowIndices = useMemo(() => {
    const indices = Array.from(new Set(Object.values(grid).map(c => c.row))).sort((a,b) => a - b);
    return indices;
  }, [grid]);

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-[#0f172a] font-body overflow-hidden">
      <header className="flex-shrink-0 px-10 py-6 bg-white border-b border-slate-100 flex justify-between items-center z-50 shadow-sm">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/unit-registration')} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <div>
              <h1 className="text-xl font-black tracking-tighter italic text-[#00216e]">CONSTRUCTOR DE TOPOLOGÍA</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">{unitData.marca} {unitData.modelo} • {unitData.placa}</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           {unitData.busType === 'Dos Pisos' ? (
              <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
                 <button onClick={() => setActiveFloor('superior')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFloor === 'superior' ? 'bg-white text-[#3755c3] shadow-sm' : 'text-slate-400'}`}>SEGUNDO PISO</button>
                 <button onClick={() => setActiveFloor('inferior')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFloor === 'inferior' ? 'bg-white text-[#3755c3] shadow-sm' : 'text-slate-400'}`}>PRIMER PISO</button>
              </div>
           ) : (
              <div className="bg-slate-100 px-6 py-2 rounded-xl">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">UNIDAD DE PISO ÚNICO</span>
              </div>
           )}
           <button onClick={handleFinalize} className="bg-[#00216e] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/10 transition-all">Sincronizar y Siguiente</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-100 p-8 flex flex-col gap-8 overflow-y-auto">
           <div>
              <h3 className="text-[10px] font-black text-[#00216e] uppercase tracking-[0.3em] mb-8 italic">Paleta de Arrastre</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { type: 'bathroom', icon: 'wc', label: 'BAÑO', color: 'amber' },
                   { type: 'entrance', icon: 'login', label: 'ENTRADA', color: 'emerald' },
                   { type: 'restricted', icon: 'block', label: 'BLOQUEAR', color: 'slate' },
                   { type: 'seat', icon: 'event_seat', label: 'ASIENTO', color: 'blue' }
                 ].map(item => (
                    <div key={item.type} draggable onDragStart={() => setDraggedType(item.type as CellType)} className="cursor-grab active:cursor-grabbing group">
                       <div className={`aspect-square rounded-3xl bg-slate-50 border-2 border-transparent group-hover:border-${item.color}-200 group-hover:bg-${item.color}-50 flex flex-col items-center justify-center gap-2 transition-all`}>
                          <span className={`material-symbols-outlined text-${item.color}-500 text-3xl transition-transform group-hover:scale-110`}>{item.icon}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{item.label}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#00216e] uppercase tracking-[0.3em] mb-4 italic">Sentido de Enumeración</h3>
              <button 
                onClick={() => setNumberingDirection(prev => prev === 'LTR' ? 'RTL' : 'LTR')}
                className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-[#00216e]">{numberingDirection === 'LTR' ? 'east' : 'west'}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00216e]">GIRAR: {numberingDirection === 'LTR' ? 'IZQ → DER' : 'DER → IZQ'}</span>
              </button>
              
              <button 
                onClick={autoNumber}
                className="w-full py-4 bg-[#00216e] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                Auto-Enumerar
              </button>
           </div>

           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#00216e] uppercase tracking-[0.3em] mb-4 italic">Selección Múltiple</h3>
              <button 
                onClick={deleteSelected}
                disabled={selectedCellIds.length === 0}
                className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Borrar {selectedCellIds.length} ítems
              </button>
           </div>
        </aside>

        <main className="flex-1 bg-slate-50/50 p-12 overflow-y-auto">
           <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-[4rem] shadow-2xl p-12 relative border border-white">
                 <div className="flex items-center justify-between mb-16 pb-10 border-b border-slate-50">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 shadow-inner">
                          <span className="material-symbols-outlined text-4xl">steering_wheel</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 italic">Ventanilla de Mando</p>
                          <p className="text-xl font-black text-[#00216e] uppercase tracking-tighter">
                            {unitData.busType === 'Normal' ? 'CABINA ÚNICA' : activeFloor === 'superior' ? 'SEGUNDO PISO' : 'PRIMER PISO'}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Capacidad Actual</p>
                       <p className="text-4xl font-black text-[#00216e] tracking-tighter">
                        {
                          unitData.busType === 'Dos Pisos' 
                          ? Object.values(superiorGrid).filter(c => c.type === 'seat').length + Object.values(inferiorGrid).filter(c => c.type === 'seat').length
                          : Object.values(superiorGrid).filter(c => c.type === 'seat').length
                        }
                       </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-[3rem_1fr_1fr_3rem_1fr_1fr] gap-4 mb-8">
                    <div></div>
                    {['V','P','','P','V'].map((l, i) => <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{l}</div>)}
                 </div>

                 <div className="space-y-4">
                    {rowIndices.map(r => (
                       <div key={r} className="grid grid-cols-[3rem_1fr_1fr_3rem_1fr_1fr] gap-4 items-center group/row">
                          <div className="flex flex-col items-center justify-center gap-1 group/btn">
                             <span className="text-[9px] font-black text-slate-200 uppercase tracking-tighter">{r}</span>
                             <button onClick={() => deleteRow(r)} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm opacity-0 group-hover/row:opacity-100">
                                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                             </button>
                          </div>

                          {[0, 1, 'aisle', 2, 3].map(c => {
                             if (c === 'aisle') return <div key="aisle" className="flex justify-center h-full"><div className="w-1.5 h-full bg-slate-50/80 rounded-full"></div></div>;
                             const cell = grid[`${activeFloor}-${r}-${c}`];
                             const isSelected = selectedCellIds.includes(cell.id);
                             return (
                                <div 
                                  key={c}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={() => handleDrop(cell.id)}
                                  onClick={(e) => toggleSelect(cell.id, e.shiftKey || e.metaKey || e.ctrlKey)}
                                  className={`aspect-[4/3] rounded-2xl border-2 transition-all flex items-center justify-center cursor-pointer relative overflow-hidden
                                    ${cell.type === 'empty' ? 'bg-slate-50/50 border-dashed border-slate-100' : ''}
                                    ${cell.type === 'seat' ? 'bg-white border-[#3755c3]/20 hover:border-[#3755c3]' : ''}
                                    ${cell.type === 'bathroom' ? 'bg-amber-100 border-amber-200' : ''}
                                    ${cell.type === 'entrance' ? 'bg-emerald-100 border-emerald-200' : ''}
                                    ${cell.type === 'restricted' ? 'bg-slate-200 border-slate-300' : ''}
                                    ${isSelected ? 'border-[#00216e] bg-[#00216e] text-white shadow-xl scale-105 z-10' : ''}
                                  `}
                                >
                                   {cell.type === 'seat' && <span className={`text-md font-black ${isSelected ? 'text-white' : 'text-[#00216e]'}`}>{cell.label}</span>}
                                   {cell.type === 'bathroom' && <span className="material-symbols-outlined text-amber-600 font-bold">wc</span>}
                                   {cell.type === 'entrance' && <span className="material-symbols-outlined text-emerald-600 font-bold">login</span>}
                                   {cell.type === 'restricted' && <span className="material-symbols-outlined text-slate-400 text-sm">block</span>}
                                </div>
                             );
                          })}
                       </div>
                    ))}
                 </div>

                 <button onClick={() => {
                        const newR = Math.max(...rowIndices) + 1;
                        setGrid(prev => {
                            const next = { ...prev };
                            COLS.forEach(c => {
                                const id = `${activeFloor}-${newR}-${c}`;
                                next[id] = { id, label: '', row: newR, col: c, type: 'seat' };
                            });
                            return next;
                        });
                    }} className="w-full mt-12 py-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-200 font-black text-[10px] uppercase tracking-[0.4em] hover:text-[#3755c3] hover:border-[#3755c3] transition-all">
                    ANEXAR FILA ESTRUCTURAL
                 </button>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default SeatDesigner;

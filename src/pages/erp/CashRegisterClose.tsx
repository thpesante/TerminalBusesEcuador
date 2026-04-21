import React, { useState, useEffect } from 'react';
import ERPSidebar from '../../components/erp/ERPSidebar';
import ERPTopBar from '../../components/erp/ERPTopBar';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface Transaction {
  id: string;
  monto: number;
  tipo: 'INGRESO' | 'EGRESO';
  concepto: string;
  createdAt: any;
}

export default function CashRegisterClose() {
  const { userData } = useAuth();
  const rucEmpresa = userData?.ruc_empresa || '';
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [physicalCash, setPhysicalCash] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);

  useEffect(() => {
    if (!rucEmpresa) return;
    const q = query(collection(db, 'cash_transactions'), where('ruc_empresa', '==', rucEmpresa));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      setTransactions(list);
    });
    return () => unsubscribe();
  }, [rucEmpresa]);

  const totalIngresos = transactions.filter(t => t.tipo === 'INGRESO').reduce((acc, t) => acc + t.monto, 0);
  const totalEgresos = transactions.filter(t => t.tipo === 'EGRESO').reduce((acc, t) => acc + t.monto, 0);
  const expectedCash = totalIngresos - totalEgresos;
  const difference = physicalCash - expectedCash;

  const handleCloseSession = async () => {
    if (!confirm("¿Está seguro de cerrar la caja actual? Se generará un reporte de auditoría.")) return;
    
    try {
      setLoading(true);
      await addDoc(collection(db, 'cash_sessions'), {
        ruc_empresa: rucEmpresa,
        vendedorId: auth.currentUser?.uid,
        esperado: expectedCash,
        fisico: physicalCash,
        diferencia: difference,
        clausuraAt: serverTimestamp()
      });
      setSessionClosed(true);
    } catch (e) {
      alert("Error al cerrar caja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#f8fafc] text-slate-800 font-body min-h-screen">
      <ERPSidebar activePath="/erp/cash-close" />
      
      <main className="ml-64 flex-1 flex flex-col h-screen">
        <ERPTopBar title="Auditoría de Cierre de Caja" />
        
        <div className="p-10 max-w-6xl mx-auto w-full space-y-10">
           <div className="flex justify-between items-end">
              <div>
                 <p className="text-[#00216e] font-black text-[10px] tracking-widest uppercase">Módulo Contable Operativo</p>
                 <h2 className="text-4xl font-black italic uppercase italic tracking-tighter">Liquidación de Turno</h2>
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">ID Terminal: {auth.currentUser?.uid?.slice(0,8)}</p>
           </div>

           <div className="grid grid-cols-12 gap-10">
              {/* Summary Dashboard */}
              <div className="col-span-12 lg:col-span-8 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingresos Proyectados</p>
                       <p className="text-4xl font-black text-[#00216e] mt-2 font-headline">$ {totalIngresos.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gastos / Egresos</p>
                       <p className="text-4xl font-black text-red-500 mt-2 font-headline">$ {totalEgresos.toFixed(2)}</p>
                    </div>
                 </div>

                 {/* Physical Input */}
                 <div className="bg-[#00216e] text-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                       <div className="space-y-4">
                          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                             <span className="material-symbols-outlined text-[#ffe07f]">payments</span>
                             Arqueo de Efectivo Físico
                          </h3>
                          <p className="text-blue-200/60 text-xs font-bold leading-relaxed max-w-xs lowercase italic">
                            Ingrese el monto total contado en caja secundario al cierre para conciliación.
                          </p>
                       </div>
                       <div className="w-full md:w-auto">
                          <input 
                            type="number"
                            value={physicalCash}
                            onChange={(e) => setPhysicalCash(Number(e.target.value))}
                            className="w-full md:w-64 bg-white/10 border-2 border-white/20 h-24 rounded-3xl px-8 text-4xl font-black text-[#ffe07f] outline-none focus:border-[#ffe07f] transition-all" 
                            placeholder="0.00"
                          />
                       </div>
                    </div>
                 </div>

                 {/* Last Transactions Table */}
                 <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividad del Turno</span>
                    </div>
                    <table className="w-full text-left">
                       <tbody className="divide-y divide-slate-50">
                          {transactions.slice(0,5).map(t => (
                            <tr key={t.id}>
                               <td className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter">{t.concepto}</td>
                               <td className="px-8 py-4 text-right font-black text-sm text-[#00216e]">$ {t.monto.toFixed(2)}</td>
                            </tr>
                          ))}
                          {transactions.length === 0 && (
                            <tr><td className="p-10 text-center opacity-30 text-[10px] font-black uppercase">Sin transacciones registradas</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Action Sidebar */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                 <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo en Sistema</p>
                       <p className="text-3xl font-black text-slate-800 font-headline">$ {expectedCash.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diferencia / Sobrante</p>
                       <p className={`text-3xl font-black font-headline ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          $ {difference.toFixed(2)}
                       </p>
                    </div>
                    <div className="pt-8 border-t border-slate-50">
                       <button 
                         disabled={loading || sessionClosed}
                         onClick={handleCloseSession}
                         className="w-full bg-[#00216e] text-white py-6 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                       >
                          <span className="material-symbols-outlined text-sm">lock</span>
                          {sessionClosed ? 'CIERRE REALIZADO' : 'CERRAR CAJA Y TURNO'}
                       </button>
                    </div>
                 </div>

                 <div className="bg-slate-800 p-8 rounded-[3rem] text-white space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Security Check</h4>
                    <ul className="space-y-4">
                       <li className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Auditoría de Boletos</span>
                       </li>
                       <li className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Conciliación Bancaria</span>
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import ERPSidebar from '../../components/erp/ERPSidebar';
import ERPTopBar from '../../components/erp/ERPTopBar';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface Ticket {
  id: string;
  pasajero: { nombre: string; cedula: string };
  precio: number;
  tarifa: string;
  createdAt: any;
  asiento: number;
}

export default function ElectronicInvoicing() {
  const { userData } = useAuth();
  const rucEmpresa = userData?.ruc_empresa || '';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rucEmpresa) return;
    const q = query(
      collection(db, 'tickets'), 
      where('ruc_empresa', '==', rucEmpresa),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ticket[];
      setTickets(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [rucEmpresa]);

  const totalSold = tickets.reduce((acc, t) => acc + t.precio, 0);

  return (
    <div className="flex bg-[#f8fafc] text-slate-800 font-body min-h-screen">
      <ERPSidebar activePath="/erp/invoicing" />
      
      <main className="ml-64 flex-1 flex flex-col h-screen">
        <ERPTopBar title="Facturación Electrónica SRI" />
        
        <div className="p-8 overflow-y-auto space-y-8">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#00216e] text-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/20 relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Ventas (Hoy)</p>
                    <p className="text-4xl font-black mt-2 font-headline">$ {totalSold.toFixed(2)}</p>
                 </div>
                 <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10">payments</span>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentos Emitidos</p>
                 <p className="text-4xl font-black mt-2 text-[#00216e]">{tickets.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Firma</p>
                    <p className="text-xl font-black mt-1 text-green-600">VIGENTE</p>
                 </div>
                 <span className="material-symbols-outlined text-4xl text-green-500">verified_user</span>
              </div>
           </div>

           {/* Invoices Table */}
           <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-xs font-black uppercase tracking-widest text-[#00216e]">Historial de Comprobantes</h3>
                 <div className="flex gap-2">
                    <button className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">Exportar Excel</button>
                    <button className="bg-[#00216e] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-900/10">Sincronizar SRI</button>
                 </div>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Secuencial</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado SRI</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {tickets.map((ticket, i) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 transition-all group">
                         <td className="px-8 py-5">
                            <span className="font-mono text-xs font-bold text-slate-400">001-001-{(1000 + i).toString().padStart(9, '0')}</span>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex flex-col">
                               <span className="text-xs font-black uppercase text-[#00216e]">{ticket.pasajero.nombre}</span>
                               <span className="text-[10px] font-bold text-slate-400">{ticket.pasajero.cedula}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <span className="font-black text-sm text-[#00216e]">$ {ticket.precio.toFixed(2)}</span>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                               <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">AUTORIZADO</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                               <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-[#00216e] material-symbols-outlined text-sm">picture_as_pdf</button>
                               <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-[#00216e] material-symbols-outlined text-sm">mail</button>
                            </div>
                         </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">No se han emitido facturas aún</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
}

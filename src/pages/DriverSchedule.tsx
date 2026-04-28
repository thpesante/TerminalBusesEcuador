import React from 'react';
import { useNavigate } from 'react-router-dom';

const DriverSchedule: React.FC = () => {
  const navigate = useNavigate();

  const schedule = [
    { day: 'Lunes', route: 'Cuenca - Quito', time: '08:00', unit: '#12', status: 'CONFIRMADO' },
    { day: 'Martes', route: 'Quito - Cuenca', time: '14:00', unit: '#12', status: 'CONFIRMADO' },
    { day: 'Miércoles', route: 'Cuenca - Guayaquil', time: '06:00', unit: '#12', status: 'CONFIRMADO' },
    { day: 'Jueves', route: 'DESCANSO', time: '-', unit: '-', status: 'OFF' },
    { day: 'Viernes', route: 'Guayaquil - Cuenca', time: '16:00', unit: '#12', status: 'CONFIRMADO' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-10 font-body">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/driver-dashboard')} className="flex items-center gap-2 text-[#3755c3] font-black uppercase text-[10px] tracking-widest mb-10 hover:gap-4 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
          Volver al Panel
        </button>

        <header className="mb-12">
          <h1 className="text-4xl font-black text-[#191c1e] italic uppercase tracking-tighter mb-2">Mi Horario de Trabajo</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cronograma Semanal de Operaciones</p>
        </header>

        <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-8 text-[10px] font-black uppercase text-slate-400">Día</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400">Ruta Asignada</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400">Hora</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400">Unidad</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {schedule.map((item, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-8 font-black text-[#191c1e] uppercase italic">{item.day}</td>
                  <td className="p-8 font-bold text-slate-600">{item.route}</td>
                  <td className="p-8 font-black text-[#3755c3]">{item.time}</td>
                  <td className="p-8 font-bold text-slate-400">{item.unit}</td>
                  <td className="p-8 text-right">
                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'CONFIRMADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverSchedule;

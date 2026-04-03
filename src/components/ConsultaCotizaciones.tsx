import React from 'react';
import { History, Search, FileText, Edit } from 'lucide-react';

interface ConsultaCotizacionesProps {
  historialCotizaciones: any[];
  onOpenPDF: () => void;
}

export const ConsultaCotizaciones: React.FC<ConsultaCotizacionesProps> = ({ 
  historialCotizaciones,
  onOpenPDF
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fadeIn">
      <div className="bv-card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-bolivar-green flex items-center gap-3">
            <History className="w-6 h-6" /> Historial de Cotizaciones
          </h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por tomador o número..." 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-bolivar-green outline-none w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">N° Cotización</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Tomador</th>
                <th className="px-6 py-4">Prima</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historialCotizaciones.length > 0 ? historialCotizaciones.map((cot) => (
                <tr key={cot.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-bolivar-green">{cot.id}</td>
                  <td className="px-6 py-4 text-gray-500">{cot.fecha}</td>
                  <td className="px-6 py-4 font-bold text-bolivar-green">{cot.tomador}</td>
                  <td className="px-6 py-4 font-mono font-bold text-modern-green">{cot.prima}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">
                      {cot.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={onOpenPDF}
                        className="p-2 text-gray-400 hover:text-bolivar-green hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all shadow-sm"
                        title="Ver PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-bolivar-green hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all shadow-sm"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                    No hay cotizaciones guardadas recientemente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

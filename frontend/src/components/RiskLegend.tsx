import React from 'react';
import { Filter } from 'lucide-react';

interface RiskLegendProps {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  counts?: { low: number; medium: number; high: number; closed: number };
}

export const RiskLegend: React.FC<RiskLegendProps> = ({
  selectedFilter,
  onSelectFilter,
  counts
}) => {
  const filters = [
    { id: 'ALL', label: 'All Roads', color: 'bg-blue-500', count: (counts?.low ?? 0) + (counts?.medium ?? 0) + (counts?.high ?? 0) },
    { id: 'HIGH', label: 'High Risk', color: 'bg-red-500', count: counts?.high ?? 149 },
    { id: 'MEDIUM', label: 'Medium Risk', color: 'bg-amber-500', count: counts?.medium ?? 4545 },
    { id: 'LOW', label: 'Low Risk', color: 'bg-emerald-500', count: counts?.low ?? 8399 },
    { id: 'CLOSED', label: 'Closed Roads', color: 'bg-slate-400', count: counts?.closed ?? 0 },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-sm text-xs text-slate-800">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          Road Risk Classification
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => {
          const isActive = selectedFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${f.color} shadow-xs`}></span>
              <span className="font-medium">{f.label}</span>
              {f.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  isActive ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-500 border border-slate-200'
                }`}>
                  {f.count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

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
    { id: 'MEDIUM', label: 'Medium Risk', color: 'bg-amber-400', count: counts?.medium ?? 4545 },
    { id: 'LOW', label: 'Low Risk', color: 'bg-emerald-500', count: counts?.low ?? 8399 },
    { id: 'CLOSED', label: 'Closed Roads', color: 'bg-gray-400', count: counts?.closed ?? 0 },
  ];

  return (
    <div className="bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-lg p-3 shadow-xl text-xs text-gray-200">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
        <span className="font-semibold text-gray-300 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
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
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all border ${
                isActive
                  ? 'bg-gray-800 text-white border-blue-500 shadow-sm'
                  : 'bg-gray-950/60 text-gray-400 border-gray-800/80 hover:bg-gray-800/60 hover:text-gray-200'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${f.color} shadow-sm`}></span>
              <span className="font-medium">{f.label}</span>
              {f.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400">
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

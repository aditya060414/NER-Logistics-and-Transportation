import React from 'react';
import { AlertTriangle, AlertOctagon, Truck, Package, Ban } from 'lucide-react';
import type { RiskSummary } from '../types/risk';

interface KPICardsProps {
  summary: RiskSummary | null;
  activeIncidentsCount?: number;
  affectedVehiclesCount?: number;
  criticalDeliveriesCount?: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  summary,
  activeIncidentsCount = 12,
  affectedVehiclesCount = 7,
  criticalDeliveriesCount = 4,
}) => {
  const highRisk = summary?.high_risk_count ?? 149;
  const closedRoads = summary?.closed_roads_count ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-slate-50/80 border-b border-slate-200">
      {/* High-Risk Roads */}
      <div className="bg-white border border-slate-200 border-l-4 border-l-rose-500 rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:shadow-sm hover:border-rose-300 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">High-Risk Roads</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center group-hover:bg-rose-100 transition">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-rose-600">{highRisk.toLocaleString()}</span>
          <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 font-bold px-1.5 py-0.5 rounded-md">AT RISK</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Soil saturation &gt; 85%</div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-rose-400 to-transparent opacity-50" />
      </div>

      {/* Active Incidents */}
      <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:shadow-sm hover:border-amber-300 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Active Incidents</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-100 transition">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600">{activeIncidentsCount}</span>
          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 font-bold px-1.5 py-0.5 rounded-md">REPORTED</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Landslides &amp; flood breaches</div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-amber-400 to-transparent opacity-50" />
      </div>

      {/* Vehicles Affected */}
      <div className="bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:shadow-sm hover:border-blue-300 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Vehicles Affected</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-blue-600">{affectedVehiclesCount}</span>
          <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 font-bold px-1.5 py-0.5 rounded-md">SIMULATED</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">En route in risk zones</div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-transparent opacity-50" />
      </div>

      {/* Critical Deliveries */}
      <div className="bg-white border border-slate-200 border-l-4 border-l-violet-500 rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:shadow-sm hover:border-violet-300 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Critical Deliveries</span>
          <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center group-hover:bg-violet-100 transition">
            <Package className="w-3.5 h-3.5 text-violet-600" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-violet-600">{criticalDeliveriesCount}</span>
          <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 font-bold px-1.5 py-0.5 rounded-md">MEDICINE/FOOD</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Priority 1 &amp; 2 consignments</div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-violet-400 to-transparent opacity-50" />
      </div>

      {/* Closed Roads */}
      <div className={`col-span-2 md:col-span-4 lg:col-span-1 bg-white border border-slate-200 border-l-4 ${
        closedRoads > 0 ? 'border-l-rose-600' : 'border-l-emerald-500'
      } rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:shadow-sm transition-all group`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Road Closures</span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
            closedRoads > 0 ? 'bg-rose-50 border border-rose-100 group-hover:bg-rose-100' : 'bg-emerald-50 border border-emerald-100'
          }`}>
            <Ban className={`w-3.5 h-3.5 ${closedRoads > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-black ${closedRoads > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{closedRoads}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
            closedRoads > 0
              ? 'text-rose-700 bg-rose-50 border-rose-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}>VERIFIED</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Physical barriers in effect</div>
        <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${
          closedRoads > 0 ? 'from-rose-500' : 'from-emerald-400'
        } to-transparent opacity-50`} />
      </div>
    </div>
  );
};


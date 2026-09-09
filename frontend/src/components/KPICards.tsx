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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-gray-950/60 border-b border-gray-800/80">
      {/* High-Risk Roads */}
      <div className="bg-gray-900/90 border border-red-900/40 rounded-lg p-3 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">High-Risk Roads</span>
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-400">{highRisk.toLocaleString()}</span>
          <span className="text-[10px] text-red-500/80 font-medium">AT RISK</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-500">
          Soil saturation &gt; 85%
        </div>
      </div>

      {/* Active Incidents */}
      <div className="bg-gray-900/90 border border-amber-900/40 rounded-lg p-3 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Active Incidents</span>
          <AlertOctagon className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{activeIncidentsCount}</span>
          <span className="text-[10px] text-amber-500/80 font-medium">REPORTED</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-500">
          Landslides &amp; flood breaches
        </div>
      </div>

      {/* Vehicles Affected */}
      <div className="bg-gray-900/90 border border-blue-900/40 rounded-lg p-3 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Vehicles Affected</span>
          <Truck className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-400">{affectedVehiclesCount}</span>
          <span className="text-[10px] text-blue-400/80 font-medium">SIMULATED</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-500">
          En route in risk zones
        </div>
      </div>

      {/* Critical Deliveries */}
      <div className="bg-gray-900/90 border border-purple-900/40 rounded-lg p-3 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Critical Deliveries</span>
          <Package className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-purple-400">{criticalDeliveriesCount}</span>
          <span className="text-[10px] text-purple-400/80 font-medium">MEDICINE/FOOD</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-500">
          Priority 1 &amp; 2 consignments
        </div>
      </div>

      {/* Closed Roads */}
      <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-gray-900/90 border border-gray-800 rounded-lg p-3 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Road Closures</span>
          <Ban className="w-4 h-4 text-gray-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-200">{closedRoads}</span>
          <span className="text-[10px] text-gray-400 font-medium">VERIFIED</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-500">
          Physical barriers in effect
        </div>
      </div>
    </div>
  );
};

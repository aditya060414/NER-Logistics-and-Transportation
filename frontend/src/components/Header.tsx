import React from 'react';
import { ShieldAlert, Activity, RefreshCw, Compass, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  scenarioName: string;
  onRefresh: () => void;
  isLoading: boolean;
  emergencyMode: boolean;
  onToggleEmergency: () => void;
  isRoutePlannerOpen: boolean;
  onToggleRoutePlanner: () => void;
  hasActiveRoute: boolean;
  isIncidentPanelOpen: boolean;
  onToggleIncidentPanel: () => void;
  unverifiedIncidentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  scenarioName,
  onRefresh,
  isLoading,
  emergencyMode,
  onToggleEmergency,
  isRoutePlannerOpen,
  onToggleRoutePlanner,
  hasActiveRoute,
  isIncidentPanelOpen,
  onToggleIncidentPanel,
  unverifiedIncidentsCount,
}) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 select-none">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-wide text-white uppercase m-0">
              NER Logistics Intelligence
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Assam Operations
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Active Scenario: <span className="text-gray-300 font-medium">{scenarioName || 'Assam Monsoon 2022'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/80 border border-gray-700 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
          <span className="text-gray-300 font-medium">Control Tower Online</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">13,093 Roads Monitored</span>
        </div>

        {/* Incidents Queue Toggle */}
        <button
          onClick={onToggleIncidentPanel}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
            isIncidentPanelOpen
              ? 'bg-amber-600 text-white border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-amber-500 hover:text-amber-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>INCIDENT QUEUE</span>
          {unverifiedIncidentsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-gray-950 font-bold text-[10px]">
              {unverifiedIncidentsCount}
            </span>
          )}
        </button>

        {/* Route Planner Toggle */}
        <button
          onClick={onToggleRoutePlanner}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
            isRoutePlannerOpen
              ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
              : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-blue-500 hover:text-blue-300'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>ROUTE PLANNER</span>
          {hasActiveRoute && (
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          )}
        </button>

        {/* Emergency Mode Toggle */}
        <button
          onClick={onToggleEmergency}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
            emergencyMode
              ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
              : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-red-500 hover:text-red-400'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'EMERGENCY MODE'}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { ShieldAlert, Activity, RefreshCw, Compass, AlertTriangle, Truck, Smartphone } from 'lucide-react';

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
  isFleetDrawerOpen: boolean;
  onToggleFleetDrawer: () => void;
  atRiskVehiclesCount: number;
  onSwitchToFieldOfficer?: () => void;
  onSwitchToDriver?: () => void;
  pendingOfflineCount: number;
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
  isFleetDrawerOpen,
  onToggleFleetDrawer,
  atRiskVehiclesCount,
  onSwitchToFieldOfficer,
  onSwitchToDriver,
  pendingOfflineCount,
}) => {


  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 select-none">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>NER Logistics Intelligence Platform</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700/60 text-blue-300 font-mono font-normal">
                CONTROL TOWER
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
            <span>Scenario:</span>
            <span className="text-gray-200 font-medium">{scenarioName}</span>
            <span className="text-gray-600">•</span>
            <span className="text-blue-400">NetworkX Risk Engine Active</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Driver Portal Direct Switcher */}
        {onSwitchToDriver && (
          <button
            onClick={onSwitchToDriver}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 border border-emerald-400/50 transition group active:scale-95"
            title="Switch into Logistics Driver Console"
          >
            <Truck className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>DRIVER PORTAL</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold text-[10px]">
              TRIP
            </span>
          </button>
        )}

        {/* Field Officer Client Direct Switcher */}
        {onSwitchToFieldOfficer && (
          <button
            onClick={onSwitchToFieldOfficer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 border border-blue-400/50 transition group active:scale-95"
            title="Switch into Field Officer Mobile Tactical Route Interface"
          >
            <Smartphone className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>FIELD OFFICER CLIENT</span>
            {pendingOfflineCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-gray-950 font-black text-[10px] animate-pulse">
                {pendingOfflineCount} QUEUED
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-black text-[10px] animate-pulse">
                D102
              </span>
            )}
          </button>
        )}



        {/* Fleet & Logistics Impact Toggle */}
        <button
          onClick={onToggleFleetDrawer}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
            isFleetDrawerOpen
              ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
              : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-blue-500 hover:text-blue-300'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-400" />
          <span>FLEET &amp; IMPACT</span>
          {atRiskVehiclesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-bold text-[10px] animate-pulse">
              {atRiskVehiclesCount} AT RISK
            </span>
          )}
        </button>

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

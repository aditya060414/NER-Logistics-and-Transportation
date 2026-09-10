import React from 'react';
import { ShieldAlert, Activity, RefreshCw, Compass, AlertTriangle, Truck, Smartphone, CloudRain, Zap } from 'lucide-react';

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
  onOpenWeather?: () => void;
  isWeatherActive?: boolean;
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
  onOpenWeather,
  isWeatherActive,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 select-none shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">

        {/* ── Brand ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg text-white shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-tight flex items-center gap-2">
              NER Logistics Intelligence Platform
              <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-100 font-mono font-bold tracking-widest">
                CONTROL TOWER
              </span>
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="text-slate-500">{scenarioName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block mr-0.5" />
                NetworkX Risk Engine Active
              </span>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center gap-1.5 flex-wrap">

          {/* Portal switchers — grouped with distinct bg */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {onSwitchToDriver && (
              <button
                onClick={onSwitchToDriver}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95 group"
                title="Switch into Logistics Driver Console"
              >
                <Truck className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">DRIVER PORTAL</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-800/60 text-emerald-100 font-mono text-[9px] font-bold">TRIP</span>
              </button>
            )}
            {onSwitchToFieldOfficer && (
              <button
                onClick={onSwitchToFieldOfficer}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition active:scale-95 group"
                title="Switch into Field Officer Tactical Interface"
              >
                <Smartphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">FIELD OFFICER CLIENT</span>
                {pendingOfflineCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] animate-pulse">{pendingOfflineCount}Q</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-800/60 text-blue-100 font-mono text-[9px] font-bold">D102</span>
                )}
              </button>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 mx-0.5 hidden sm:block" />

          {/* Fleet & Impact */}
          <button
            onClick={onToggleFleetDrawer}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border active:scale-95 ${
              isFleetDrawerOpen
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : atRiskVehiclesCount > 0
                ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Truck className={`w-3.5 h-3.5 ${isFleetDrawerOpen ? 'text-white' : atRiskVehiclesCount > 0 ? 'text-rose-600' : 'text-blue-600'}`} />
            <span className="hidden md:inline">FLEET &amp; IMPACT</span>
            {atRiskVehiclesCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] animate-pulse ${isFleetDrawerOpen ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'}`}>
                {atRiskVehiclesCount} AT RISK
              </span>
            )}
          </button>

          {/* Incident Queue */}
          <button
            onClick={onToggleIncidentPanel}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border active:scale-95 ${
              isIncidentPanelOpen
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : unverifiedIncidentsCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isIncidentPanelOpen ? 'text-white' : 'text-amber-500'}`} />
            <span className="hidden md:inline">INCIDENT QUEUE</span>
            {unverifiedIncidentsCount > 0 && (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${isIncidentPanelOpen ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'}`}>
                {unverifiedIncidentsCount}
              </span>
            )}
          </button>

          {/* Weather */}
          {onOpenWeather && (
            <button
              onClick={onOpenWeather}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border active:scale-95 ${
                isWeatherActive
                  ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
              }`}
              title="Assam Weather Intelligence — All Districts Radar"
            >
              <CloudRain className={`w-3.5 h-3.5 ${isWeatherActive ? 'text-white' : 'text-sky-600'}`} />
              <span className="hidden md:inline">WEATHER (ASSAM)</span>
              <span className={`px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold ${isWeatherActive ? 'bg-sky-800/50 text-white' : 'bg-sky-600 text-white'}`}>35</span>
            </button>
          )}

          {/* Route Planner */}
          <button
            onClick={onToggleRoutePlanner}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border active:scale-95 ${
              isRoutePlannerOpen
                ? 'bg-violet-600 text-white border-violet-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${isRoutePlannerOpen ? 'text-white' : 'text-violet-600'}`} />
            <span className="hidden md:inline">ROUTE PLANNER</span>
            {hasActiveRoute && (
              <span className={`w-2 h-2 rounded-full animate-ping ${isRoutePlannerOpen ? 'bg-white' : 'bg-violet-500'}`} />
            )}
          </button>

          {/* Emergency Mode */}
          <button
            onClick={onToggleEmergency}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border active:scale-95 ${
              emergencyMode
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs animate-pulse'
                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            {emergencyMode
              ? <Zap className="w-3.5 h-3.5 text-white" />
              : <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            }
            <span className="hidden lg:inline">{emergencyMode ? 'EMERGENCY ACTIVE' : 'EMERGENCY MODE'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 rounded-lg border border-slate-200 transition disabled:opacity-40 active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};



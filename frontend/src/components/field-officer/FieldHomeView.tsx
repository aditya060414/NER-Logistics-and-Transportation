import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Navigation, 
  RefreshCw, 
  AlertTriangle, 
  Truck, 
  ShieldAlert, 
  CloudRain, 
  ChevronRight, 
  FileText,
  Database
} from 'lucide-react';
import type { Delivery, Vehicle } from '../../types/logistics';
import type { FieldOfficerGPS, OfficerNetworkStatus, SupportedLanguage } from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';
import type { WeatherCurrent } from '../../services/api';

interface FieldHomeViewProps {
  networkStatus: OfficerNetworkStatus;
  onToggleNetworkStatus: () => void;
  gps: FieldOfficerGPS;
  onToggleGPS: () => void;
  pendingReportsCount: number;
  lastSyncTime: string;
  isSyncing: boolean;
  onSyncNow: () => void;
  activeDelivery: Delivery | null;
  activeVehicle: Vehicle | null;
  weather: WeatherCurrent | null;
  language: SupportedLanguage;
  onNavigateTab: (tab: any) => void;
  demoModeActive: boolean;
}

export const FieldHomeView: React.FC<FieldHomeViewProps> = ({
  networkStatus,
  onToggleNetworkStatus,
  gps,
  onToggleGPS,
  pendingReportsCount,
  lastSyncTime,
  isSyncing,
  onSyncNow,
  activeDelivery,
  activeVehicle,
  weather,
  language,
  onNavigateTab,
  demoModeActive,
}) => {
  const t = getTranslation(language);
  const isOnline = networkStatus === 'ONLINE';

  return (
    <div className="space-y-3.5 pb-6">
      {/* Officer Status Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              {t.fieldOfficer}
            </span>
            {demoModeActive && (
              <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 text-[9px] font-bold">
                {t.demoMode}
              </span>
            )}
          </div>

          {/* Online / Offline Toggle Button */}
          <button
            type="button"
            onClick={onToggleNetworkStatus}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900/80'
                : 'bg-red-950/90 text-red-300 border-red-700 hover:bg-red-900/90 animate-pulse'
            }`}
            title="Click to toggle simulated cellular signal"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>🟢 {t.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-400" />
                <span>🔴 {t.offline}</span>
              </>
            )}
          </button>
        </div>

        {/* Telemetry Snapshot Strip */}
        <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-gray-800 text-[10px]">
          <div className="flex flex-col">
            <span className="text-gray-400">GPS Signal</span>
            <button 
              onClick={onToggleGPS}
              className="text-left font-mono font-bold flex items-center gap-1 mt-0.5 text-cyan-300 hover:underline"
            >
              {gps.status === 'ACTIVE' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>±{gps.accuracy}m</span>
                </>
              ) : gps.status === 'DEMO_GPS' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>DEMO GPS</span>
                </>
              ) : (
                <span className="text-red-400">LOST</span>
              )}
            </button>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-400">{t.lastSync}</span>
            <span className="font-mono text-gray-200 mt-0.5 truncate">
              {lastSyncTime || 'Just now'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-400">Pending Reports</span>
            <span className={`font-mono font-bold mt-0.5 ${pendingReportsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {pendingReportsCount > 0 ? `${pendingReportsCount} in queue` : '0 pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Mission & Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* ACTIVE ASSIGNMENT CARD */}
          <div className="bg-gray-900 border-2 border-blue-600/40 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <span className="text-xs md:text-sm font-black tracking-wider text-blue-300 uppercase">
                  {t.activeAssignment}
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-red-950 border border-red-700 text-red-300 text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                🚨 {activeDelivery?.priority || 'CRITICAL'}
              </span>
            </div>

            {/* Cargo and Delivery Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-baseline justify-between bg-gray-950/70 p-3 rounded-xl border border-gray-800">
                <div>
                  <span className="text-[10px] text-gray-400 block">{t.cargo}</span>
                  <span className="font-bold text-white text-sm md:text-base">
                    {activeDelivery?.cargo_type || 'MEDICINE'} • {activeDelivery?.id || 'D102'}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {activeDelivery?.cargo_name || 'Critical Emergency Medicine & IV Fluids'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">{t.status}</span>
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-700 mt-0.5">
                    {activeDelivery?.status || 'IN TRANSIT'}
                  </span>
                </div>
              </div>

              {/* Corridor Waypoints */}
              <div className="grid grid-cols-2 gap-3 bg-gray-950/50 p-3 rounded-xl border border-gray-800/80 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">{t.from}</span>
                  <span className="font-bold text-gray-200 text-sm">
                    {activeDelivery?.origin ? activeDelivery.origin.split(' ')[0] : 'Guwahati'}
                  </span>
                  <span className="text-[10px] text-gray-400 block">Central Depot</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">{t.to}</span>
                  <span className="font-bold text-emerald-300 text-sm">
                    {activeDelivery?.destination ? activeDelivery.destination.split(' ')[0] : 'Haflong'}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 block">Dima Hasao Civil Hospital</span>
                </div>
              </div>

              {/* Vehicle and Risk Assessment */}
              <div className="flex items-center justify-between text-xs px-1 text-gray-400">
                <span>Vehicle: <strong className="text-gray-200">{activeVehicle?.vehicle_number || 'AS-01-TR-102'}</strong></span>
                <span>Corridor Risk: <strong className="text-amber-400">MEDIUM (302 km)</strong></span>
              </div>

              {/* View Route Action Button */}
              <button
                type="button"
                onClick={() => onNavigateTab('route')}
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-xs md:text-sm transition active:scale-[0.98]"
              >
                <Navigation className="w-4 h-4" />
                <span className="tracking-wide">{t.viewRoute}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* QUICK ACTIONS GRID */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-2 px-1">
              {t.quickActions}
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Report Incident */}
              <button
                type="button"
                onClick={() => onNavigateTab('report')}
                className="p-3.5 bg-gray-900 hover:bg-gray-800/90 border border-amber-800/40 rounded-xl text-left shadow flex flex-col justify-between transition group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/90 border border-amber-700/60 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">{t.reportIncident}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Hazard & breach</span>
                </div>
              </button>

              {/* My Route */}
              <button
                type="button"
                onClick={() => onNavigateTab('route')}
                className="p-3.5 bg-gray-900 hover:bg-gray-800/90 border border-blue-800/40 rounded-xl text-left shadow flex flex-col justify-between transition group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-950/90 border border-blue-700/60 flex items-center justify-center text-blue-400">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">{t.myRoute}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Live road risk</span>
                </div>
              </button>

              {/* My Task */}
              <button
                type="button"
                onClick={() => onNavigateTab('delivery')}
                className="p-3.5 bg-gray-900 hover:bg-gray-800/90 border border-emerald-800/40 rounded-xl text-left shadow flex flex-col justify-between transition group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/90 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">{t.myTask}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">D102 Cargo timeline</span>
                </div>
              </button>

              {/* Sync Now */}
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="p-3.5 bg-gray-900 hover:bg-gray-800/90 border border-cyan-800/40 rounded-xl text-left shadow flex flex-col justify-between transition group active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-cyan-300">
                    {pendingReportsCount}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">{t.syncNow}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {isSyncing ? 'Syncing...' : 'Sync cache'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Weather, Offline Diagnostics & Emergency */}
        <div className="space-y-4">
          {/* Weather Advisory Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-xs shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span className="uppercase tracking-wider">🌧 Weather Telemetry</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Assam SDMA</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 bg-gray-950 p-2.5 rounded-xl text-[11px] mt-2 border border-gray-800">
              <div>
                <span className="text-[9px] text-gray-500 block">Rainfall</span>
                <span className="font-bold text-white">{weather?.mean_24h_rainfall_mm || 58.4} mm</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block">Forecast</span>
                <span className="font-bold text-cyan-300">Heavy Rain</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block">Risk Impact</span>
                <span className="font-bold text-red-400">HIGH</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2.5 leading-relaxed">
              {weather?.peak_hazard_district 
                ? `Peak hazard district: ${weather.peak_hazard_district}. Hill cut routes prone to slope movement.`
                : 'Precipitation exceeding saturation thresholds along Dima Hasao hill passes.'}
            </p>
          </div>

          {/* Offline Alert Card (shown if offline) */}
          {!isOnline && (
            <div className="bg-red-950/70 border border-red-800 rounded-2xl p-4 text-xs text-red-200 shadow-xl space-y-1.5">
              <div className="font-bold text-red-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-red-400 shrink-0" />
                <span>{t.offlineMode}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900 border border-red-700 font-mono">INDEXEDDB</span>
              </div>
              <p className="text-[11px] text-red-300/90 leading-relaxed">
                Operating with local corridor cache. New incident reports will queue locally and auto-sync when network returns.
              </p>
            </div>
          )}

          {/* Quick Emergency SOS Card */}
          <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-4 shadow-xl text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Emergency Dispatch Link</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Direct emergency distress broadcast link to ASDMA State Disaster Control Room.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('emergency')}
              className="w-full py-3 bg-gradient-to-r from-red-700 via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-black rounded-xl shadow-lg shadow-red-700/30 flex items-center justify-center gap-2 text-xs transition active:scale-[0.98] border border-red-500/50 uppercase tracking-wider"
            >
              <ShieldAlert className="w-4 h-4 text-yellow-300 animate-bounce" />
              <span>🚨 {t.emergency} PROTOCOL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

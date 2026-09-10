import React, { useState, useEffect } from 'react';
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
  Database,
  MapPin,
  Eye
} from 'lucide-react';
import type { Delivery, Vehicle } from '../../types/logistics';
import type { FieldOfficerGPS, OfficerNetworkStatus, SupportedLanguage } from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';
import type { WeatherCurrent } from '../../services/api';
import { fetchWeatherAtCoords } from '../../services/api';
import type { DistrictWeatherReport } from '../../types/weather';

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
  onOpenAdminWeather?: () => void;
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
  onOpenAdminWeather,
}) => {
  const t = getTranslation(language);
  const isOnline = networkStatus === 'ONLINE';

  // GPS-Traced Live Weather Report
  const [tracedWeather, setTracedWeather] = useState<DistrictWeatherReport | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchWeatherAtCoords(gps.latitude, gps.longitude)
      .then((data) => {
        if (isMounted) setTracedWeather(data);
      })
      .catch((err) => console.warn('Could not fetch traced weather for officer:', err));
    return () => {
      isMounted = false;
    };
  }, [gps.latitude, gps.longitude]);

  return (
    <div className="space-y-3.5 pb-6">
      {/* Officer Status Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              {t.fieldOfficer}
            </span>
            {demoModeActive && (
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold">
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
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 animate-pulse'
            }`}
            title="Click to toggle simulated cellular signal"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-600" />
                <span>🟢 {t.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-600" />
                <span>🔴 {t.offline}</span>
              </>
            )}
          </button>
        </div>

        {/* Telemetry Snapshot Strip */}
        <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-slate-100 text-[10px]">
          <div className="flex flex-col">
            <span className="text-slate-500">GPS Signal</span>
            <button 
              onClick={onToggleGPS}
              className="text-left font-mono font-bold flex items-center gap-1 mt-0.5 text-blue-600 hover:underline"
            >
              {gps.status === 'ACTIVE' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>±{gps.accuracy}m</span>
                </>
              ) : gps.status === 'DEMO_GPS' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>DEMO GPS</span>
                </>
              ) : (
                <span className="text-rose-600">LOST</span>
              )}
            </button>
          </div>

          <div className="flex flex-col">
            <span className="text-slate-500">{t.lastSync}</span>
            <span className="font-mono text-slate-700 mt-0.5 truncate">
              {lastSyncTime || 'Just now'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-slate-500">Pending Reports</span>
            <span className={`font-mono font-bold mt-0.5 ${pendingReportsCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
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
          <div className="bg-white border border-blue-200 rounded-2xl p-4 md:p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-xs md:text-sm font-black tracking-wider text-blue-700 uppercase">
                  {t.activeAssignment}
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                🚨 {activeDelivery?.priority || 'CRITICAL'}
              </span>
            </div>

            {/* Cargo and Delivery Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-baseline justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">{t.cargo}</span>
                  <span className="font-bold text-slate-900 text-sm md:text-base">
                    {activeDelivery?.cargo_type || 'MEDICINE'} • {activeDelivery?.id || 'D102'}
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {activeDelivery?.cargo_name || 'Critical Emergency Medicine & IV Fluids'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">{t.status}</span>
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 mt-0.5">
                    {activeDelivery?.status || 'IN TRANSIT'}
                  </span>
                </div>
              </div>

              {/* Corridor Waypoints */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">{t.from}</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {activeDelivery?.origin ? activeDelivery.origin.split(' ')[0] : 'Guwahati'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Central Depot</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">{t.to}</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {activeDelivery?.destination ? activeDelivery.destination.split(' ')[0] : 'Haflong'}
                  </span>
                  <span className="text-[10px] text-emerald-600 block">Dima Hasao Civil Hospital</span>
                </div>
              </div>

              {/* Vehicle and Risk Assessment */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <span>Vehicle: <strong className="text-slate-800">{activeVehicle?.vehicle_number || 'AS-01-TR-102'}</strong></span>
                <span>Corridor Risk: <strong className="text-amber-600">MEDIUM (302 km)</strong></span>
              </div>

              {/* View Route Action Button */}
              <button
                type="button"
                onClick={() => onNavigateTab('route')}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs md:text-sm transition active:scale-[0.98]"
              >
                <Navigation className="w-4 h-4" />
                <span className="tracking-wide">{t.viewRoute}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* QUICK ACTIONS GRID */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-2 px-1">
              {t.quickActions}
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Report Incident */}
              <button
                type="button"
                onClick={() => onNavigateTab('report')}
                className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left shadow-xs flex flex-col justify-between transition group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">{t.reportIncident}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Hazard & breach</span>
                </div>
              </button>

              {/* My Route */}
              <button
                type="button"
                onClick={() => onNavigateTab('route')}
                className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left shadow-xs flex flex-col justify-between transition group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">{t.myRoute}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Live road risk</span>
                </div>
              </button>

              {/* My Task */}
              <button
                type="button"
                onClick={() => onNavigateTab('delivery')}
                className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left shadow-xs flex flex-col justify-between transition group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">{t.myTask}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">D102 Cargo timeline</span>
                </div>
              </button>

              {/* Sync Now */}
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left shadow-xs flex flex-col justify-between transition group active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-sky-700">
                    {pendingReportsCount}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">{t.syncNow}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {isSyncing ? 'Syncing...' : 'Sync cache'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Weather, Offline Diagnostics & Emergency */}
        <div className="space-y-4">
          {/* Weather Advisory Card (GPS-Traced) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span className="uppercase tracking-wider">🌧 Weather Telemetry</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-semibold">
                <MapPin className="w-3 h-3 text-blue-600" />
                {tracedWeather ? tracedWeather.district_name : 'Locating GPS...'}
              </span>
            </div>

            {/* Traced District Quick Status */}
            <div className="flex items-center justify-between my-2 pb-2 border-b border-slate-100">
              <div>
                <span className="text-lg font-bold text-slate-900">
                  {tracedWeather ? `${tracedWeather.temperature_c}°C` : '28.2°C'}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  {tracedWeather?.condition || 'Monsoon Showers'}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  tracedWeather?.flood_alert_level === 'RED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : tracedWeather?.flood_alert_level === 'ORANGE'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : tracedWeather?.flood_alert_level === 'YELLOW'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                ALERT: {tracedWeather?.flood_alert_level || 'ORANGE'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px] border border-slate-200">
              <div>
                <span className="text-[9px] text-slate-500 block">24h Rainfall</span>
                <span className="font-bold text-slate-900">
                  {tracedWeather ? `${tracedWeather.rainfall_mm} mm` : `${weather?.mean_24h_rainfall_mm || 58.4} mm`}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">Soil Moisture</span>
                <span className="font-bold text-sky-700">
                  {tracedWeather ? `${tracedWeather.soil_moisture_pct}%` : '82%'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">Visibility</span>
                <span className="font-bold text-slate-800">
                  {tracedWeather ? `${tracedWeather.visibility_km} km` : '4.2 km'}
                </span>
              </div>
            </div>

            <div className="mt-2.5 p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-slate-700 leading-relaxed">
              <span className="font-semibold text-blue-900 block mb-0.5">Terrain Advisory:</span>
              {tracedWeather?.logistics_advisory ||
                (weather?.peak_hazard_district 
                  ? `Peak hazard district: ${weather.peak_hazard_district}. Hill cut routes prone to slope movement.`
                  : 'Precipitation exceeding saturation thresholds along Dima Hasao hill passes.')}
            </div>

            {/* Option to See Weather Like Admin (All 35 Districts) */}
            {onOpenAdminWeather && (
              <button
                type="button"
                onClick={onOpenAdminWeather}
                className="w-full mt-3 py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-blue-400 rounded-xl text-xs font-semibold flex items-center justify-between transition shadow-xs group active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                  <span>See Weather Like Admin (All 35 Districts)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </button>
            )}
          </div>

          {/* Offline Alert Card (shown if offline) */}
          {!isOnline && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 shadow-xs space-y-1.5">
              <div className="font-bold text-rose-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{t.offlineMode}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 border border-rose-200 font-mono text-rose-700">INDEXEDDB</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Operating with local corridor cache. New incident reports will queue locally and auto-sync when network returns.
              </p>
            </div>
          )}

          {/* Quick Emergency SOS Card */}
          <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-xs text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Emergency Dispatch Link</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Direct emergency distress broadcast link to ASDMA State Disaster Control Room.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('emergency')}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs transition active:scale-[0.98] uppercase tracking-wider"
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

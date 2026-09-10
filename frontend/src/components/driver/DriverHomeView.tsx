import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Navigation, 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  AlertOctagon, 
  CloudRain, 
  ArrowRight, 
  Layers
} from 'lucide-react';
import type { Delivery } from '../../types/logistics';
import type { RouteSummary } from '../../types/route';
import type { DriverProfile, DriverGPS, DriverNetworkStatus } from '../../types/driver';
import type { SupportedLanguage } from '../../types/fieldOfficer';
import { fetchWeatherAtCoords } from '../../services/api';
import type { DistrictWeatherReport } from '../../types/weather';

interface DriverHomeViewProps {
  driver: DriverProfile;
  activeDelivery: Delivery | null;
  activeRoute: RouteSummary | null;
  currentGps: DriverGPS;
  networkStatus: DriverNetworkStatus;
  selectedLanguage: SupportedLanguage;
  onNavigateToNewConsignment: () => void;
  onNavigateToRoute: () => void;
  onNavigateToActiveTrip: () => void;
  onOpenReportModal: () => void;
  onOpenEmergencyModal: () => void;
  onNavigateToAlerts: () => void;
}

export const DriverHomeView: React.FC<DriverHomeViewProps> = ({
  driver,
  activeDelivery,
  activeRoute,
  currentGps,
  networkStatus,
  onNavigateToNewConsignment,
  onNavigateToRoute,
  onNavigateToActiveTrip,
  onOpenReportModal,
  onOpenEmergencyModal,
  onNavigateToAlerts,
}) => {
  // Traced location weather state (strictly for driver's current coordinates)
  const [tracedWeather, setTracedWeather] = useState<DistrictWeatherReport | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (currentGps?.latitude && currentGps?.longitude) {
      fetchWeatherAtCoords(currentGps.latitude, currentGps.longitude)
        .then((data) => {
          if (isMounted) setTracedWeather(data);
        })
        .catch((err) => {
          console.warn('Could not fetch traced weather for driver:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [currentGps?.latitude, currentGps?.longitude]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 p-4 sm:p-6 text-slate-800 font-sans pb-28">
      {/* Driver Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {driver.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold">
                {driver.vehicle_number}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {driver.carrier_hub} • {driver.vehicle_type}
            </p>
          </div>
        </div>

        {/* GPS & Network Status Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 font-bold">GPS ACTIVE</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold uppercase ${
              networkStatus === 'ONLINE'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {networkStatus}
          </div>
        </div>
      </div>

      {/* GPS-Traced Location Weather Card (Driver gets ONLY current location weather) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider block">
                TRACED LOCATION WEATHER (GPS LOCK)
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{tracedWeather ? tracedWeather.district_name : 'Tracing coordinates...'}</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  ({currentGps ? `${currentGps.latitude.toFixed(2)}°N, ${currentGps.longitude.toFixed(2)}°E` : '26.14°N, 91.73°E'})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                tracedWeather?.flood_alert_level === 'RED'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : tracedWeather?.flood_alert_level === 'ORANGE'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : tracedWeather?.flood_alert_level === 'YELLOW'
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              FLOOD ALERT: {tracedWeather?.flood_alert_level || 'ORANGE'}
            </span>
          </div>
        </div>

        {/* Real-time telemetry metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-semibold block">Condition</span>
            <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
              {tracedWeather ? `${tracedWeather.temperature_c}°C • ${tracedWeather.condition}` : '28°C • Monsoon'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-semibold block">24h Rainfall</span>
            <span className="text-xs font-bold text-blue-600 block mt-0.5">
              {tracedWeather ? `${tracedWeather.rainfall_mm} mm` : '58.4 mm'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-semibold block">Visibility</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {tracedWeather ? `${tracedWeather.visibility_km} km` : '4.2 km'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-semibold block">Wind Speed</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {tracedWeather ? `${tracedWeather.wind_kmh} km/h` : '18 km/h'}
            </span>
          </div>
        </div>

        {/* Logistics & Driving Road Advisory */}
        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
              Driving & Road Friction Advisory:
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {tracedWeather?.logistics_advisory ||
                'Caution: Heavy rain corridor active. Maintain safe headway and reduce speeds on highway curves.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToAlerts}
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold transition shadow-2xs"
          >
            Corridor Alerts
          </button>
        </div>
      </div>

      {/* ACTIVE CONSIGNMENT HERO CARD */}
      {activeDelivery ? (
        <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xs space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-black uppercase tracking-wider">
                  ACTIVE MISSION
                </span>
                <span className="text-xs font-mono font-black text-blue-700">
                  {activeDelivery.consignment_id || activeDelivery.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    activeDelivery.priority === 'CRITICAL'
                      ? 'bg-rose-50 border border-rose-200 text-rose-700'
                      : activeDelivery.priority === 'HIGH'
                      ? 'bg-amber-50 border border-amber-200 text-amber-700'
                      : 'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}
                >
                  {activeDelivery.priority}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase mt-1">
                {activeDelivery.cargo_name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-black animate-pulse">
                ● {activeDelivery.status}
              </span>
            </div>
          </div>

          {/* Route Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>PICKUP LOCATION</span>
              </span>
              <p className="text-slate-900 font-bold text-sm truncate">{activeDelivery.origin}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>DESTINATION</span>
              </span>
              <p className="text-slate-900 font-bold text-sm truncate">{activeDelivery.destination}</p>
            </div>
          </div>

          {/* Quick Metrics if route available */}
          {activeRoute && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">DISTANCE</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {activeRoute.distance_km.toFixed(1)} KM
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">DRIVE TIME</span>
                <span className="text-base font-black text-amber-600 font-mono">
                  {Math.floor(activeRoute.eta_minutes / 60)}h {Math.round(activeRoute.eta_minutes % 60)}m
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">ROAD RISK</span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {activeRoute.risk_level}
                </span>
              </div>
            </div>
          )}

          {/* Action Button: Resume In-Transit View */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onNavigateToActiveTrip}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wide shadow-xs transition active:scale-98 flex items-center justify-center gap-2.5"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>RESUME IN-TRANSIT NAVIGATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onNavigateToRoute}
              className="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs uppercase transition flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>View Route Map</span>
            </button>
          </div>
        </div>
      ) : (
        /* NO ACTIVE CONSIGNMENT — PROMINENT CALL TO ACTION */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase">
              No Active Consignment Dispatched
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Register a new consignment waybill, specify cargo priority &amp; destination to calculate your safe AI corridor.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={onNavigateToNewConsignment}
              className="py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider shadow-xs transition active:scale-98 inline-flex items-center gap-2.5"
            >
              <Plus className="w-5 h-5" />
              <span>ENTER NEW CONSIGNMENT</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* New Consignment */}
        <button
          type="button"
          onClick={onNavigateToNewConsignment}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition flex flex-col justify-between group active:scale-95 shadow-xs"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase">New Trip</h4>
            <span className="text-[10px] text-slate-500">Enter consignment</span>
          </div>
        </button>

        {/* Report Road Hazard */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition flex flex-col justify-between group active:scale-95 shadow-xs"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase">Report Hazard</h4>
            <span className="text-[10px] text-slate-500">Landslide / Flood</span>
          </div>
        </button>

        {/* Corridor Alerts */}
        <button
          type="button"
          onClick={onNavigateToAlerts}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition flex flex-col justify-between group active:scale-95 shadow-xs"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase">Corridor Alerts</h4>
            <span className="text-[10px] text-slate-500">Road restrictions</span>
          </div>
        </button>

        {/* Emergency SOS */}
        <button
          type="button"
          onClick={onOpenEmergencyModal}
          className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition flex flex-col justify-between group active:scale-95 shadow-xs"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-xs text-rose-800 uppercase">EMERGENCY SOS</h4>
            <span className="text-[10px] text-rose-600 font-semibold">Call Dispatch / 112</span>
          </div>
        </button>
      </div>
    </div>
  );
};

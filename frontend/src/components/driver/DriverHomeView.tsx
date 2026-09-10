import React from 'react';
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
  networkStatus,
  onNavigateToNewConsignment,
  onNavigateToRoute,
  onNavigateToActiveTrip,
  onOpenReportModal,
  onOpenEmergencyModal,
  onNavigateToAlerts,
}) => {

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 p-4 sm:p-6 text-gray-100 font-sans pb-28">
      {/* Driver Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-600/30">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                {driver.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-bold">
                {driver.vehicle_number}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {driver.carrier_hub} • {driver.vehicle_type}
            </p>
          </div>
        </div>

        {/* GPS & Network Status Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-[11px] font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300 font-bold">GPS ACTIVE</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold uppercase ${
              networkStatus === 'ONLINE'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
            }`}
          >
            {networkStatus}
          </div>
        </div>
      </div>

      {/* Real-Time Monsoon Weather Card */}
      <div className="bg-gradient-to-r from-blue-950/60 via-gray-900 to-indigo-950/50 border border-blue-600/30 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
              CORRIDOR WEATHER INTEL • ASSAM MONSOON
            </span>
            <p className="text-xs text-gray-200 font-medium">
              Heavy continuous rainfall (74mm/24h) along NH-27 hill sectors. River gauge advisory at flood level in Barak Basin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToAlerts}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[11px] font-bold transition"
        >
          View Alerts
        </button>
      </div>

      {/* ACTIVE CONSIGNMENT HERO CARD */}
      {activeDelivery ? (
        <div className="bg-gray-900/95 border-2 border-blue-500/70 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-900/80 border border-blue-500 text-white text-[10px] font-mono font-black uppercase tracking-wider">
                  ACTIVE MISSION
                </span>
                <span className="text-xs font-mono font-black text-blue-400">
                  {activeDelivery.consignment_id || activeDelivery.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    activeDelivery.priority === 'CRITICAL'
                      ? 'bg-red-950 border border-red-500 text-red-300'
                      : activeDelivery.priority === 'HIGH'
                      ? 'bg-amber-950 border border-amber-500 text-amber-300'
                      : 'bg-blue-950 border border-blue-500 text-blue-300'
                  }`}
                >
                  {activeDelivery.priority}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase mt-1">
                {activeDelivery.cargo_name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-black animate-pulse">
                ● {activeDelivery.status}
              </span>
            </div>
          </div>

          {/* Route Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/80 space-y-1">
              <span className="text-gray-400 font-bold flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>PICKUP LOCATION</span>
              </span>
              <p className="text-white font-bold text-sm truncate">{activeDelivery.origin}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/80 space-y-1">
              <span className="text-gray-400 font-bold flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>DESTINATION</span>
              </span>
              <p className="text-white font-bold text-sm truncate">{activeDelivery.destination}</p>
            </div>
          </div>

          {/* Quick Metrics if route available */}
          {activeRoute && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-[10px] text-gray-400 font-bold block">DISTANCE</span>
                <span className="text-base font-black text-white font-mono">
                  {activeRoute.distance_km.toFixed(1)} KM
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-[10px] text-gray-400 font-bold block">DRIVE TIME</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {Math.floor(activeRoute.eta_minutes / 60)}h {Math.round(activeRoute.eta_minutes % 60)}m
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-[10px] text-gray-400 font-bold block">ROAD RISK</span>
                <span className="text-base font-black text-emerald-400 font-mono">
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
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wide shadow-xl shadow-blue-600/30 transition active:scale-98 flex items-center justify-center gap-2.5"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>RESUME IN-TRANSIT NAVIGATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onNavigateToRoute}
              className="py-3.5 px-5 rounded-2xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold text-xs uppercase transition flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>View Route Map</span>
            </button>
          </div>
        </div>
      ) : (
        /* NO ACTIVE CONSIGNMENT — PROMINENT CALL TO ACTION */
        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-xl">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase">
              No Active Consignment Dispatched
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
              Register a new consignment waybill, specify cargo priority &amp; destination to calculate your safe AI corridor.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={onNavigateToNewConsignment}
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-blue-600/40 transition active:scale-98 inline-flex items-center gap-2.5"
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
          className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/50 text-left transition flex flex-col justify-between group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white uppercase">New Trip</h4>
            <span className="text-[10px] text-gray-400">Enter consignment</span>
          </div>
        </button>

        {/* Report Road Hazard */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-amber-500/50 text-left transition flex flex-col justify-between group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white uppercase">Report Hazard</h4>
            <span className="text-[10px] text-gray-400">Landslide / Flood</span>
          </div>
        </button>

        {/* Corridor Alerts */}
        <button
          type="button"
          onClick={onNavigateToAlerts}
          className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/50 text-left transition flex flex-col justify-between group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white uppercase">Corridor Alerts</h4>
            <span className="text-[10px] text-gray-400">Road restrictions</span>
          </div>
        </button>

        {/* Emergency SOS */}
        <button
          type="button"
          onClick={onOpenEmergencyModal}
          className="p-4 rounded-2xl bg-red-950/60 hover:bg-red-900/80 border border-red-700/60 text-left transition flex flex-col justify-between group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-red-600/40">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-xs text-white uppercase">EMERGENCY SOS</h4>
            <span className="text-[10px] text-red-300">Call Dispatch / 112</span>
          </div>
        </button>
      </div>
    </div>
  );
};

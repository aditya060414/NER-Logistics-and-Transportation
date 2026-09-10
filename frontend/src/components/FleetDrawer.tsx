import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  Bell, 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Send, 
  Phone,
  AlertOctagon,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import type { Vehicle, Delivery, LogisticsAlert } from '../types/logistics';
import type { RoutePlanResponse } from '../types/route';

interface FleetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  deliveries: Delivery[];
  alerts: LogisticsAlert[];
  onDispatchReroute: (vehicleId: string) => Promise<void>;
  onFocusVehicleOnMap?: (vehicle: Vehicle) => void;
  onViewDeliveryRoute?: (delivery: Delivery) => void;
  selectedVehicleId?: string | null;
  isLoading?: boolean;
  activeRouteResponse?: RoutePlanResponse | null;
  onOpenAllFleet?: () => void;
}

export const FleetDrawer: React.FC<FleetDrawerProps> = ({
  isOpen,
  onClose,
  vehicles,
  deliveries,
  alerts,
  onDispatchReroute,
  onFocusVehicleOnMap,
  onViewDeliveryRoute,
  selectedVehicleId,
  onOpenAllFleet,
}) => {
  const [activeTab, setActiveTab] = useState<'IMPACT' | 'FLEET' | 'DELIVERIES' | 'ALERTS'>('IMPACT');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<boolean>(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  if (!isOpen) return null;

  const atRiskVehicles = vehicles.filter((v) => v.status === 'AT_RISK');
  const criticalDeliveries = deliveries.filter((d) => d.priority === 'CRITICAL');
  const unreadAlerts = alerts.filter((a) => a.status === 'UNREAD');

  const handleDispatchClick = async (vehicleId: string) => {
    setIsDispatching(true);
    setDispatchedSuccess(false);
    try {
      await onDispatchReroute(vehicleId);
      setDispatchedSuccess(true);
    } catch (err) {
      console.error('Failed to dispatch detour:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 bottom-20 z-[1000] w-[420px] max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 text-slate-800">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 select-none shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase truncate">
                Fleet &amp; Logistics
              </h2>
              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium shrink-0">
                GPS Live
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">Closure Rerouting &amp; Deliveries</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (onOpenAllFleet) onOpenAllFleet();
              else window.location.hash = '#fleet';
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition shadow-2xs whitespace-nowrap"
            title="Open All Fleet in Fullscreen Portal"
          >
            <ExternalLink className="w-3 h-3" />
            <span>FULL VIEW</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 p-1.5 bg-slate-50/60 border-b border-slate-100 text-[10px] font-bold shrink-0">
        <button
          onClick={() => setActiveTab('IMPACT')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition whitespace-nowrap ${
            activeTab === 'IMPACT'
              ? 'bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <AlertOctagon className="w-3 h-3 text-rose-600" />
          <span>IMPACT</span>
          {atRiskVehicles.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-extrabold animate-pulse">
              {atRiskVehicles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('FLEET')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition whitespace-nowrap ${
            activeTab === 'FLEET'
              ? 'bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Truck className="w-3 h-3 text-blue-600" />
          <span>FLEET ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERIES')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition whitespace-nowrap ${
            activeTab === 'DELIVERIES'
              ? 'bg-purple-50 text-purple-800 border border-purple-300 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Package className="w-3 h-3 text-purple-600" />
          <span>CARGO ({criticalDeliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition whitespace-nowrap ${
            activeTab === 'ALERTS'
              ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Bell className="w-3 h-3 text-amber-600" />
          <span>ALERTS</span>
          {unreadAlerts.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">
              {unreadAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 text-xs pb-4">
        {/* TAB 1: LOGISTICS IMPACT & AUTOMATIC REROUTING */}
        {activeTab === 'IMPACT' && (
          <div className="space-y-3">
            {atRiskVehicles.length > 0 ? (
              atRiskVehicles.map((veh) => {
                const delivery = deliveries.find((d) => d.id === veh.assigned_delivery_id);
                return (
                  <div
                    key={`impact-${veh.id}`}
                    className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3 shadow-xs"
                  >
                    {/* Urgency Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4 animate-bounce" />
                        <span>CORRIDOR CLOSURE DETECTED</span>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        VEHICLE AT RISK
                      </span>
                    </div>

                    {/* Affected Vehicle & Cargo Info */}
                    <div className="bg-white p-2.5 rounded-lg border border-rose-200 space-y-1.5 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {veh.vehicle_number}
                        </span>
                        <span className="text-[10px] text-slate-500">{veh.vehicle_type}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Driver: <strong className="text-slate-900">{veh.driver_name}</strong> •{' '}
                        <span className="text-slate-500">{veh.driver_phone}</span>
                      </div>
                      {delivery && (
                        <div className="pt-1 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-500">Assigned Delivery: </span>
                          <strong className="text-rose-700">{delivery.cargo_name}</strong>
                          <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                            <span>
                              {delivery.origin} &rarr; {delivery.destination}
                            </span>
                            <span className="text-rose-600 font-bold">+2h 15m delay</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Automatic Detour AI Recommendation */}
                    <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>AI Safety Detour Automatically Calculated</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        Bypasses confirmed landslide closure at Bijni–Panbari corridor. Reroutes vehicle via central valley corridor to ensure safe medical consignment arrival.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-center pt-1 bg-white border border-blue-100 p-1.5 rounded text-[10px]">
                        <div>
                          <span className="text-slate-500 block">Detour Distance</span>
                          <span className="font-bold text-slate-900">302.8 km</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Updated ETA</span>
                          <span className="font-bold text-blue-700">4.5 hrs</span>
                        </div>
                      </div>
                    </div>

                    {/* Action: Dispatch Detour to Driver */}
                    <div className="pt-1">
                      <button
                        onClick={() => handleDispatchClick(veh.id)}
                        disabled={isDispatching}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition text-xs"
                      >
                        {isDispatching ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Transmitting Detour Telemetry...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>DISPATCH DETOUR TO DRIVER ({veh.driver_name.toUpperCase()})</span>
                          </>
                        )}
                      </button>

                      {dispatchedSuccess && (
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] text-center flex items-center justify-center gap-1.5 animate-in fade-in font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Detour navigation successfully acknowledged by Driver {veh.driver_name}!</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <h3 className="font-bold text-emerald-900 text-xs">All Active Fleet Routes Clear</h3>
                <p className="text-[11px] text-emerald-700">
                  No en-route logistics vehicles are currently blocked by confirmed road closures.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FLEET TRACKING */}
        {activeTab === 'FLEET' && (
          <div className="space-y-2.5">
            {vehicles.map((v) => {
              const isSelected = selectedVehicleId === v.id;
              const isAtRisk = v.status === 'AT_RISK';
              const isRerouted = v.status === 'REROUTED';

              return (
                <div
                  key={v.id}
                  className={`p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-400'
                      : isAtRisk
                      ? 'bg-rose-50/60 border-rose-300 hover:border-rose-400'
                      : isRerouted
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-mono font-bold text-slate-900">{v.vehicle_number}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        isAtRisk
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : isRerouted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Type: {v.vehicle_type}</div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      <span>{v.driver_name} ({v.driver_phone})</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span>Speed: <strong className="text-slate-800">{v.speed_kmh} km/h</strong></span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {v.current_latitude.toFixed(3)}, {v.current_longitude.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  {onFocusVehicleOnMap && (
                    <button
                      onClick={() => onFocusVehicleOnMap(v)}
                      className="w-full mt-2 py-1.5 bg-white hover:bg-slate-100 text-blue-700 rounded-lg text-[10px] font-semibold transition border border-slate-200 flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Track Vehicle Location on Map</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: CRITICAL DELIVERIES */}
        {activeTab === 'DELIVERIES' && (
          <div className="space-y-2.5">
            {deliveries.map((d) => {
              const isCritical = d.priority === 'CRITICAL';
              return (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">{d.id}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {d.priority} PRIORITY
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs leading-tight">{d.cargo_name}</h4>

                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <div>Origin: {d.origin}</div>
                    <div>Destination: {d.destination}</div>
                    <div className="flex justify-between items-center pt-1">
                      <span>Status: <strong className="text-slate-800">{d.status}</strong></span>
                      {d.delay_minutes > 0 ? (
                        <span className="text-rose-600 font-bold">+{d.delay_minutes}m delay</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">On Time</span>
                      )}
                    </div>
                  </div>

                  {onViewDeliveryRoute && (
                    <button
                      onClick={() => onViewDeliveryRoute(d)}
                      className="w-full mt-1.5 py-1.5 bg-white hover:bg-slate-100 text-purple-700 rounded-lg text-[10px] font-semibold transition border border-slate-200 flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Inspect Supply Corridor on Map</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: ALERTS */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-2.5">
            {alerts.filter(a => !dismissedAlerts.has(a.id)).length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <h3 className="font-bold text-emerald-900 text-xs">All Alerts Cleared</h3>
                <p className="text-[11px] text-emerald-700">No active notifications at this time.</p>
              </div>
            ) : (
              alerts.filter(a => !dismissedAlerts.has(a.id)).map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-xl border ${
                    a.severity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <strong className="text-slate-900 text-xs truncate">{a.title}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-rose-700 border border-rose-200">
                        {a.severity}
                      </span>
                      <button
                        onClick={() => handleDismissAlert(a.id)}
                        title="Dismiss notification"
                        className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-white/70 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed mb-1">{a.message}</p>
                  <div className="text-[9px] text-slate-500">District: {a.district || 'Assam Regional Corridor'}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Quick-Link Footer */}
      <div className="p-2.5 border-t border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between shrink-0 text-[10px]">
        <span className="text-slate-500 font-medium">
          <strong className="text-slate-800 font-bold">{vehicles.length}</strong> Fleet Units • <strong className="text-rose-600 font-bold">{atRiskVehicles.length}</strong> At Risk
        </span>
        <button
          onClick={() => {
            if (onOpenAllFleet) onOpenAllFleet();
            else window.location.hash = '#fleet';
          }}
          className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
        >
          <span>Open Dedicated Portal</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

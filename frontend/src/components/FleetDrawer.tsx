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
  Sparkles
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
}) => {
  const [activeTab, setActiveTab] = useState<'IMPACT' | 'FLEET' | 'DELIVERIES' | 'ALERTS'>('IMPACT');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<boolean>(false);

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
      setTimeout(() => setDispatchedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to dispatch detour:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] w-[420px] max-w-[calc(100vw-2rem)] bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 text-gray-200">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-gray-800 flex items-center justify-between bg-gray-950/60 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                Fleet &amp; Logistics Impact
              </h2>
              <span className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
                Simulated GPS
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Closure Rerouting &amp; Delivery Intelligence</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 p-1.5 bg-gray-950/40 border-b border-gray-800 text-[10px] font-bold">
        <button
          onClick={() => setActiveTab('IMPACT')}
          className={`py-1.5 rounded flex items-center justify-center gap-1 transition ${
            activeTab === 'IMPACT'
              ? 'bg-red-600/30 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <AlertOctagon className="w-3 h-3 text-red-400" />
          <span>IMPACT</span>
          {atRiskVehicles.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-extrabold animate-pulse">
              {atRiskVehicles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('FLEET')}
          className={`py-1.5 rounded flex items-center justify-center gap-1 transition ${
            activeTab === 'FLEET'
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Truck className="w-3 h-3 text-blue-400" />
          <span>FLEET ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERIES')}
          className={`py-1.5 rounded flex items-center justify-center gap-1 transition ${
            activeTab === 'DELIVERIES'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Package className="w-3 h-3 text-purple-400" />
          <span>CARGO ({criticalDeliveries.length} Crit)</span>
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`py-1.5 rounded flex items-center justify-center gap-1 transition ${
            activeTab === 'ALERTS'
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bell className="w-3 h-3 text-amber-400" />
          <span>ALERTS</span>
          {unreadAlerts.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center text-[9px] font-bold">
              {unreadAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Body Content */}
      <div className="p-3.5 space-y-3 overflow-y-auto text-xs">
        {/* TAB 1: LOGISTICS IMPACT & AUTOMATIC REROUTING */}
        {activeTab === 'IMPACT' && (
          <div className="space-y-3">
            {atRiskVehicles.length > 0 ? (
              atRiskVehicles.map((veh) => {
                const delivery = deliveries.find((d) => d.id === veh.assigned_delivery_id);
                return (
                  <div
                    key={`impact-${veh.id}`}
                    className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 space-y-3 shadow-lg"
                  >
                    {/* Urgency Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4 animate-bounce" />
                        <span>CORRIDOR CLOSURE DETECTED</span>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-900 text-red-100 border border-red-700">
                        VEHICLE AT RISK
                      </span>
                    </div>

                    {/* Affected Vehicle & Cargo Info */}
                    <div className="bg-gray-950/80 p-2.5 rounded-lg border border-red-900/50 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-white text-xs">
                          {veh.vehicle_number}
                        </span>
                        <span className="text-[10px] text-gray-400">{veh.vehicle_type}</span>
                      </div>
                      <div className="text-[11px] text-gray-300">
                        Driver: <strong className="text-white">{veh.driver_name}</strong> •{' '}
                        <span className="text-gray-400">{veh.driver_phone}</span>
                      </div>
                      {delivery && (
                        <div className="pt-1 border-t border-gray-800 text-[11px]">
                          <span className="text-gray-400">Assigned Delivery: </span>
                          <strong className="text-red-300">{delivery.cargo_name}</strong>
                          <div className="text-[10px] text-gray-400 flex items-center justify-between mt-0.5">
                            <span>
                              {delivery.origin} $\rightarrow$ {delivery.destination}
                            </span>
                            <span className="text-red-400 font-semibold">+2h 15m delay</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Automatic Detour AI Recommendation */}
                    <div className="bg-blue-950/40 border border-blue-800/70 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-300 font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>AI Safety Detour Automatically Calculated</span>
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed">
                        Bypasses confirmed landslide closure at Bijni–Panbari corridor. Reroutes vehicle via central valley corridor to ensure safe medical consignment arrival.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-center pt-1 bg-gray-950/60 p-1.5 rounded text-[10px]">
                        <div>
                          <span className="text-gray-400 block">Detour Distance</span>
                          <span className="font-bold text-white">302.8 km</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Updated ETA</span>
                          <span className="font-bold text-blue-300">4.5 hrs</span>
                        </div>
                      </div>
                    </div>

                    {/* Action: Dispatch Detour to Driver */}
                    <div className="pt-1">
                      <button
                        onClick={() => handleDispatchClick(veh.id)}
                        disabled={isDispatching}
                        className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition text-xs"
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
                        <div className="mt-2 p-2 bg-emerald-950 border border-emerald-700 text-emerald-200 rounded text-[10px] text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Detour navigation successfully acknowledged by Driver {veh.driver_name}!</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                <h3 className="font-bold text-white text-xs">All Active Fleet Routes Clear</h3>
                <p className="text-[11px] text-gray-300">
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
                  className={`p-3 rounded-lg border transition ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500'
                      : isAtRisk
                      ? 'bg-red-950/30 border-red-900/60 hover:border-red-700'
                      : isRerouted
                      ? 'bg-emerald-950/30 border-emerald-900/60'
                      : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-mono font-bold text-white">{v.vehicle_number}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        isAtRisk
                          ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                          : isRerouted
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}
                    >
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-400 space-y-0.5">
                    <div>Type: {v.vehicle_type}</div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Phone className="w-2.5 h-2.5" />
                      <span>{v.driver_name} ({v.driver_phone})</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span>Speed: <strong className="text-white">{v.speed_kmh} km/h</strong></span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        {v.current_latitude.toFixed(3)}, {v.current_longitude.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  {onFocusVehicleOnMap && (
                    <button
                      onClick={() => onFocusVehicleOnMap(v)}
                      className="w-full mt-2 py-1 bg-gray-800 hover:bg-gray-700 text-blue-300 rounded text-[10px] font-medium transition flex items-center justify-center gap-1"
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
                  className="p-3 rounded-lg bg-gray-950/60 border border-gray-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">{d.id}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {d.priority} PRIORITY
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-xs leading-tight">{d.cargo_name}</h4>

                  <div className="text-[10px] text-gray-400 space-y-0.5">
                    <div>Origin: {d.origin}</div>
                    <div>Destination: {d.destination}</div>
                    <div className="flex justify-between items-center pt-1">
                      <span>Status: <strong className="text-white">{d.status}</strong></span>
                      {d.delay_minutes > 0 ? (
                        <span className="text-red-400 font-semibold">+{d.delay_minutes}m delay</span>
                      ) : (
                        <span className="text-emerald-400">On Time</span>
                      )}
                    </div>
                  </div>

                  {onViewDeliveryRoute && (
                    <button
                      onClick={() => onViewDeliveryRoute(d)}
                      className="w-full mt-1.5 py-1 bg-gray-800 hover:bg-gray-700 text-purple-300 rounded text-[10px] font-medium transition flex items-center justify-center gap-1"
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
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded-lg border ${
                  a.severity === 'CRITICAL'
                    ? 'bg-red-950/30 border-red-800/80'
                    : 'bg-amber-950/30 border-amber-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <strong className="text-white text-xs">{a.title}</strong>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 rounded bg-red-900 text-red-200">
                    {a.severity}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-1">{a.message}</p>
                <div className="text-[9px] text-gray-400">District: {a.district || 'Assam Regional Corridor'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

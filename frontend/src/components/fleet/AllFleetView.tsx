import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  Phone, 
  MapPin, 
  X, 
  ShieldAlert,
  Zap,
  Clock
} from 'lucide-react';
import type { Vehicle, Delivery, LogisticsAlert } from '../../types/logistics';
import { fetchVehicles, fetchDeliveries, fetchAlerts, dispatchReroute } from '../../services/api';

interface AllFleetViewProps {
  onBackToDashboard: () => void;
  onFocusVehicleOnMap?: (vehicle: Vehicle) => void;
}

export const AllFleetView: React.FC<AllFleetViewProps> = ({
  onBackToDashboard,
  onFocusVehicleOnMap,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [alerts, setAlerts] = useState<LogisticsAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'FLEET' | 'CARGO' | 'ALERTS'>('FLEET');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchedSuccessId, setDispatchedSuccessId] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [vehData, delData, alertData] = await Promise.all([
        fetchVehicles(),
        fetchDeliveries(),
        fetchAlerts()
      ]);
      setVehicles(vehData || []);
      setDeliveries(delData || []);
      setAlerts(alertData || []);
    } catch (err: any) {
      console.error('Failed to load fleet logistics data:', err);
      setError(err?.message || 'Unable to connect to Fleet Telemetry Engine.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispatch = async (vehicleId: string) => {
    setDispatchingId(vehicleId);
    try {
      await dispatchReroute(vehicleId);
      setDispatchedSuccessId(vehicleId);
      await loadData();
      setTimeout(() => setDispatchedSuccessId(null), 3000);
    } catch (err) {
      console.error('Failed to dispatch detour:', err);
    } finally {
      setDispatchingId(null);
    }
  };

  const atRiskVehicles = vehicles.filter((v) => v.status === 'AT_RISK');
  const criticalDeliveries = deliveries.filter((d) => d.priority === 'CRITICAL');
  const activeAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((veh) => {
      if (statusFilter !== 'ALL' && veh.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPlate = veh.vehicle_number?.toLowerCase().includes(q);
        const matchesDriver = veh.driver_name?.toLowerCase().includes(q);
        const matchesType = veh.vehicle_type?.toLowerCase().includes(q);
        if (!matchesPlate && !matchesDriver && !matchesType) return false;
      }
      return true;
    });
  }, [vehicles, statusFilter, searchQuery]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((del) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCargo = del.cargo_name?.toLowerCase().includes(q);
        const matchesOrigin = del.origin?.toLowerCase().includes(q);
        const matchesDest = del.destination?.toLowerCase().includes(q);
        const matchesType = del.cargo_type?.toLowerCase().includes(q);
        if (!matchesCargo && !matchesOrigin && !matchesDest && !matchesType) return false;
      }
      return true;
    });
  }, [deliveries, searchQuery]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Control Tower</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  Freight Fleet Telemetry &amp; Supply Chain Logistics
                </h1>
                <p className="text-[11px] text-slate-500">
                  Live GPS Tracking • Corridor Disruption Safety • Consignment Priority Detours
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition shadow-2xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Telemetry</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-3">✕</button>
          </div>
        )}

        {/* KPI Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 border-l-4 border-l-blue-600 rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Active Fleet Units</div>
            <div className="mt-1 text-2xl font-black text-slate-800">{vehicles.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">En route with live GPS telemetry</div>
          </div>

          <div className="bg-white border border-slate-200 border-l-4 border-l-rose-500 rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Vehicles At Risk</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">{atRiskVehicles.length}</span>
              {atRiskVehicles.length > 0 && (
                <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                  DETOUR NEEDED
                </span>
              )}
            </div>
            <div className="text-[10px] text-rose-600 mt-0.5">Heading toward closed road hazards</div>
          </div>

          <div className="bg-white border border-slate-200 border-l-4 border-l-purple-500 rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Critical Consignments</div>
            <div className="mt-1 text-2xl font-black text-purple-600">{criticalDeliveries.length}</div>
            <div className="text-[10px] text-purple-700 mt-0.5">Life-saving medicine &amp; emergency food</div>
          </div>

          <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Active Supply Alerts</div>
            <div className="mt-1 text-2xl font-black text-amber-600">{activeAlerts.length}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Corridor closures impacting transit</div>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
              <button
                onClick={() => setActiveTab('FLEET')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'FLEET'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>FLEET VEHICLES ({vehicles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('CARGO')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'CARGO'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-purple-600" />
                <span>CARGO DELIVERIES ({deliveries.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('ALERTS')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'ALERTS'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>ALERTS ({activeAlerts.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'FLEET'
                    ? 'Search license plate, driver name...'
                    : 'Search cargo type, origin, destination...'
                }
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filters for Fleet Tab */}
          {activeTab === 'FLEET' && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
              <span className="text-slate-500 mr-1">Status Filter:</span>
              {[
                { id: 'ALL', label: `All Vehicles (${vehicles.length})` },
                { id: 'AT_RISK', label: `At Risk (${atRiskVehicles.length})`, color: 'text-rose-700 bg-rose-50 border-rose-200' },
                { id: 'ON_ROUTE', label: 'On Route', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                { id: 'REROUTED', label: 'Rerouted (Safety Detour)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    statusFilter === pill.id
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : pill.color || 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold">Synchronizing fleet telemetry and road closure vectors...</p>
          </div>
        )}

        {/* TAB 1: FLEET VEHICLES GRID */}
        {!isLoading && activeTab === 'FLEET' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {filteredVehicles.length === 0 ? (
              <div className="col-span-full py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-2 p-6">
                <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Vehicles Match Filter</h3>
                <p className="text-xs text-slate-500">Try clearing your search query or selecting "All Vehicles".</p>
              </div>
            ) : (
              filteredVehicles.map((veh) => {
                const isAtRisk = veh.status === 'AT_RISK';
                const isRerouted = veh.status === 'REROUTED';
                const assignedDel = deliveries.find((d) => d.id === veh.assigned_delivery_id);

                return (
                  <div
                    key={veh.id}
                    className={`bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                      isAtRisk
                        ? 'border-rose-300 border-l-4 border-l-rose-600'
                        : isRerouted
                        ? 'border-emerald-300 border-l-4 border-l-emerald-600'
                        : 'border-blue-200 border-l-4 border-l-blue-500'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isAtRisk ? 'bg-rose-50 text-rose-600' : isRerouted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-xs">{veh.vehicle_number}</span>
                            <div className="text-[10px] text-slate-500">{veh.vehicle_type}</div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                            isAtRisk
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                              : isRerouted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {veh.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Driver & Telemetry */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[11px] font-medium text-slate-500">Driver:</span>
                          <strong className="text-slate-900">{veh.driver_name}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            Contact:
                          </span>
                          <span className="font-mono text-[11px] text-slate-800">{veh.driver_phone}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                          <span className="text-[11px] font-medium text-slate-500">Speed / GPS:</span>
                          <span className="text-[11px] font-bold text-slate-900">
                            {veh.speed_kmh} km/h • ({veh.current_latitude.toFixed(3)}, {veh.current_longitude.toFixed(3)})
                          </span>
                        </div>
                      </div>

                      {/* Consignment info */}
                      {assignedDel && (
                        <div className="border border-purple-100 bg-purple-50/40 rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-purple-900 uppercase">Assigned Consignment</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                              assignedDel.priority === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-purple-100 text-purple-800 border-purple-200'
                            }`}>
                              {assignedDel.priority}
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 text-xs">{assignedDel.cargo_name}</p>
                          <div className="text-[10px] text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{assignedDel.origin} → {assignedDel.destination}</span>
                          </div>
                        </div>
                      )}

                      {/* AI Detour Advice if At Risk */}
                      {isAtRisk && (
                        <div className="border border-rose-200 bg-rose-50/60 rounded-lg p-2.5 space-y-1 text-xs">
                          <div className="flex items-center gap-1 font-bold text-rose-800 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Approaching Landslide Closure</span>
                          </div>
                          <p className="text-[10px] text-rose-900 leading-relaxed">
                            Bypasses Bijni–Panbari corridor closure. Automated dynamic routing calculated safe central valley corridor.
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-rose-800 pt-1">
                            <span>Detour Distance: 302.8 km</span>
                            <span>Updated ETA: 4.5 hrs</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      {isAtRisk && (
                        <button
                          onClick={() => handleDispatch(veh.id)}
                          disabled={dispatchingId === veh.id || dispatchedSuccessId === veh.id}
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-60 active:scale-95"
                        >
                          {dispatchingId === veh.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : dispatchedSuccessId === veh.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {dispatchedSuccessId === veh.id ? 'Detour Dispatched to Driver App' : 'Dispatch AI Safety Detour'}
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onFocusVehicleOnMap) {
                            onFocusVehicleOnMap(veh);
                          } else {
                            onBackToDashboard();
                          }
                        }}
                        className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Focus on Control Tower Map</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: CARGO DELIVERIES */}
        {!isLoading && activeTab === 'CARGO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {filteredDeliveries.map((del) => {
              const isCrit = del.priority === 'CRITICAL';
              return (
                <div
                  key={del.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-all space-y-3 ${
                    isCrit ? 'border-purple-300 border-l-4 border-l-purple-600' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">{del.id}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                      isCrit ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {del.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{del.cargo_name}</h3>
                    <div className="text-[11px] text-slate-500">{del.cargo_type}</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs space-y-1">
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>From:</strong> {del.origin}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span><strong>To:</strong> {del.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Scheduled ETA: {del.scheduled_eta}
                    </span>
                    {del.delay_minutes > 0 ? (
                      <span className="text-amber-700 font-bold">+{del.delay_minutes}m delay</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">On Schedule</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: ALERTS */}
        {!isLoading && activeTab === 'ALERTS' && (
          <div className="max-w-3xl mx-auto space-y-3 pb-12">
            {activeAlerts.length === 0 ? (
              <div className="py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-2 p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">All Logistics Alerts Cleared</h3>
                <p className="text-xs text-slate-500">No active supply chain disruption warnings.</p>
              </div>
            ) : (
              activeAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs flex items-start justify-between gap-3 ${
                    a.severity === 'CRITICAL'
                      ? 'border-rose-300 border-l-4 border-l-rose-600'
                      : 'border-amber-300 border-l-4 border-l-amber-500'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{a.title}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>
                    <div className="text-[10px] text-slate-400">
                      Location / Corridor: {a.district || 'Assam Regional Corridor'}
                    </div>
                  </div>

                  <button
                    onClick={() => setDismissedAlerts(prev => new Set([...prev, a.id]))}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polyline, 
  Marker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  Layers, 
  ChevronUp, 
  ChevronDown, 
  ShieldCheck, 
  PhoneCall
} from 'lucide-react';
import type { RoutePlanResponse } from '../../types/route';
import type { Incident } from '../../types/incident';
import type { Delivery, Vehicle } from '../../types/logistics';
import type { FieldOfficerGPS, FieldRoadWarning, SupportedLanguage } from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';


// Custom Map Panning Helper
function MapFlyTo({ coords, zoom }: { coords: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, zoom || map.getZoom(), { duration: 0.8 });
    }
  }, [coords, zoom, map]);
  return null;
}

// Custom Leaflet Icons
const officerIcon = L.divIcon({
  className: 'custom-officer-icon',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 22px; height: 22px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
      </div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="background: #ef4444; color: white; padding: 3px 6px; border-radius: 12px; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 2px;">
        <span>📍 Haflong</span>
      </div>
      <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #ef4444;"></div>
    </div>
  `,
  iconSize: [60, 30],
  iconAnchor: [30, 30],
});

const incidentIcon = L.divIcon({
  className: 'custom-incident-icon',
  html: `
    <div style="width: 26px; height: 26px; border-radius: 50%; background: #dc2626; border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(220, 38, 38, 0.8); display: flex; align-items: center; justify-content: center; font-size: 14px; animation: bounce 1s infinite;">
      🚨
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

interface FieldRouteViewProps {
  routeResponse: RoutePlanResponse | null;
  selectedRouteType: 'recommended' | 'alternative';
  onSelectRouteType: (type: 'recommended' | 'alternative') => void;
  incidents: Incident[];
  activeDelivery: Delivery | null;
  activeVehicle: Vehicle | null;
  gps: FieldOfficerGPS;
  onUpdateGPS: (lat: number, lon: number) => void;
  onRecalculateRoute: (priority?: string) => Promise<void>;
  isLoadingRoute: boolean;
  language: SupportedLanguage;
  onStartJourney: () => void;
  onContactControlRoom: () => void;
  activeWarning: FieldRoadWarning | null;
  onDismissWarning: () => void;
  demoModeActive: boolean;
  onTriggerDemoReroute: () => void;
}

export const FieldRouteView: React.FC<FieldRouteViewProps> = ({
  routeResponse,
  selectedRouteType,
  onSelectRouteType,
  incidents,
  activeDelivery,
  activeVehicle,
  gps,
  onUpdateGPS,
  onRecalculateRoute,
  isLoadingRoute,
  language,
  onStartJourney,
  onContactControlRoom,
  activeWarning,
  onDismissWarning,
  demoModeActive,
  onTriggerDemoReroute,
}) => {
  const t = getTranslation(language);

  // Layer Visibility Controls
  const [layers, setLayers] = useState({
    risk: true,
    incidents: true,
    closures: true,
    weather: false,
    route: true,
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Bottom Sheet State
  const [isCardExpanded, setIsCardExpanded] = useState(true);

  // GPS Simulation state
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);
  const [simStepIndex, setSimStepIndex] = useState(0);

  // Priority Selector
  const [selectedPriority, setSelectedPriority] = useState<string>(
    activeDelivery?.priority || 'CRITICAL'
  );

  const recommended = routeResponse?.recommended;
  const alternatives = routeResponse?.alternatives || [];
  const noSafeRoute = routeResponse?.no_safe_route || false;

  // Selected Route Coordinates
  const activeRouteSummary =
    selectedRouteType === 'recommended' ? recommended : alternatives[0] || recommended;
  const routeCoordinates = activeRouteSummary?.coordinates || [];

  // Destination coords (default Haflong)
  const destCoords: [number, number] = [
    activeDelivery?.destination_coords?.lat || 25.1706,
    activeDelivery?.destination_coords?.lon || 93.0175,
  ];

  const currentOfficerCoords: [number, number] = [gps.latitude, gps.longitude];

  // GPS Simulation Timer
  useEffect(() => {
    let interval: any;
    if (isSimulatingMovement && routeCoordinates.length > 0) {
      interval = setInterval(() => {
        setSimStepIndex((prev) => {
          const next = (prev + 1) % routeCoordinates.length;
          const [lat, lon] = routeCoordinates[next];
          onUpdateGPS(lat, lon);
          return next;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isSimulatingMovement, routeCoordinates, onUpdateGPS]);

  // Determine line color based on risk
  const getRouteColor = (riskLevel?: string) => {
    if (riskLevel === 'CRITICAL') return '#ef4444';
    if (riskLevel === 'HIGH') return '#f97316';
    if (riskLevel === 'MEDIUM') return '#eab308';
    return '#10b981';
  };

  const handlePriorityChange = async (p: string) => {
    setSelectedPriority(p);
    await onRecalculateRoute(p);
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] flex flex-col overflow-hidden bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
      {/* Top Map Action Bar */}
      <div className="absolute top-2 left-2 right-2 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
        {/* GPS Badge */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                gps.status === 'ACTIVE'
                  ? 'bg-emerald-500 animate-pulse'
                  : gps.status === 'DEMO_GPS'
                  ? 'bg-blue-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="font-mono text-[10px] text-slate-700 font-bold">
              {gps.status === 'DEMO_GPS' ? `DEMO GPS (${simStepIndex + 1}/${routeCoordinates.length || 1})` : gps.status === 'ACTIVE' ? `GPS ±${gps.accuracy}m` : 'GPS LOST'}
            </span>
          </div>

          {/* Quick Simulation Movement Toggle for Field Testing */}
          <button
            type="button"
            onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
              isSimulatingMovement
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isSimulatingMovement ? '⏸ PAUSE SIM' : '▶ DRIVE GPS'}
          </button>

          {/* Quick Demo Detour Trigger if Demo Mode Active */}
          {demoModeActive && (
            <button
              type="button"
              onClick={onTriggerDemoReroute}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-xs transition"
              title="Trigger instant road closure & detour"
            >
              ⚡ DETOUR
            </button>
          )}
        </div>


        {/* Layer Controls Dropdown */}
        <div className="pointer-events-auto relative">
          <button
            type="button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs flex items-center gap-1 text-xs"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold">Layers</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl p-2 shadow-lg space-y-1.5 text-xs text-slate-700">
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={layers.risk}
                  onChange={(e) => setLayers({ ...layers, risk: e.target.checked })}
                  className="rounded text-blue-600 border-slate-300"
                />
                <span>Road Risk</span>
              </label>
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={layers.incidents}
                  onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
                  className="rounded text-blue-600 border-slate-300"
                />
                <span>Incidents (🚨)</span>
              </label>
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={layers.closures}
                  onChange={(e) => setLayers({ ...layers, closures: e.target.checked })}
                  className="rounded text-blue-600 border-slate-300"
                />
                <span>Closures (🔒)</span>
              </label>
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={layers.route}
                  onChange={(e) => setLayers({ ...layers, route: e.target.checked })}
                  className="rounded text-blue-600 border-slate-300"
                />
                <span>Active Route</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Map Surface */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer
          center={currentOfficerCoords}
          zoom={10}
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#f8fafc' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapFlyTo coords={currentOfficerCoords} />

          {/* Officer Current Position Marker */}
          <Marker position={currentOfficerCoords} icon={officerIcon}>
            <Popup>
              <div className="text-xs text-slate-800">
                <strong className="text-blue-600 block mb-0.5">🔵 Current Officer GPS</strong>
                <p className="text-[10px] text-slate-600">
                  {gps.latitude.toFixed(4)} N, {gps.longitude.toFixed(4)} E
                </p>
                <p className="text-[10px] text-slate-500">
                  Speed: {gps.speed_kmh} km/h • Vehicle: {activeVehicle?.vehicle_number || 'AS-01-TR-102'}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={destCoords} icon={destinationIcon}>
            <Popup>
              <div className="text-xs text-slate-800">
                <strong className="text-red-600 block mb-0.5">📍 Mission Destination</strong>
                <p className="text-[10px] text-slate-600">Haflong Civil Hospital (Dima Hasao)</p>
                <p className="text-[10px] text-slate-500">Priority: CRITICAL Relief Supplies</p>
              </div>
            </Popup>
          </Marker>

          {/* Active Route Polylines */}
          {layers.route && routeCoordinates.length > 0 && (
            <>
              {/* Outer glow line */}
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: getRouteColor(activeRouteSummary?.risk_level),
                  weight: 8,
                  opacity: 0.25,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Core route line */}
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: getRouteColor(activeRouteSummary?.risk_level),
                  weight: 4,
                  opacity: 0.95,
                  dashArray: selectedRouteType === 'alternative' ? '6, 8' : undefined,
                }}
              />
            </>
          )}

          {/* Alternative Route Polyline if available */}
          {layers.route && alternatives.length > 0 && selectedRouteType === 'recommended' && (
            <Polyline
              positions={alternatives[0].coordinates}
              pathOptions={{
                color: '#9333ea',
                weight: 3,
                opacity: 0.6,
                dashArray: '4, 8',
              }}
            />
          )}

          {/* Incident Markers */}
          {layers.incidents &&
            incidents.map((inc) => (
              <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={incidentIcon}>
                <Popup>
                  <div className="text-xs text-slate-800">
                    <div className="flex items-center gap-1 text-red-600 font-bold mb-1">
                      <span>🚨 {inc.type}</span>
                      <span className="text-[9px] px-1 bg-red-50 border border-red-200 rounded text-red-700">
                        {inc.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">{inc.road_name}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{inc.description}</p>
                    <p className="text-[9px] text-slate-500 mt-1">Severity: {inc.severity}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* LIVE WARNING TOAST OVERLAY */}
      {activeWarning && (
        <div className="absolute top-14 left-3 right-3 z-[1100] bg-white/95 backdrop-blur-md border border-red-300 rounded-2xl p-3.5 shadow-xl text-slate-900 animate-in slide-in-from-top duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-red-600 uppercase">
                  {activeWarning.type === 'ROAD_CLOSED'
                    ? t.roadClosedAhead
                    : activeWarning.type === 'OFF_ROUTE'
                    ? t.offRoute
                    : t.highRiskAhead}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200">
                  {activeWarning.risk_level}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{activeWarning.road_name}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{activeWarning.reason}</p>
              {activeWarning.distance_km && (
                <p className="text-[10px] text-amber-700 font-bold mt-1">
                  ⚠ Distance: {activeWarning.distance_km} km ahead
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                {activeWarning.type === 'ROAD_CLOSED' || activeWarning.type === 'OFF_ROUTE' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onRecalculateRoute(selectedPriority);
                      onDismissWarning();
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-lg text-xs shadow-xs hover:brightness-110 flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t.recalculateRoute}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onDismissWarning}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs border border-slate-200"
                  >
                    Acknowledge Warning
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NO SAFE ROUTE MODAL */}
      {noSafeRoute && (
        <div className="absolute inset-x-3 bottom-24 z-[1200] bg-rose-50/95 backdrop-blur-md border-2 border-rose-400 rounded-2xl p-4 shadow-xl text-slate-900">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-black tracking-wider text-rose-700 uppercase block">
                🚨 {t.noSafeRoute}
              </span>
              <p className="text-xs text-rose-900 font-medium mt-1">
                {t.noSafeRouteMsg} All transit corridors between Guwahati and Haflong are obstructed by active landslides and flood breaches.
              </p>
              <div className="mt-2 p-2 bg-white/80 rounded-lg border border-rose-200 text-[11px] text-amber-800 font-bold">
                Recommended Action: {t.holdAtSafeLocation} (Nagaon / Lumding Relief Depot)
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={onContactControlRoom}
                  className="py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.contactControlRoom}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRecalculateRoute(selectedPriority)}
                  className="py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Detours</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE BOTTOM ROUTE INFORMATION CARD */}
      <div className="relative z-[900] bg-white border-t border-slate-200 shadow-sm text-slate-800">
        {/* Collapse Handle Bar */}
        <div 
          onClick={() => setIsCardExpanded(!isCardExpanded)}
          className="w-full py-1.5 flex items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500 border-b border-slate-200"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <span className="text-slate-700">{activeRouteSummary?.name || t.recommendedRoute}</span>
            {isCardExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Card Body */}
        {isCardExpanded && (
          <div className="p-3.5 space-y-3 max-h-[42vh] overflow-y-auto pb-6">
            {/* Primary KPI Metrics Strip */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[9px] text-slate-500 block font-bold">ETA</span>
                <span className="text-sm font-black text-slate-900">
                  {activeRouteSummary ? `${Math.floor(activeRouteSummary.eta_minutes / 60)}h ${Math.round(activeRouteSummary.eta_minutes % 60)}m` : '4h 32m'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-bold">Distance</span>
                <span className="text-sm font-black text-slate-900">
                  {activeRouteSummary?.distance_km || 302} km
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-bold">Corridor Risk</span>
                <span
                  className={`text-sm font-black ${
                    activeRouteSummary?.risk_level === 'HIGH'
                      ? 'text-red-600'
                      : activeRouteSummary?.risk_level === 'MEDIUM'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {activeRouteSummary?.risk_level || 'MEDIUM'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-bold">High-Risk Segs</span>
                <span className="text-sm font-black text-amber-600">
                  {activeRouteSummary?.high_risk_segments ?? 3}
                </span>
              </div>
            </div>

            {/* Why This Route Explanation */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Why this route?
              </span>
              <ul className="space-y-0.5 text-[11px] text-slate-700">
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Avoids closed road corridors & confirmed mudslide zones</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Lower flood exposure along southern national highway link</span>
                </li>
                <li className="flex items-center gap-1.5 text-blue-700">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span>Prioritized for {selectedPriority} life-saving cargo</span>
                </li>
              </ul>
            </div>

            {/* Route Alternatives Selection */}
            {alternatives.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Route Alternatives ({alternatives.length + 1})
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    Compare trade-offs
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Recommended Safe Route Card */}
                  <button
                    type="button"
                    onClick={() => onSelectRouteType('recommended')}
                    className={`p-2 rounded-xl border text-left transition ${
                      selectedRouteType === 'recommended'
                        ? 'bg-emerald-50 border-emerald-500 text-slate-900 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-emerald-700">SAFE ROUTE</span>
                      <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      {recommended?.distance_km || 302} km • {recommended ? Math.round(recommended.eta_minutes) : 272} min
                    </div>
                    <span className="text-[9px] text-emerald-600 font-medium block mt-0.5">
                      ✓ Lower Disruption Exposure
                    </span>
                  </button>

                  {/* Alternative Route Card */}
                  <button
                    type="button"
                    onClick={() => onSelectRouteType('alternative')}
                    className={`p-2 rounded-xl border text-left transition ${
                      selectedRouteType === 'alternative'
                        ? 'bg-purple-50 border-purple-500 text-slate-900 ring-1 ring-purple-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-purple-700">ALTERNATIVE</span>
                      <span className="text-[9px] px-1 rounded bg-amber-100 border border-amber-200 text-amber-800 font-semibold">
                        HIGH RISK
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      {alternatives[0]?.distance_km || 294} km • {Math.round(alternatives[0]?.eta_minutes || 252)} min
                    </div>
                    <span className="text-[9px] text-amber-700 font-medium block mt-0.5">
                      ⚠ Shorter but higher slope risk
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Cargo Priority Selector */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Cargo Priority Weighting
                </span>
                <span className="text-[9px] text-slate-500">
                  Engine adapts route risk avoidance
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                {['CRITICAL', 'HIGH', 'NORMAL', 'LOW'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePriorityChange(p)}
                    className={`py-1.5 rounded border transition ${
                      selectedPriority === p
                        ? p === 'CRITICAL'
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onStartJourney}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 text-xs transition active:scale-[0.98]"
              >
                <Play className="w-4 h-4" />
                <span>{t.startJourney}</span>
              </button>

              <button
                type="button"
                onClick={() => onRecalculateRoute(selectedPriority)}
                disabled={isLoadingRoute}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 text-xs transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingRoute ? 'animate-spin' : ''}`} />
                <span>{isLoadingRoute ? 'Calculating...' : t.recalculateRoute}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

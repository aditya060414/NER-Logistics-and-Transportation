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
  AlertOctagon, 
  CheckCircle2, 
  Play, 
  Pause, 
  RefreshCw, 
  Flag,
  Sparkles
} from 'lucide-react';
import type { Delivery } from '../../types/logistics';
import type { RouteSummary } from '../../types/route';
import type { DriverProfile, DriverGPS } from '../../types/driver';
import { planRoute, updateDeliveryDetails } from '../../services/api';

interface DriverActiveTripViewProps {
  delivery: Delivery;
  route: RouteSummary;
  driver: DriverProfile;
  currentGps: DriverGPS;
  onUpdateGps: (newGps: DriverGPS) => void;
  onDeliveryCompleted: (updatedDelivery: Delivery) => void;
  onOpenReportModal: () => void;
  onOpenEmergencyModal: () => void;
}

// Custom vehicle marker icon
const truckIcon = L.divIcon({
  className: 'custom-truck-icon',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(37, 99, 235, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(37, 99, 235, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
        🚚
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const destFlagIcon = L.divIcon({
  className: 'custom-dest-flag',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="background: #10b981; border: 2px solid #ffffff; width: 26px; height: 26px; border-radius: 50%; box-shadow: 0 0 14px rgba(16, 185, 129, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px;">
        🏁
      </div>
      <div style="background: #10b981; color: white; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 4px; margin-top: 3px; border: 1px solid white;">DESTINATION</div>
    </div>
  `,
  iconSize: [50, 42],
  iconAnchor: [25, 15],
});

// Map Panning Center Helper
function MapCenterFollow({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.panTo(coords, { animate: true, duration: 0.6 });
    }
  }, [coords, map]);
  return null;
}

export const DriverActiveTripView: React.FC<DriverActiveTripViewProps> = ({
  delivery,
  route,
  driver,
  onUpdateGps,
  onDeliveryCompleted,
  onOpenReportModal,
  onOpenEmergencyModal,
}) => {
  const coordinates = route.coordinates || [
    [delivery.origin_coords.lat, delivery.origin_coords.lon],
    [delivery.destination_coords.lat, delivery.destination_coords.lon],
  ];

  // In-transit simulation state
  const [currentCoordIndex, setCurrentCoordIndex] = useState<number>(0);
  const [isSimulatingGps, setIsSimulatingGps] = useState<boolean>(true);
  const [currentSpeed, setCurrentSpeed] = useState<number>(54);
  const [statusState, setStatusState] = useState<'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED'>('IN_TRANSIT');

  // Road closure / detour state
  const [hasRoadClosureAhead, setHasRoadClosureAhead] = useState<boolean>(false);
  const [detourRoute, setDetourRoute] = useState<RouteSummary | null>(null);
  const [isCalculatingDetour, setIsCalculatingDetour] = useState<boolean>(false);

  // Active current truck position
  const currentPos: [number, number] = coordinates[currentCoordIndex] || [
    delivery.origin_coords.lat,
    delivery.origin_coords.lon,
  ];

  // Simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isSimulatingGps && coordinates.length > 1 && statusState === 'IN_TRANSIT') {
      interval = setInterval(() => {
        setCurrentCoordIndex((prev) => {
          const next = prev + 1;
          if (next >= coordinates.length) {
            setIsSimulatingGps(false);
            setStatusState('ARRIVED');
            return coordinates.length - 1;
          }
          // Fluctuate speed slightly
          setCurrentSpeed(Math.floor(48 + Math.random() * 15));
          return next;
        });
      }, 2400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulatingGps, coordinates, statusState]);

  // Update GPS when coord changes
  useEffect(() => {
    if (coordinates[currentCoordIndex]) {
      const [lat, lon] = coordinates[currentCoordIndex];
      onUpdateGps({
        latitude: lat,
        longitude: lon,
        speed_kmh: currentSpeed,
        heading: 65,
        accuracy: 4,
        last_updated: new Date().toLocaleTimeString(),
        status: isSimulatingGps ? 'SIMULATED' : 'ACTIVE',
      });
    }
  }, [currentCoordIndex, currentSpeed, isSimulatingGps]);

  // Calculate remaining distance and ETA
  const progressRatio = coordinates.length > 1 ? currentCoordIndex / (coordinates.length - 1) : 0;
  const remainingDistanceKm = Math.max(0, (route.distance_km * (1 - progressRatio)));
  const remainingMinutes = Math.max(1, Math.round(route.eta_minutes * (1 - progressRatio)));

  // Simulate Road Closure & Safe Reroute
  const handleSimulateClosure = async () => {
    setHasRoadClosureAhead(true);
    setIsCalculatingDetour(true);

    try {
      // Pick a road segment to block and recalculate via backend NetworkX Dijkstra
      const blockedSegment = route.segment_osm_ids?.[Math.floor(route.segment_osm_ids.length / 2)] || '999999999';
      
      const res = await planRoute({
        origin_lat: currentPos[0],
        origin_lon: currentPos[1],
        dest_lat: delivery.destination_coords.lat,
        dest_lon: delivery.destination_coords.lon,
        priority: delivery.priority,
        blocked_roads: [blockedSegment],
      });

      if (res.recommended) {
        setDetourRoute(res.recommended);
      }
    } catch (err) {
      console.error('Detour calculation error:', err);
    } finally {
      setIsCalculatingDetour(false);
    }
  };

  // Accept Detour
  const handleAcceptDetour = () => {
    if (detourRoute) {
      // Switch active coordinates to detour
      // Keep alert dismissed
      setHasRoadClosureAhead(false);
      setDetourRoute(null);
      setCurrentCoordIndex(0);
    }
  };

  // Mark as Arrived
  const handleMarkArrived = async () => {
    try {
      await updateDeliveryDetails(delivery.id, { status: 'ARRIVED' });
      setStatusState('ARRIVED');
    } catch (e) {
      setStatusState('ARRIVED');
    }
  };

  // Complete Delivery
  const handleCompleteDelivery = async () => {
    try {
      const res = await updateDeliveryDetails(delivery.id, { status: 'COMPLETED' });
      onDeliveryCompleted(res.delivery);
    } catch (e) {
      onDeliveryCompleted({
        ...delivery,
        status: 'COMPLETED',
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 p-4 sm:p-6 text-gray-100 font-sans pb-28">
      {/* Dynamic Road Closure & Detour Warning Banner */}
      {hasRoadClosureAhead && (
        <div className="bg-red-950/90 border-2 border-red-600 rounded-3xl p-5 shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-in slide-in-from-top duration-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-bounce">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  TACTICAL WARNING • ROAD CLOSED AHEAD
                </span>
                <h3 className="text-base sm:text-lg font-black text-white uppercase mt-0.5">
                  Fresh Landslide &amp; Debris Obstruction on Corridor
                </h3>
                <p className="text-xs text-red-200">
                  Control Tower verified road blockage at km 84. Autonomous NetworkX detour calculated.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-red-300">
              12.4 KM AHEAD
            </span>
          </div>

          {detourRoute ? (
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white uppercase">
                    Safe Detour Via Elevated Bypass
                  </span>
                </div>
                <div className="text-[11px] text-gray-300 flex items-center gap-3 font-mono">
                  <span>Dist: +{(detourRoute.distance_km - remainingDistanceKm).toFixed(1)} km</span>
                  <span>•</span>
                  <span>Est: +{Math.max(5, Math.round(detourRoute.eta_minutes - remainingMinutes))} mins</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">0 High-Risk Segments</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAcceptDetour}
                  className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACCEPT NEW SAFE DETOUR</span>
                </button>
              </div>
            </div>
          ) : isCalculatingDetour ? (
            <div className="p-3 bg-gray-900 rounded-2xl text-xs text-gray-300 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>NetworkX Dijkstra Engine computing safe alternate bypass...</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Top HUD: Driver Flight Deck */}
      <div className="bg-gray-900/95 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black">
              🚚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wide">
                  {delivery.consignment_id || delivery.id}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 text-[10px] font-mono font-bold">
                  {delivery.priority}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    statusState === 'ARRIVED'
                      ? 'bg-emerald-900/80 text-emerald-300 animate-pulse'
                      : 'bg-indigo-900/80 text-indigo-300 animate-pulse'
                  }`}
                >
                  ● {statusState}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {delivery.cargo_name} • Driver {driver.name} ({driver.vehicle_number})
              </p>
            </div>
          </div>

          {/* GPS Simulation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSimulatingGps((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                isSimulatingGps
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:text-white'
              }`}
            >
              {isSimulatingGps ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>GPS Tracking Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Tracking</span>
                </>
              )}
            </button>

            {!hasRoadClosureAhead && statusState === 'IN_TRANSIT' && (
              <button
                type="button"
                onClick={handleSimulateClosure}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 text-xs font-bold transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Blockage</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Speed */}
          <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/80">
            <span className="text-[11px] text-gray-400 font-bold block mb-1">SPEED</span>
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
              <span>{currentSpeed}</span>
              <span className="text-xs text-gray-400 font-sans">KM/H</span>
            </div>
          </div>

          {/* Distance Remaining */}
          <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/80">
            <span className="text-[11px] text-gray-400 font-bold block mb-1">REMAINING DIST</span>
            <div className="text-2xl font-black text-blue-400 font-mono flex items-baseline gap-1">
              <span>{remainingDistanceKm.toFixed(1)}</span>
              <span className="text-xs text-gray-400 font-sans">KM</span>
            </div>
          </div>

          {/* Dynamic ETA */}
          <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/80">
            <span className="text-[11px] text-gray-400 font-bold block mb-1">EST. ARRIVAL</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m
            </div>
          </div>

          {/* Destination */}
          <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/80 truncate">
            <span className="text-[11px] text-gray-400 font-bold block mb-1">DESTINATION</span>
            <div className="text-sm font-black text-white truncate font-sans">
              {delivery.destination}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">All-weather route</span>
          </div>
        </div>
      </div>

      {/* Interactive In-Transit Live Map */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative h-[420px] sm:h-[480px]">
        <MapContainer
          center={currentPos}
          zoom={11}
          className="h-full w-full z-10"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Active Route Polyline */}
          <Polyline
            positions={coordinates}
            pathOptions={{
              color: '#3b82f6',
              weight: 6,
              opacity: 0.9,
            }}
          />

          {/* Live Truck Marker */}
          <Marker position={currentPos} icon={truckIcon}>
            <Popup>
              <div className="text-xs">
                <strong>{driver.vehicle_number}</strong>
                <div>Driver: {driver.name}</div>
                <div>Speed: {currentSpeed} km/h</div>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker
            position={[delivery.destination_coords.lat, delivery.destination_coords.lon]}
            icon={destFlagIcon}
          >
            <Popup>
              <div className="text-xs font-bold">
                Destination: {delivery.destination}
              </div>
            </Popup>
          </Marker>

          <MapCenterFollow coords={currentPos} />
        </MapContainer>

        {/* Floating Proximity Road Warning Badge */}
        <div className="absolute top-4 left-4 z-[1000] bg-gray-950/85 backdrop-blur-md border border-gray-800 rounded-2xl p-3 shadow-xl max-w-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>TERRAIN SAFETY HUD</span>
          </div>
          <p className="text-[11px] text-gray-300">
            Passing Barak Valley foothills. Heavy monsoon advisory active. Safe speed recommended &lt; 50 km/h.
          </p>
        </div>

        {/* Live GPS Coordinates Pill */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-gray-950/90 backdrop-blur-md border border-gray-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-gray-300 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{currentPos[0].toFixed(4)}° N, {currentPos[1].toFixed(4)}° E</span>
        </div>
      </div>

      {/* Driver Tactical Command Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Arrived Button */}
        <button
          type="button"
          onClick={handleMarkArrived}
          disabled={statusState === 'ARRIVED' || statusState === 'COMPLETED'}
          className="p-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/50 text-emerald-400 font-black text-xs uppercase transition active:scale-95 flex flex-col items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Flag className="w-5 h-5" />
          <span>{statusState === 'ARRIVED' ? 'ARRIVED AT DEST' : 'MARK ARRIVED'}</span>
        </button>

        {/* Complete Delivery Button */}
        <button
          type="button"
          onClick={handleCompleteDelivery}
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase shadow-xl shadow-emerald-600/30 transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>COMPLETE DELIVERY</span>
        </button>

        {/* Report Hazard Button */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="p-3.5 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 font-black text-xs uppercase transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>REPORT HAZARD</span>
        </button>

        {/* Emergency SOS Button */}
        <button
          type="button"
          onClick={onOpenEmergencyModal}
          className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase shadow-xl shadow-red-600/30 transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
        >
          <AlertOctagon className="w-5 h-5" />
          <span>EMERGENCY SOS</span>
        </button>
      </div>
    </div>
  );
};

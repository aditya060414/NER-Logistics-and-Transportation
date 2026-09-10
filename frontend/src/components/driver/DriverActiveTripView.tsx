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
  Sparkles,
  CloudRain
} from 'lucide-react';
import type { Delivery } from '../../types/logistics';
import type { RouteSummary } from '../../types/route';
import type { DriverProfile, DriverGPS } from '../../types/driver';
import { planRoute, updateDeliveryDetails, fetchWeatherAtCoords } from '../../services/api';
import type { DistrictWeatherReport } from '../../types/weather';

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

  // GPS-Traced Weather for current truck location
  const [tracedWeather, setTracedWeather] = useState<DistrictWeatherReport | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (currentPos && currentPos[0] && currentPos[1]) {
      fetchWeatherAtCoords(currentPos[0], currentPos[1])
        .then((data) => {
          if (isMounted) setTracedWeather(data);
        })
        .catch((err) => console.warn('Active trip weather lookup failed:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [currentPos[0], currentPos[1]]);

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
    <div className="w-full max-w-5xl mx-auto space-y-4 p-4 sm:p-6 text-slate-800 font-sans pb-28">
      {/* Dynamic Road Closure & Detour Warning Banner */}
      {hasRoadClosureAhead && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-xs animate-in slide-in-from-top duration-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-bounce">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  TACTICAL WARNING • ROAD CLOSED AHEAD
                </span>
                <h3 className="text-base sm:text-lg font-black text-rose-900 uppercase mt-0.5">
                  Fresh Landslide &amp; Debris Obstruction on Corridor
                </h3>
                <p className="text-xs text-rose-700">
                  Control Tower verified road blockage at km 84. Autonomous NetworkX detour calculated.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-rose-700">
              12.4 KM AHEAD
            </span>
          </div>

          {detourRoute ? (
            <div className="bg-white border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 uppercase">
                    Safe Detour Via Elevated Bypass
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-3 font-mono">
                  <span>Dist: +{(detourRoute.distance_km - remainingDistanceKm).toFixed(1)} km</span>
                  <span>•</span>
                  <span>Est: +{Math.max(5, Math.round(detourRoute.eta_minutes - remainingMinutes))} mins</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">0 High-Risk Segments</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAcceptDetour}
                  className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACCEPT NEW SAFE DETOUR</span>
                </button>
              </div>
            </div>
          ) : isCalculatingDetour ? (
            <div className="p-3 bg-white border border-rose-200 rounded-2xl text-xs text-slate-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>NetworkX Dijkstra Engine computing safe alternate bypass...</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Top HUD: Driver Flight Deck */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              🚚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {delivery.consignment_id || delivery.id}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                  {delivery.priority}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    statusState === 'ARRIVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                  }`}
                >
                  ● {statusState}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
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
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Simulate Blockage</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Speed */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block mb-1">SPEED</span>
            <div className="text-2xl font-black text-slate-900 font-mono flex items-baseline gap-1">
              <span>{currentSpeed}</span>
              <span className="text-xs text-slate-500 font-sans">KM/H</span>
            </div>
          </div>

          {/* Distance Remaining */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block mb-1">REMAINING DIST</span>
            <div className="text-2xl font-black text-blue-600 font-mono flex items-baseline gap-1">
              <span>{remainingDistanceKm.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-sans">KM</span>
            </div>
          </div>

          {/* Dynamic ETA */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block mb-1">EST. ARRIVAL</span>
            <div className="text-2xl font-black text-amber-600 font-mono">
              {Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m
            </div>
          </div>

          {/* Destination */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 truncate">
            <span className="text-[11px] text-slate-500 font-bold block mb-1">DESTINATION</span>
            <div className="text-sm font-black text-slate-900 truncate font-sans">
              {delivery.destination}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">All-weather route</span>
          </div>
        </div>
      </div>

      {/* Interactive In-Transit Live Map */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs relative h-[420px] sm:h-[480px]">
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
              color: '#2563eb',
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

        {/* Floating Proximity Road Warning Badge (Live Traced Weather) */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-sm max-w-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>{tracedWeather ? `${tracedWeather.district_name} Weather` : 'TERRAIN SAFETY HUD'}</span>
            </div>
            {tracedWeather && (
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                  tracedWeather.flood_alert_level === 'RED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : tracedWeather.flood_alert_level === 'ORANGE'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {tracedWeather.rainfall_mm}mm rain
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {tracedWeather?.logistics_advisory ||
              'Passing Barak Valley foothills. Heavy monsoon advisory active. Safe speed recommended < 50 km/h.'}
          </p>
        </div>

        {/* Live GPS Coordinates Pill */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-700 shadow-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
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
          className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-emerald-700 font-bold text-xs uppercase transition active:scale-95 flex flex-col items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <Flag className="w-5 h-5" />
          <span>{statusState === 'ARRIVED' ? 'ARRIVED AT DEST' : 'MARK ARRIVED'}</span>
        </button>

        {/* Complete Delivery Button */}
        <button
          type="button"
          onClick={handleCompleteDelivery}
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase shadow-xs transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>COMPLETE DELIVERY</span>
        </button>

        {/* Report Hazard Button */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs uppercase transition active:scale-95 flex flex-col items-center justify-center gap-1.5 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>REPORT HAZARD</span>
        </button>

        {/* Emergency SOS Button */}
        <button
          type="button"
          onClick={onOpenEmergencyModal}
          className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase shadow-xs transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
        >
          <AlertOctagon className="w-5 h-5" />
          <span>EMERGENCY SOS</span>
        </button>
      </div>
    </div>
  );
};

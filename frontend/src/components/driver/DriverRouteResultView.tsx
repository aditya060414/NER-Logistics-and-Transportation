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
  Navigation, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Edit3
} from 'lucide-react';
import type { Delivery } from '../../types/logistics';
import type { RoutePlanResponse, RouteSummary } from '../../types/route';
import type { DriverProfile } from '../../types/driver';

interface DriverRouteResultViewProps {
  delivery: Delivery;
  routePlan: RoutePlanResponse;
  driver: DriverProfile;
  onStartJourney: (selectedRoute: RouteSummary) => void;
  onEditConsignment: () => void;
}

// Map Auto-Fit Helper
function MapFitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((c) => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [coords, map]);
  return null;
}

// Markers
const originPinIcon = L.divIcon({
  className: 'custom-origin-icon',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="background: #10b981; border: 2px solid #ffffff; width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8); display: flex; align-items: center; justify-content: center;">
        <div style="background: #ffffff; width: 6px; height: 6px; border-radius: 50%;"></div>
      </div>
      <div style="background: rgba(16, 185, 129, 0.9); color: #ffffff; font-size: 9px; font-weight: 900; padding: 1px 6px; border-radius: 4px; margin-top: 3px; border: 1px solid #ffffff;">PICKUP</div>
    </div>
  `,
  iconSize: [40, 36],
  iconAnchor: [20, 10],
});

const destPinIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="background: #ef4444; border: 2px solid #ffffff; width: 22px; height: 22px; border-radius: 50%; box-shadow: 0 0 12px rgba(239, 68, 68, 0.9); display: flex; align-items: center; justify-content: center;">
        <div style="background: #ffffff; width: 8px; height: 8px; border-radius: 50%;"></div>
      </div>
      <div style="background: rgba(239, 68, 68, 0.95); color: #ffffff; font-size: 9px; font-weight: 900; padding: 1px 6px; border-radius: 4px; margin-top: 3px; border: 1px solid #ffffff;">DEST</div>
    </div>
  `,
  iconSize: [40, 38],
  iconAnchor: [20, 11],
});

export const DriverRouteResultView: React.FC<DriverRouteResultViewProps> = ({
  delivery,
  routePlan,
  driver,
  onStartJourney,
  onEditConsignment,
}) => {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  // Collect routes: recommended + alternatives
  const allRoutes: { route: RouteSummary; label: string; isRecommended: boolean }[] = [];
  if (routePlan.recommended) {
    allRoutes.push({
      route: routePlan.recommended,
      label: 'Recommended Safe Corridor',
      isRecommended: true,
    });
  }
  if (routePlan.alternatives && routePlan.alternatives.length > 0) {
    routePlan.alternatives.forEach((alt, idx) => {
      allRoutes.push({
        route: alt,
        label: `Alternative Route ${idx + 1}`,
        isRecommended: false,
      });
    });
  }

  const activeOption = allRoutes[selectedRouteIndex] || allRoutes[0];
  const activeRoute = activeOption?.route;

  const routeCoordinates = activeRoute?.coordinates || [
    [delivery.origin_coords.lat, delivery.origin_coords.lon],
    [delivery.destination_coords.lat, delivery.destination_coords.lon],
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 p-4 sm:p-6 text-gray-100 font-sans pb-28">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              STEP 2 OF 3 • SAFE CORRIDOR COMPUTED
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-900/50 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold">
              {delivery.consignment_id || delivery.id}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Safe Logistics Route
          </h2>
          <p className="text-xs text-gray-400">
            {delivery.cargo_name} • <span className="text-gray-200 font-bold">{delivery.cargo_type}</span> ({delivery.priority}) • Driver {driver.name} ({driver.vehicle_number})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditConsignment}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-bold transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Edit Consignment</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map & Route Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Map (7 cols) */}
        <div className="lg:col-span-7 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative h-[380px] sm:h-[440px]">
          <MapContainer
            center={[delivery.origin_coords.lat, delivery.origin_coords.lon]}
            zoom={8}
            className="h-full w-full z-10"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Polyline for Active Route */}
            {activeRoute && activeRoute.coordinates && (
              <Polyline
                positions={activeRoute.coordinates}
                pathOptions={{
                  color: activeOption.isRecommended ? '#2563eb' : '#f59e0b',
                  weight: 6,
                  opacity: 0.95,
                  lineJoin: 'round',
                }}
              />
            )}

            {/* Other routes shown as subtle dashed lines */}
            {allRoutes.map((item, idx) => {
              if (idx === selectedRouteIndex) return null;
              return (
                <Polyline
                  key={idx}
                  positions={item.route.coordinates}
                  pathOptions={{
                    color: '#6b7280',
                    weight: 3,
                    dashArray: '6, 8',
                    opacity: 0.6,
                  }}
                />
              );
            })}

            {/* Pickup Marker */}
            <Marker
              position={[delivery.origin_coords.lat, delivery.origin_coords.lon]}
              icon={originPinIcon}
            >
              <Popup>
                <div className="text-xs">
                  <strong>Pickup Origin:</strong> {delivery.origin}
                </div>
              </Popup>
            </Marker>

            {/* Destination Marker */}
            <Marker
              position={[delivery.destination_coords.lat, delivery.destination_coords.lon]}
              icon={destPinIcon}
            >
              <Popup>
                <div className="text-xs">
                  <strong>Delivery Destination:</strong> {delivery.destination}
                </div>
              </Popup>
            </Marker>

            <MapFitBounds coords={routeCoordinates} />
          </MapContainer>

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-[1000] bg-gray-950/85 backdrop-blur-md border border-gray-800 rounded-2xl px-3.5 py-2 text-xs flex items-center gap-2 shadow-xl">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white text-[11px] uppercase">
              {activeOption.label}
            </span>
          </div>
        </div>

        {/* Right Column: Route Stats, AI Explanation, and Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Route Selector Tabs if alternatives exist */}
          {allRoutes.length > 1 && (
            <div className="flex items-center gap-2 p-1.5 bg-gray-900 border border-gray-800 rounded-2xl">
              {allRoutes.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedRouteIndex(idx)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedRouteIndex === idx
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.isRecommended && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>{item.isRecommended ? 'Safest' : `Alt ${idx}`}</span>
                </button>
              ))}
            </div>
          )}

          {/* Metrics Card */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-300 uppercase tracking-wider">
                Telemetry Estimates
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                  activeRoute?.risk_level === 'LOW'
                    ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                    : activeRoute?.risk_level === 'MEDIUM'
                    ? 'bg-amber-950 border border-amber-500/50 text-amber-300'
                    : 'bg-red-950 border border-red-500/50 text-red-300'
                }`}
              >
                {activeRoute?.risk_level || 'LOW'} ROAD RISK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/80">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  <span>Total Distance</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {activeRoute?.distance_km?.toFixed(1) || '0.0'} <span className="text-xs text-gray-400">KM</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/80">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Est. Drive Time</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {Math.floor((activeRoute?.eta_minutes || 0) / 60)}h{' '}
                  {Math.round((activeRoute?.eta_minutes || 0) % 60)}m
                </div>
              </div>
            </div>

            {/* Waypoints Strip */}
            <div className="space-y-2 pt-2 border-t border-gray-800/80 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-gray-400">Pickup:</span>
                <strong className="text-white truncate">{delivery.origin}</strong>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-gray-400">Drop:</span>
                <strong className="text-white truncate">{delivery.destination}</strong>
              </div>
            </div>
          </div>

          {/* "WHY THIS ROUTE?" Explainable Decision Box */}
          <div className="bg-gradient-to-br from-blue-950/70 via-gray-900 to-indigo-950/50 border border-blue-600/40 rounded-3xl p-4 shadow-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-blue-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Safe Route Rationale</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {activeRoute?.explanation ||
                `Calculated via NetworkX multi-hazard graph engine. Prioritizes all-weather elevated roadways and bypasses active monsoon landslide sectors for ${delivery.priority} cargo.`}
            </p>
            {activeRoute?.avoided_high_risk_roads ? (
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bypasses {activeRoute.avoided_high_risk_roads} hazardous road segments</span>
              </div>
            ) : null}
          </div>

          {/* Primary Action Button: Start Journey */}
          <div>
            <button
              type="button"
              onClick={() => activeRoute && onStartJourney(activeRoute)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-3"
            >
              <Navigation className="w-5 h-5 fill-current" />
              <span>START JOURNEY (DISPATCH NOW)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="w-full max-w-5xl mx-auto space-y-4 p-4 sm:p-6 text-slate-800 font-sans pb-28">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold tracking-wider uppercase">
              STEP 2 OF 3 • SAFE CORRIDOR COMPUTED
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold">
              {delivery.consignment_id || delivery.id}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Safe Logistics Route
          </h2>
          <p className="text-xs text-slate-500">
            {delivery.cargo_name} • <span className="text-slate-800 font-bold">{delivery.cargo_type}</span> ({delivery.priority}) • Driver {driver.name} ({driver.vehicle_number})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditConsignment}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Edit Consignment</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map & Route Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Map (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs relative h-[380px] sm:h-[440px]">
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
                    color: '#94a3b8',
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
          <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl px-3.5 py-2 text-xs flex items-center gap-2 shadow-sm">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800 text-[11px] uppercase">
              {activeOption.label}
            </span>
          </div>
        </div>

        {/* Right Column: Route Stats, AI Explanation, and Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Route Selector Tabs if alternatives exist */}
          {allRoutes.length > 1 && (
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl">
              {allRoutes.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedRouteIndex(idx)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedRouteIndex === idx
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {item.isRecommended && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{item.isRecommended ? 'Safest' : `Alt ${idx}`}</span>
                </button>
              ))}
            </div>
          )}

          {/* Metrics Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Telemetry Estimates
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                  activeRoute?.risk_level === 'LOW'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : activeRoute?.risk_level === 'MEDIUM'
                    ? 'bg-amber-50 border border-amber-200 text-amber-700'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}
              >
                {activeRoute?.risk_level || 'LOW'} ROAD RISK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total Distance</span>
                </div>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {activeRoute?.distance_km?.toFixed(1) || '0.0'} <span className="text-xs text-slate-500 font-sans">KM</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Est. Drive Time</span>
                </div>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {Math.floor((activeRoute?.eta_minutes || 0) / 60)}h{' '}
                  {Math.round((activeRoute?.eta_minutes || 0) % 60)}m
                </div>
              </div>
            </div>

            {/* Waypoints Strip */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-500">Pickup:</span>
                <strong className="text-slate-800 truncate">{delivery.origin}</strong>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="text-slate-500">Drop:</span>
                <strong className="text-slate-800 truncate">{delivery.destination}</strong>
              </div>
            </div>
          </div>

          {/* "WHY THIS ROUTE?" Explainable Decision Box */}
          <div className="bg-blue-50/50 border border-blue-200/70 rounded-3xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Safe Route Rationale</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeRoute?.explanation ||
                `Calculated via NetworkX multi-hazard graph engine. Prioritizes all-weather elevated roadways and bypasses active monsoon landslide sectors for ${delivery.priority} cargo.`}
            </p>
            {activeRoute?.avoided_high_risk_roads ? (
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bypasses {activeRoute.avoided_high_risk_roads} hazardous road segments</span>
              </div>
            ) : null}
          </div>

          {/* Primary Action Button: Start Journey */}
          <div>
            <button
              type="button"
              onClick={() => activeRoute && onStartJourney(activeRoute)}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider shadow-sm transition active:scale-98 flex items-center justify-center gap-3"
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

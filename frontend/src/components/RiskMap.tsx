import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RiskGeoJSON, RoadRiskProperties } from '../types/risk';
import type { RoutePlanResponse, RouteSummary } from '../types/route';
import type { Incident } from '../types/incident';
import type { Vehicle } from '../types/logistics';

interface RiskMapProps {
  geojsonData: RiskGeoJSON | null;
  selectedRoad: RoadRiskProperties | null;
  onSelectRoad: (road: RoadRiskProperties) => void;
  emergencyMode: boolean;
  activeRouteResponse?: RoutePlanResponse | null;
  selectedRouteType?: 'recommended' | 'alternative' | null;
  incidents?: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  vehicles?: Vehicle[];
  onSelectVehicle?: (vehicle: Vehicle) => void;
}

const COLOR_CLOSED = '#4B5563'; // Dark Gray
const COLOR_HIGH = '#EF4444';   // Vibrant Red
const COLOR_MEDIUM = '#F59E0B'; // Amber Yellow
const COLOR_LOW = '#10B981';    // Emerald Green

// Custom divIcons for logistics depots and destinations
const originIcon = L.divIcon({
  className: 'custom-origin-icon',
  html: `<div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #10B981; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 15px rgba(16, 185, 129, 0.9); font-size: 14px; cursor: pointer;">🟢</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `<div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #3B82F6; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 15px rgba(59, 130, 246, 0.9); font-size: 14px; cursor: pointer;">🏁</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Incident Warning Icons
const unverifiedIncidentIcon = L.divIcon({
  className: 'custom-unverified-incident-icon',
  html: `<div style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: #D97706; border: 2px solid #FEF3C7; border-radius: 50%; box-shadow: 0 0 14px rgba(245, 158, 11, 0.9); font-size: 12px; cursor: pointer;">⚠️</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const verifiedIncidentIcon = L.divIcon({
  className: 'custom-verified-incident-icon',
  html: `<div style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: #DC2626; border: 2px solid #FEE2E2; border-radius: 50%; box-shadow: 0 0 14px rgba(220, 38, 38, 0.9); font-size: 12px; cursor: pointer;">🛑</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// Vehicle Tracking DivIcon
const getVehicleIcon = (status: string) => {
  const color = status === 'AT_RISK' ? '#ef4444' : status === 'REROUTED' ? '#10b981' : '#3b82f6';
  const shadow = status === 'AT_RISK' ? 'rgba(239, 68, 68, 0.9)' : status === 'REROUTED' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(59, 130, 246, 0.9)';
  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `<div style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: #0f172a; border: 2px solid ${color}; border-radius: 50%; box-shadow: 0 0 16px ${shadow}; font-size: 15px; cursor: pointer;">🚚</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Component that automatically animates map viewport to frame the calculated route
function MapBoundsUpdater({ route }: { route: RouteSummary | null }) {
  const map = useMap();

  useEffect(() => {
    if (!route || !route.coordinates || route.coordinates.length === 0) return;

    try {
      const bounds = L.latLngBounds(route.coordinates as [number, number][]);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 12,
          animate: true,
          duration: 1.0,
        });
      }
    } catch (e) {
      console.warn('Could not fit route bounds:', e);
    }
  }, [map, route]);

  return null;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  geojsonData,
  selectedRoad,
  onSelectRoad,
  emergencyMode,
  activeRouteResponse,
  selectedRouteType = 'recommended',
  incidents = [],
  onSelectIncident,
  vehicles = [],
  onSelectVehicle,
}) => {
  const assamCenter: [number, number] = [26.2006, 92.9376];

  const roadStyle = (feature: any) => {
    if (!feature?.properties) {
      return { color: COLOR_LOW, weight: 1.5, opacity: 0.5 };
    }

    const { risk_level, road_status, osm_id } = feature.properties;
    const isSelected = selectedRoad && String(selectedRoad.osm_id) === String(osm_id);

    if (road_status === 'CLOSED') {
      return {
        color: COLOR_CLOSED,
        weight: isSelected ? 5.5 : 4.0,
        dashArray: '6, 6',
        opacity: 0.95,
      };
    }

    if (risk_level === 'HIGH') {
      return {
        color: COLOR_HIGH,
        weight: isSelected ? 5.0 : emergencyMode ? 4.0 : 3.2,
        opacity: 0.9,
      };
    }

    if (risk_level === 'MEDIUM') {
      return {
        color: COLOR_MEDIUM,
        weight: isSelected ? 4.5 : emergencyMode ? 1.5 : 2.0,
        opacity: emergencyMode ? 0.35 : 0.75,
      };
    }

    return {
      color: COLOR_LOW,
      weight: isSelected ? 3.5 : emergencyMode ? 0.8 : 1.2,
      opacity: emergencyMode ? 0.15 : 0.5,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (!feature.properties) return;
    const p = feature.properties;

    layer.on({
      click: () => {
        onSelectRoad(p);
      },
      mouseover: (e: any) => {
        const targetLayer = e.target;
        if (targetLayer.setStyle) {
          targetLayer.setStyle({
            weight: 5,
            opacity: 1,
          });
        }
      },
      mouseout: (e: any) => {
        const targetLayer = e.target;
        if (targetLayer.setStyle) {
          targetLayer.setStyle(roadStyle(feature));
        }
      },
    });

    const statusBadge = p.road_status === 'CLOSED'
      ? '<span style="color: #9ca3af; font-weight: bold;">[CLOSED]</span>'
      : `<span style="color: ${p.risk_level === 'HIGH' ? '#ef4444' : p.risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981'}; font-weight: bold;">[${p.risk_level} RISK]</span>`;

    layer.bindTooltip(
      `<div style="font-size: 11px; padding: 2px 4px;">
        <strong>${p.name || 'Unnamed Road'}</strong><br/>
        District: ${p.district || 'Assam'}<br/>
        Score: <strong>${p.risk_score ? p.risk_score.toFixed(3) : '0.00'}</strong> ${statusBadge}
       </div>`,
      { sticky: true, className: 'bg-gray-900 border border-gray-700 text-gray-200' }
    );
  };

  const recommendedRoute = activeRouteResponse?.recommended || null;
  const alternativeRoutes = activeRouteResponse?.alternatives || [];

  const originCoord: [number, number] | null = activeRouteResponse?.origin
    ? [activeRouteResponse.origin.lat, activeRouteResponse.origin.lon]
    : null;

  const destCoord: [number, number] | null = activeRouteResponse?.destination
    ? [activeRouteResponse.destination.lat, activeRouteResponse.destination.lon]
    : null;

  const routeToFocus = selectedRouteType === 'alternative' && alternativeRoutes.length > 0
    ? alternativeRoutes[0]
    : recommendedRoute;

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-950 overflow-hidden">
      <MapContainer
        center={assamCenter}
        zoom={7}
        minZoom={6}
        maxZoom={15}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Underlying Network Road Features */}
        {geojsonData && (
          <GeoJSON
            key={`roads-geojson-${geojsonData.features.length}-${emergencyMode ? 'em' : 'norm'}-${selectedRoad?.osm_id || ''}`}
            data={geojsonData as any}
            style={roadStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Map Bounds Auto-Center on Calculated Route */}
        {routeToFocus && <MapBoundsUpdater route={routeToFocus} />}

        {/* Alternative Routes */}
        {alternativeRoutes.map((alt, idx) => {
          if (!alt.coordinates || alt.coordinates.length === 0) return null;
          const isFocused = selectedRouteType === 'alternative';
          return (
            <React.Fragment key={`alt-route-${idx}`}>
              <Polyline
                positions={alt.coordinates}
                pathOptions={{
                  color: isFocused ? '#c084fc' : '#a855f7',
                  weight: isFocused ? 5 : 3.5,
                  dashArray: '8, 8',
                  opacity: isFocused ? 0.95 : 0.6,
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <strong className="text-purple-400">{alt.name}</strong>
                    <br />
                    Distance: {alt.distance_km} km | ETA: {alt.eta_hours}h
                    <br />
                    Risk Level: <strong className="text-amber-400">{alt.risk_level}</strong>
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* Recommended Safe Route */}
        {recommendedRoute && recommendedRoute.coordinates && recommendedRoute.coordinates.length > 0 && (
          <React.Fragment>
            <Polyline
              positions={recommendedRoute.coordinates}
              pathOptions={{
                color: '#1d4ed8',
                weight: selectedRouteType === 'recommended' ? 10 : 7,
                opacity: 0.35,
                lineCap: 'round',
              }}
            />
            <Polyline
              positions={recommendedRoute.coordinates}
              pathOptions={{
                color: '#3b82f6',
                weight: selectedRouteType === 'recommended' ? 5.5 : 4,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-blue-400">{recommendedRoute.name}</strong>
                  <br />
                  Distance: {recommendedRoute.distance_km} km | ETA: {recommendedRoute.eta_hours}h
                  <br />
                  Risk Level: <strong className="text-emerald-400">{recommendedRoute.risk_level}</strong>
                  {recommendedRoute.avoided_high_risk_roads ? (
                    <div className="text-emerald-400 mt-1">
                      🛡️ Bypasses {recommendedRoute.avoided_high_risk_roads} high-hazard segments
                    </div>
                  ) : null}
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        )}

        {/* Field Incident Markers */}
        {incidents.map((incident) => {
          if (!incident.latitude || !incident.longitude) return null;
          const isVerified = incident.status === 'VERIFIED';
          const icon = isVerified ? verifiedIncidentIcon : unverifiedIncidentIcon;

          return (
            <Marker
              key={`inc-marker-${incident.id}`}
              position={[incident.latitude, incident.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectIncident) onSelectIncident(incident);
                },
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{incident.id}</span>
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        isVerified ? 'bg-red-900 text-red-200' : 'bg-amber-900 text-amber-200'
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <strong className="text-amber-300 block">{incident.road_name}</strong>
                  <div className="text-gray-300 text-[10px]">{incident.description}</div>
                  <div className="text-[9px] text-gray-400">
                    Source: <span className="text-white font-semibold">{incident.source}</span>
                  </div>
                  {onSelectIncident && (
                    <button
                      onClick={() => onSelectIncident(incident)}
                      className="w-full mt-1 py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-medium transition"
                    >
                      Review in Incident Queue
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Fleet Vehicles Markers (Simulated GPS) */}
        {vehicles.map((veh) => {
          if (!veh.current_latitude || !veh.current_longitude) return null;
          return (
            <Marker
              key={`veh-marker-${veh.id}`}
              position={[veh.current_latitude, veh.current_longitude]}
              icon={getVehicleIcon(veh.status)}
              eventHandlers={{
                click: () => {
                  if (onSelectVehicle) onSelectVehicle(veh);
                },
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-white">{veh.vehicle_number}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        veh.status === 'AT_RISK'
                          ? 'bg-red-900 text-red-100'
                          : veh.status === 'REROUTED'
                          ? 'bg-emerald-900 text-emerald-100'
                          : 'bg-blue-900 text-blue-100'
                      }`}
                    >
                      {veh.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-300">
                    Driver: <strong>{veh.driver_name}</strong>
                  </div>
                  <div className="text-[9px] text-gray-400">
                    Speed: {veh.speed_kmh} km/h • GPS: {veh.current_latitude.toFixed(3)}, {veh.current_longitude.toFixed(3)}
                  </div>
                  <div className="text-[9px] text-amber-300 font-medium">
                    [Simulated Telemetry]
                  </div>
                  {onSelectVehicle && (
                    <button
                      onClick={() => onSelectVehicle(veh)}
                      className="w-full mt-1 py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-medium transition"
                    >
                      View Logistics &amp; Detour Options
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Origin & Destination Markers */}
        {originCoord && (
          <Marker position={originCoord} icon={originIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Origin Logistics Hub</strong>
                <br />
                Coordinates: {originCoord[0].toFixed(4)}, {originCoord[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {destCoord && (
          <Marker position={destCoord} icon={destIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Destination Point</strong>
                <br />
                Coordinates: {destCoord[0].toFixed(4)}, {destCoord[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RiskGeoJSON, RoadRiskProperties } from '../types/risk';
import type { RoutePlanResponse, RouteSummary } from '../types/route';

interface RiskMapProps {
  geojsonData: RiskGeoJSON | null;
  selectedRoad: RoadRiskProperties | null;
  onSelectRoad: (road: RoadRiskProperties) => void;
  emergencyMode: boolean;
  activeRouteResponse?: RoutePlanResponse | null;
  selectedRouteType?: 'recommended' | 'alternative' | null;
}

const COLOR_CLOSED = '#4B5563'; // Dark Gray
const COLOR_HIGH = '#EF4444';   // Vibrant Red
const COLOR_MEDIUM = '#F59E0B'; // Amber Yellow
const COLOR_LOW = '#10B981';    // Emerald Green

// Custom divIcons for logistics depots and medical destinations
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

  // Determine origin and dest points for pin markers
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

        {/* Alternative / Direct Routes (Rendered underneath safe route) */}
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
                    {alt.high_risk_segments > 0 && (
                      <div className="text-red-400 mt-1">
                        ⚠️ Traverses {alt.high_risk_segments} high-risk segments
                      </div>
                    )}
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* Recommended Safe Route (Solid Vivid Blue with subtle outer glow) */}
        {recommendedRoute && recommendedRoute.coordinates && recommendedRoute.coordinates.length > 0 && (
          <React.Fragment>
            {/* Outer Glow / Casing */}
            <Polyline
              positions={recommendedRoute.coordinates}
              pathOptions={{
                color: '#1d4ed8',
                weight: selectedRouteType === 'recommended' ? 10 : 7,
                opacity: 0.35,
                lineCap: 'round',
              }}
            />
            {/* Core Solid Blue Route */}
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

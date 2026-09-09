import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import type { RiskGeoJSON, RoadRiskProperties } from '../types/risk';

interface RiskMapProps {
  geojsonData: RiskGeoJSON | null;
  selectedRoad: RoadRiskProperties | null;
  onSelectRoad: (road: RoadRiskProperties) => void;
  emergencyMode: boolean;
}

const COLOR_CLOSED = '#4B5563'; // Dark Gray
const COLOR_HIGH = '#EF4444';   // Vibrant Red
const COLOR_MEDIUM = '#F59E0B'; // Amber Yellow
const COLOR_LOW = '#10B981';    // Emerald Green

export const RiskMap: React.FC<RiskMapProps> = ({
  geojsonData,
  selectedRoad,
  onSelectRoad,
  emergencyMode,
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

        {geojsonData && (
          <GeoJSON
            key={`roads-geojson-${geojsonData.features.length}-${emergencyMode ? 'em' : 'norm'}-${selectedRoad?.osm_id || ''}`}
            data={geojsonData as any}
            style={roadStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
};

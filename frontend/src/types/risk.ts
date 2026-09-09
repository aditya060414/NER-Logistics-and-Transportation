export interface RiskSummary {
  total_roads: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  closed_roads_count: number;
  mean_risk_score: number;
  active_monsoon_scenario: string;
}

export interface RoadRiskProperties {
  osm_id: string;
  name: string;
  fclass: string;
  district: string;
  length_km: number;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  road_status: 'OPEN' | 'AT_RISK' | 'RESTRICTED' | 'BLOCKED' | 'CLOSED';
  rainfall_1d: number;
  rainfall_3d: number;
  rainfall_7d: number;
  static_vulnerability: number;
  historical_risk: number;
}

export interface RoadRiskDetail extends RoadRiskProperties {
  estimated_speed_kmh: number;
  travel_time_min: number;
  rainfall_risk: number;
  terrain_risk: number;
  explanation: {
    primary_factor: string;
    contributing_factors: string[];
    confidence: string;
  };
}

export interface RiskGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id?: string | number;
    properties: RoadRiskProperties;
    geometry: {
      type: 'LineString' | 'MultiLineString';
      coordinates: any;
    };
  }>;
}

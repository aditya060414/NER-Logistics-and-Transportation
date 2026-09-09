export interface LogisticsHub {
  name: string;
  city: string;
  lat: number;
  lon: number;
  type: 'PRIMARY_DEPOT' | 'REGIONAL_HUB' | 'CRITICAL_DESTINATION' | 'RELIEF_DEPOT' | 'CORRIDOR_JUNCTION';
}

export interface RouteSummary {
  name: string;
  distance_km: number;
  eta_minutes: number;
  eta_hours: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  high_risk_segments: number;
  max_risk_score: number;
  segment_osm_ids: string[];
  coordinates: [number, number][];
  avoided_high_risk_roads?: number;
  explanation?: string;
}

export interface RoutePlanResponse {
  origin: { lon: number; lat: number };
  destination: { lon: number; lat: number };
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  recommended: RouteSummary | null;
  alternatives: RouteSummary[];
  no_safe_route: boolean;
  message?: string;
  recommended_action?: string;
}

export interface RoutePlanRequest {
  origin_city?: string;
  dest_city?: string;
  origin_lat?: number;
  origin_lon?: number;
  dest_lat?: number;
  dest_lon?: number;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  blocked_roads?: string[];
}

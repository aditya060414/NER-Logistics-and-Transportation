export interface Incident {
  id: string;
  type: 'LANDSLIDE' | 'FLOOD' | 'ROAD_BREACH' | 'TREE_FALL' | 'BRIDGE_DAMAGE';
  road_name: string;
  description: string;
  source: 'CITIZEN' | 'OFFICER' | 'RADIO' | 'CONTROL_ROOM' | 'SYSTEM';
  status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
  latitude: number;
  longitude: number;
  osm_id?: string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  photo_url?: string | null;
  submitted_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
}

export interface IncidentsResponse {
  total: number;
  unverified_count: number;
  verified_count: number;
  rejected_count: number;
  incidents: Incident[];
}

export interface IncidentCreateRequest {
  type: string;
  road_name: string;
  description: string;
  source: string;
  latitude: number;
  longitude: number;
  osm_id?: string;
  severity: string;
  photo_url?: string;
}

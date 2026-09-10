export type DriverNetworkStatus = 'ONLINE' | 'OFFLINE';

export type DriverGPSStatus = 'ACTIVE' | 'WEAK_SIGNAL' | 'SIMULATED';

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicle_id: string;
  vehicle_number: string;
  vehicle_type: string;
  carrier_hub: string;
  license_number: string;
  rating: number;
}

export type CargoCategory = 
  | 'MEDICINE'
  | 'FOOD'
  | 'RELIEF MATERIAL'
  | 'AGRICULTURAL GOODS'
  | 'CONSTRUCTION MATERIAL'
  | 'FUEL / ESSENTIAL SUPPLY'
  | 'GENERAL GOODS'
  | 'OTHER';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface ConsignmentFormData {
  consignment_id: string;
  cargo_name: string;
  cargo_type: CargoCategory;
  priority: PriorityLevel;
  quantity: number;
  unit: string;
  weight_kg: number;
  origin: string;
  origin_lat: number;
  origin_lon: number;
  destination: string;
  dest_lat: number;
  dest_lon: number;
  notes?: string;
}

export type DriverTab = 
  | 'home'
  | 'new_consignment'
  | 'route_preview'
  | 'active_trip'
  | 'report_hazard'
  | 'alerts'
  | 'history'
  | 'profile';

export interface DriverGPS {
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading: number;
  accuracy: number;
  last_updated: string;
  status: DriverGPSStatus;
}

export interface DriverRoadWarning {
  id: string;
  type: 'LANDSLIDE' | 'ROAD_BLOCK' | 'FLOOD' | 'HIGH_RISK_CORRIDOR' | 'BRIDGE_RESTRICTION' | 'WEATHER';
  title: string;
  message: string;
  distance_ahead_km: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  osm_id?: string;
  bypass_available: boolean;
  timestamp: string;
}

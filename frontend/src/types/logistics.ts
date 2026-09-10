import type { RouteSummary } from './route';

export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  current_latitude: number;
  current_longitude: number;
  status: 'AT_RISK' | 'ON_ROUTE' | 'REROUTED' | 'HALTED';
  assigned_delivery_id: string;
  driver_name: string;
  driver_phone: string;
  last_updated: string;
  speed_kmh: number;
}

export interface Delivery {
  id: string;
  consignment_id?: string;
  cargo_name: string;
  cargo_type: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  origin: string;
  origin_coords: { lat: number; lon: number };
  destination: string;
  destination_coords: { lat: number; lon: number };
  assigned_vehicle_id: string | null;
  driver_id?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  quantity?: number;
  unit?: string;
  weight_kg?: number;
  description?: string;
  notes?: string;
  status: 
    | 'IN_TRANSIT' 
    | 'REROUTED_IN_TRANSIT' 
    | 'DISPATCH_PENDING' 
    | 'DELIVERED'
    | 'ASSIGNED'
    | 'ACCEPTED'
    | 'DELAYED'
    | 'AT_RISK'
    | 'REROUTED'
    | 'ARRIVED'
    | 'COMPLETED'
    | 'CANCELLED';
  scheduled_eta: string;
  delay_minutes: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  reroute_active: boolean;
  alternate_route_summary?: RouteSummary | null;
}

export interface LogisticsAlert {
  id: string;
  type: 'ROAD_CLOSURE' | 'HEAVY_RAIN' | 'DELIVERY_DELAY' | 'FLEET_REROUTED';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  district: string | null;
  road_id: string | null;
  delivery_id: string | null;
  vehicle_id: string | null;
  status: 'UNREAD' | 'READ';
  created_at: string;
}

export interface ImpactEvaluationResponse {
  impacted: boolean;
  affected_vehicles_count: number;
  affected_deliveries_count: number;
  affected_vehicles: Vehicle[];
  affected_deliveries: Delivery[];
  new_alerts: LogisticsAlert[];
}

/**
 * Type definitions for Field Officer Mobile Module
 */

export type OfficerNetworkStatus = 'ONLINE' | 'OFFLINE';

export type GPSStatusMode = 'ACTIVE' | 'SIGNAL_LOST' | 'DEMO_GPS';

export type TaskOperationalStatus = 
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'DELAYED'
  | 'AT_RISK'
  | 'REROUTED'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type FieldOfficerTab = 
  | 'home'
  | 'route'
  | 'report'
  | 'incidents'
  | 'delivery'
  | 'alerts'
  | 'emergency'
  | 'settings';

export type SupportedLanguage = 'en' | 'as' | 'hi';

export interface FieldOfficerGPS {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  speed_kmh: number;
  heading: number;
  last_updated: string;
  status: GPSStatusMode;
}

export interface FieldRoadWarning {
  id: string;
  type: 'HIGH_RISK_ROAD' | 'ROAD_CLOSED' | 'OFF_ROUTE' | 'NO_SAFE_ROUTE' | 'BRIDGE_RESTRICTION' | 'INCIDENT_NEARBY';
  road_name: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  distance_km?: number;
  timestamp: string;
  detour_available?: boolean;
}

export interface RadioReportEntry {
  id: string;
  timestamp: string;
  incident_type: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: string;
  source: 'RADIO';
  status: 'UNVERIFIED';
}

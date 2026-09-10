import type { RiskSummary, RiskGeoJSON, RoadRiskDetail } from '../types/risk';
import type { LogisticsHub, RoutePlanRequest, RoutePlanResponse } from '../types/route';
import type { IncidentsResponse, IncidentCreateRequest, Incident } from '../types/incident';
import type { Vehicle, Delivery, LogisticsAlert, ImpactEvaluationResponse } from '../types/logistics';

const API_BASE = '/api';

export async function fetchRiskSummary(): Promise<RiskSummary> {
  const res = await fetch(`${API_BASE}/risk/summary`);
  if (!res.ok) throw new Error('Failed to fetch risk summary');
  return res.json();
}

export async function fetchRiskMap(level?: string, district?: string): Promise<RiskGeoJSON> {
  const params = new URLSearchParams();
  if (level) params.append('level', level);
  if (district) params.append('district', district);
  
  const res = await fetch(`${API_BASE}/risk/map?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch risk map data');
  return res.json();
}

export async function fetchRoadDetail(osmId: string): Promise<RoadRiskDetail> {
  const res = await fetch(`${API_BASE}/risk/${osmId}`);
  if (!res.ok) throw new Error(`Failed to fetch details for road ${osmId}`);
  return res.json();
}

export async function fetchLogisticsHubs(): Promise<LogisticsHub[]> {
  const res = await fetch(`${API_BASE}/routes/hubs`);
  if (!res.ok) throw new Error('Failed to fetch logistics hubs');
  return res.json();
}

export async function planRoute(req: RoutePlanRequest): Promise<RoutePlanResponse> {
  const res = await fetch(`${API_BASE}/routes/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || 'Failed to calculate safe route');
  }
  return res.json();
}

export async function fetchIncidents(status?: string, source?: string): Promise<IncidentsResponse> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (source && source !== 'ALL') params.append('source', source);

  const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function createIncident(data: IncidentCreateRequest): Promise<{ success: boolean; incident: Incident }> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create incident report');
  return res.json();
}

export async function verifyIncident(incidentId: string): Promise<{ success: boolean; incident: Incident; action_taken: any }> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/verify`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to verify incident ${incidentId}`);
  return res.json();
}

export async function rejectIncident(incidentId: string): Promise<{ success: boolean; incident: Incident }> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/reject`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reject incident ${incidentId}`);
  return res.json();
}

export async function syncOfflineIncidents(reports: IncidentCreateRequest[]): Promise<{ success: boolean; synced_count: number; synced_incidents: Incident[] }> {
  const res = await fetch(`${API_BASE}/incidents/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reports),
  });
  if (!res.ok) throw new Error('Failed to synchronize offline incident reports');
  return res.json();
}

export async function resetIncidents(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/incidents/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset incidents');
  return res.json();
}

// Logistics & Fleet API
export async function fetchVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/logistics/vehicles`);
  if (!res.ok) throw new Error('Failed to fetch fleet vehicles');
  return res.json();
}

export async function fetchDeliveries(): Promise<Delivery[]> {
  const res = await fetch(`${API_BASE}/logistics/deliveries`);
  if (!res.ok) throw new Error('Failed to fetch deliveries');
  return res.json();
}

export async function fetchAlerts(): Promise<LogisticsAlert[]> {
  const res = await fetch(`${API_BASE}/logistics/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function markAlertRead(alertId: string): Promise<{ success: boolean; alert: LogisticsAlert }> {
  const res = await fetch(`${API_BASE}/logistics/alerts/read/${alertId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to mark alert ${alertId} read`);
  return res.json();
}

export async function evaluateClosureImpact(closedOsmIds: string[]): Promise<ImpactEvaluationResponse> {
  const res = await fetch(`${API_BASE}/logistics/evaluate-impact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ closed_osm_ids: closedOsmIds }),
  });
  if (!res.ok) throw new Error('Failed to evaluate logistics impact');
  return res.json();
}

export async function dispatchReroute(vehicleId: string): Promise<{ success: boolean; message: string; vehicle: Vehicle; delivery: Delivery }> {
  const res = await fetch(`${API_BASE}/logistics/dispatch-reroute/${vehicleId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to dispatch reroute to vehicle ${vehicleId}`);
  return res.json();
}

export async function resetLogistics(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/logistics/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset logistics state');
  return res.json();
}

// Weather Intelligence API
export interface WeatherCurrent {
  status: string;
  station: string;
  date: string;
  condition: string;
  mean_24h_rainfall_mm: number;
  max_24h_rainfall_mm: number;
  peak_hazard_district: string;
  soil_moisture_saturation_pct: number;
  flood_alert_level: string;
  data_provenance: string;
}

export interface WeatherForecastItem {
  day: string;
  date: string;
  rainfall_forecast_mm: number;
  condition: string;
  risk_impact: string;
  corridor_advisory: string;
}

export async function fetchCurrentWeather(): Promise<WeatherCurrent> {
  const res = await fetch(`${API_BASE}/weather/current`);
  if (!res.ok) throw new Error('Failed to fetch weather telemetry');
  return res.json();
}

export async function fetchWeatherForecast(): Promise<WeatherForecastItem[]> {
  const res = await fetch(`${API_BASE}/weather/forecast`);
  if (!res.ok) throw new Error('Failed to fetch weather forecast');
  return res.json();
}

export async function updateDeliveryStatus(
  deliveryId: string,
  data: { status: string; delay_minutes?: number; risk_level?: string }
): Promise<{ success: boolean; delivery: Delivery }> {
  const res = await fetch(`${API_BASE}/logistics/deliveries/${deliveryId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update delivery status');
  return res.json();
}

export async function updateVehicleTelemetry(
  vehicleId: string,
  data: { latitude: number; longitude: number; speed_kmh?: number; status?: string }
): Promise<{ success: boolean; vehicle: Vehicle }> {
  const res = await fetch(`${API_BASE}/logistics/vehicles/${vehicleId}/telemetry`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update vehicle telemetry');
  return res.json();
}

// Driver & Consignment Specific API Methods
export async function createConsignmentDelivery(data: {
  consignment_id?: string;
  cargo_name: string;
  cargo_type: string;
  priority: string;
  origin: string;
  origin_lat: number;
  origin_lon: number;
  destination: string;
  dest_lat: number;
  dest_lon: number;
  driver_id?: string;
  vehicle_id?: string;
  quantity?: number;
  unit?: string;
  weight_kg?: number;
  notes?: string;
}): Promise<{ success: boolean; delivery: Delivery; consignment_id: string; message: string }> {
  const res = await fetch(`${API_BASE}/deliveries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || 'Failed to register consignment');
  }
  return res.json();
}

export async function fetchMyDeliveries(driverId?: string, vehicleId?: string): Promise<Delivery[]> {
  const params = new URLSearchParams();
  if (driverId) params.append('driver_id', driverId);
  if (vehicleId) params.append('vehicle_id', vehicleId);
  
  const res = await fetch(`${API_BASE}/deliveries/my?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch driver deliveries');
  return res.json();
}

export async function fetchDeliveryById(deliveryId: string): Promise<Delivery> {
  const res = await fetch(`${API_BASE}/deliveries/${deliveryId}`);
  if (!res.ok) throw new Error(`Delivery ${deliveryId} not found`);
  return res.json();
}

export async function updateDeliveryDetails(
  deliveryId: string,
  data: Partial<Delivery>
): Promise<{ success: boolean; delivery: Delivery }> {
  const res = await fetch(`${API_BASE}/deliveries/${deliveryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update delivery');
  return res.json();
}


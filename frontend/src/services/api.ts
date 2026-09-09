import type { RiskSummary, RiskGeoJSON, RoadRiskDetail } from '../types/risk';
import type { LogisticsHub, RoutePlanRequest, RoutePlanResponse } from '../types/route';
import type { IncidentsResponse, IncidentCreateRequest, Incident } from '../types/incident';

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

export async function resetIncidents(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/incidents/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset incidents');
  return res.json();
}

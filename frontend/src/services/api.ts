import type { RiskSummary, RiskGeoJSON, RoadRiskDetail } from '../types/risk';
import type { LogisticsHub, RoutePlanRequest, RoutePlanResponse } from '../types/route';

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

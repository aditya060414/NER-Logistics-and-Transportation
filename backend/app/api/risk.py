"""
FastAPI Router for Road Disruption Risk Intelligence
Provides GeoJSON map endpoint and detailed road explanation endpoints.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from ml.data_loader import get_data_loader
from ml.risk_engine import predict_risk

router = APIRouter(prefix="/api/risk", tags=["Risk Intelligence"])

@router.get("/summary")
def get_risk_summary() -> Dict[str, Any]:
    """
    Returns high-level statistics for KPIs and dashboard gauges.
    """
    loader = get_data_loader()
    gdf = loader.get_roads_risk()
    closed = loader.get_closed_roads()
    
    counts = gdf["risk_level"].value_counts().to_dict()
    return {
        "total_roads": len(gdf),
        "low_risk_count": int(counts.get("LOW", 0)),
        "medium_risk_count": int(counts.get("MEDIUM", 0)),
        "high_risk_count": int(counts.get("HIGH", 0)),
        "closed_roads_count": len(closed),
        "mean_risk_score": round(float(gdf["risk_score"].mean()), 4),
        "active_monsoon_scenario": "Assam 2022 Stress Test (2022-06-18)"
    }

@router.get("/map")
def get_risk_map(
    level: Optional[str] = Query(None, description="Filter by risk level: LOW, MEDIUM, HIGH or comma-separated"),
    district: Optional[str] = Query(None, description="Filter by district name (e.g. Chirang, Cachar)")
) -> Dict[str, Any]:
    """
    Returns GeoJSON FeatureCollection formatted in WGS84 (EPSG:4326) for direct Leaflet rendering.
    """
    loader = get_data_loader()
    return loader.get_risk_geojson(level=level, district=district)

@router.get("/{osm_id}")
def get_road_risk_detail(osm_id: str) -> Dict[str, Any]:
    """
    Returns granular risk attribution and explanatory factors for a specific road segment.
    """
    loader = get_data_loader()
    road = loader.get_road_by_osm_id(osm_id)
    
    if not road:
        raise HTTPException(status_code=404, detail=f"Road segment with osm_id '{osm_id}' not found.")
        
    status = "CLOSED" if str(osm_id) in loader.get_closed_roads() else road.get("road_status", "OPEN")
    
    r1 = float(road.get("rainfall_1d", 0.0))
    r3 = float(road.get("rainfall_3d", 0.0))
    r7 = float(road.get("rainfall_7d", 0.0))
    rain_risk = float(road.get("rainfall_risk", 0.0))
    vuln = float(road.get("static_vulnerability", 0.0))
    hist = int(road.get("historical_risk", 0))
    score = float(road.get("risk_score", 0.0))
    level = str(road.get("risk_level", "LOW"))
    
    # Generate human-readable explanation
    factors_list = []
    if r1 >= 50.0:
        factors_list.append(f"Heavy 24h precipitation ({r1:.1f} mm)")
    if r3 >= 150.0:
        factors_list.append(f"High 3-day rainfall accumulation ({r3:.1f} mm)")
    if r7 >= 300.0:
        factors_list.append(f"Critical 7-day soil saturation ({r7:.1f} mm)")
    if vuln >= 0.40:
        factors_list.append(f"Structural vulnerability ({road.get('fclass')} road with bottleneck exposure)")
    if hist == 1:
        factors_list.append("Documented historical flood disruption corridor (ASDMA)")
        
    if not factors_list:
        primary_factor = "Normal weather conditions; minimal disruption exposure."
    else:
        primary_factor = "; ".join(factors_list)

    return {
        "osm_id": str(osm_id),
        "road_name": road.get("name") or "Unnamed Road",
        "district": road.get("district", "Unknown"),
        "road_class": road.get("fclass", "unclassified"),
        "length_km": round(float(road.get("length_km", 0.0)), 2),
        "estimated_speed_kmh": int(road.get("estimated_speed_kmh", 40)),
        "travel_time_min": round(float(road.get("travel_time_min", 0.0)), 1),
        "risk_score": round(score, 4),
        "risk_level": level,
        "road_status": status,
        "rainfall_1d": round(r1, 2),
        "rainfall_3d": round(r3, 2),
        "rainfall_7d": round(r7, 2),
        "rainfall_risk": round(rain_risk, 4),
        "static_vulnerability": round(vuln, 4),
        "historical_risk": hist,
        "terrain_risk": round(float(road.get("terrain_risk", 0.0)), 4),
        "explanation": {
            "primary_factor": primary_factor,
            "contributing_factors": factors_list,
            "confidence": "Evidence-grounded heuristic prototype"
        }
    }

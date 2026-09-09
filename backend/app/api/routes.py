"""
FastAPI Router for Risk-Aware Routing and Route Planning
Supports multi-criteria pathfinding with cargo priorities and dynamic closure penalties.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from ml.routing_engine import plan_route, ASSAM_HUBS

router = APIRouter(prefix="/api/routes", tags=["Route Intelligence"])

class Coordinate(BaseModel):
    lat: float = Field(..., description="Latitude (WGS84)")
    lon: float = Field(..., description="Longitude (WGS84)")

class RoutePlanRequest(BaseModel):
    origin: Optional[Coordinate] = None
    destination: Optional[Coordinate] = None
    origin_lat: Optional[float] = None
    origin_lon: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lon: Optional[float] = None
    origin_city: Optional[str] = None
    dest_city: Optional[str] = None
    priority: str = Field(default="CRITICAL", description="Cargo priority: CRITICAL, HIGH, NORMAL, LOW")
    blocked_roads: Optional[List[str]] = Field(default_factory=list, description="List of OSM road IDs to avoid")

@router.get("/hubs")
def get_logistics_hubs() -> List[Dict[str, Any]]:
    """
    Returns pre-configured key logistics hubs across Assam for quick UI origin/dest selection.
    """
    return [
        {"name": "Guwahati (Central Depot)", "city": "Guwahati", "lat": 26.1445, "lon": 91.7362, "type": "PRIMARY_DEPOT"},
        {"name": "Tezpur (Northern Corridor)", "city": "Tezpur", "lat": 26.6528, "lon": 92.7926, "type": "REGIONAL_HUB"},
        {"name": "Haflong (Dima Hasao Hill Civil Hospital)", "city": "Haflong", "lat": 25.1706, "lon": 93.0175, "type": "CRITICAL_DESTINATION"},
        {"name": "Dibrugarh (Upper Assam Supply Base)", "city": "Dibrugarh", "lat": 27.4728, "lon": 94.9120, "type": "REGIONAL_HUB"},
        {"name": "Silchar (Barak Valley Terminal)", "city": "Silchar", "lat": 24.8333, "lon": 92.7976, "type": "REGIONAL_HUB"},
        {"name": "Jorhat (Relief Base)", "city": "Jorhat", "lat": 26.7509, "lon": 94.2037, "type": "RELIEF_DEPOT"},
        {"name": "Bongaigaon (Western Assam Link)", "city": "Bongaigaon", "lat": 26.5019, "lon": 90.5432, "type": "CORRIDOR_JUNCTION"},
        {"name": "Nagaon (Central Junction)", "city": "Nagaon", "lat": 26.3452, "lon": 92.6840, "type": "CORRIDOR_JUNCTION"}
    ]

@router.post("/plan")
def plan_safe_route(req: RoutePlanRequest) -> Dict[str, Any]:
    """
    Computes recommended safe route, alternatives, and ETA taking weather risk and closures into account.
    """
    # 1. Resolve Origin coordinates
    orig_lat = req.origin_lat
    orig_lon = req.origin_lon
    if req.origin:
        orig_lat = req.origin.lat
        orig_lon = req.origin.lon
    elif req.origin_city and req.origin_city.lower() in ASSAM_HUBS:
        orig_lon, orig_lat = ASSAM_HUBS[req.origin_city.lower()]

    # 2. Resolve Destination coordinates
    dest_lat = req.dest_lat
    dest_lon = req.dest_lon
    if req.destination:
        dest_lat = req.destination.lat
        dest_lon = req.destination.lon
    elif req.dest_city and req.dest_city.lower() in ASSAM_HUBS:
        dest_lon, dest_lat = ASSAM_HUBS[req.dest_city.lower()]

    if orig_lat is None or orig_lon is None or dest_lat is None or dest_lon is None:
        raise HTTPException(
            status_code=400,
            detail="Origin and Destination coordinates (or valid city names) must be provided."
        )

    # 3. Call routing engine
    result = plan_route(
        orig_lon=float(orig_lon),
        orig_lat=float(orig_lat),
        dest_lon=float(dest_lon),
        dest_lat=float(dest_lat),
        priority=req.priority,
        blocked_osm_ids=set(req.blocked_roads or [])
    )

    return result

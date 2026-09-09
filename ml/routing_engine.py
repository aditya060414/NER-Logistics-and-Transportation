"""
Risk-Aware Routing Engine for NER Logistics Platform
Integrates NetworkX routing graph with road disruption risk scores and dynamic road closures.
"""

from typing import Dict, List, Any, Optional, Set
import networkx as nx
import pyproj
from ml.data_loader import get_data_loader

PRIORITY_PENALTIES = {
    "CRITICAL": 5.0,  # Strongest risk avoidance
    "HIGH": 3.0,
    "NORMAL": 1.5,
    "LOW": 0.5
}

# Standard Assam Hub Coordinates (lon, lat)
ASSAM_HUBS = {
    "guwahati": (91.7362, 26.1445),
    "tezpur": (92.7926, 26.6528),
    "haflong": (93.0175, 25.1706),
    "dibrugarh": (94.9120, 27.4728),
    "silchar": (92.7976, 24.8333),
    "jorhat": (94.2037, 26.7509),
    "bongaigaon": (90.5432, 26.5019),
    "nagaon": (92.6840, 26.3452)
}

transformer_to_wgs84 = pyproj.Transformer.from_crs("EPSG:32646", "EPSG:4326", always_xy=True)

def plan_route(
    orig_lon: float,
    orig_lat: float,
    dest_lon: float,
    dest_lat: float,
    priority: str = "CRITICAL",
    blocked_osm_ids: Optional[Set[str]] = None
) -> Dict[str, Any]:
    """
    Computes recommended safe route, alternative routes, and ETA with risk penalty.
    """
    loader = get_data_loader()
    G = loader.get_routing_graph()
    roads_df = loader.get_roads_risk()
    
    # Pre-build risk lookup map by osm_id
    risk_map = dict(zip(roads_df["osm_id"].astype(str), roads_df["risk_score"]))
    
    orig_node = loader.snap_coordinate_to_node(orig_lon, orig_lat)
    dest_node = loader.snap_coordinate_to_node(dest_lon, dest_lat)
    
    # Combine explicit request blocked IDs with system-wide verified closures
    system_closed = loader.get_closed_roads()
    blocked_set = set(str(x).strip() for x in (blocked_osm_ids or set())).union(system_closed)
    
    priority_upper = priority.upper()
    risk_factor = PRIORITY_PENALTIES.get(priority_upper, 3.0)
    
    def safe_weight(u, v, d):
        osm_id = str(d.get("osm_id", ""))
        if osm_id in blocked_set:
            return 1e9 # Road closed
        tt = d.get("travel_time_min", 1.0)
        risk = risk_map.get(osm_id, 0.0)
        return tt * (1.0 + risk_factor * risk)

    def fastest_weight(u, v, d):
        osm_id = str(d.get("osm_id", ""))
        if osm_id in blocked_set:
            return 1e9 # Road closed
        return d.get("travel_time_min", 1.0)

    try:
        # 1. Recommended Safe Route (Priority Risk Weight)
        safe_nodes = nx.shortest_path(G, source=orig_node, target=dest_node, weight=safe_weight)
        
        # 2. Fastest Route (Pure Travel Time)
        fastest_nodes = nx.shortest_path(G, source=orig_node, target=dest_node, weight=fastest_weight)
    except nx.NetworkXNoPath:
        return {
            "recommended": None,
            "alternatives": [],
            "no_safe_route": True,
            "message": "NO SAFE ROUTE AVAILABLE. All available corridors contain critical restrictions or closures.",
            "recommended_action": "HOLD VEHICLE AT SAFE LOCATION / RE-ROUTE VIA RELIEF DEPOT"
        }

    # Verify if safe route accidentally traversed a blocked road (in case entire graph is severed)
    def check_blocked_traversal(node_path: List[int]) -> int:
        count = 0
        for u, v in zip(node_path[:-1], node_path[1:]):
            edge_data = G[u][v][0]
            if str(edge_data.get("osm_id", "")) in blocked_set:
                count += 1
        return count

    if check_blocked_traversal(safe_nodes) > 0:
        return {
            "recommended": None,
            "alternatives": [],
            "no_safe_route": True,
            "message": "NO SAFE ROUTE AVAILABLE. Every feasible corridor is blocked by confirmed closures.",
            "recommended_action": "HOLD VEHICLE AT SAFE LOCATION"
        }

    def build_route_summary(node_path: List[int], name: str) -> Dict[str, Any]:
        total_dist_km = 0.0
        total_time_min = 0.0
        coords_wgs84 = []
        high_risk_segments = 0
        max_segment_risk = 0.0
        segment_osm_ids = []
        
        for u, v in zip(node_path[:-1], node_path[1:]):
            edge_data = G[u][v][0]
            osm_id = str(edge_data.get("osm_id", ""))
            segment_osm_ids.append(osm_id)
            total_dist_km += edge_data.get("length_km", 0.0)
            total_time_min += edge_data.get("travel_time_min", 0.0)
            
            r = risk_map.get(osm_id, 0.0)
            if r > max_segment_risk:
                max_segment_risk = r
            if r >= 0.66:
                high_risk_segments += 1
                
            geom = edge_data.get("geometry")
            if geom and hasattr(geom, "coords"):
                for x, y in geom.coords:
                    lon, lat = transformer_to_wgs84.transform(x, y)
                    coords_wgs84.append([round(lat, 5), round(lon, 5)])

        if max_segment_risk >= 0.66:
            overall_risk = "HIGH"
        elif max_segment_risk >= 0.33:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        return {
            "name": name,
            "distance_km": round(total_dist_km, 1),
            "eta_minutes": round(total_time_min, 1),
            "eta_hours": round(total_time_min / 60.0, 1),
            "risk_level": overall_risk,
            "high_risk_segments": high_risk_segments,
            "max_risk_score": round(max_segment_risk, 3),
            "segment_osm_ids": segment_osm_ids,
            "coordinates": coords_wgs84[::2]
        }

    recommended = build_route_summary(safe_nodes, f"Recommended Safe Route ({priority_upper} Cargo)")
    fastest = build_route_summary(fastest_nodes, "Fastest Direct Route")
    
    # Calculate avoided high risk segments
    avoided_count = max(0, fastest["high_risk_segments"] - recommended["high_risk_segments"])
    recommended["avoided_high_risk_roads"] = avoided_count
    
    if avoided_count > 0:
        recommended["explanation"] = f"Bypasses {avoided_count} high-risk road segment(s) prone to landslide/flooding. Prioritizes cargo safety."
    else:
        recommended["explanation"] = f"Optimal corridor selected for {priority_upper} priority with lowest cumulative weather risk."

    alternatives = []
    if fastest["coordinates"] != recommended["coordinates"]:
        fastest["explanation"] = "Direct corridor with shortest travel time, but passes through elevated risk zones."
        alternatives.append(fastest)

    tradeoff_text = "Safe route is directly optimal."
    if alternatives:
        time_diff = round(recommended["eta_minutes"] - fastest["eta_minutes"], 1)
        dist_diff = round(recommended["distance_km"] - fastest["distance_km"], 1)
        tradeoff_text = f"Safe route adds +{dist_diff} km and +{time_diff} mins ETA to avoid hazardous flood/landslide exposure."

    return {
        "recommended": recommended,
        "alternatives": alternatives,
        "no_safe_route": False,
        "decision_summary": {
            "cargo_priority": priority_upper,
            "tradeoff": tradeoff_text,
            "blocked_corridors_avoided": len(blocked_set)
        }
    }

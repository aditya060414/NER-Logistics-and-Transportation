"""
Risk-Aware Routing Engine for NER Logistics Platform
Integrates NetworkX routing graph with road disruption risk scores and dynamic road closures.
"""

from typing import Dict, List, Any, Optional, Set
import networkx as nx
import pyproj
from ml.data_loader import get_data_loader

PRIORITY_PENALTIES = {
    "CRITICAL": 5.0,  # Strongly avoids high & medium risk roads
    "HIGH": 3.0,
    "NORMAL": 1.5,
    "LOW": 0.5
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
    
    blocked_set = set(str(x) for x in (blocked_osm_ids or []))
    risk_factor = PRIORITY_PENALTIES.get(priority.upper(), 3.0)
    
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
            "message": "All practical corridors are closed or physically inaccessible."
        }

    def build_route_summary(node_path: List[int], name: str) -> Dict[str, Any]:
        total_dist_km = 0.0
        total_time_min = 0.0
        coords_wgs84 = []
        high_risk_segments = 0
        max_segment_risk = 0.0
        
        for u, v in zip(node_path[:-1], node_path[1:]):
            edge_data = G[u][v][0]
            osm_id = str(edge_data.get("osm_id", ""))
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
            "coordinates": coords_wgs84[::2] # Decimate for network efficiency
        }

    recommended = build_route_summary(safe_nodes, f"Recommended Safe Route ({priority} Cargo)")
    fastest = build_route_summary(fastest_nodes, "Fastest Route (Direct)")
    
    alternatives = []
    if fastest["coordinates"] != recommended["coordinates"]:
        alternatives.append(fastest)

    return {
        "recommended": recommended,
        "alternatives": alternatives,
        "no_safe_route": False
    }

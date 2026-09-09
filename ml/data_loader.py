"""
Data Loader Module for NER Logistics Platform
Caches preprocessed geospatial layers, routing graphs, and risk tables in memory.
Eliminates redundant disk I/O and never touches raw rainfall CSVs during application runtime.
"""

import json
import pickle
from pathlib import Path
from typing import Optional, Dict, Any, List
import geopandas as gpd
import networkx as nx
import pyproj
from scipy.spatial import cKDTree
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

class LogisticsDataLoader:
    _instance: Optional["LogisticsDataLoader"] = None
    
    def __init__(self):
        self._roads_gdf: Optional[gpd.GeoDataFrame] = None
        self._roads_wgs84: Optional[gpd.GeoDataFrame] = None
        self._roads_by_osm_id: Optional[Dict[str, Dict[str, Any]]] = None
        self._geojson_cache: Optional[Dict[str, Any]] = None
        self._graph: Optional[nx.MultiDiGraph] = None
        self._node_tree: Optional[cKDTree] = None
        self._node_ids: Optional[List[int]] = None
        self._transformer: Optional[pyproj.Transformer] = None
        self._closed_roads: set = set()
        
    @classmethod
    def get_instance(cls) -> "LogisticsDataLoader":
        if cls._instance is None:
            cls._instance = LogisticsDataLoader()
        return cls._instance

    def get_roads_risk(self) -> gpd.GeoDataFrame:
        if self._roads_gdf is None:
            risk_file = DATA_DIR / "risk" / "assam_demo_road_risk.gpkg"
            if not risk_file.exists():
                risk_file = DATA_DIR / "gis" / "assam_road_routing.gpkg"
            self._roads_gdf = gpd.read_file(risk_file)
            self._roads_gdf["osm_id"] = self._roads_gdf["osm_id"].astype(str)
        return self._roads_gdf

    def get_roads_wgs84(self) -> gpd.GeoDataFrame:
        if self._roads_wgs84 is None:
            gdf = self.get_roads_risk()
            if str(gdf.crs).lower() != "epsg:4326":
                self._roads_wgs84 = gdf.to_crs("EPSG:4326")
            else:
                self._roads_wgs84 = gdf.copy()
            self._roads_wgs84["osm_id"] = self._roads_wgs84["osm_id"].astype(str)
        return self._roads_wgs84

    def get_roads_dict_by_osm_id(self) -> Dict[str, Dict[str, Any]]:
        if self._roads_by_osm_id is None:
            gdf = self.get_roads_risk()
            records = gdf.to_dict(orient="records")
            self._roads_by_osm_id = {str(r["osm_id"]): r for r in records}
        return self._roads_by_osm_id

    def get_road_by_osm_id(self, osm_id: str) -> Optional[Dict[str, Any]]:
        lookup = self.get_roads_dict_by_osm_id()
        return lookup.get(str(osm_id).strip())

    def get_risk_geojson(self, level: Optional[str] = None, district: Optional[str] = None) -> Dict[str, Any]:
        """
        Returns GeoJSON feature collection in EPSG:4326 for Leaflet map display.
        """
        # If no filter and cache available, return cached GeoJSON dict
        if level is None and district is None and self._geojson_cache is not None:
            return self._geojson_cache

        gdf = self.get_roads_wgs84()
        
        if level:
            levels = [l.strip().upper() for l in level.split(",")]
            gdf = gdf[gdf["risk_level"].str.upper().isin(levels)]
        if district:
            gdf = gdf[gdf["district"].str.lower() == district.strip().lower()]

        cols = [
            "osm_id", "name", "fclass", "district", "length_km",
            "risk_score", "risk_level", "road_status",
            "rainfall_1d", "rainfall_3d", "rainfall_7d",
            "static_vulnerability", "historical_risk", "geometry"
        ]
        available_cols = [c for c in cols if c in gdf.columns]
        
        geojson_str = gdf[available_cols].to_json()
        data = json.loads(geojson_str)

        # Reflect dynamic road closures in GeoJSON properties
        if self._closed_roads:
            for feat in data.get("features", []):
                oid = str(feat.get("properties", {}).get("osm_id", ""))
                if oid in self._closed_roads:
                    feat["properties"]["road_status"] = "CLOSED"

        if level is None and district is None and not self._closed_roads:
            self._geojson_cache = data

        return data

    def mark_road_closed(self, osm_id: str):
        self._closed_roads.add(str(osm_id).strip())
        self._geojson_cache = None # invalidate cache
        lookup = self.get_roads_dict_by_osm_id()
        if str(osm_id) in lookup:
            lookup[str(osm_id)]["road_status"] = "CLOSED"

    def mark_road_open(self, osm_id: str):
        self._closed_roads.discard(str(osm_id).strip())
        self._geojson_cache = None # invalidate cache
        lookup = self.get_roads_dict_by_osm_id()
        if str(osm_id) in lookup:
            r = lookup[str(osm_id)]
            r["road_status"] = "AT_RISK" if r.get("risk_level") == "HIGH" else "OPEN"

    def get_closed_roads(self) -> set:
        return set(self._closed_roads)

    def get_routing_graph(self) -> nx.MultiDiGraph:
        if self._graph is None:
            graph_file = DATA_DIR / "gis" / "assam_graph.pkl"
            with open(graph_file, "rb") as f:
                self._graph = pickle.load(f)
                
            self._transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:32646", always_xy=True)
            self._node_ids = list(self._graph.nodes())
            coords = np.array([[self._graph.nodes[n]["x"], self._graph.nodes[n]["y"]] for n in self._node_ids])
            self._node_tree = cKDTree(coords)
            
        return self._graph

    def snap_coordinate_to_node(self, lon: float, lat: float) -> int:
        self.get_routing_graph()
        x, y = self._transformer.transform(lon, lat)
        _, idx = self._node_tree.query([x, y])
        return self._node_ids[idx]

def get_data_loader() -> LogisticsDataLoader:
    return LogisticsDataLoader.get_instance()

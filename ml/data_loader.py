"""
Data Loader Module for NER Logistics Platform
Caches preprocessed geospatial layers, routing graphs, and risk tables in memory.
Eliminates redundant disk I/O and never touches raw rainfall CSVs during application runtime.
"""

import pickle
from pathlib import Path
from typing import Optional, Dict, Any
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
        self._graph: Optional[nx.MultiDiGraph] = None
        self._node_tree: Optional[cKDTree] = None
        self._node_ids: Optional[list] = None
        self._transformer: Optional[pyproj.Transformer] = None
        self._historical_df = None
        
    @classmethod
    def get_instance(cls) -> "LogisticsDataLoader":
        if cls._instance is None:
            cls._instance = LogisticsDataLoader()
        return cls._instance

    def get_roads_risk(self) -> gpd.GeoDataFrame:
        if self._roads_gdf is None:
            risk_file = DATA_DIR / "risk" / "assam_demo_road_risk.gpkg"
            if not risk_file.exists():
                # Fallback to base road network if risk file not yet generated
                risk_file = DATA_DIR / "gis" / "assam_road_routing.gpkg"
            self._roads_gdf = gpd.read_file(risk_file)
        return self._roads_gdf

    def get_routing_graph(self) -> nx.MultiDiGraph:
        if self._graph is None:
            graph_file = DATA_DIR / "gis" / "assam_graph.pkl"
            with open(graph_file, "rb") as f:
                self._graph = pickle.load(f)
                
            # Pre-compute KDTree for snapping (lon, lat) to graph nodes
            self._transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:32646", always_xy=True)
            self._node_ids = list(self._graph.nodes())
            coords = np.array([[self._graph.nodes[n]["x"], self._graph.nodes[n]["y"]] for n in self._node_ids])
            self._node_tree = cKDTree(coords)
            
        return self._graph

    def snap_coordinate_to_node(self, lon: float, lat: float) -> int:
        """Finds closest graph junction node to WGS84 coordinate (lon, lat)."""
        self.get_routing_graph() # Ensure tree is initialized
        x, y = self._transformer.transform(lon, lat)
        _, idx = self._node_tree.query([x, y])
        return self._node_ids[idx]

def get_data_loader() -> LogisticsDataLoader:
    return LogisticsDataLoader.get_instance()

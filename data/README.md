# Data Directory Structure

This directory holds processed geospatial, risk, and historical evidence datasets.

### `data/gis/`
Contains OpenStreetMap roads, network graphs, boundaries, and district administrative shapefiles/GeoPackages:
- `assam_boundary.gpkg`
- `assam_districts.gpkg`
- `assam_districts_assam.gpkg`
- `assam_edges.gpkg`
- `assam_nodes.gpkg`
- `assam_roads.gpkg`
- `assam_major_roads.gpkg`
- `assam_major_roads_clean.gpkg`
- `assam_road_attributes.gpkg`
- `assam_road_routing.gpkg`
- `assam_graph.pkl` (NetworkX graph)

### `data/risk/`
Output of the risk engine:
- `assam_demo_road_risk.gpkg` (13,093 road segments with rainfall risk, static vulnerability, historical risk, and combined risk score/level)

### `data/historical/`
Historical disruption data:
- `historical_evidence_summary.csv` (Historical flood, landslide, and corridor disruption events)

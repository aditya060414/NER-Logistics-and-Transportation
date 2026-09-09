# Data Sources & Provenance Documentation

| Layer | Source / Agency | Coverage | Update Frequency | Real / Simulated in Prototype |
|---|---|---|---|---|
| **Road Network** | OpenStreetMap (OSM) / Geofabrik | Assam State (`assam_roads.gpkg`, `assam_edges.gpkg`) | Static snapshot | **Real** processed GIS data |
| **Routing Graph** | NetworkX generated graph from OSM edges | Assam primary & secondary road corridors | Static snapshot | **Real** graph structure |
| **Rainfall Data** | CWC / Assam Water Resources Dept / IMD | Daily rainfall records 2021–2025 | Historical daily | **Real** rainfall records |
| **Historical Disasters** | ASDMA (Assam State Disaster Management Authority) | Floods, landslides & corridor disruption records | Historical records | **Real** corridor evidence |
| **Road Risk Model** | Explainable Risk Engine (60% Rain + 25% Vuln + 15% Hist) | 13,093 road segments | Computed | **Real** computed heuristics |
| **Vehicle Telemetry** | Simulated fleet tracking | Key Assam logistics routes | 5-second simulated tick | **Simulated** GPS for demo |
| **Field Reports** | Mobile field officer & radio fallback mockups | Demo corridor | On submission | **Simulated** for demo story |
| **Terrain / DEM** | SRTM / Copernicus DEM (Optional) | North Eastern Region | Static elevation | Optional enhancement |

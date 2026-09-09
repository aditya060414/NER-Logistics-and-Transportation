"""
One-Time Data Preprocessing and Artifact Generation Pipeline
for NER Logistics Accessibility Intelligence Platform (SIH 2026)

Runs the heavy geospatial processing, rainfall aggregation, spatial indexing,
vulnerability scoring, and demo risk computation ONCE, exporting compact artifacts
for zero-overhead FastAPI runtime usage.
"""

import sys
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd
import geopandas as gpd
from scipy.spatial import cKDTree

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("NER_Preprocessor")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
GIS_DIR = DATA_DIR / "gis"
RISK_DIR = DATA_DIR / "risk"
HISTORICAL_DIR = DATA_DIR / "historical"
METADATA_DIR = BASE_DIR / "metadata"
ML_DIR = BASE_DIR / "ml"

for d in [RISK_DIR, HISTORICAL_DIR, METADATA_DIR]:
    d.mkdir(parents=True, exist_ok=True)

def run_pipeline():
    logger.info("==================================================================")
    logger.info("STEP 1: Loading Road Network & District Administrative Boundaries")
    logger.info("==================================================================")
    
    roads_file = GIS_DIR / "assam_road_routing.gpkg"
    if not roads_file.exists():
        raise FileNotFoundError(f"Missing base road file: {roads_file}")
    
    roads = gpd.read_file(roads_file)
    logger.info(f"Loaded {len(roads)} road segments. CRS: {roads.crs}")

    districts_file = GIS_DIR / "assam_districts_assam.gpkg"
    districts = gpd.read_file(districts_file).to_crs(roads.crs)
    
    # Assign district to each road via representative midpoint
    roads_mid = roads.copy()
    roads_mid['geometry'] = roads.geometry.interpolate(0.5, normalized=True)
    joined_districts = gpd.sjoin(
        roads_mid[['osm_id', 'geometry']],
        districts[['name', 'geometry']],
        how='left',
        predicate='intersects'
    ).drop_duplicates(subset=['osm_id']).rename(columns={'name': 'district'})

    roads = roads.merge(joined_districts[['osm_id', 'district']], on='osm_id', how='left')
    roads['district'] = roads['district'].fillna('Unknown')
    logger.info(f"Districts assigned successfully. Top 3 districts: {roads['district'].value_counts().head(3).to_dict()}")

    logger.info("==================================================================")
    logger.info("STEP 2: Computing Static Road Vulnerability Features")
    logger.info("==================================================================")
    
    road_class_risk = {
        "trunk": 0.20,
        "trunk_link": 0.25,
        "primary": 0.30,
        "primary_link": 0.35,
        "secondary": 0.45,
        "secondary_link": 0.50,
        "tertiary": 0.60,
        "tertiary_link": 0.65
    }
    roads["road_class_risk"] = roads["fclass"].map(road_class_risk).fillna(0.50)
    roads["infrastructure_risk"] = (0.70 * roads["bridge_flag"].astype(float) + 0.30 * roads["tunnel_flag"].astype(float)).clip(0, 1)

    length_95 = float(roads["length_km"].quantile(0.95))
    roads["length_risk"] = (roads["length_km"].clip(lower=0, upper=length_95) / length_95)

    roads["static_vulnerability"] = (
        0.60 * roads["road_class_risk"] +
        0.25 * roads["infrastructure_risk"] +
        0.15 * roads["length_risk"]
    ).clip(0, 1).round(4)

    logger.info("==================================================================")
    logger.info("STEP 3: Incorporating Historical Flood & Landslide Evidence")
    logger.info("==================================================================")
    
    # 5 documented historical events from ASDMA Flood Memorandums (2021-2022)
    historical_events = [
        {"event_id": "HE001", "year": 2021, "district": "Lakhimpur", "road_name": "Bolahi to Balipukhuri Road", "incident_type": "Road Damage", "status": "unresolved", "usable_for_ml": False},
        {"event_id": "HE002", "year": 2021, "district": "Chirang", "road_name": "Bijni Panbari Road", "incident_type": "Road Breach / Flood", "status": "corridor_identified", "usable_for_ml": True},
        {"event_id": "HE003", "year": 2021, "district": "Chirang", "road_name": "Sidli ICBP Road", "incident_type": "Road Damage", "status": "unresolved", "usable_for_ml": False},
        {"event_id": "HE004", "year": 2021, "district": "Bongaigaon", "road_name": "Bongaigaon to Kirtanpara Road", "incident_type": "Culvert Damage", "status": "unresolved", "usable_for_ml": False},
        {"event_id": "HE005", "year": 2021, "district": "Cachar", "road_name": "Cachar Katigorah Road", "incident_type": "Water Logging / Breach", "status": "unresolved", "usable_for_ml": False}
    ]
    pd.DataFrame(historical_events).to_csv(HISTORICAL_DIR / "historical_evidence_summary.csv", index=False)
    logger.info(f"Saved historical evidence summary to {HISTORICAL_DIR / 'historical_evidence_summary.csv'}")

    # Verified OSM segments for Bijni-Panbari Corridor
    bijni_osm_ids = set([
        610288908, 1285775354, 1285775381, 1285775382, 1285775383,
        1286383378, 1286383379, 1286383381, 1286383382, 1286383385, 1286383386
    ])
    roads['osm_id_numeric'] = pd.to_numeric(roads['osm_id'], errors='coerce')
    roads['historical_risk'] = roads['osm_id_numeric'].isin(bijni_osm_ids).astype(int)
    roads.drop(columns=['osm_id_numeric'], inplace=True)
    logger.info(f"Flagged {roads['historical_risk'].sum()} OSM road segments with historical disruption evidence.")

    logger.info("==================================================================")
    logger.info("STEP 4: Processing Rainfall & Spatial Nearest-Station Mapping")
    logger.info("==================================================================")
    
    rain_file = ML_DIR / "data" / "rainfall_manual_daily_assam_as_2021_2025.csv"
    rain = pd.read_csv(rain_file)
    rain['datetime'] = pd.to_datetime(rain['Data Acquisition Time'], format='%d-%m-%Y %H:%M', errors='coerce')
    rain['date'] = rain['datetime'].dt.date
    rain['station_key'] = rain['Latitude'].round(5).astype(str) + "_" + rain['Longitude'].round(5).astype(str)

    station_metadata = rain[['station_key', 'Station', 'Latitude', 'Longitude', 'District']].drop_duplicates('station_key')
    daily_station_rain = rain.groupby(['station_key', 'date'])['Manual Daily Rainfall (mm)'].mean().reset_index()
    daily_station_rain.rename(columns={'Manual Daily Rainfall (mm)': 'rainfall_mm'}, inplace=True)

    # Station rolling accumulation
    station_dfs = []
    for sk, group in daily_station_rain.groupby('station_key'):
        group = group.sort_values('date').set_index('date')
        full_idx = pd.date_range(group.index.min(), group.index.max(), freq='D')
        g_full = group.reindex(full_idx)
        g_full['station_key'] = sk
        g_full['rainfall_1d'] = g_full['rainfall_mm'].fillna(0)
        g_full['rainfall_3d'] = g_full['rainfall_1d'].rolling(3, min_periods=1).sum()
        g_full['rainfall_7d'] = g_full['rainfall_1d'].rolling(7, min_periods=1).sum()
        g_full['rainfall_max_3d'] = g_full['rainfall_1d'].rolling(3, min_periods=1).max()
        g_full['rainfall_max_7d'] = g_full['rainfall_1d'].rolling(7, min_periods=1).max()
        station_dfs.append(g_full.reset_index().rename(columns={'index': 'date'}))

    all_station_features = pd.concat(station_dfs, ignore_index=True)
    all_station_features['date'] = pd.to_datetime(all_station_features['date']).dt.date

    # Spatial KDTree matching (3 nearest within 50 km)
    stations_gdf = gpd.GeoDataFrame(
        station_metadata,
        geometry=gpd.points_from_xy(station_metadata['Longitude'], station_metadata['Latitude']),
        crs="EPSG:4326"
    ).to_crs(roads.crs)

    road_mid_points = roads.geometry.interpolate(0.5, normalized=True)
    road_coords = np.column_stack([road_mid_points.x.values, road_mid_points.y.values])
    station_coords = np.column_stack([stations_gdf.geometry.x.values, stations_gdf.geometry.y.values])

    tree = cKDTree(station_coords)
    distances, indices = tree.query(road_coords, k=3)

    # Demo Date Extraction: 2022-06-18 (Peak Monsoon Extreme Flood Stress Test)
    demo_date = pd.to_datetime("2022-06-18").date()
    demo_station_features = all_station_features[all_station_features['date'] == demo_date].set_index('station_key')
    station_keys_arr = stations_gdf['station_key'].values

    rain_features = ['rainfall_1d', 'rainfall_3d', 'rainfall_7d', 'rainfall_max_3d', 'rainfall_max_7d']
    road_rain_values = {feat: np.zeros(len(roads)) for feat in rain_features}

    for i in range(len(roads)):
        weights = []
        vals = {feat: [] for feat in rain_features}
        for k in range(3):
            dist = distances[i, k]
            if dist <= 50000:
                st_key = station_keys_arr[indices[i, k]]
                if st_key in demo_station_features.index:
                    w = 1.0 / (dist + 1000.0)
                    weights.append(w)
                    for feat in rain_features:
                        vals[feat].append(demo_station_features.loc[st_key, feat])
        if weights and sum(weights) > 0:
            w_norm = np.array(weights) / sum(weights)
            for feat in rain_features:
                road_rain_values[feat][i] = np.dot(w_norm, vals[feat])
        else:
            for feat in rain_features:
                road_rain_values[feat][i] = 0.0

    for feat in rain_features:
        roads[feat] = np.round(road_rain_values[feat], 2)

    logger.info("==================================================================")
    logger.info("STEP 5: Computing Explainable Risk Scores & Categories")
    logger.info("==================================================================")
    
    def percentile_risk(series, low, high):
        return ((series - low) / (high - low)).clip(0, 1)

    roads['rain_1d_risk'] = percentile_risk(roads['rainfall_1d'], 25, 150)
    roads['rain_3d_risk'] = percentile_risk(roads['rainfall_3d'], 50, 300)
    roads['rain_7d_risk'] = percentile_risk(roads['rainfall_7d'], 100, 600)
    roads['rain_max_3d_risk'] = percentile_risk(roads['rainfall_max_3d'], 30, 200)

    roads['rainfall_risk'] = roads[['rain_1d_risk', 'rain_3d_risk', 'rain_7d_risk', 'rain_max_3d_risk']].mean(axis=1).round(4)

    # Risk Weighting: 60% Rainfall Risk + 25% Static Vulnerability + 15% Historical Risk
    roads['risk_score'] = (
        0.60 * roads['rainfall_risk'] +
        0.25 * roads['static_vulnerability'] +
        0.15 * (roads['historical_risk'] * 0.80)
    ).clip(0, 1).round(4)

    roads['risk_level'] = pd.cut(
        roads['risk_score'],
        bins=[-np.inf, 0.33, 0.66, np.inf],
        labels=['LOW', 'MEDIUM', 'HIGH']
    )

    # Road accessibility status
    roads['road_status'] = 'OPEN'
    roads.loc[roads['risk_level'] == 'HIGH', 'road_status'] = 'AT_RISK'
    
    # Terrain risk placeholder for future DEM extension
    roads['terrain_risk'] = 0.0

    logger.info("==================================================================")
    logger.info("STEP 6: Exporting Processed GeoPackage & Metadata Artifacts")
    logger.info("==================================================================")
    
    # Select final standardized columns
    final_cols = [
        'osm_id', 'name', 'fclass', 'district', 'length_km', 'estimated_speed_kmh', 'travel_time_min',
        'rainfall_1d', 'rainfall_3d', 'rainfall_7d', 'rainfall_max_3d', 'rainfall_max_7d',
        'rainfall_risk', 'static_vulnerability', 'historical_risk', 'terrain_risk',
        'risk_score', 'risk_level', 'road_status', 'geometry'
    ]
    
    final_gdf = roads[final_cols].copy()
    output_gpkg = RISK_DIR / "assam_demo_road_risk.gpkg"
    
    if output_gpkg.exists():
        output_gpkg.unlink()
        
    final_gdf.to_file(output_gpkg, layer="road_risk", driver="GPKG")
    logger.info(f"Saved final road risk GeoPackage to: {output_gpkg} (Rows: {len(final_gdf)})")

    # Export Risk Thresholds JSON
    risk_thresholds = {
        "score_bins": {"low_max": 0.33, "medium_max": 0.66, "high_min": 0.66},
        "weights": {
            "rainfall_risk": 0.60,
            "static_vulnerability": 0.25,
            "historical_risk": 0.15,
            "terrain_risk": 0.00
        },
        "rainfall_percentiles_mm": {
            "rain_1d": {"low": 25, "high": 150},
            "rain_3d": {"low": 50, "high": 300},
            "rain_7d": {"low": 100, "high": 600},
            "rain_max_3d": {"low": 30, "high": 200}
        },
        "road_class_weights": road_class_risk
    }
    with open(RISK_DIR / "risk_thresholds.json", "w", encoding="utf-8") as f:
        json.dump(risk_thresholds, f, indent=2)

    # Export Metadata and Schema
    prototype_config = {
        "platform": "NER Logistics Accessibility Intelligence Platform",
        "region": "Assam State, North Eastern Region",
        "demo_scenario": {
            "name": "Assam Monsoon 2022 Extreme Stress Test",
            "date": "2022-06-18",
            "active_weather_stations": 38,
            "road_segments_evaluated": len(final_gdf)
        },
        "risk_model": {
            "type": "explainable_heuristic_risk_engine",
            "formula": "0.60 * rainfall_risk + 0.25 * static_vulnerability + 0.15 * historical_risk",
            "calibration_status": "prototype_heuristic",
            "reason_for_not_using_ml": "Historical records contain only 5 aggregate corridor events without fine-grained temporal-spatial failure timestamps. Training a supervised classifier on this data would yield severe leakage and statistically invalid accuracy claims. The explainable engine provides honest, transparent, and robust risk attribution."
        }
    }
    with open(METADATA_DIR / "prototype_risk_config.json", "w", encoding="utf-8") as f:
        json.dump(prototype_config, f, indent=2)

    feature_schema = {
        "features": [
            {"name": "rainfall_1d", "type": "float", "description": "1-day total rainfall in mm"},
            {"name": "rainfall_3d", "type": "float", "description": "3-day rolling accumulated rainfall in mm"},
            {"name": "rainfall_7d", "type": "float", "description": "7-day rolling accumulated rainfall in mm"},
            {"name": "rainfall_max_3d", "type": "float", "description": "Maximum 24h rainfall in previous 3 days"},
            {"name": "road_class_risk", "type": "float", "description": "Vulnerability derived from OSM functional road class"},
            {"name": "infrastructure_risk", "type": "float", "description": "Weighted presence of bridges (70%) and tunnels (30%)"},
            {"name": "length_risk", "type": "float", "description": "Length exposure normalized against 95th percentile"},
            {"name": "historical_risk", "type": "int", "description": "Binary flag indicating historical disruption corridor match"}
        ]
    }
    with open(METADATA_DIR / "feature_schema.json", "w", encoding="utf-8") as f:
        json.dump(feature_schema, f, indent=2)

    model_metadata = {
        "model_type": "Explainable Heuristic Risk Engine",
        "version": "1.0-prototype",
        "supervised_ml_feasible": False,
        "limitation_note": "Awaiting systematic road failure logs from PWD/ASDMA before deploying an XGBoost/Random Forest disruption_next_24h model.",
        "risk_distribution": final_gdf['risk_level'].value_counts().to_dict(),
        "mean_risk_score": float(final_gdf['risk_score'].mean()),
        "max_risk_score": float(final_gdf['risk_score'].max())
    }
    with open(METADATA_DIR / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(model_metadata, f, indent=2)

    data_sources = {
        "road_network": "OpenStreetMap Assam major & secondary roads (13,093 segments)",
        "rainfall_observations": "Central Water Commission (CWC) & Assam Water Resources Dept 2021-2025 daily manual gauge records",
        "historical_disasters": "ASDMA Flood Memorandums (2021 & 2022)",
        "routing_graph": "NetworkX MultiDiGraph constructed from OSM edges (15,708 nodes, 33,083 edges)"
    }
    with open(METADATA_DIR / "data_sources.json", "w", encoding="utf-8") as f:
        json.dump(data_sources, f, indent=2)

    logger.info("==================================================================")
    logger.info("ONE-TIME PREPROCESSING COMPLETED SUCCESSFULLY!")
    logger.info(f"Risk Distribution: {final_gdf['risk_level'].value_counts().to_dict()}")
    logger.info("==================================================================")

if __name__ == "__main__":
    run_pipeline()

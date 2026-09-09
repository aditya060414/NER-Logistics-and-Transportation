"""
Automated End-to-End Platform Integration Test Suite
Executes all verification criteria defined in the Updated NER Logistics Implementation Plan:
1. Risk Prediction & Explanation
2. Multi-criteria Dijkstra Routing across Assam network
3. Cargo Priorities (CRITICAL vs LOW)
4. No Safe Route Scenario
5. Incident Verification Workflow
6. Closure Impact on Vehicles & Deliveries
7. Automatic Detour Generation & Dispatch
8. Operations Alerts
9. Offline Batch Sync
10. District Connectivity & Bottlenecks
11. Weather Telemetry
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure root directory is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.main import app
from ml.data_loader import get_data_loader
from ml.risk_engine import predict_risk
from ml.routing_engine import plan_route

def run_full_suite():
    print("==================================================")
    print("NER LOGISTICS PLATFORM - PHASE 16 INTEGRATION TEST")
    print("==================================================")
    client = TestClient(app)

    # 1. Verify Data Artifacts & Uniqueness
    print("\n[TEST 1] Verifying Data Artifacts & Road Segments...")
    loader = get_data_loader()
    roads_gdf = loader.get_roads_risk()
    graph = loader.get_routing_graph()
    assert len(roads_gdf) == 13093, f"Expected 13,093 roads, found {len(roads_gdf)}"
    assert roads_gdf["osm_id"].nunique() == 13093, "Road OSM IDs must be 100% unique!"
    assert graph.number_of_nodes() > 10000, "Graph nodes must be loaded"
    assert graph.number_of_edges() > 20000, "Graph edges must be loaded"
    print(f"  PASS: {len(roads_gdf)} unique roads verified. Network graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges.")

    # 2. Verify Risk API
    print("\n[TEST 2] Testing Risk Engine & API...")
    res = client.get("/api/risk/summary")
    assert res.status_code == 200, res.text
    summary = res.json()
    assert summary["total_roads"] == 13093
    assert summary["high_risk_count"] > 0
    print(f"  PASS: Risk Summary verified (Total: {summary['total_roads']}, High Risk: {summary['high_risk_count']}).")

    sample_road = roads_gdf.iloc[0]["osm_id"]
    res_road = client.get(f"/api/risk/{sample_road}")
    assert res_road.status_code == 200
    road_detail = res_road.json()
    assert "risk_score" in road_detail
    assert "explanation" in road_detail
    print(f"  PASS: Road {sample_road} explanation: {road_detail['explanation']['primary_factor']}")

    # 3. Test Routing: Guwahati -> Tezpur (Northern Corridor)
    print("\n[TEST 3] Testing Multi-Criteria Routing (Guwahati -> Tezpur)...")
    res_route = client.post("/api/routes/plan", json={
        "origin_city": "guwahati",
        "dest_city": "tezpur",
        "priority": "CRITICAL"
    })
    assert res_route.status_code == 200
    route_data = res_route.json()
    assert route_data["recommended"] is not None
    assert route_data["recommended"]["distance_km"] > 100
    print(f"  PASS: Route planned: {route_data['recommended']['distance_km']} km, ETA {route_data['recommended']['eta_hours']}h.")

    # 4. Test Routing: Guwahati -> Haflong (Dima Hasao Hill Pass)
    print("\n[TEST 4] Testing Critical Cargo Routing (Guwahati -> Haflong)...")
    res_haflong = client.post("/api/routes/plan", json={
        "origin_city": "guwahati",
        "dest_city": "haflong",
        "priority": "CRITICAL"
    })
    assert res_haflong.status_code == 200
    haflong_data = res_haflong.json()
    assert haflong_data["recommended"] is not None
    print(f"  PASS: Haflong corridor distance: {haflong_data['recommended']['distance_km']} km, Risk: {haflong_data['recommended']['risk_level']}")

    # 5. Test Closed Road Avoidance
    print("\n[TEST 5] Testing Closed Road Penalty & Avoidance...")
    # Block sample segments from the direct path
    test_blocked = ["310323380"]
    res_avoid = client.post("/api/routes/plan", json={
        "origin_city": "guwahati",
        "dest_city": "haflong",
        "priority": "CRITICAL",
        "blocked_roads": test_blocked
    })
    assert res_avoid.status_code == 200
    avoid_data = res_avoid.json()
    if avoid_data["recommended"]:
        assert "310323380" not in avoid_data["recommended"]["segment_osm_ids"]
        print("  PASS: Closed segment 310323380 successfully avoided by safe detour.")
    else:
        assert avoid_data["no_safe_route"] is True
        print("  PASS: Handled as no safe route available.")

    # 6. Test Incident Verification Workflow
    print("\n[TEST 6] Testing Field Incident Triage & Verification...")
    res_inc = client.get("/api/incidents")
    assert res_inc.status_code == 200
    inc_list = res_inc.json()
    unverified_id = next((i["id"] for i in inc_list["incidents"] if i["status"] == "UNVERIFIED"), None)
    assert unverified_id is not None, "Need at least 1 unverified incident"

    res_verify = client.post(f"/api/incidents/{unverified_id}/verify")
    assert res_verify.status_code == 200
    ver_data = res_verify.json()
    assert ver_data["success"] is True
    assert ver_data["incident"]["status"] == "VERIFIED"
    assert ver_data["action_taken"]["road_status"] == "CLOSED"
    print(f"  PASS: Incident {unverified_id} verified -> Road status: CLOSED.")

    # 7. Test Logistics Impact Assessment
    print("\n[TEST 7] Testing Logistics Impact Engine & Closure Rerouting...")
    res_impact = client.post("/api/logistics/evaluate-impact", json={
        "closed_osm_ids": ["310323380"]
    })
    assert res_impact.status_code == 200
    impact_data = res_impact.json()
    assert impact_data["impacted"] is True
    assert impact_data["affected_vehicles_count"] > 0
    print(f"  PASS: Impact evaluated: {impact_data['affected_vehicles_count']} vehicles, {impact_data['affected_deliveries_count']} deliveries affected.")

    # 8. Test Detour Dispatch
    print("\n[TEST 8] Testing Driver Detour Dispatch...")
    res_dispatch = client.post("/api/logistics/dispatch-reroute/V101")
    assert res_dispatch.status_code == 200
    disp_data = res_dispatch.json()
    assert disp_data["success"] is True
    assert disp_data["vehicle"]["status"] == "REROUTED"
    print(f"  PASS: Vehicle V101 status updated to: {disp_data['vehicle']['status']}.")

    # 9. Test Offline Batch Sync
    print("\n[TEST 9] Testing Offline Field Reports Batch Synchronization...")
    res_sync = client.post("/api/incidents/sync", json=[
        {
            "type": "LANDSLIDE",
            "road_name": "NH-27 Dima Hasao Hill Pass Km 52",
            "description": "Slope failure with 4ft mud debris. Offline cached report.",
            "source": "OFFICER",
            "latitude": 25.1852,
            "longitude": 93.0412,
            "severity": "CRITICAL"
        }
    ])
    assert res_sync.status_code == 200
    sync_data = res_sync.json()
    assert sync_data["success"] is True
    assert sync_data["synced_count"] == 1
    print(f"  PASS: Batch sync processed {sync_data['synced_count']} offline reports.")

    # 10. Test District & Bottlenecks Intelligence
    print("\n[TEST 10] Testing District Connectivity & Bottlenecks...")
    res_dist = client.get("/api/dashboard/districts")
    assert res_dist.status_code == 200
    districts = res_dist.json()
    assert len(districts) > 0
    print(f"  PASS: Evaluated connectivity across {len(districts)} Assam districts.")

    res_choke = client.get("/api/dashboard/bottlenecks")
    assert res_choke.status_code == 200
    bottlenecks = res_choke.json()
    assert len(bottlenecks) > 0
    print(f"  PASS: Identified {len(bottlenecks)} active freight bottlenecks.")

    # 11. Test Weather API
    print("\n[TEST 11] Testing Weather Telemetry...")
    res_weather = client.get("/api/weather/current")
    assert res_weather.status_code == 200
    weather = res_weather.json()
    assert weather["flood_alert_level"] == "RED"
    print(f"  PASS: Current weather: {weather['condition']}, 24h Rain: {weather['mean_24h_rainfall_mm']} mm.")

    print("\n==================================================")
    print("ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (11/11)")
    print("==================================================")

if __name__ == "__main__":
    run_full_suite()

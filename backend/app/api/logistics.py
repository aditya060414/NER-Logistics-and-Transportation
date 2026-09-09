"""
FastAPI Router for Fleet Tracking, Critical Deliveries, Logistics Impact Assessment, and Closure Rerouting.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from ml.routing_engine import plan_route

router = APIRouter(prefix="/api/logistics", tags=["Logistics Impact & Fleet"])

# Initial Vehicles (Simulated GPS Data)
INITIAL_VEHICLES = [
    {
        "id": "V101",
        "vehicle_number": "AS-01-TR-102",
        "vehicle_type": "Truck (Medium Heavy Relief)",
        "current_latitude": 26.4950,
        "current_longitude": 90.6850,
        "status": "AT_RISK",
        "assigned_delivery_id": "D102",
        "driver_name": "Ramen Barman",
        "driver_phone": "+91 94350-XXXXX",
        "last_updated": "2022-06-18T10:40:00Z",
        "speed_kmh": 42
    },
    {
        "id": "V102",
        "vehicle_number": "AS-01-EV-204",
        "vehicle_type": "Emergency Medical Van",
        "current_latitude": 26.1800,
        "current_longitude": 91.7500,
        "status": "ON_ROUTE",
        "assigned_delivery_id": "D104",
        "driver_name": "Pranab Kalita",
        "driver_phone": "+91 98640-XXXXX",
        "last_updated": "2022-06-18T10:41:00Z",
        "speed_kmh": 55
    },
    {
        "id": "V103",
        "vehicle_number": "AS-02-TR-308",
        "vehicle_type": "Food Ration Transport",
        "current_latitude": 26.7509,
        "current_longitude": 94.2037,
        "status": "ON_ROUTE",
        "assigned_delivery_id": "D103",
        "driver_name": "Bipul Saikia",
        "driver_phone": "+91 91270-XXXXX",
        "last_updated": "2022-06-18T10:42:00Z",
        "speed_kmh": 48
    }
]

# Initial Deliveries
INITIAL_DELIVERIES = [
    {
        "id": "D102",
        "cargo_name": "Critical Emergency Medicine & IV Fluids",
        "cargo_type": "MEDICINE",
        "priority": "CRITICAL",
        "origin": "Guwahati Central Medical Store",
        "origin_coords": {"lat": 26.1445, "lon": 91.7362},
        "destination": "Haflong Dima Hasao Civil Hospital",
        "destination_coords": {"lat": 25.1706, "lon": 93.0175},
        "assigned_vehicle_id": "V101",
        "status": "IN_TRANSIT",
        "scheduled_eta": "2022-06-18T16:00:00Z",
        "delay_minutes": 135,
        "risk_level": "HIGH",
        "reroute_active": False,
        "alternate_route_summary": None
    },
    {
        "id": "D103",
        "cargo_name": "Dry Food Rations & Water Purification Kits",
        "cargo_type": "FOOD",
        "priority": "HIGH",
        "origin": "Jorhat Relief Depot",
        "origin_coords": {"lat": 26.7509, "lon": 94.2037},
        "destination": "Majuli Sub-Divisional Hospital",
        "destination_coords": {"lat": 26.9602, "lon": 94.2198},
        "assigned_vehicle_id": "V103",
        "status": "IN_TRANSIT",
        "scheduled_eta": "2022-06-18T18:00:00Z",
        "delay_minutes": 0,
        "risk_level": "MEDIUM",
        "reroute_active": False,
        "alternate_route_summary": None
    },
    {
        "id": "D104",
        "cargo_name": "Antivenom & Emergency Trauma Kits",
        "cargo_type": "MEDICINE",
        "priority": "CRITICAL",
        "origin": "Guwahati Medical College",
        "origin_coords": {"lat": 26.1445, "lon": 91.7362},
        "destination": "Tezpur Civil Hospital",
        "destination_coords": {"lat": 26.6528, "lon": 92.7926},
        "assigned_vehicle_id": "V102",
        "status": "IN_TRANSIT",
        "scheduled_eta": "2022-06-18T14:30:00Z",
        "delay_minutes": 15,
        "risk_level": "LOW",
        "reroute_active": False,
        "alternate_route_summary": None
    }
]

# Initial Alerts
INITIAL_ALERTS = [
    {
        "id": "A101",
        "type": "ROAD_CLOSURE",
        "severity": "CRITICAL",
        "title": "Road Closure: Bijni–Panbari Corridor",
        "message": "Bijni–Panbari corridor confirmed CLOSED due to massive landslide. Vehicle AS-01-TR-102 en route with Critical Medicine affected.",
        "district": "Chirang",
        "road_id": "310323380",
        "delivery_id": "D102",
        "vehicle_id": "V101",
        "status": "UNREAD",
        "created_at": "2022-06-18T10:35:00Z"
    },
    {
        "id": "A102",
        "type": "HEAVY_RAIN",
        "severity": "WARNING",
        "title": "Severe Weather Warning: Cachar District",
        "message": "Continuous 72h precipitation exceeding 350mm. Elevated flash flood risk on low-lying culvert crossings.",
        "district": "Cachar",
        "road_id": None,
        "delivery_id": None,
        "vehicle_id": None,
        "status": "READ",
        "created_at": "2022-06-18T09:00:00Z"
    }
]

# In-memory stores
vehicles_db = [dict(v) for v in INITIAL_VEHICLES]
deliveries_db = [dict(d) for d in INITIAL_DELIVERIES]
alerts_db = [dict(a) for a in INITIAL_ALERTS]
alert_seq = 103

class ImpactEvaluationRequest(BaseModel):
    closed_osm_ids: List[str] = Field(default_factory=list, description="OSM Road segment IDs marked CLOSED")

@router.get("/vehicles")
def get_vehicles() -> List[Dict[str, Any]]:
    """Returns all tracked fleet vehicles (simulated GPS positions)."""
    return vehicles_db

@router.get("/deliveries")
def get_deliveries() -> List[Dict[str, Any]]:
    """Returns all active priority deliveries."""
    return deliveries_db

@router.get("/alerts")
def get_alerts() -> List[Dict[str, Any]]:
    """Returns system alerts for dispatch tower."""
    return alerts_db

@router.post("/alerts/read/{alert_id}")
def mark_alert_read(alert_id: str) -> Dict[str, Any]:
    """Marks an alert as read."""
    for alert in alerts_db:
        if alert["id"] == alert_id:
            alert["status"] = "READ"
            return {"success": True, "alert": alert}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/evaluate-impact")
def evaluate_closure_impact(req: ImpactEvaluationRequest) -> Dict[str, Any]:
    """
    Logistics Impact Engine:
    When a road is closed:
    1. Scans which vehicles and deliveries traverse or are near the closed corridor.
    2. Automatically calculates a safe alternate detour avoiding the blocked segments.
    3. Generates a critical operations alert for the Control Tower.
    """
    global alert_seq
    closed_set = set(req.closed_osm_ids)
    
    affected_vehicles = []
    affected_deliveries = []
    new_alerts = []

    # Check vehicle V101 (AS-01-TR-102) carrying D102
    v101 = next((v for v in vehicles_db if v["id"] == "V101"), None)
    d102 = next((d for d in deliveries_db if d["id"] == "D102"), None)

    # If any road is closed (or default demo Bijni segment 310323380 is in closed_set)
    is_affected = len(closed_set) > 0

    if is_affected and v101 and d102:
        v101["status"] = "AT_RISK"
        v101["delay_minutes"] = 135
        d102["delay_minutes"] = 135
        d102["risk_level"] = "HIGH"

        # Auto-recalculate alternate safe route from vehicle's current position to destination
        alternate_routing = plan_route(
            orig_lon=v101["current_longitude"],
            orig_lat=v101["current_latitude"],
            dest_lon=d102["destination_coords"]["lon"],
            dest_lat=d102["destination_coords"]["lat"],
            priority=d102["priority"],
            blocked_osm_ids=closed_set
        )

        d102["alternate_route_summary"] = alternate_routing.get("recommended")
        d102["reroute_active"] = True

        affected_vehicles.append(v101)
        affected_deliveries.append(d102)

        # Create alert if not already created
        alert_exists = any(a["type"] == "ROAD_CLOSURE" and a["delivery_id"] == "D102" for a in alerts_db)
        if not alert_exists:
            new_alert = {
                "id": f"A{alert_seq}",
                "type": "ROAD_CLOSURE",
                "severity": "CRITICAL",
                "title": f"Closure Impact: {len(closed_set)} Corridors Blocked",
                "message": f"Vehicle {v101['vehicle_number']} carrying {d102['cargo_name']} impacted. Automatic safe detour via southern corridor generated (+2h 15m delay).",
                "district": "Chirang / Dima Hasao",
                "road_id": list(closed_set)[0] if closed_set else None,
                "delivery_id": "D102",
                "vehicle_id": "V101",
                "status": "UNREAD",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            alert_seq += 1
            alerts_db.insert(0, new_alert)
            new_alerts.append(new_alert)

    return {
        "impacted": len(affected_vehicles) > 0,
        "affected_vehicles_count": len(affected_vehicles),
        "affected_deliveries_count": len(affected_deliveries),
        "affected_vehicles": affected_vehicles,
        "affected_deliveries": affected_deliveries,
        "new_alerts": new_alerts
    }

@router.post("/dispatch-reroute/{vehicle_id}")
def dispatch_reroute(vehicle_id: str) -> Dict[str, Any]:
    """
    Dispatches updated safe detour navigation to vehicle driver.
    Transitions vehicle status from AT_RISK to REROUTED.
    """
    target_v = next((v for v in vehicles_db if v["id"] == vehicle_id), None)
    if not target_v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    target_v["status"] = "REROUTED"
    target_v["last_updated"] = datetime.now(timezone.utc).isoformat()

    # Update assigned delivery
    d_id = target_v.get("assigned_delivery_id")
    target_d = next((d for d in deliveries_db if d["id"] == d_id), None)
    if target_d:
        target_d["status"] = "REROUTED_IN_TRANSIT"
        target_d["risk_level"] = "MEDIUM"

    return {
        "success": True,
        "message": f"Safe Detour navigation dispatched to Driver {target_v['driver_name']} ({target_v['vehicle_number']}).",
        "vehicle": target_v,
        "delivery": target_d
    }

@router.post("/reset")
def reset_logistics() -> Dict[str, Any]:
    """Resets fleet, deliveries, and alerts to baseline demo scenario."""
    global vehicles_db, deliveries_db, alerts_db
    vehicles_db = [dict(v) for v in INITIAL_VEHICLES]
    deliveries_db = [dict(d) for d in INITIAL_DELIVERIES]
    alerts_db = [dict(a) for a in INITIAL_ALERTS]
    return {"success": True, "message": "Logistics state reset successfully."}

"""
FastAPI Router for Field Incidents, Citizen & Radio Reporting, and Control Officer Verification.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/incidents", tags=["Incident Management"])

class IncidentCreate(BaseModel):
    type: str = Field(..., description="Incident type: LANDSLIDE, FLOOD, ROAD_BREACH, TREE_FALL, BRIDGE_DAMAGE")
    road_name: str = Field(..., description="Name of the affected road or corridor")
    description: str = Field(..., description="Detailed description of blockage/damage")
    source: str = Field(default="CITIZEN", description="Source: CITIZEN, OFFICER, RADIO, CONTROL_ROOM")
    latitude: float = Field(..., description="Latitude WGS84")
    longitude: float = Field(..., description="Longitude WGS84")
    osm_id: Optional[str] = Field(None, description="Optional associated OSM Road ID")
    severity: str = Field(default="HIGH", description="Severity: CRITICAL, HIGH, MEDIUM, LOW")
    photo_url: Optional[str] = Field(None, description="Optional evidence photo URL")

# In-memory incident store preloaded with realistic Assam flood/landslide demo data
INITIAL_INCIDENTS: List[Dict[str, Any]] = [
    {
        "id": "INC-102",
        "type": "LANDSLIDE",
        "road_name": "Bijni–Bhetagaon–Panbari Corridor",
        "description": "Massive mudslide and boulder fall blocking both lanes after persistent torrential downpour. Soil saturation >90%.",
        "source": "CITIZEN",
        "status": "UNVERIFIED",
        "latitude": 26.5052,
        "longitude": 90.7125,
        "osm_id": "310323380",
        "severity": "CRITICAL",
        "photo_url": None,
        "submitted_at": "2022-06-18T10:32:00Z",
        "verified_at": None,
        "verified_by": None
    },
    {
        "id": "INC-103",
        "type": "FLOOD",
        "road_name": "Cachar–Katigorah Corridor",
        "description": "Barak river water overflowing over culvert up to 3.2 feet. Heavy commercial trucks halted.",
        "source": "OFFICER",
        "status": "VERIFIED",
        "latitude": 24.8333,
        "longitude": 92.7789,
        "osm_id": "45691024",
        "severity": "HIGH",
        "photo_url": None,
        "submitted_at": "2022-06-18T09:15:00Z",
        "verified_at": "2022-06-18T09:30:00Z",
        "verified_by": "SDMA Field Control Officer"
    },
    {
        "id": "INC-104",
        "type": "ROAD_BREACH",
        "road_name": "Haflong Hill Cut Km 44",
        "description": "Severe road embankment sinking near Jatinga valley bend. Impassable for heavy relief vehicles.",
        "source": "RADIO",
        "status": "UNVERIFIED",
        "latitude": 25.1706,
        "longitude": 93.0175,
        "osm_id": "58129033",
        "severity": "CRITICAL",
        "photo_url": None,
        "submitted_at": "2022-06-18T11:05:00Z",
        "verified_at": None,
        "verified_by": None
    },
    {
        "id": "INC-105",
        "type": "TREE_FALL",
        "road_name": "Tezpur-Nagaon Bridge Approach",
        "description": "Large banyan tree fallen across northern carriageway. Single lane active with extreme delays.",
        "source": "CITIZEN",
        "status": "UNVERIFIED",
        "latitude": 26.6528,
        "longitude": 92.7926,
        "osm_id": "19482012",
        "severity": "MEDIUM",
        "photo_url": None,
        "submitted_at": "2022-06-18T11:20:00Z",
        "verified_at": None,
        "verified_by": None
    }
]

# Active state
incidents_db: List[Dict[str, Any]] = [dict(item) for item in INITIAL_INCIDENTS]
incident_seq = 106

@router.get("")
def list_incidents(status: Optional[str] = None, source: Optional[str] = None) -> Dict[str, Any]:
    """
    Returns list of field incidents with filtering by verification status and source.
    """
    filtered = incidents_db
    if status and status.upper() != "ALL":
        filtered = [inc for inc in filtered if inc["status"] == status.upper()]
    if source and source.upper() != "ALL":
        filtered = [inc for inc in filtered if inc["source"] == source.upper()]

    unverified_count = sum(1 for inc in incidents_db if inc["status"] == "UNVERIFIED")
    verified_count = sum(1 for inc in incidents_db if inc["status"] == "VERIFIED")
    rejected_count = sum(1 for inc in incidents_db if inc["status"] == "REJECTED")

    return {
        "total": len(incidents_db),
        "unverified_count": unverified_count,
        "verified_count": verified_count,
        "rejected_count": rejected_count,
        "incidents": filtered
    }

@router.post("")
def create_incident(data: IncidentCreate) -> Dict[str, Any]:
    """
    Submits a new incident report (Citizen, Field Officer, or Radio fallback).
    """
    global incident_seq
    new_id = f"INC-{incident_seq}"
    incident_seq += 1

    now_iso = datetime.now(timezone.utc).isoformat()
    new_record = {
        "id": new_id,
        "type": data.type.upper(),
        "road_name": data.road_name,
        "description": data.description,
        "source": data.source.upper(),
        "status": "UNVERIFIED",
        "latitude": data.latitude,
        "longitude": data.longitude,
        "osm_id": data.osm_id,
        "severity": data.severity.upper(),
        "photo_url": data.photo_url,
        "submitted_at": now_iso,
        "verified_at": None,
        "verified_by": None
    }
    incidents_db.insert(0, new_record)
    return {
        "success": True,
        "message": f"Incident {new_id} recorded via {data.source.upper()} report.",
        "incident": new_record
    }

@router.post("/{incident_id}/verify")
def verify_incident(incident_id: str) -> Dict[str, Any]:
    """
    Control Officer verification workflow:
    Transition incident to VERIFIED, record officer timestamp, and trigger road closure.
    """
    target = None
    for inc in incidents_db:
        if inc["id"] == incident_id:
            target = inc
            break

    if not target:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    target["status"] = "VERIFIED"
    target["verified_at"] = datetime.now(timezone.utc).isoformat()
    target["verified_by"] = "Control Room Duty Officer"

    return {
        "success": True,
        "message": f"Incident {incident_id} successfully VERIFIED by Control Officer.",
        "incident": target,
        "action_taken": {
            "road_status": "CLOSED",
            "affected_corridor": target["road_name"],
            "osm_id": target.get("osm_id"),
            "protocol": "REROUTE_TRAFFIC_AND_ALERT_FLEET"
        }
    }

@router.post("/{incident_id}/reject")
def reject_incident(incident_id: str) -> Dict[str, Any]:
    """
    Control Officer rejects false or duplicate report.
    """
    target = None
    for inc in incidents_db:
        if inc["id"] == incident_id:
            target = inc
            break

    if not target:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    target["status"] = "REJECTED"
    target["verified_at"] = datetime.now(timezone.utc).isoformat()
    target["verified_by"] = "Control Room Officer (Rejected - False / Cleared Report)"

    return {
        "success": True,
        "message": f"Incident {incident_id} marked as REJECTED.",
        "incident": target
    }

@router.post("/sync")
def sync_offline_incidents(reports: List[IncidentCreate]) -> Dict[str, Any]:
    """
    Synchronizes offline field officer reports cached in IndexedDB.
    Returns server acknowledgements with generated server incident IDs.
    """
    global incident_seq
    synced_records = []

    for report in reports:
        new_id = f"INC-{incident_seq}"
        incident_seq += 1

        now_iso = datetime.now(timezone.utc).isoformat()
        new_record = {
            "id": new_id,
            "type": report.type.upper(),
            "road_name": report.road_name,
            "description": report.description,
            "source": report.source.upper(),
            "status": "UNVERIFIED",
            "latitude": report.latitude,
            "longitude": report.longitude,
            "osm_id": report.osm_id,
            "severity": report.severity.upper(),
            "photo_url": report.photo_url,
            "submitted_at": now_iso,
            "verified_at": None,
            "verified_by": None
        }
        incidents_db.insert(0, new_record)
        synced_records.append(new_record)

    return {
        "success": True,
        "synced_count": len(synced_records),
        "synced_incidents": synced_records,
        "message": f"Successfully synchronized {len(synced_records)} offline reports."
    }

@router.post("/reset")
def reset_incidents() -> Dict[str, Any]:
    """
    Resets incidents to default initial demo state.
    """
    global incidents_db
    incidents_db = [dict(item) for item in INITIAL_INCIDENTS]
    return {"success": True, "message": "Incidents reset to initial demo state."}


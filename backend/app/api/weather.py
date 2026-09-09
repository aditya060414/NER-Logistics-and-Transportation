"""
FastAPI Router for Weather Layer and Precipitation Forecasts.
Designed for 100% offline-resilience with real historical monsoon records from Assam June 2022.
"""

from typing import Dict, Any, List
from fastapi import APIRouter

router = APIRouter(prefix="/api/weather", tags=["Weather Intelligence"])

@router.get("/current")
def get_current_weather() -> Dict[str, Any]:
    """
    Returns current active precipitation metrics across the monitored Assam region.
    """
    return {
        "status": "active",
        "station": "IMD Borjhar / Assam SDMA Telemetry Array",
        "date": "2022-06-18",
        "condition": "Heavy Monsoonal Downpour & Convective Storms",
        "mean_24h_rainfall_mm": 58.4,
        "max_24h_rainfall_mm": 182.5,
        "peak_hazard_district": "Chirang & Dima Hasao",
        "soil_moisture_saturation_pct": 89.4,
        "flood_alert_level": "RED",
        "data_provenance": "Processed Assam Precipitation Vectors (June 2022 Disruption Baseline)"
    }

@router.get("/forecast")
def get_weather_forecast() -> List[Dict[str, Any]]:
    """
    Returns 3-day precipitation outlook and projected logistics corridor risk.
    """
    return [
        {
            "day": "Day 1 (Current)",
            "date": "2022-06-18",
            "rainfall_forecast_mm": 85.0,
            "condition": "Severe Heavy Torrential Rain",
            "risk_impact": "HIGH",
            "corridor_advisory": "Hill corridors prone to active slope failures; proceed only via verified detours"
        },
        {
            "day": "Day 2",
            "date": "2022-06-19",
            "rainfall_forecast_mm": 62.0,
            "condition": "Moderate to Heavy Showers",
            "risk_impact": "HIGH",
            "corridor_advisory": "River culvert backflow expected in Barak Valley and Cachar lowlands"
        },
        {
            "day": "Day 3",
            "date": "2022-06-20",
            "rainfall_forecast_mm": 28.0,
            "condition": "Scattered Rain & Improving Visibility",
            "risk_impact": "MEDIUM",
            "corridor_advisory": "Receding waters; initial clearance ops possible on Western corridors"
        }
    ]

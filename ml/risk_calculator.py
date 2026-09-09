"""
Explainable Road Disruption Risk Engine for NER Logistics Platform
Allows FastAPI runtime and batch services to calculate or simulate risk on demand
without executing the preprocessing pipeline or heavy rainfall files.
"""

import json
from pathlib import Path
from typing import Dict, Any, Union, Optional
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = BASE_DIR / "data" / "risk" / "risk_thresholds.json"

DEFAULT_THRESHOLDS = {
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
    "road_class_weights": {
        "trunk": 0.20, "trunk_link": 0.25, "primary": 0.30, "primary_link": 0.35,
        "secondary": 0.45, "secondary_link": 0.50, "tertiary": 0.60, "tertiary_link": 0.65
    }
}

def load_thresholds() -> Dict[str, Any]:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_THRESHOLDS

def percentile_risk(value: float, low: float, high: float) -> float:
    if value is None or np.isnan(value):
        return 0.0
    return float(np.clip((value - low) / (high - low), 0.0, 1.0))

def predict_risk(
    rainfall_1d: float = 0.0,
    rainfall_3d: float = 0.0,
    rainfall_7d: float = 0.0,
    rainfall_max_3d: Optional[float] = None,
    fclass: str = "secondary",
    bridge_flag: int = 0,
    tunnel_flag: int = 0,
    length_km: float = 2.0,
    historical_risk: int = 0,
    terrain_risk: float = 0.0
) -> Dict[str, Any]:
    """
    Predict/estimate disruption risk score and level for an individual road segment.
    """
    cfg = load_thresholds()
    p = cfg["rainfall_percentiles_mm"]
    w = cfg["weights"]
    
    r1 = percentile_risk(rainfall_1d, p["rain_1d"]["low"], p["rain_1d"]["high"])
    r3 = percentile_risk(rainfall_3d, p["rain_3d"]["low"], p["rain_3d"]["high"])
    r7 = percentile_risk(rainfall_7d, p["rain_7d"]["low"], p["rain_7d"]["high"])
    
    if rainfall_max_3d is None:
        rainfall_max_3d = rainfall_1d
    rmax3 = percentile_risk(rainfall_max_3d, p["rain_max_3d"]["low"], p["rain_max_3d"]["high"])
    
    rain_risk = float(np.mean([r1, r3, r7, rmax3]))
    
    class_risk = cfg["road_class_weights"].get(fclass, 0.50)
    infra_risk = min(1.0, 0.70 * float(bridge_flag) + 0.30 * float(tunnel_flag))
    len_risk = min(1.0, max(0.0, length_km / 10.0))
    vuln_risk = 0.60 * class_risk + 0.25 * infra_risk + 0.15 * len_risk
    
    score = (
        w["rainfall_risk"] * rain_risk +
        w["static_vulnerability"] * vuln_risk +
        w["historical_risk"] * (float(historical_risk) * 0.80) +
        w.get("terrain_risk", 0.0) * terrain_risk
    )
    score = float(np.clip(score, 0.0, 1.0))
    
    bins = cfg["score_bins"]
    if score < bins["low_max"]:
        level = "LOW"
    elif score < bins["medium_max"]:
        level = "MEDIUM"
    else:
        level = "HIGH"
        
    return {
        "risk_score": round(score, 4),
        "risk_level": level,
        "factors": {
            "rainfall_risk": round(rain_risk, 4),
            "static_vulnerability": round(vuln_risk, 4),
            "historical_risk": int(historical_risk),
            "terrain_risk": round(terrain_risk, 4),
            "rainfall_inputs_mm": {
                "1d": round(rainfall_1d, 2),
                "3d": round(rainfall_3d, 2),
                "7d": round(rainfall_7d, 2)
            }
        }
    }

def calculate_road_risk(df: pd.DataFrame) -> pd.DataFrame:
    """
    Vectorized risk calculation on a Pandas/GeoPandas DataFrame of roads.
    """
    cfg = load_thresholds()
    p = cfg["rainfall_percentiles_mm"]
    w = cfg["weights"]
    
    res = df.copy()
    
    r1 = ((res["rainfall_1d"].fillna(0) - p["rain_1d"]["low"]) / (p["rain_1d"]["high"] - p["rain_1d"]["low"])).clip(0, 1)
    r3 = ((res["rainfall_3d"].fillna(0) - p["rain_3d"]["low"]) / (p["rain_3d"]["high"] - p["rain_3d"]["low"])).clip(0, 1)
    r7 = ((res["rainfall_7d"].fillna(0) - p["rain_7d"]["low"]) / (p["rain_7d"]["high"] - p["rain_7d"]["low"])).clip(0, 1)
    rm3 = ((res.get("rainfall_max_3d", res["rainfall_1d"]).fillna(0) - p["rain_max_3d"]["low"]) / (p["rain_max_3d"]["high"] - p["rain_max_3d"]["low"])).clip(0, 1)
    
    res["rainfall_risk"] = ((r1 + r3 + r7 + rm3) / 4.0).round(4)
    
    if "static_vulnerability" not in res.columns:
        class_risk = res["fclass"].map(cfg["road_class_weights"]).fillna(0.50)
        infra_risk = (0.70 * res.get("bridge_flag", 0).astype(float) + 0.30 * res.get("tunnel_flag", 0).astype(float)).clip(0, 1)
        len_risk = (res.get("length_km", 2.0).clip(0, 10.0) / 10.0)
        res["static_vulnerability"] = (0.60 * class_risk + 0.25 * infra_risk + 0.15 * len_risk).round(4)
        
    hist_col = res.get("historical_risk", 0).astype(float) * 0.80
    
    res["risk_score"] = (
        w["rainfall_risk"] * res["rainfall_risk"] +
        w["static_vulnerability"] * res["static_vulnerability"] +
        w["historical_risk"] * hist_col
    ).clip(0, 1).round(4)
    
    res["risk_level"] = pd.cut(
        res["risk_score"],
        bins=[-np.inf, 0.33, 0.66, np.inf],
        labels=["LOW", "MEDIUM", "HIGH"]
    )
    
    return res

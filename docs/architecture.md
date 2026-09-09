# System Architecture

## Overview
The NER Logistics Intelligence Platform is designed around the core operational loop:
**DATA → RISK → IMPACT → DECIDE → ACT → VERIFY → UPDATE → RE-CALCULATE**

```text
┌─────────────────┐
│ Weather / Rain  │
└────────┬────────┘
         │
┌────────▼────────┐
│   Risk Engine   │ ◄── Road Network (OSM)
│ Rain + Road +    │ ◄── Historical Events (ASDMA)
│ Historical Risk │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Road Risk Map   │
└────────┬────────┘
         │
 ┌───────┼───────────────┐
 ▼       ▼               ▼
Logistics   Incidents       District
Vehicles    Reports         Analytics
 │       │ (Citizen/Radio)
 │       ▼
 │  Verification
 │       │
 │       ▼
 │  Road Status (CLOSED)
 │       │
 └───────┼───────────────┘
         ▼
┌─────────────────┐
│ Impact Engine   │
│ Vehicles        │
│ Deliveries      │
│ Supply Priority │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Route Engine    │
│ Dijkstra / A*   │
└────────┬────────┘
         │
 ┌───────┴───────────────┐
 ▼                       ▼
SAFE ROUTE             NO SAFE ROUTE
 │                       │
 ▼                       ▼
REROUTE                HOLD AT SAFE LOC
 │                       │
 └───────┬───────────────┘
         ▼
┌─────────────────┐
│ Alerts / Action │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Control Tower   │
└─────────────────┘
```

## Layers
1. **Frontend (Vite + React + TypeScript + Tailwind CSS)**:
   - Control Tower Dashboard
   - Interactive Leaflet Risk Map
   - Route Planner (Safe vs Fastest vs Alternatives)
   - Fleet Tracking & Incident Management
   - Offline-first Field Officer Reporter (IndexedDB)
2. **Backend (FastAPI + Python + SQLite)**:
   - REST endpoints
   - In-memory NetworkX routing graph
   - Dynamic closure weight modifiers
   - Supply impact calculation engine
3. **ML & GIS**:
   - GeoPandas and Shapely spatial processing
   - Feature engineering on rainfall accumulation and historical flood corridors
   - Explainable scoring heuristics (60% rainfall, 25% vulnerability, 15% historical)

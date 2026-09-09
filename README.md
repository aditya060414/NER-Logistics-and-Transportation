# NER Logistics & Transportation Intelligence Platform

> **Team 7 Sisters · Smart India Hackathon (SIH) 2026 · PS 26002**  
> AI-powered, resilient, risk-aware logistics intelligence and route optimization for the North Eastern Region (Assam Prototype).

---

## 🎯 The Operational Loop
The platform operates on a continuous, closed feedback loop:
$$\text{DATA} \to \text{RISK} \to \text{IMPACT} \to \text{DECIDE} \to \text{ACT} \to \text{VERIFY} \to \text{UPDATE} \to \text{RE-CALCULATE}$$

1. **Weather & GIS Ingestion**: Ingests OpenStreetMap road networks, daily rainfall observations, and historical disaster corridors.
2. **Explainable Risk Engine**: Evaluates road disruption probability using weighted heuristics (60% Rainfall accumulation, 25% Static road vulnerability, 15% Historical disaster evidence).
3. **Logistics Impact Engine**: Automatically maps high-risk corridors to active vehicles, critical cargo shipments (medicine, emergency relief, food), and ETA delays.
4. **Interactive Verification Workflow**: Citizen and officer reports (landslides, floods) are verified by the Control Officer, dynamically marking road segments as `CLOSED`.
5. **Dynamic Risk-Aware Rerouting**: Evaluates alternative corridors using Dijkstra / A* with heavy penalties on high-risk edges and infinite penalties on closures.
6. **Alerts & Operations Control Tower**: Pushes real-time operational notifications and supports Emergency Mode for priority convoys.

---

## 🏗️ Repository Architecture

```text
NER-Logistics-and-Transportation/
├── backend/                  # FastAPI REST API, routing logic, SQLite DB
│   ├── app/
│   │   ├── api/              # Roads, Risk, Weather, Routing, Incidents, Vehicles, Alerts
│   │   ├── services/         # Routing service, Risk engine, Incident verification
│   │   └── models/           # Pydantic schemas and database models
│   └── requirements.txt
├── frontend/                 # React + TypeScript + Vite + Tailwind CSS + Leaflet
│   └── src/
│       ├── components/       # Map views, popup telemetry, alert panels, KPI cards
│       ├── pages/            # Control Tower, Risk Map, Route Planner, Fleet, Incidents
│       ├── services/         # API clients & IndexedDB offline-first sync
│       └── types/            # TypeScript interfaces
├── data/
│   ├── gis/                  # Processed Assam OpenStreetMap GeoPackages & NetworkX graphs
│   ├── risk/                 # Road-level computed risk datasets
│   └── historical/           # ASDMA historical flood & landslide evidence
├── ml/
│   ├── data/                 # Raw rainfall observations (2021–2025)
│   ├── features/             # Feature engineering pipelines
│   ├── models/               # Serialized ML models
│   └── risk_engine/          # Heuristic risk calculation engine
├── demo/                     # Self-contained offline presentation scenario & test datasets
│   ├── scenario.json         # Assam Monsoon 2022 stress test scenario
│   ├── vehicles.json         # Simulated fleet telemetry
│   ├── incidents.json        # Field officer and citizen reports
│   ├── deliveries.json       # Essential supply shipments (medicine, food, relief)
│   └── alerts.json           # Road closure and rerouting notifications
└── docs/
    ├── architecture.md       # Technical architecture & subsystem flowcharts
    ├── api-contract.md       # Frozen backend REST specifications
    ├── demo-script.md        # 3-5 minute live demonstration walkthrough
    ├── data-sources.md       # Data provenance & Real vs Simulated transparency
    └── NER_Logistics_Updated_Implementation_Plan.md
```

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be available at `http://localhost:5173`.

---

## 📊 Real vs Simulated Transparency (SIH Best Practice)
- **Real Data**: Assam road network (OSM), NetworkX routing graph, historical disaster events (ASDMA), Assam daily rainfall records (2021–2025), computed road vulnerability.
- **Simulated for Demo**: Live vehicle GPS tracks, real-time citizen reports, dynamic radio field messages.

---

## 👥 Team
- **Team**: 7 Sisters
- **Problem Statement**: PS 26002

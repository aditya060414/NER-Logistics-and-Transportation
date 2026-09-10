# NER Logistics & Transportation Intelligence Platform

> **Team 7 Sisters · Smart India Hackathon (SIH) 2026 · PS 26002**  
> AI-Powered Smart Logistics Accessibility Intelligence Platform for the North Eastern Region (Assam Prototype).

---

## 🎯 The Operational Loop
The platform operates on a continuous, closed feedback loop:
$$\text{DATA} \to \text{RISK} \to \text{IMPACT} \to \text{DECIDE} \to \text{ACT} \to \text{VERIFY} \to \text{UPDATE} \to \text{RE-CALCULATE}$$

1. **Weather & GIS Ingestion**: Ingests OpenStreetMap road networks, daily rainfall observations, and historical disaster corridors across Assam.
2. **Explainable Risk Engine**: Evaluates road disruption probability using weighted heuristics (60% Rainfall accumulation, 25% Static road vulnerability, 15% Historical disaster evidence).
3. **Logistics Impact Engine**: Automatically maps high-risk corridors to active vehicles, critical cargo shipments (medicine, emergency relief, food), and ETA delays.
4. **Interactive Verification Workflow**: Citizen and officer reports (landslides, floods) are verified by the Control Officer, dynamically marking road segments as `CLOSED`.
5. **Dynamic Risk-Aware Rerouting**: Evaluates alternative corridors using NetworkX Dijkstra / A* with heavy penalties on high-risk edges and infinite penalties on closures.
6. **Role-Based Portals**:
   - **🏛️ Admin Control Tower**: Full KPI analytics, fleet monitoring, incident verification, and closure rerouting.
   - **📱 Field Officer Tactical Client**: Mobile-first route navigation, D102 Medicine delivery, live GPS tracking, high-risk warnings, road closure auto-reroute, offline IndexedDB queuing, multilingual support (English, Assamese, Hindi), and emergency SOS.

---

## 🚀 How to Run the Platform

### Terminal 1: Backend FastAPI Server (Port 8000)

**Option A (If you are in the `backend/` folder)**:
```powershell
cd "c:\coding\Web Development\FULL STACK\Project\SIH\backend"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option B (If you are in the project root folder `SIH/`)**:
```powershell
cd "c:\coding\Web Development\FULL STACK\Project\SIH"
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive API Swagger Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **API Health Check**: [`http://localhost:8000/api/health`](http://localhost:8000/api/health)

---


### Terminal 2: Frontend React Application (Port 5173)

1. Open a second terminal in the `frontend/` directory:
   ```bash
   cd "c:\coding\Web Development\FULL STACK\Project\SIH\frontend"
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - **Platform URL**: [`http://localhost:5173`](http://localhost:5173)
   - **Direct Link to Admin Control Tower**: [`http://localhost:5173/#admin`](http://localhost:5173/#admin)
   - **Direct Link to Field Officer Module**: [`http://localhost:5173/#field-officer`](http://localhost:5173/#field-officer)
   - **Direct Link to Logistics Driver Portal**: [`http://localhost:5173/#driver`](http://localhost:5173/#driver)

---

### Terminal 3: Run Automated End-to-End Test Suite

To verify all 11 core sub-systems (13,093 road segments, risk prediction, Dijkstra routing, closure avoidance, batch offline sync, and weather telemetry):
```bash
cd "c:\coding\Web Development\FULL STACK\Project\SIH"
python tests/test_full_platform_pipeline.py
```

To run a production bundle build test:
```bash
cd "c:\coding\Web Development\FULL STACK\Project\SIH\frontend"
npm run build
```

---

## 🚚 Logistics Driver Portal Highlights

Built for drivers on hazardous Northeast India corridors:
- **Consignment Logging**: Enter waybill number (`CN-2026-XXXXX`), select cargo category (Medicine, Relief, Food, Fuel, etc.), assign priority with smart defaults, and set quantity/weight.
- **GPS & Hub Selection**: Autofill pickup with live GPS or choose key Assam logistics hubs (Guwahati, Tezpur, Haflong, Silchar, Jorhat, Dibrugarh, etc.).
- **Safe Corridor Engine**: NetworkX Dijkstra calculates lowest-risk route avoiding active flood/landslide sectors, with explainable AI rationale.
- **In-Transit HUD Navigation**: High-contrast driving console with live speedometer, real-time remaining distance, dynamic ETA countdown, and moving GPS tracker.
- **Dynamic Road Closure Detour**: When landslides or obstacles occur ahead, the HUD triggers an alert with an instant 1-tap safe detour recalculation.
- **Hazard Reporting**: 2-tap road obstruction reporting with live GPS and simulated dashcam photo proof.
- **Emergency SOS**: Immediate high-priority distress broadcast with 1-tap calling for Police (112) and NER Disaster Helpline (1070).

---

## 📱 Field Officer Module Highlights

Designed specifically for emergency logistics under poor or zero cellular connectivity:
- **Offline-First Resilience**: Incident reports and photo evidence are queued locally in browser **IndexedDB (`ner_logistics_offline_db`)** with status `PENDING_SYNC` during network blackouts, and auto-synchronized upon uplink restoration via `POST /api/incidents/sync`.
- **Cached Corridors**: Routes and nearby risk factors are cached locally so navigation remains active offline.
- **Multilingual Interface**: Toggle seamlessly between **English**, **Assamese (অসমীয়া)**, and **Hindi (हिन्दी)**.
- **Active Assignment**: Tracked delivery `D102` (Critical Emergency Medicine from Guwahati Central Store to Haflong Civil Hospital).
- **Proximity Warnings**: Live visual warnings when approaching high-risk hill passes (`⚠ HIGH-RISK ROAD AHEAD`) and closed corridors (`🚨 ROAD CLOSED AHEAD`).
- **Dynamic Detour Dispatch**: Instant route recalculation (+28 km, +42 min, LOW risk) when control room confirms a blockage.
- **Interactive Demo Controller**: 1-click execution of the full 7-step presentation scenario in **Settings → SIH 2026 Demo Mode**.

---

## 🏗️ Repository Architecture

```text
NER-Logistics-and-Transportation/
├── backend/
│   ├── app/
│   │   ├── api/              # Risk, Routes, Incidents, Logistics/Deliveries, Weather APIs
│   │   ├── services/         # Routing engine, Risk engine, Incident verification
│   │   ├── models/           # Pydantic schemas and database models
│   │   └── main.py           # FastAPI entrypoint & router mounts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── driver/       # Logistics Driver Console & In-Transit HUD Navigation
│   │   │   ├── field-officer/# Mobile-first Tactical Field Officer Module
│   │   │   │   ├── FieldOfficerApp.tsx   # Master field container & device viewport
│   │   │   │   ├── FieldHomeView.tsx     # Officer status, D102 assignment, quick actions
│   │   │   │   ├── FieldRouteView.tsx    # Leaflet tactical map, GPS drive & rerouting
│   │   │   │   ├── FieldReportView.tsx   # Touch-friendly incident reporting form
│   │   │   │   ├── FieldIncidentsView.tsx# Corridor hazards & VHF radio fallback modal
│   │   │   │   ├── FieldDeliveryView.tsx # Consignment details & task progression
│   │   │   │   ├── FieldAlertsView.tsx   # Road closure & monsoon notifications
│   │   │   │   ├── FieldEmergencyView.tsx# Emergency SOS protocol
│   │   │   │   └── FieldSettingsView.tsx # Language selection, sync & SIH demo runner
│   │   │   ├── RoleSelectorModal.tsx     # Role selection gateway modal
│   │   │   ├── Header.tsx                # Top navigation & role switcher
│   │   │   ├── KPICards.tsx              # High-level road network KPI cards
│   │   │   ├── RiskMap.tsx               # Leaflet GIS visualization
│   │   │   ├── RoutePlanner.tsx          # Multi-criteria routing engine modal
│   │   │   ├── IncidentPanel.tsx         # Incident triage & verification queue
│   │   │   └── FleetDrawer.tsx           # Fleet telemetry & closure impact drawer
│   │   ├── services/
│   │   │   ├── api.ts                    # Backend REST API client methods
│   │   │   ├── offlineStorage.ts         # IndexedDB offline caching service
│   │   │   └── i18n.ts                   # English, Assamese, and Hindi translations
│   │   └── types/                        # TypeScript interfaces
│   └── package.json
├── data/
│   ├── gis/                  # Processed Assam OpenStreetMap GeoPackages & NetworkX graphs
│   ├── risk/                 # Road-level computed risk datasets
│   └── historical/           # ASDMA historical flood & landslide evidence
├── ml/
│   ├── data_loader.py        # Spatial indexing & in-memory graph loader
│   ├── risk_engine.py        # Heuristic disruption risk scoring engine
│   └── routing_engine.py     # Multi-criteria Dijkstra pathfinding with cargo priority
├── tests/
│   └── test_full_platform_pipeline.py # End-to-end integration test suite
└── README.md
```

---

## 📊 Real vs Simulated Transparency (SIH Best Practice)
- **Real Data**: Assam road network (13,093 OSM road segments), NetworkX graph (15,708 nodes, 33,083 edges), historical disaster records (ASDMA), Assam June 2022 rainfall records, computed road vulnerability.
- **Simulated for Demo**: Live GPS telemetry coordinates, citizen hazard reports, and simulated cellular outage toggles.

---

## 👥 Team
- **Team**: 7 Sisters
- **Problem Statement**: PS 26002

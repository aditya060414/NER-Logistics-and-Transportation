# NER Logistics Intelligence Platform --- Updated Prototype Implementation Plan

**Team 7 Sisters · SIH 2026 · PS 26002**

## 1. Purpose

This is the updated prototype-first implementation plan for the NER
Logistics Intelligence Platform.

The prototype is designed around one operational loop:

**DATA → RISK → IMPACT → DECIDE → ACT → VERIFY → UPDATE → RE-CALCULATE**

The two team tracks run in parallel:

-   **You:** GIS, rainfall features, risk engine, ML, routing and route
    API logic.
-   **Friend:** Frontend, backend, database, incident workflow,
    fleet/delivery UI and product integration.

The goal is not to build every production feature. The goal is to
demonstrate a convincing end-to-end logistics intelligence system for
Assam that can later scale to the full North Eastern Region.

------------------------------------------------------------------------

# 2. Prototype Scope

## 2.1 Core demo story

The main demo should show:

1.  The platform receives rainfall, road and historical evidence.
2.  The system identifies a high-risk road/corridor.
3.  The dashboard explains why the road is risky.
4.  A logistics vehicle/delivery is affected.
5.  The system calculates safer alternate routes.
6.  A field incident is submitted.
7.  The control officer verifies the incident.
8.  The road changes from open/at-risk to closed.
9.  Affected vehicles and deliveries are identified.
10. The route is automatically recalculated.
11. An alert is generated.
12. The control tower shows the updated situation.

This continuous loop is the spine of the prototype.

------------------------------------------------------------------------

# 3. What Is Real vs Simulated

This must be explicit in the UI and PPT.

## Real / processed data

-   Assam road network from OpenStreetMap
-   Assam road routing graph
-   Historical Assam disaster evidence
-   Assam rainfall datasets
-   Road vulnerability features
-   Historical disruption corridor evidence
-   Prototype rainfall-risk calculations
-   Risk-aware routing logic

## Simulated prototype data

-   Live vehicle GPS positions
-   Delivery records
-   Some current incidents
-   Alert delivery
-   Radio reports
-   Citizen reports
-   Some dynamic road closures
-   Demo scenario events

Never present simulated GPS or simulated incidents as real-time
government data.

Use labels such as:

**Prototype Data**, **Simulated GPS**, **Demo Scenario**, **Historical
Evidence**, and **Processed Rainfall Data**.

------------------------------------------------------------------------

# 4. Final Technology Stack

  Layer                Technology
  -------------------- ---------------------------
  Frontend             React + TypeScript + Vite
  Styling              Tailwind CSS
  Maps                 Leaflet + React-Leaflet
  Charts               Recharts
  Icons                Lucide React
  Backend              FastAPI
  API validation       Pydantic
  Prototype DB         SQLite
  GIS processing       GeoPandas + Shapely
  Routing              NetworkX, Dijkstra/A\*
  ML                   Scikit-learn / XGBoost
  Model persistence    Joblib
  Offline              IndexedDB
  Optional real-time   WebSocket
  Deployment           Vercel + Render/Railway
  Road data            OpenStreetMap
  Terrain              SRTM/DEM if implemented
  Weather              Weather API if available

Do not introduce PostGIS, Kafka, Kubernetes, microservices or other
infrastructure unless the core prototype is already working.

------------------------------------------------------------------------

# 5. Repository Structure

``` text
ner-logistics-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── roads.py
│   │   │   ├── risk.py
│   │   │   ├── routes.py
│   │   │   ├── weather.py
│   │   │   ├── incidents.py
│   │   │   ├── vehicles.py
│   │   │   ├── deliveries.py
│   │   │   ├── alerts.py
│   │   │   └── dashboard.py
│   │   ├── services/
│   │   │   ├── risk_service.py
│   │   │   ├── routing_service.py
│   │   │   ├── incident_service.py
│   │   │   ├── vehicle_service.py
│   │   │   ├── delivery_service.py
│   │   │   └── alert_service.py
│   │   ├── models/
│   │   │   ├── incident.py
│   │   │   ├── vehicle.py
│   │   │   ├── delivery.py
│   │   │   └── alert.py
│   │   └── data/
│   │
│   └── requirements.txt
│
├── ml/
│   ├── data/
│   ├── features/
│   ├── models/
│   ├── notebooks/
│   ├── inference/
│   └── risk_engine/
│
├── data/
│   ├── gis/
│   ├── risk/
│   └── historical/
│
├── demo/
│   ├── vehicles.json
│   ├── incidents.json
│   ├── deliveries.json
│   ├── alerts.json
│   └── scenario.json
│
└── docs/
    ├── architecture.md
    ├── api-contract.md
    ├── demo-script.md
    └── data-sources.md
```

------------------------------------------------------------------------

# 6. Data Files To Give Your Friend

Your friend does NOT need the raw 2.8 GB rainfall feature CSV or
notebooks.

Give the backend/frontend team:

``` text
data/gis/
├── assam_road_routing.gpkg
├── assam_edges.gpkg
├── assam_nodes.gpkg
└── assam_boundary.gpkg

data/risk/
└── assam_demo_road_risk.gpkg

data/historical/
└── historical_evidence_summary.csv
```

Your current prototype risk output contains **13,093 roads**, with
vulnerability and historical-risk fields available.

Keep the large raw rainfall files on the ML side.

------------------------------------------------------------------------

# 7. Your Current Risk Dataset

The current prototype output is:

``` text
assam_demo_road_risk.gpkg
```

It contains:

``` text
osm_id
name
fclass
rainfall_1d
rainfall_3d
rainfall_7d
rainfall_risk
static_vulnerability
historical_risk
risk_score
risk_level
geometry
```

Current demo:

-   Demo date: **2022-06-18**
-   Road rows: **13,093**
-   Missing vulnerability: **0**
-   Missing historical risk: **0**
-   Missing rainfall: **147**
-   Risk distribution:
    -   LOW: 1,835
    -   MEDIUM: 6,636
    -   HIGH: 4,622

This is a useful stress-test scenario for the prototype.

------------------------------------------------------------------------

# 8. Risk Architecture

The prototype risk engine is explainable and should be presented
honestly.

``` text
Rainfall
   │
   ▼
Rainfall Risk
   │
Road ───────► Static Vulnerability
   │
Historical Evidence ─► Historical Risk
   │
   └────────────┬───────────────┘
                ▼
          Risk Engine
                ▼
        Risk Score 0–1
                ▼
        LOW / MEDIUM / HIGH
```

Current prototype weighting:

``` text
60% Rainfall Risk
25% Static Vulnerability
15% Historical Risk
```

This is a prototype heuristic, not a trained probability model.

Later:

``` text
Historical labelled events
        ↓
Feature engineering
        ↓
XGBoost / Random Forest
        ↓
Calibrated disruption probability
        ↓
Risk level
```

------------------------------------------------------------------------

# 9. Risk Explanation

Every road should expose:

``` text
Risk Score: 0.86
Risk Level: HIGH

Contributing factors:
• High 1-day rainfall
• High 3-day rainfall
• High 7-day accumulation
• Road vulnerability
• Historical disruption evidence

Confidence:
Prototype / Evidence-based
```

Do not display a fake ML confidence score until a real model is trained
and calibrated.

Use:

**Risk Score** and **Evidence Sources** for the current prototype.

------------------------------------------------------------------------

# 10. Road Status vs Risk

These are separate concepts.

Risk:

``` text
LOW
MEDIUM
HIGH
```

Accessibility/status:

``` text
OPEN
AT_RISK
RESTRICTED
BLOCKED
CLOSED
```

A road can be:

``` text
HIGH RISK + OPEN
```

It becomes:

``` text
CLOSED
```

only after a verified closure/damage incident or explicit authority
action.

------------------------------------------------------------------------

# 11. Main Dashboard --- Control Tower

The main screen should look like an operations/control centre.

## Header

``` text
NER LOGISTICS INTELLIGENCE
Assam Operations

🟢 System Online
Last Sync: 10:42 AM

[ Emergency Mode ]
[ User / Role ]
```

## KPI cards

``` text
High-Risk Roads
4,622

Active Incidents
12

Vehicles Affected
7

Critical Deliveries
4
```

## Main map

Large central Leaflet map showing:

-   Road risk
-   Road status
-   Incidents
-   Vehicles
-   Closures
-   Selected route
-   Weather/risk overlay if available

## Right-side operations panel

``` text
ACTIVE ALERTS

🔴 Road Closure
Bijni–Panbari

🟠 Heavy Rain Risk
Cachar

🟡 Delivery Delay
Medicine Shipment #D102
```

## Bottom panels

``` text
District Connectivity
Critical Deliveries
Top Bottlenecks
Recent Incidents
```

------------------------------------------------------------------------

# 12. Map Design

Use:

``` text
🟢 LOW
🟡 MEDIUM
🔴 HIGH
⚫ CLOSED
```

Do not overload the map.

Layers:

``` text
Road Risk
Incidents
Vehicles
Closures
Routes
```

Allow layer toggles.

Map popup:

``` text
Road: Bijnigaon–Bhetagaon–Panbari
Class: Secondary

Risk: HIGH
Score: 0.86

Rainfall
24h: 88.6 mm
3d: 360.3 mm
7d: 512.5 mm

Vulnerability: 0.45
Historical Risk: YES

Status: OPEN

[ Find Alternate Route ]
[ View Details ]
```

Add:

``` text
© OpenStreetMap contributors
```

------------------------------------------------------------------------

# 13. Route Planner

Route planner is a major feature.

``` text
FROM
[ Guwahati ▼ ]

TO
[ Haflong ▼ ]

Cargo Priority
[ CRITICAL ▼ ]

[ FIND SAFE ROUTE ]
```

Return:

### Recommended

``` text
SAFE ROUTE

Distance: 290 km
ETA: 6h 20m
Risk: LOW

Why recommended:
Avoids 3 high-risk roads
```

### Alternative

``` text
ALTERNATIVE

Distance: 275 km
ETA: 5h 55m
Risk: MEDIUM
```

### Fastest / Riskier

``` text
FASTEST

Distance: 260 km
ETA: 5h 20m
Risk: HIGH
```

The user should understand the trade-off between ETA and safety.

------------------------------------------------------------------------

# 14. Routing Algorithm

Each road edge receives:

``` text
travel_time
risk_score
closure_status
```

Prototype cost:

``` text
cost =
travel_time
+ risk_penalty
+ closure_penalty
```

Priority changes the risk penalty.

``` text
CRITICAL → strongest risk avoidance
HIGH     → strong risk avoidance
NORMAL   → moderate
LOW      → lower
```

Closed roads receive a very large penalty or are removed from the graph.

Use:

``` text
Dijkstra / A*
```

Generate 2--3 route candidates.

------------------------------------------------------------------------

# 15. No Safe Route Scenario

If every practical route contains a closed/unsafe segment:

``` text
NO SAFE ROUTE AVAILABLE

Reason:
All available corridors contain
critical restrictions.

Recommended action:
HOLD VEHICLE AT SAFE LOCATION

[ Notify Control Room ]
[ View Affected Delivery ]
```

Do not return an API error.

This is a logistics decision, not a routing failure.

------------------------------------------------------------------------

# 16. Logistics Impact Engine

This is an important addition.

Risk should lead to logistics consequences.

``` text
Road Risk
   ↓
Affected Route
   ↓
Affected Vehicle
   ↓
Affected Delivery
   ↓
Priority Assessment
   ↓
Action
```

Example:

``` text
Medicine Delivery D102

Destination: Haflong
Priority: CRITICAL

Current route:
HIGH RISK

ETA:
+2h 15m

Action:
REROUTE
```

------------------------------------------------------------------------

# 17. Cargo Priority

Use:

``` text
CRITICAL
HIGH
NORMAL
LOW
```

Examples:

``` text
CRITICAL
Medicine
Emergency supplies
Relief material

HIGH
Food
Agricultural supplies

NORMAL
Construction material

LOW
General commercial cargo
```

The priority affects route selection.

------------------------------------------------------------------------

# 18. Fleet Tracking

Fleet page:

``` text
VEHICLE ID
TYPE
LOCATION
STATUS
DELIVERY
RISK
ETA
```

Example:

``` text
AS-01-TR-102
Truck

📍 Near Chirang
Status: AT RISK

Delivery: D102
Risk: HIGH
ETA: +1h 40m

[ View Route ]
```

For the prototype, GPS positions are simulated.

Use a moving marker on the map.

------------------------------------------------------------------------

# 19. Incident Management

Incident page:

``` text
ACTIVE INCIDENTS

ID     TYPE       SOURCE      STATUS
I102   Landslide  Citizen     Unverified
I103   Flood      Officer     Verified
I104   Road      Radio       Unverified
```

Incident details:

``` text
Type:
LANDSLIDE

Location:
26.xxxx, 90.xxxx

Source:
CITIZEN

Submitted:
10:32 AM

Evidence:
Photo

Status:
UNVERIFIED

[ VERIFY ]
[ REJECT ]
```

------------------------------------------------------------------------

# 20. Incident Sources

Every incident must have:

``` text
source
```

Possible values:

``` text
CITIZEN
OFFICER
RADIO
CONTROL_ROOM
SYSTEM
```

This allows the platform to distinguish raw reports from verified
intelligence.

------------------------------------------------------------------------

# 21. Verification Workflow

This is the strongest demo interaction.

``` text
Citizen/Officer Report
        ↓
UNVERIFIED
        ↓
Control Officer Review
        ↓
VERIFY
        ↓
Road Status = CLOSED
        ↓
Find affected vehicles
        ↓
Find affected deliveries
        ↓
Recalculate routes
        ↓
Generate alert
```

If rejected:

``` text
Incident → REJECTED
Road remains unchanged
```

------------------------------------------------------------------------

# 22. Radio Fallback

No software-radio integration is required.

Provide a simple:

``` text
[ + RADIO REPORT ]
```

Form:

``` text
Incident Type
Location / Coordinates
Description
Source = RADIO
Status = UNVERIFIED
```

The control room can then verify it.

This demonstrates resilience when field internet is unavailable.

------------------------------------------------------------------------

# 23. Field Officer App

Create a mobile-responsive page:

``` text
FIELD REPORT

Incident Type
[ Landslide ▼ ]

Use Current GPS
[ 📍 ]

Description
[................]

Photo
[ Take / Upload ]

[ SUBMIT REPORT ]
```

After submission:

``` text
✓ Saved
Pending Sync
```

------------------------------------------------------------------------

# 24. Offline-First Workflow

Use IndexedDB.

When online:

``` text
Submit
 ↓
Backend
 ↓
Server acknowledgement
 ↓
Synced
```

When offline:

``` text
Submit
 ↓
IndexedDB
 ↓
PENDING_SYNC
 ↓
Internet returns
 ↓
POST /api/incidents/sync
 ↓
Server acknowledgement
 ↓
SYNCED
```

Show:

``` text
🔴 OFFLINE
3 reports pending sync

Last successful sync:
10:37 AM
```

Never delete the local report before server acknowledgement.

------------------------------------------------------------------------

# 25. Weather Layer

If a weather API is available, backend should expose:

``` text
GET /api/weather/current
GET /api/weather/forecast
```

Display:

``` text
CURRENT WEATHER

Rainfall: 42 mm
Forecast: Heavy Rain
Risk impact: HIGH
```

Architecture:

``` text
Weather API
    ↓
Current/Forecast Weather
    ↓
Risk Engine
    ↓
Road Risk
```

Important distinction:

**Weather API predicts weather. The platform predicts road disruption
risk.**

------------------------------------------------------------------------

# 26. District Connectivity

Create a district-level operational view.

``` text
DISTRICT CONNECTIVITY

District             Connectivity

Cachar                 72% 🔴
Chirang                91% 🟢
Lakhimpur              64% 🔴
Kamrup                 88% 🟢
Dima Hasao             43% 🔴
```

Prototype metric:

``` text
accessible major roads /
total major roads
```

Use it as an operational indicator, not a claim of official government
connectivity statistics.

------------------------------------------------------------------------

# 27. Bottleneck Detection

Dashboard:

``` text
TOP BOTTLENECKS

1. Bijni–Panbari
   HIGH RISK
   7 affected vehicles

2. Cachar–Katigorah
   HIGH RISK
   3 critical deliveries

3. NH corridor
   MEDIUM RISK
   Heavy rainfall exposure
```

A bottleneck can be identified using:

-   High road risk
-   Closure/restriction
-   Number of affected routes
-   Number of affected vehicles
-   Number/priority of deliveries

------------------------------------------------------------------------

# 28. Supply Impact

Show:

``` text
SUPPLY IMPACT

Medicine              3 affected
Food                   7 affected
Relief                 4 affected
Construction           2 affected
```

Then:

``` text
CRITICAL SUPPLY GAP

Medicine delivery D102
Delayed by 2h 15m

Recommended:
Reroute via safe corridor
```

------------------------------------------------------------------------

# 29. Emergency Mode

Header button:

``` text
🚨 EMERGENCY MODE
```

When activated, switch dashboard into emergency operations:

``` text
CRITICAL ROADS
CRITICAL INCIDENTS
EMERGENCY VEHICLES
CRITICAL DELIVERIES
SAFE ROUTES
```

Map focuses on:

``` text
🔴 Critical roads
🚨 Incidents
🚑 Emergency vehicles
🟢 Safe routes
```

This should be one of the major presentation moments.

------------------------------------------------------------------------

# 30. Alerts

Alert object:

``` text
id
type
severity
title
message
source
timestamp
district
road_id
delivery_id
vehicle_id
status
```

Types:

``` text
ROAD_CLOSURE
HIGH_RISK
HEAVY_RAIN
ROUTE_CHANGE
DELIVERY_DELAY
SUPPLY_RISK
```

Prototype notification:

``` text
🔴 ROAD CLOSURE

Bijni–Panbari Road has been
verified CLOSED.

2 vehicles affected.
1 critical delivery affected.

Recommended route recalculated.
```

------------------------------------------------------------------------

# 31. Multilingual Alerts

Prototype should support at least:

``` text
English
Assamese
Hindi
```

The UI can initially use predefined translations for demo messages.

Architecture should keep:

``` text
language
message_template
notification
```

so a proper translation service can be added later.

------------------------------------------------------------------------

# 32. Analytics

Analytics page:

## Risk distribution

``` text
LOW      1835
MEDIUM   6636
HIGH     4622
```

## District risk

``` text
District
High-risk roads
Active incidents
Connectivity
```

## Historical evidence

``` text
Year
Historical disruption events/corridors
Affected infrastructure context
```

Clearly label historical corridor matches as:

**Historical disruption corridor**

not as exact confirmed failed segments when the evidence does not
establish the exact segment.

------------------------------------------------------------------------

# 33. Data Provenance

Create a Data Sources panel:

``` text
DATA SOURCES

Rainfall
CWC / Assam Water Department

Road Network
OpenStreetMap

Historical Disaster Evidence
ASDMA

Terrain
SRTM / DEM

Weather
External Weather API
```

Road popup should also explain which evidence contributed to the risk
score.

------------------------------------------------------------------------

# 34. System Health

Add:

``` text
SYSTEM STATUS

API              🟢
GIS               🟢
Risk Engine       🟢
Weather           🟢
GPS Feed          🟢
Sync Service      🟢
```

This can be simulated for the prototype.

------------------------------------------------------------------------

# 35. Authentication and Roles

Use simple prototype roles:

``` text
ADMIN
CONTROL_OFFICER
FIELD_OFFICER
LOGISTICS_OPERATOR
```

Capabilities:

  Role                 Main capability
  -------------------- -------------------------------
  Admin                System management
  Control Officer      Verify incidents / operations
  Field Officer        Submit reports
  Logistics Operator   Vehicles / deliveries

Do not spend prototype time implementing government SSO.

------------------------------------------------------------------------

# 36. Backend API Contract

Freeze these APIs before frontend/backend integration.

## Roads

``` text
GET /api/roads
GET /api/roads/{osm_id}
GET /api/risk/map
```

## Risk

``` text
GET /api/risk/map
GET /api/risk/{osm_id}
```

## Weather

``` text
GET /api/weather/current
GET /api/weather/forecast
```

## Routing

``` text
POST /api/routes/plan
```

Request:

``` json
{
  "origin": {
    "lat": 26.1445,
    "lon": 91.7362
  },
  "destination": {
    "lat": 26.3452,
    "lon": 93.3247
  },
  "priority": "CRITICAL"
}
```

Response:

``` json
{
  "recommended": {},
  "alternatives": [],
  "no_safe_route": false
}
```

## Incidents

``` text
GET /api/incidents
POST /api/incidents
PATCH /api/incidents/{id}/verify
PATCH /api/incidents/{id}/reject
POST /api/incidents/sync
```

## Vehicles

``` text
GET /api/vehicles
POST /api/vehicles/location
```

## Deliveries

``` text
GET /api/deliveries
POST /api/deliveries
PATCH /api/deliveries/{id}
```

## Alerts

``` text
GET /api/alerts
PATCH /api/alerts/{id}/read
```

## Dashboard

``` text
GET /api/dashboard/summary
GET /api/dashboard/districts
GET /api/dashboard/bottlenecks
GET /api/dashboard/supply-impact
```

------------------------------------------------------------------------

# 37. Database Tables

SQLite is sufficient.

## incidents

``` text
id
type
latitude
longitude
description
source
photo_path
status
created_at
verified_at
verified_by
road_id
```

## vehicles

``` text
id
vehicle_number
vehicle_type
latitude
longitude
status
delivery_id
last_updated
```

## deliveries

``` text
id
cargo_type
priority
origin
destination
vehicle_id
status
eta
delay_minutes
risk_level
```

## alerts

``` text
id
type
severity
title
message
road_id
vehicle_id
delivery_id
status
created_at
```

------------------------------------------------------------------------

# 38. Frontend Pages

Build these pages:

``` text
Dashboard
Risk Map
Route Planner
Fleet
Deliveries
Incidents
Analytics
Field Report
```

Optional:

``` text
Settings
```

------------------------------------------------------------------------

# 39. Frontend Components

``` text
Sidebar
Header
KPICard
RiskMap
RoadPopup
RiskLegend
IncidentCard
IncidentDetail
VehicleCard
VehicleMarker
DeliveryCard
RouteCard
AlertPanel
DistrictCard
BottleneckCard
EmergencyBanner
SystemStatus
OfflineStatus
WeatherCard
RiskExplanation
```

------------------------------------------------------------------------

# 40. UI Design Principles

Use a professional control-room style.

### Desktop

``` text
┌─────────────────────────────────────────────┐
│ Header / Emergency / System Status          │
├──────────┬──────────────────────┬───────────┤
│ Sidebar  │       MAIN MAP       │ Operations│
│          │                      │           │
│          │                      │ Alerts    │
│          │                      │ Incidents │
│          │                      │           │
├──────────┴──────────────────────┴───────────┤
│ KPI / District / Bottleneck / Deliveries    │
└─────────────────────────────────────────────┘
```

### Visual language

Use:

``` text
Green = safe
Yellow = caution
Red = critical
Gray/black = closed
Blue = route / information
```

Keep the map dominant.

Do not make every card brightly coloured.

------------------------------------------------------------------------

# 41. Loading and Error States

Every major screen must have:

``` text
Loading...
```

``` text
Unable to load data
[Retry]
```

``` text
No incidents found
```

``` text
No safe route available
```

This prevents the prototype from looking broken during demo.

------------------------------------------------------------------------

# 42. Demo Mode

Add:

``` text
🎬 DEMO MODE
```

Demo mode loads a predefined scenario from:

``` text
demo/scenario.json
```

The scenario should contain:

``` text
Rainfall situation
Risk roads
Incident
Vehicle
Delivery
Closure
Route change
Alert
```

The complete demo must work without relying on external live APIs.

This is preferable to relying only on screenshots as a fallback.

------------------------------------------------------------------------

# 43. Demo Scenario

Recommended story:

``` text
Scenario:
Heavy rainfall across Assam

        ↓

Bijni–Panbari corridor becomes
HIGH RISK

        ↓

Critical medicine vehicle is
using the corridor

        ↓

Field report:
"Landslide blocking road"

        ↓

Incident = UNVERIFIED

        ↓

Control officer verifies

        ↓

Road = CLOSED

        ↓

Vehicle affected

        ↓

Delivery D102 affected

        ↓

Route engine recalculates

        ↓

Safe alternate route selected

        ↓

ETA increases

        ↓

Alert generated

        ↓

Control tower updated
```

This should be rehearsed repeatedly.

------------------------------------------------------------------------

# 44. Development Phases

## Phase 0 --- Setup

### Friend

-   Create React/Vite project
-   Create FastAPI project
-   Create SQLite DB
-   Create repository
-   Create API contract
-   Create UI shell

### You

-   Organize GIS/risk files
-   Confirm risk GeoPackage
-   Confirm NetworkX graph
-   Create routing service module

Checkpoint:

**Both environments run locally.**

------------------------------------------------------------------------

# 45. Phase 1 --- Map + Risk

### Friend

Build:

``` text
Dashboard shell
Risk Map
Road Popup
Risk Legend
```

Backend:

``` text
GET /api/risk/map
GET /api/risk/{osm_id}
```

### You

Provide:

``` text
assam_demo_road_risk.gpkg
```

Confirm:

``` text
13,093 roads
risk_score
risk_level
rainfall
vulnerability
historical risk
```

Checkpoint:

**Map renders and road click shows risk details.**

------------------------------------------------------------------------

# 46. Phase 2 --- Routing

### You --- highest priority

Implement:

``` text
Graph
 ↓
Risk join
 ↓
Edge cost
 ↓
Dijkstra/A*
 ↓
2–3 candidate routes
 ↓
Route JSON
```

Test:

``` text
Guwahati → Tezpur
Guwahati → Haflong
Guwahati → Dibrugarh
```

Backend exposes:

``` text
POST /api/routes/plan
```

Friend builds:

``` text
Route Planner
Route Cards
Route Polylines
```

Checkpoint:

**Origin → Destination → routes appear on map.**

------------------------------------------------------------------------

# 47. Phase 3 --- Logistics Impact

Friend implements:

``` text
Vehicles
Deliveries
Priority
Affected vehicle
Affected delivery
```

You provide routing/risk outputs.

Checkpoint:

``` text
HIGH-RISK ROAD
      ↓
Vehicle affected
      ↓
Delivery affected
      ↓
Alternate route
```

------------------------------------------------------------------------

# 48. Phase 4 --- Incident + Verification

Friend implements:

``` text
Incident creation
Source
Photo
Verification
Rejection
Dynamic road status
```

Important flow:

``` text
UNVERIFIED
   ↓
VERIFY
   ↓
CLOSED
   ↓
AFFECTED VEHICLES
   ↓
AFFECTED DELIVERIES
   ↓
REROUTE
   ↓
ALERT
```

Checkpoint:

**One button click changes the operational state of the system.**

------------------------------------------------------------------------

# 49. Phase 5 --- Offline + Field Reporting

Friend implements:

``` text
FieldReport
IndexedDB
Offline queue
Sync endpoint
Sync status
```

Test:

``` text
Turn internet off
Submit incident
Refresh
Turn internet on
Sync
```

Checkpoint:

**Report survives offline operation and syncs successfully.**

------------------------------------------------------------------------

# 50. Phase 6 --- Weather + District Intelligence

Add:

``` text
Weather
District Connectivity
Bottlenecks
Supply Impact
Historical View
```

These should feed the dashboard, not become separate disconnected
features.

------------------------------------------------------------------------

# 51. Phase 7 --- Emergency Mode + Alerts

Implement:

``` text
Emergency Mode
Critical deliveries
Critical vehicles
Critical roads
Alert panel
```

When a verified critical incident occurs:

``` text
Incident
 ↓
Road closure
 ↓
Affected logistics
 ↓
Rerouting
 ↓
Alert
```

------------------------------------------------------------------------

# 52. Phase 8 --- Analytics + Polish

Add:

``` text
Risk distribution
District table
Historical disruption chart
Supply impact
Bottlenecks
System health
Data sources
```

Then stop adding features.

Only:

``` text
Testing
Bug fixing
UI polish
Demo rehearsal
```

------------------------------------------------------------------------

# 53. Your ML Track

Your primary ML work should NOT block the frontend.

Current prototype:

``` text
Explainable heuristic risk engine
```

Future ML:

``` text
Historical rainfall
+
Road features
+
Terrain
+
Historical incidents
+
Infrastructure
+
Spatial features
        ↓
Feature engineering
        ↓
XGBoost / Random Forest
        ↓
Disruption probability
        ↓
LOW / MEDIUM / HIGH
```

Target:

``` text
disruption in next 24 hours = 0/1
```

Avoid time leakage.

Never use:

``` text
road_closed = TRUE
```

as an input to predict whether that road will close.

Only use information available before the prediction time.

------------------------------------------------------------------------

# 54. ML Features

Potential future features:

``` text
rainfall_1d
rainfall_3d
rainfall_7d
rainfall_max_3d
rainfall_max_7d
rainfall_3d_coverage
rainfall_7d_coverage

elevation
slope

road_class
road_length
bridge_flag
tunnel_flag
estimated_speed
travel_time

distance_to_river
historical_event_count
historical_risk
district
```

Later add:

``` text
soil
drainage
river level
landslide susceptibility
traffic
satellite-derived indicators
```

Do not make these mandatory for the 2-day prototype.

------------------------------------------------------------------------

# 55. ML Evaluation

When real labels are available, report:

``` text
Precision
Recall
F1
ROC-AUC
PR-AUC
Confusion Matrix
Calibration
```

For disruption prediction, recall is especially important because
missing a dangerous disruption can be more costly than generating an
extra warning.

Do not claim model accuracy until a proper labelled evaluation exists.

------------------------------------------------------------------------

# 56. Terrain

If time allows:

``` text
DEM
 ↓
Elevation
Slope
 ↓
Terrain Risk
```

If terrain is not ready before the core demo:

**Do not delay routing or incident verification for terrain.**

Architecture should still leave fields for:

``` text
elevation
slope
terrain_risk
```

------------------------------------------------------------------------

# 57. Real-Time Data Architecture

Prototype can use REST polling.

Optional:

``` text
WebSocket
```

for:

``` text
Vehicle position
Incident updates
Alerts
```

Do not make WebSockets a critical dependency.

------------------------------------------------------------------------

# 58. Data Source Documentation

Create:

``` text
docs/data-sources.md
```

Document:

``` text
Rainfall:
CWC / Assam Water Department

Roads:
OpenStreetMap

Historical:
ASDMA

Terrain:
SRTM/DEM

Weather:
External API
```

Also record:

``` text
data date range
processing method
limitations
whether data is live/simulated
```

------------------------------------------------------------------------

# 59. Important Data Limitations

The prototype must explicitly state:

1.  Some historical road incidents are corridor-level evidence rather
    than exact failed segments.
2.  Prototype GPS positions are simulated.
3.  Some incidents are simulated.
4.  Current risk is an explainable prototype score, not a calibrated ML
    probability.
5.  Rainfall coverage is not uniform across all locations.
6.  A high-risk road is not automatically closed.
7.  Official authority verification is required before treating a report
    as confirmed closure.

These limitations make the project more credible, not weaker.

------------------------------------------------------------------------

# 60. Testing Checklist

## GIS

``` text
✓ Assam roads render
✓ Risk colours correct
✓ Road popup works
✓ No missing vulnerability
✓ No missing historical risk
```

## Routing

``` text
✓ Route exists
✓ Distance sensible
✓ ETA sensible
✓ High-risk roads penalized
✓ Closed roads avoided
✓ No-safe-route handled
✓ Critical cargo prioritizes safety
```

## Incidents

``` text
✓ Citizen report
✓ Officer report
✓ Radio report
✓ Incident verification
✓ Incident rejection
✓ Road status update
✓ Vehicle impact
✓ Delivery impact
✓ Route recalculation
✓ Alert creation
```

## Offline

``` text
✓ Report saved offline
✓ Refresh doesn't lose report
✓ Sync works
✓ Duplicate sync prevented
✓ Last sync shown
```

## UI

``` text
✓ Loading states
✓ Error states
✓ Empty states
✓ Mobile field report
✓ Emergency mode
✓ Demo mode
```

------------------------------------------------------------------------

# 61. Demo Rehearsal

Do the same sequence every time.

## 1 --- Dashboard

Show:

``` text
High-risk roads
Incidents
Vehicles
Critical deliveries
```

## 2 --- Risk Map

Click a high-risk road.

Show:

``` text
Rainfall
Vulnerability
Historical evidence
Risk score
```

## 3 --- Route Planner

Enter:

``` text
Guwahati → Haflong
Critical cargo
```

Show route alternatives.

## 4 --- Fleet

Show a vehicle using the corridor.

## 5 --- Incident

Open a landslide report.

Show:

``` text
Source: Field Officer
Status: Unverified
```

## 6 --- Verify

Click:

``` text
VERIFY
```

## 7 --- Road closes

Map changes:

``` text
CLOSED
```

## 8 --- Logistics impact

Vehicle and delivery become affected.

## 9 --- Automatic reroute

Show new route.

## 10 --- Alert

Show:

``` text
Road closure
Route changed
Delivery ETA updated
```

## 11 --- Emergency mode

Show critical operations dashboard.

End with:

**"The platform converts fragmented road and weather information into an
operational logistics decision."**

------------------------------------------------------------------------

# 62. Two-Day Priority Plan

## DAY 1

### You

**Morning** - Finish risk output - Load graph - Join risk to graph -
Implement edge cost - Implement Dijkstra/A\* - Test 3 corridors

**Afternoon** - Build route API - Return route geometry - Return
ETA/distance/risk - Test closed-road handling

**Evening** - Integrate with friend's backend - Fix route/map issues

### Friend

**Morning** - React shell - Sidebar - Header - Dashboard - Leaflet map

**Afternoon** - Risk map - Road popup - Route Planner UI

**Evening** - Connect APIs - Render routes

DAY 1 checkpoint:

**Map + risk + route planning works.**

------------------------------------------------------------------------

# 63. DAY 2

### You

-   Finalize routing
-   Improve risk explanation
-   Provide risk output/API format
-   Help incident → road status integration
-   Validate demo scenario
-   Only then work on ML upgrade if time remains

### Friend

**Morning** - Incidents - Verification - Dynamic road closure - Alerts

**Afternoon** - Vehicles - Deliveries - Priority - Emergency mode

**Evening** - Offline report - District analytics - Polish - Demo mode -
Testing

DAY 2 checkpoint:

**Incident → Verify → Close → Reroute → Alert works end-to-end.**

------------------------------------------------------------------------

# 64. What NOT To Build Now

Do not spend the 2-day window on:

``` text
✗ Full PostGIS migration
✗ Government SSO
✗ Full SMS infrastructure
✗ WhatsApp API
✗ Complex microservices
✗ Kubernetes
✗ Advanced satellite AI
✗ Deep learning
✗ Full multimodal optimization
✗ Warehouse management
✗ Complete traffic prediction
✗ Perfect nationwide data
✗ Perfect rainfall reconstruction
```

Build the operational story first.

------------------------------------------------------------------------

# 65. Final Architecture

``` text
                    ┌─────────────────┐
                    │ Weather / Rain  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Risk Engine   │
                    │ Rain + Road +    │
                    │ Historical +     │
                    │ Terrain         │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Road Risk Map   │
                    └────────┬────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
       Logistics         Incidents         District
       Vehicles           Reports          Analytics
             │               │                │
             │               ▼                │
             │          Verification          │
             │               │                │
             │               ▼                │
             │         Road Status            │
             │               │                │
             └───────────────┼────────────────┘
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
                  ┌──────────┴──────────┐
                  ▼                     ▼
            SAFE ROUTE             NO SAFE ROUTE
                  │                     │
                  ▼                     ▼
              REROUTE                 HOLD
                  │                     │
                  └──────────┬──────────┘
                             ▼
                    ┌─────────────────┐
                    │ Alerts / Action │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Control Tower   │
                    └─────────────────┘
                             │
                             └───────↺
```

------------------------------------------------------------------------

# 66. Final Team Split

  You --- GIS / ML / Routing   Friend --- Product / Backend / Frontend
  ---------------------------- -----------------------------------------
  Rainfall features            React UI
  Risk engine                  Dashboard
  Road vulnerability           Leaflet map
  Historical risk              Backend
  Risk output                  APIs
  NetworkX graph               SQLite
  Risk-aware routing           Incidents
  Route API logic              Verification
  Route geometry               Vehicles
  ETA calculation              Deliveries
  ML model                     Alerts
  Terrain if time              Offline UI
  Risk explanation             Emergency mode
  ML evaluation                Analytics
  Data validation              Demo mode

------------------------------------------------------------------------

# 67. Final Prototype Definition

The prototype is successful if a judge can see this in under five
minutes:

``` text
A risky road is identified
        ↓
The system explains why
        ↓
A critical logistics vehicle is affected
        ↓
A field incident is reported
        ↓
The officer verifies it
        ↓
The road becomes closed
        ↓
The system identifies affected deliveries
        ↓
A safer alternate route is calculated
        ↓
ETA is updated
        ↓
An alert is generated
        ↓
The control tower reflects the new situation
```

That is the minimum complete product story.

The ML model is then the intelligence layer that upgrades the
prototype's explainable risk engine into a learned disruption-prediction
system.

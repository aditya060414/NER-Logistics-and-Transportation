# Demo Script & Presentation Rehearsal

**Target Duration: 3–5 Minutes**

### Step 1: Control Tower Overview
- Display the main Operations Dashboard:
  - 4,622 High-Risk Roads
  - 12 Active Incidents
  - 7 Vehicles Affected
  - 4 Critical Deliveries
- Explain: Assam monsoon stress test (June 18, 2022 historical severe rainfall scenario).

### Step 2: Risk Map Deep Dive
- Click on the high-risk **Bijni–Panbari** corridor.
- Show road popup with explainable risk breakdown:
  - 24h Rainfall: 88.6 mm
  - 3-day Rainfall: 360.3 mm
  - Static Road Vulnerability: 0.45
  - Historical Disruption Corridor: YES
  - Combined Risk: 0.86 (HIGH)

### Step 3: Logistics Impact Identification
- Show Fleet Tracking: Vehicle `AS-01-TR-102` (carrying Critical Medicine Shipment `D102` to Haflong) is currently en route along this high-risk corridor.

### Step 4: Incident Submission & Verification Workflow
- Switch to Incident Panel:
  - A citizen report `I102` (Landslide at Bijni) arrives with status `UNVERIFIED`.
  - Control Officer reviews photo evidence.
  - Officer clicks **VERIFY**.
  - System updates Road Status immediately: **OPEN → CLOSED**.

### Step 5: Dynamic Recalculation & Alert Generation
- System automatically triggers:
  1. Affected vehicles identified (`AS-01-TR-102`).
  2. Routing engine runs Dijkstra/A* with closure penalty on blocked edges.
  3. Safer alternate route calculated (+1h 40m ETA).
  4. Instant notification alert pushed to Control Tower and driver dispatch.

### Step 6: Emergency Mode & Conclusion
- Toggle **Emergency Mode** to focus view on critical roads, emergency convoys, and relief corridors.
- Closing Statement: *"The platform converts fragmented road and weather data into decisive, life-saving logistics actions."*

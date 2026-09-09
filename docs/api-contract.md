# Backend API Contract

Frozen API specifications for the prototype frontend-backend integration.

## Base URL: `http://localhost:8000`

---

### 1. Roads & Risk
- **`GET /api/roads`**: List road segments (paginated or filtered by bounding box/district).
- **`GET /api/roads/{osm_id}`**: Get specific road metadata and geometry.
- **`GET /api/risk/map`**: GeoJSON endpoint for Leaflet to display road risk levels (`LOW`, `MEDIUM`, `HIGH`, `CLOSED`).
- **`GET /api/risk/{osm_id}`**: Detailed risk breakdown (rainfall metrics, static vulnerability, historical disruption flag, confidence).

---

### 2. Weather
- **`GET /api/weather/current`**: District/regional current rainfall and conditions.
- **`GET /api/weather/forecast`**: 24h - 72h forecast indicators for risk preview.

---

### 3. Routing
- **`POST /api/routes/plan`**
  **Request Body:**
  ```json
  {
    "origin": { "lat": 26.1445, "lon": 91.7362 },
    "destination": { "lat": 26.3452, "lon": 93.3247 },
    "priority": "CRITICAL"
  }
  ```
  **Response Body:**
  ```json
  {
    "recommended": {
      "name": "Safe Route",
      "distance_km": 290,
      "eta_minutes": 380,
      "risk_level": "LOW",
      "avoided_high_risk_roads": 3,
      "geometry": []
    },
    "alternatives": [
      {
        "name": "Fastest Route",
        "distance_km": 260,
        "eta_minutes": 320,
        "risk_level": "HIGH",
        "geometry": []
      }
    ],
    "no_safe_route": false
  }
  ```

---

### 4. Incidents
- **`GET /api/incidents`**: List all incidents with source, coordinates, status (`UNVERIFIED`, `VERIFIED`, `REJECTED`).
- **`POST /api/incidents`**: Create a new incident report (citizen / field officer / radio).
- **`PATCH /api/incidents/{id}/verify`**: Control officer verification (triggers road closure, vehicle impact check, and dynamic reroute).
- **`PATCH /api/incidents/{id}/reject`**: Control officer rejection.
- **`POST /api/incidents/sync`**: Batch sync offline reports stored in client IndexedDB.

---

### 5. Fleet & Vehicles
- **`GET /api/vehicles`**: Real-time simulated positions, statuses (`ON_ROUTE`, `AT_RISK`, `HELD`), assigned deliveries.
- **`POST /api/vehicles/location`**: Update vehicle telemetry.

---

### 6. Deliveries
- **`GET /api/deliveries`**: Active logistics shipments, cargo types (medicine, food, relief), priority (`CRITICAL`, `HIGH`, `NORMAL`, `LOW`), ETA delay.
- **`POST /api/deliveries`**: Register new delivery assignment.
- **`PATCH /api/deliveries/{id}`**: Update delivery status or route assignment.

---

### 7. Alerts & Notifications
- **`GET /api/alerts`**: Active operational notifications (road closure, route changed, delivery delayed).
- **`PATCH /api/alerts/{id}/read`**: Mark notification as acknowledged.

---

### 8. Control Tower Dashboard
- **`GET /api/dashboard/summary`**: KPIs (high-risk roads, active incidents, affected vehicles, critical deliveries).
- **`GET /api/dashboard/districts`**: District connectivity scores (`accessible major roads / total major roads`).
- **`GET /api/dashboard/bottlenecks`**: Top impacted corridors ranked by risk and volume.
- **`GET /api/dashboard/supply-impact`**: Summary of affected essential goods (medicine, food, relief).

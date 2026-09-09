# Demo & Simulation Scenarios

This directory holds the self-contained demo scenario data so that the prototype can run flawlessly offline and without relying on external live APIs during presentations.

### Files:
- `scenario.json`: Master demo script orchestrating the simulation timeline (rainfall event -> high risk corridor -> affected vehicle -> landslide incident -> verification -> road closure -> dynamic rerouting -> notification alert).
- `vehicles.json`: Simulated GPS coordinates, vehicle types, status, and assigned deliveries (e.g. `AS-01-TR-102`).
- `incidents.json`: Citizen and field officer reported incidents with coordinates, photos/evidence, source (CITIZEN, OFFICER, RADIO), and status (UNVERIFIED, VERIFIED, REJECTED).
- `deliveries.json`: Active cargo shipments, priority levels (CRITICAL, HIGH, NORMAL, LOW), origin, destination, ETA, and delay tracking.
- `alerts.json`: System notifications generated when road status changes or routes are recalculated.

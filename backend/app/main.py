import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure SIH root is on sys.path for ml module imports
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.api.risk import router as risk_router
from backend.app.api.routes import router as routes_router
from backend.app.api.incidents import router as incidents_router
from backend.app.api.logistics import router as logistics_router
from ml.data_loader import get_data_loader

app = FastAPI(
    title="NER Logistics Intelligence Platform API",
    description="Backend API for real-time risk assessment, logistics rerouting, and incident management across Assam / NER.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(risk_router)
app.include_router(routes_router)
app.include_router(incidents_router)
app.include_router(logistics_router)

@app.on_event("startup")
def startup_event():
    """
    Pre-warm in-memory datasets on startup for instantaneous response times.
    """
    loader = get_data_loader()
    loader.get_roads_risk()
    loader.get_routing_graph()
    loader.get_roads_dict_by_osm_id()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "NER Logistics Intelligence Platform API",
        "version": "1.0.0",
        "region": "Assam, North Eastern Region",
        "active_endpoints": [
            "/api/risk/summary",
            "/api/risk/map",
            "/api/risk/{osm_id}",
            "/api/health"
        ]
    }

@app.get("/api/health")
def health_check():
    loader = get_data_loader()
    roads_loaded = loader._roads_gdf is not None
    graph_loaded = loader._graph is not None
    return {
        "status": "healthy",
        "roads_in_memory": roads_loaded,
        "graph_in_memory": graph_loaded,
        "total_roads": len(loader.get_roads_risk()) if roads_loaded else 0,
        "total_graph_nodes": loader.get_routing_graph().number_of_nodes() if graph_loaded else 0
    }

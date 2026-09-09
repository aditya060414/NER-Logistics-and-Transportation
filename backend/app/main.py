from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "NER Logistics Intelligence Platform API",
        "version": "1.0.0",
        "region": "Assam, North Eastern Region"
    }

@app.get("/api/health")
def health_check():
    return {
        "api": "healthy",
        "database": "sqlite",
        "gis_engine": "geopandas/shapely/networkx"
    }

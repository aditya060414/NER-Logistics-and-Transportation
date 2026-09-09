import { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { RiskLegend } from './components/RiskLegend';
import { RiskMap } from './components/RiskMap';
import { RoadDetailPanel } from './components/RoadDetailPanel';
import { fetchRiskSummary, fetchRiskMap } from './services/api';
import type { RiskSummary, RiskGeoJSON, RoadRiskProperties } from './types/risk';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [geojsonData, setGeojsonData] = useState<RiskGeoJSON | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<RoadRiskProperties | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (filter: string = selectedFilter) => {
    setIsLoading(true);
    setError(null);

    try {
      const summaryData = await fetchRiskSummary();
      setSummary(summaryData);

      const levelParam = filter === 'ALL' ? undefined : filter === 'CLOSED' ? undefined : filter;
      const mapData = await fetchRiskMap(levelParam);
      setGeojsonData(mapData);
    } catch (err: any) {
      console.error('Error loading risk data:', err);
      setError('Unable to connect to Risk Intelligence Engine at http://localhost:8000. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    loadData(selectedFilter);
  }, [selectedFilter, loadData]);

  const handleSelectFilter = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleToggleEmergency = () => {
    setEmergencyMode((prev) => !prev);
  };

  const handleRoadSelect = (road: RoadRiskProperties) => {
    setSelectedRoad(road);
  };

  const handleClosePanel = () => {
    setSelectedRoad(null);
  };

  const handleToggleClosure = (osmId: string, currentStatus: string) => {
    if (!geojsonData) return;
    
    const newStatus = currentStatus === 'CLOSED' ? 'OPEN' : 'CLOSED';
    
    const updatedFeatures = geojsonData.features.map((f) => {
      if (String(f.properties.osm_id) === String(osmId)) {
        return {
          ...f,
          properties: {
            ...f.properties,
            road_status: newStatus as any,
          },
        };
      }
      return f;
    });

    setGeojsonData({
      ...geojsonData,
      features: updatedFeatures,
    });

    if (selectedRoad && String(selectedRoad.osm_id) === String(osmId)) {
      setSelectedRoad({
        ...selectedRoad,
        road_status: newStatus as any,
      });
    }

    if (summary) {
      setSummary({
        ...summary,
        closed_roads_count: newStatus === 'CLOSED' ? summary.closed_roads_count + 1 : Math.max(0, summary.closed_roads_count - 1),
      });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      <Header
        scenarioName={summary?.active_monsoon_scenario || 'Assam Monsoon 2022'}
        onRefresh={() => loadData(selectedFilter)}
        isLoading={isLoading}
        emergencyMode={emergencyMode}
        onToggleEmergency={handleToggleEmergency}
      />

      <KPICards
        summary={summary}
        activeIncidentsCount={12}
        affectedVehiclesCount={7}
        criticalDeliveriesCount={4}
      />

      <div className="relative flex-1 w-full h-full overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-[2000] bg-gray-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm font-medium text-gray-300">
              Loading 13,093 Assam Road Disruption Risk Vectors...
            </p>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] bg-red-950/90 border border-red-800 text-red-200 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-xs max-w-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Connection Failed</p>
              <p className="text-red-400">{error}</p>
            </div>
            <button
              onClick={() => loadData(selectedFilter)}
              className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-white rounded border border-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        <RiskMap
          geojsonData={geojsonData}
          selectedRoad={selectedRoad}
          onSelectRoad={handleRoadSelect}
          emergencyMode={emergencyMode}
        />

        <div className="absolute top-4 left-4 z-[1000] max-w-md">
          <RiskLegend
            selectedFilter={selectedFilter}
            onSelectFilter={handleSelectFilter}
            counts={
              summary
                ? {
                    low: summary.low_risk_count,
                    medium: summary.medium_risk_count,
                    high: summary.high_risk_count,
                    closed: summary.closed_roads_count,
                  }
                : undefined
            }
          />
        </div>

        {emergencyMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse flex items-center gap-2">
            <span>🚨 EMERGENCY OPERATIONS ACTIVE — FOCUSING ON HIGH-RISK &amp; LIFE-CRITICAL CORRIDORS</span>
          </div>
        )}

        <RoadDetailPanel
          selectedRoad={selectedRoad}
          onClose={handleClosePanel}
          onToggleClosure={handleToggleClosure}
        />
      </div>
    </div>
  );
}

export default App;

import { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { RiskLegend } from './components/RiskLegend';
import { RiskMap } from './components/RiskMap';
import { RoadDetailPanel } from './components/RoadDetailPanel';
import { RoutePlanner } from './components/RoutePlanner';
import { IncidentPanel } from './components/IncidentPanel';
import { FleetDrawer } from './components/FleetDrawer';
import { FieldOfficerModal } from './components/FieldOfficerModal';
import { FieldOfficerApp } from './components/field-officer/FieldOfficerApp';
import { DriverApp } from './components/driver/DriverApp';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { AlertBanner } from './components/AlertBanner';
import { AssamWeatherView } from './components/weather/AssamWeatherView';
import { AllIncidentsView } from './components/incident/AllIncidentsView';
import { AllFleetView } from './components/fleet/AllFleetView';
import { 
  fetchRiskSummary, 
  fetchRiskMap, 
  fetchIncidents, 
  verifyIncident, 
  rejectIncident, 
  createIncident,
  fetchVehicles,
  fetchDeliveries,
  fetchAlerts,
  markAlertRead,
  evaluateClosureImpact,
  dispatchReroute
} from './services/api';
import { getPendingReports } from './services/offlineStorage';
import type { RiskSummary, RiskGeoJSON, RoadRiskProperties } from './types/risk';
import type { RoutePlanResponse } from './types/route';
import type { Incident, IncidentCreateRequest } from './types/incident';
import type { Vehicle, Delivery, LogisticsAlert } from './types/logistics';
import { AlertCircle, RefreshCw, Compass, AlertTriangle, Smartphone, Users, CloudRain } from 'lucide-react';


export function App() {
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [geojsonData, setGeojsonData] = useState<RiskGeoJSON | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<RoadRiskProperties | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Route Planning States
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [activeRouteResponse, setActiveRouteResponse] = useState<RoutePlanResponse | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<'recommended' | 'alternative' | null>('recommended');
  const [blockedRoadOsmIds, setBlockedRoadOsmIds] = useState<string[]>([]);

  // Incident Queue States
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isIncidentPanelOpen, setIsIncidentPanelOpen] = useState<boolean>(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isIncidentLoading, setIsIncidentLoading] = useState<boolean>(false);

  // Fleet & Logistics States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [alerts, setAlerts] = useState<LogisticsAlert[]>([]);
  const [isFleetDrawerOpen, setIsFleetDrawerOpen] = useState<boolean>(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Role-Based Architecture: 'admin' vs 'field_officer' vs 'driver'
  const [activeRole, setActiveRole] = useState<'admin' | 'field_officer' | 'driver'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('driver')) {
        return 'driver';
      }
      if (window.location.hash.includes('field') || window.location.pathname.includes('field')) {
        return 'field_officer';
      }
      const saved = localStorage.getItem('ner_active_role');
      if (saved === 'field_officer' || saved === 'admin' || saved === 'driver') return saved;
    }
    return 'admin';
  });
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  const [isFieldOfficerModalOpen, setIsFieldOfficerModalOpen] = useState<boolean>(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);

  const [isWeatherRoute, setIsWeatherRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.includes('weather');
    }
    return false;
  });

  const [isIncidentsRoute, setIsIncidentsRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.includes('incident');
    }
    return false;
  });

  const [isFleetRoute, setIsFleetRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.includes('fleet') || window.location.hash.includes('logistics');
    }
    return false;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setIsWeatherRoute(hash.includes('weather'));
      setIsIncidentsRoute(hash.includes('incident'));
      setIsFleetRoute(hash.includes('fleet') || hash.includes('logistics'));
      if (hash.includes('driver')) {
        setActiveRole('driver');
      } else if (hash.includes('field')) {
        setActiveRole('field_officer');
      } else if (hash.includes('admin') || hash.includes('weather') || hash.includes('incident') || hash.includes('fleet') || hash.includes('logistics') || hash === '') {
        setActiveRole('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ner_active_role', activeRole);
    }
  }, [activeRole]);


  const checkOfflineQueue = useCallback(async () => {
    try {
      const pending = await getPendingReports();
      setPendingOfflineCount(pending.length);
    } catch (e) {
      console.warn('Could not read offline queue:', e);
    }
  }, []);

  const loadData = useCallback(async (filter: string = selectedFilter) => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryData, incidentsData, vehiclesData, deliveriesData, alertsData] = await Promise.all([
        fetchRiskSummary(),
        fetchIncidents(),
        fetchVehicles(),
        fetchDeliveries(),
        fetchAlerts()
      ]);
      setSummary(summaryData);
      setIncidents(incidentsData.incidents || []);
      setVehicles(vehiclesData || []);
      setDeliveries(deliveriesData || []);
      setAlerts(alertsData || []);

      const levelParam = filter === 'ALL' ? undefined : filter === 'CLOSED' ? undefined : filter;
      const mapData = await fetchRiskMap(levelParam);
      setGeojsonData(mapData);

      await checkOfflineQueue();
    } catch (err: any) {
      console.error('Error loading risk data:', err);
      setError('Unable to connect to Risk Intelligence Engine at http://localhost:8000. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter, checkOfflineQueue]);

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

  // Triggers logistics impact assessment whenever road closures change
  const triggerClosureImpact = async (updatedBlockedIds: string[]) => {
    try {
      const impact = await evaluateClosureImpact(updatedBlockedIds);
      if (impact.impacted) {
        if (impact.affected_vehicles.length > 0) {
          setVehicles((prev) =>
            prev.map((v) => {
              const matched = impact.affected_vehicles.find((av) => av.id === v.id);
              return matched || v;
            })
          );
        }
        if (impact.affected_deliveries.length > 0) {
          setDeliveries((prev) =>
            prev.map((d) => {
              const matched = impact.affected_deliveries.find((ad) => ad.id === d.id);
              return matched || d;
            })
          );

          const primaryDelivery = impact.affected_deliveries[0];
          if (primaryDelivery?.alternate_route_summary) {
            setActiveRouteResponse({
              origin: { lon: primaryDelivery.origin_coords.lon, lat: primaryDelivery.origin_coords.lat },
              destination: { lon: primaryDelivery.destination_coords.lon, lat: primaryDelivery.destination_coords.lat },
              priority: primaryDelivery.priority,
              recommended: primaryDelivery.alternate_route_summary,
              alternatives: [],
              no_safe_route: false,
            });
          }
        }
        if (impact.new_alerts.length > 0) {
          setAlerts((prev) => [...impact.new_alerts, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to evaluate closure impact:', err);
    }
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

    const updatedBlocked = newStatus === 'CLOSED'
      ? (blockedRoadOsmIds.includes(osmId) ? blockedRoadOsmIds : [...blockedRoadOsmIds, osmId])
      : blockedRoadOsmIds.filter((id) => id !== osmId);

    setBlockedRoadOsmIds(updatedBlocked);

    if (newStatus === 'CLOSED') {
      triggerClosureImpact(updatedBlocked);
    }

    if (summary) {
      setSummary({
        ...summary,
        closed_roads_count: newStatus === 'CLOSED' ? summary.closed_roads_count + 1 : Math.max(0, summary.closed_roads_count - 1),
      });
    }
  };

  const handlePlanRouteFromRoad = (road: RoadRiskProperties) => {
    if (!blockedRoadOsmIds.includes(road.osm_id)) {
      setBlockedRoadOsmIds((prev) => [...prev, road.osm_id]);
    }
    setIsRoutePlannerOpen(true);
  };

  const handleRemoveBlockedRoad = (osmId: string) => {
    setBlockedRoadOsmIds((prev) => prev.filter((id) => id !== osmId));
  };

  const handleClearBlockedRoads = () => {
    setBlockedRoadOsmIds([]);
  };

  // Incident Verification Flow
  const handleVerifyIncident = async (incidentId: string) => {
    setIsIncidentLoading(true);
    try {
      const res = await verifyIncident(incidentId);
      if (res.success && res.incident) {
        setIncidents((prev) =>
          prev.map((item) => (item.id === incidentId ? res.incident : item))
        );

        const targetOsmId = res.incident.osm_id;
        if (targetOsmId) {
          handleToggleClosure(targetOsmId, 'OPEN');
        }
      }
    } catch (err) {
      console.error('Failed to verify incident:', err);
    } finally {
      setIsIncidentLoading(false);
    }
  };

  const handleRejectIncident = async (incidentId: string) => {
    setIsIncidentLoading(true);
    try {
      const res = await rejectIncident(incidentId);
      if (res.success && res.incident) {
        setIncidents((prev) =>
          prev.map((item) => (item.id === incidentId ? res.incident : item))
        );
      }
    } catch (err) {
      console.error('Failed to reject incident:', err);
    } finally {
      setIsIncidentLoading(false);
    }
  };

  const handleCreateIncident = async (data: IncidentCreateRequest) => {
    setIsIncidentLoading(true);
    try {
      const res = await createIncident(data);
      if (res.success && res.incident) {
        setIncidents((prev) => [res.incident, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create incident:', err);
    } finally {
      setIsIncidentLoading(false);
    }
  };

  const handleSelectIncidentOnMap = (incident: Incident) => {
    setSelectedIncidentId(incident.id);
    setIsIncidentPanelOpen(true);
  };

  // Dispatch Detour Action
  const handleDispatchRerouteAction = async (vehicleId: string) => {
    try {
      const res = await dispatchReroute(vehicleId);
      if (res.success) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicleId ? res.vehicle : v))
        );
        if (res.delivery) {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === res.delivery.id ? res.delivery : d))
          );
        }
      }
    } catch (err) {
      console.error('Failed to dispatch detour:', err);
    }
  };

  const handleFocusVehicleOnMap = (veh: Vehicle) => {
    setSelectedVehicleId(veh.id);
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'READ' } : a))
      );
    } catch (e) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  const handleOpenAlertDetails = () => {
    setIsFleetDrawerOpen(true);
  };

  const unverifiedCount = incidents.filter((i) => i.status === 'UNVERIFIED').length;
  const atRiskCount = vehicles.filter((v) => v.status === 'AT_RISK').length;

  // Render Dedicated Field Officer Module if activeRole is 'field_officer'
  if (activeRole === 'field_officer') {
    return (
      <FieldOfficerApp
        onSwitchToAdmin={() => {
          setActiveRole('admin');
          window.location.hash = '#admin';
        }}
      />
    );
  }

  // Render Dedicated Logistics Driver Module if activeRole is 'driver'
  if (activeRole === 'driver') {
    return (
      <DriverApp
        onSwitchRole={(r) => {
          setActiveRole(r);
          window.location.hash = r === 'field_officer' ? '#field-officer' : `#${r}`;
        }}
      />
    );
  }

  // Render Dedicated Assam Weather Intelligence View if #weather
  if (isWeatherRoute && activeRole === 'admin') {
    return (
      <AssamWeatherView
        onBackToDashboard={() => {
          setIsWeatherRoute(false);
          window.location.hash = '#admin';
        }}
      />
    );
  }

  // Render Dedicated All Incidents View if #incidents
  if (isIncidentsRoute && activeRole === 'admin') {
    return (
      <AllIncidentsView
        onBackToDashboard={() => {
          setIsIncidentsRoute(false);
          window.location.hash = '#admin';
        }}
        onFocusIncidentOnMap={(inc) => {
          setIsIncidentsRoute(false);
          window.location.hash = '#admin';
          handleSelectIncidentOnMap(inc);
        }}
      />
    );
  }

  // Render Dedicated Freight Fleet & Logistics View if #fleet
  if (isFleetRoute && activeRole === 'admin') {
    return (
      <AllFleetView
        onBackToDashboard={() => {
          setIsFleetRoute(false);
          window.location.hash = '#admin';
        }}
        onFocusVehicleOnMap={(veh) => {
          setIsFleetRoute(false);
          window.location.hash = '#admin';
          handleFocusVehicleOnMap(veh);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Header
        scenarioName={summary?.active_monsoon_scenario || 'Assam Monsoon 2022'}
        onRefresh={() => loadData(selectedFilter)}
        isLoading={isLoading}
        emergencyMode={emergencyMode}
        onToggleEmergency={handleToggleEmergency}
        isRoutePlannerOpen={isRoutePlannerOpen}
        onToggleRoutePlanner={() => setIsRoutePlannerOpen((prev) => !prev)}
        hasActiveRoute={!!activeRouteResponse?.recommended}
        isIncidentPanelOpen={isIncidentPanelOpen}
        onToggleIncidentPanel={() => setIsIncidentPanelOpen((prev) => !prev)}
        unverifiedIncidentsCount={unverifiedCount}
        isFleetDrawerOpen={isFleetDrawerOpen}
        onToggleFleetDrawer={() => setIsFleetDrawerOpen((prev) => !prev)}
        atRiskVehiclesCount={atRiskCount}
        onSwitchToFieldOfficer={() => {
          setActiveRole('field_officer');
          window.location.hash = '#field-officer';
        }}
        onSwitchToDriver={() => {
          setActiveRole('driver');
          window.location.hash = '#driver';
        }}
        pendingOfflineCount={pendingOfflineCount}
        onOpenWeather={() => {
          setIsWeatherRoute(true);
          window.location.hash = '#weather';
        }}
        isWeatherActive={isWeatherRoute}
      />



      <KPICards
        summary={summary}
        activeIncidentsCount={incidents.length}
        affectedVehiclesCount={atRiskCount}
        criticalDeliveriesCount={deliveries.filter((d) => d.priority === 'CRITICAL').length}
      />

      {/* Real-Time Alert Banner Toast */}
      <AlertBanner
        alerts={alerts}
        onDismiss={handleDismissAlert}
        onOpenAlertDetails={handleOpenAlertDetails}
      />

      <div className="relative flex-1 min-h-0 w-full overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-[2000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-700">
              Loading 13,093 Assam Road Disruption Risk Vectors...
            </p>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-xs max-w-lg">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Connection Failed</p>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => loadData(selectedFilter)}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Leaflet Risk Map with Route, Incidents, and Live Fleet Markers */}
        <RiskMap
          geojsonData={geojsonData}
          selectedRoad={selectedRoad}
          onSelectRoad={handleRoadSelect}
          emergencyMode={emergencyMode}
          activeRouteResponse={activeRouteResponse}
          selectedRouteType={selectedRouteType}
          incidents={incidents}
          onSelectIncident={handleSelectIncidentOnMap}
          vehicles={vehicles}
          onSelectVehicle={handleFocusVehicleOnMap}
        />

        {/* Floating Filter / Legend on Left */}
        <div className="absolute top-4 left-4 z-[900] max-w-md">
          {!isRoutePlannerOpen && (
            <div className="space-y-2">
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
              
              <div className="grid grid-cols-4 gap-1.5">
                {/* Route Planner Button */}
                <button
                  onClick={() => setIsRoutePlannerOpen(true)}
                  className="flex items-center justify-center gap-1 py-2 px-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm text-[11px] transition group"
                >
                  <Compass className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-45 transition-transform" />
                  <span>Route</span>
                </button>

                {/* Incident Queue Button */}
                <button
                  onClick={() => setIsIncidentPanelOpen(true)}
                  className="flex items-center justify-center gap-1 py-2 px-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold rounded-lg shadow-sm text-[11px] transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Queue ({unverifiedCount})</span>
                </button>

                {/* Weather Button */}
                <button
                  onClick={() => {
                    setIsWeatherRoute(true);
                    window.location.hash = '#weather';
                  }}
                  className="flex items-center justify-center gap-1 py-2 px-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-semibold rounded-lg shadow-sm text-[11px] transition"
                >
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span>Weather</span>
                </button>

                {/* Field App Launcher */}
                <button
                  onClick={() => setIsFieldOfficerModalOpen(true)}
                  className="flex items-center justify-center gap-1 py-2 px-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-semibold rounded-lg shadow-sm text-[11px] transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                  <span>Field App</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Route Planner Floating Panel */}
        <RoutePlanner
          isOpen={isRoutePlannerOpen}
          onClose={() => setIsRoutePlannerOpen(false)}
          onRoutesCalculated={setActiveRouteResponse}
          activeRouteResponse={activeRouteResponse}
          selectedRouteType={selectedRouteType}
          onSelectRouteType={setSelectedRouteType}
          blockedRoadOsmIds={blockedRoadOsmIds}
          onRemoveBlockedRoad={handleRemoveBlockedRoad}
          onClearBlockedRoads={handleClearBlockedRoads}
        />

        {/* Incident Queue Panel */}
        <IncidentPanel
          isOpen={isIncidentPanelOpen}
          onClose={() => setIsIncidentPanelOpen(false)}
          incidents={incidents}
          onVerify={handleVerifyIncident}
          onReject={handleRejectIncident}
          onCreateIncident={handleCreateIncident}
          onSelectIncidentOnMap={handleSelectIncidentOnMap}
          selectedIncidentId={selectedIncidentId}
          isLoading={isIncidentLoading}
          onOpenAllIncidents={() => {
            setIsIncidentPanelOpen(false);
            setIsIncidentsRoute(true);
            window.location.hash = '#incidents';
          }}
        />

        {/* Fleet & Logistics Impact Drawer */}
        <FleetDrawer
          isOpen={isFleetDrawerOpen}
          onClose={() => setIsFleetDrawerOpen(false)}
          vehicles={vehicles}
          deliveries={deliveries}
          alerts={alerts}
          onDispatchReroute={handleDispatchRerouteAction}
          onFocusVehicleOnMap={handleFocusVehicleOnMap}
          selectedVehicleId={selectedVehicleId}
          activeRouteResponse={activeRouteResponse}
          onOpenAllFleet={() => {
            setIsFleetDrawerOpen(false);
            setIsFleetRoute(true);
            window.location.hash = '#fleet';
          }}
        />

        {/* Field Officer Offline Reporting Modal */}
        <FieldOfficerModal
          isOpen={isFieldOfficerModalOpen}
          onClose={() => {
            setIsFieldOfficerModalOpen(false);
            if (typeof window !== 'undefined' && window.location.hash === '#field') {
              window.history.pushState(null, '', window.location.pathname);
            }
            checkOfflineQueue();
          }}
          onIncidentSynced={() => {
            loadData(selectedFilter);
            checkOfflineQueue();
          }}
        />

        {/* Emergency Mode Announcement Banner */}
        {emergencyMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse flex items-center gap-2">
            <span>🚨 EMERGENCY OPERATIONS ACTIVE — FOCUSING ON HIGH-RISK &amp; LIFE-CRITICAL CORRIDORS</span>
          </div>
        )}

        {/* Floating Portal Switcher Button */}
        <div className="absolute bottom-6 right-6 z-[1200]">
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-lg transition group active:scale-95"
          >
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Switch Role / Portal</span>
          </button>
        </div>

        {/* Role Selection Gateway Modal */}
        <RoleSelectorModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          currentRole={activeRole}
          onSelectRole={(r) => {
            setActiveRole(r);
            if (r === 'field_officer') window.location.hash = '#field-officer';
            else if (r === 'driver') window.location.hash = '#driver';
            else window.location.hash = '#admin';
          }}
        />

        {/* Selected Road Details Panel */}
        <RoadDetailPanel
          selectedRoad={selectedRoad}
          onClose={handleClosePanel}
          onToggleClosure={handleToggleClosure}
          onPlanRouteFromRoad={handlePlanRouteFromRoad}
        />
      </div>
    </div>
  );
}

export default App;


import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, 
  Navigation, 
  AlertTriangle, 
  Bell, 
  Menu, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  ArrowLeft,
  Truck,
  Radio,
  Sliders,
  CloudRain
} from 'lucide-react';
import { AssamWeatherView } from '../weather/AssamWeatherView';
import { FieldHomeView } from './FieldHomeView';
import { FieldRouteView } from './FieldRouteView';
import { FieldReportView } from './FieldReportView';
import { FieldIncidentsView } from './FieldIncidentsView';
import { FieldDeliveryView } from './FieldDeliveryView';
import { FieldAlertsView } from './FieldAlertsView';
import { FieldEmergencyView } from './FieldEmergencyView';
import { FieldSettingsView } from './FieldSettingsView';
import { 
  planRoute, 
  fetchIncidents, 
  fetchDeliveries, 
  fetchVehicles, 
  fetchAlerts, 
  markAlertRead, 
  syncOfflineIncidents, 
  createIncident, 
  fetchCurrentWeather,
  updateDeliveryStatus,
  type WeatherCurrent
} from '../../services/api';

import { 
  saveOfflineReport, 
  getPendingReports, 
  markReportsSynced, 
  cacheActiveRoute, 
  getCachedRoute, 
  clearAllOfflineStorage,
  type OfflineReport 
} from '../../services/offlineStorage';
import type { Delivery, Vehicle, LogisticsAlert } from '../../types/logistics';
import type { Incident, IncidentCreateRequest } from '../../types/incident';
import type { RoutePlanResponse } from '../../types/route';
import type { 
  FieldOfficerTab, 
  OfficerNetworkStatus, 
  FieldOfficerGPS, 
  SupportedLanguage, 
  FieldRoadWarning, 
  TaskOperationalStatus 
} from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';

interface FieldOfficerAppProps {
  onSwitchToAdmin: () => void;
}

export const FieldOfficerApp: React.FC<FieldOfficerAppProps> = ({ onSwitchToAdmin }) => {
  // Tab navigation
  const [currentTab, setCurrentTab] = useState<FieldOfficerTab>('home');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = getTranslation(language);

  // Network and GPS
  const [networkStatus, setNetworkStatus] = useState<OfficerNetworkStatus>('ONLINE');
  const [gps, setGps] = useState<FieldOfficerGPS>({
    latitude: 26.1445,
    longitude: 91.7362,
    accuracy: 8,
    speed_kmh: 42,
    heading: 135,
    last_updated: new Date().toISOString(),
    status: 'ACTIVE',
  });

  // Data states
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<LogisticsAlert[]>([]);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);

  // Route states
  const [routeResponse, setRouteResponse] = useState<RoutePlanResponse | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<'recommended' | 'alternative'>('recommended');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Offline queue
  const [offlineReports, setOfflineReports] = useState<OfflineReport[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Road Warnings & Reroute Toasts
  const [activeWarning, setActiveWarning] = useState<FieldRoadWarning | null>(null);

  // State-wide Weather Observer Modal (Admin View for Field Officer)
  const [showAdminWeatherModal, setShowAdminWeatherModal] = useState(false);

  // Demo Mode State
  const [demoModeActive, setDemoModeActive] = useState(true);
  const [demoStepIndex, setDemoStepIndex] = useState(0);

  // Load Initial Data
  const refreshData = useCallback(async () => {
    try {
      // Pending offline reports
      const pending = await getPendingReports();
      setOfflineReports(pending);

      if (networkStatus === 'ONLINE') {
        const [delivs, vehs, incs, alrts, wthr] = await Promise.all([
          fetchDeliveries().catch(() => []),
          fetchVehicles().catch(() => []),
          fetchIncidents().catch(() => ({ incidents: [] })),
          fetchAlerts().catch(() => []),
          fetchCurrentWeather().catch(() => null),
        ]);

        const d102 = delivs.find((d) => d.id === 'D102') || delivs[0] || null;
        const v101 = vehs.find((v) => v.id === 'V101') || vehs[0] || null;

        setActiveDelivery(d102);
        setActiveVehicle(v101);
        setIncidents(incs.incidents || []);
        setAlerts(alrts || []);
        setWeather(wthr);

        // Fetch Route for D102: Guwahati to Haflong
        const origLat = d102?.origin_coords?.lat || 26.1445;
        const origLon = d102?.origin_coords?.lon || 91.7362;
        const destLat = d102?.destination_coords?.lat || 25.1706;
        const destLon = d102?.destination_coords?.lon || 93.0175;

        const plan = await planRoute({
          origin_lat: origLat,
          origin_lon: origLon,
          dest_lat: destLat,
          dest_lon: destLon,
          priority: (d102?.priority as any) || 'CRITICAL',
          blocked_roads: [],
        });

        setRouteResponse(plan);
        await cacheActiveRoute('D102', plan);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        // Read cached route
        const cached = await getCachedRoute('D102');
        if (cached) {
          setRouteResponse(cached.plan);
        }
      }
    } catch (err) {
      console.warn('Initial field data load error:', err);
      const cached = await getCachedRoute('D102');
      if (cached) {
        setRouteResponse(cached.plan);
      }
    }
  }, [networkStatus]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Recalculate Route with given priority or closures
  const handleRecalculateRoute = async (priority: string = 'CRITICAL', blockedOsmIds: string[] = []) => {
    setIsLoadingRoute(true);
    try {
      const origLat = activeDelivery?.origin_coords?.lat || 26.1445;
      const origLon = activeDelivery?.origin_coords?.lon || 91.7362;
      const destLat = activeDelivery?.destination_coords?.lat || 25.1706;
      const destLon = activeDelivery?.destination_coords?.lon || 93.0175;

      const plan = await planRoute({
        origin_lat: origLat,
        origin_lon: origLon,
        dest_lat: destLat,
        dest_lon: destLon,
        priority: (priority as any) || 'CRITICAL',
        blocked_roads: blockedOsmIds,
      });

      setRouteResponse(plan);
      await cacheActiveRoute('D102', plan);
    } catch (e) {
      console.error('Failed to recalculate route:', e);
    } finally {
      setIsLoadingRoute(false);
    }
  };


  // Sync Offline Reports
  const handleSyncNow = async () => {
    if (networkStatus !== 'ONLINE') {
      alert('Cannot sync while cellular signal is OFFLINE. Toggle network back to ONLINE to transmit.');
      return;
    }
    if (offlineReports.length === 0) {
      alert('IndexedDB queue is empty. No pending reports.');
      return;
    }

    setIsSyncing(true);
    try {
      const payload: IncidentCreateRequest[] = offlineReports.map((r) => ({
        type: r.type,
        road_name: r.road_name,
        description: r.description,
        source: r.source || 'OFFICER',
        severity: r.severity,
        latitude: r.latitude,
        longitude: r.longitude,
        photo_url: r.photo_url,
      }));

      const res = await syncOfflineIncidents(payload);
      if (res.success) {
        const localIds = offlineReports.map((r) => r.local_id);
        await markReportsSynced(localIds);
        const remaining = await getPendingReports();
        setOfflineReports(remaining);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        refreshData();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit Incident Report (Online vs. Offline)
  const handleSubmitReport = async (
    data: IncidentCreateRequest,
    photoDataUrl?: string
  ): Promise<{ success: boolean; offline: boolean }> => {
    if (networkStatus === 'OFFLINE') {
      await saveOfflineReport(data, photoDataUrl);
      const pending = await getPendingReports();
      setOfflineReports(pending);
      return { success: true, offline: true };
    } else {
      try {
        await createIncident(data);
        refreshData();
        return { success: true, offline: false };
      } catch (e) {

        // Fallback to offline storage
        await saveOfflineReport(data, photoDataUrl);
        const pending = await getPendingReports();
        setOfflineReports(pending);
        return { success: true, offline: true };
      }
    }
  };

  // Update Task Status
  const handleUpdateDeliveryStatus = async (status: TaskOperationalStatus, delayMinutes?: number) => {
    if (!activeDelivery) return;
    try {
      const res = await updateDeliveryStatus(activeDelivery.id, {
        status,
        delay_minutes: delayMinutes,
      });
      if (res.success) {
        setActiveDelivery(res.delivery);
      }
    } catch (e) {
      // Local state update if offline
      setActiveDelivery((prev) => (prev ? { ...prev, status, delay_minutes: delayMinutes || prev.delay_minutes } : null));
    }
  };

  // Update GPS Pin
  const handleUpdateGPS = (lat: number, lon: number) => {
    setGps((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      last_updated: new Date().toISOString(),
      status: 'DEMO_GPS',
    }));

    // Trigger proximity warnings if near dangerous segment
    if (lat > 25.16 && lat < 25.20 && lon > 93.00 && lon < 93.06) {
      setActiveWarning({
        id: 'WARN-HAZARD-01',
        type: 'HIGH_RISK_ROAD',
        road_name: 'Dima Hasao Hill Pass Km 52',
        risk_level: 'CRITICAL',
        reason: 'Heavy continuous rainfall + slope failure saturation (>92%)',
        distance_km: 1.8,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Send Emergency SOS
  const handleSendEmergencySOS = async (type: string, message: string) => {
    const reportData: IncidentCreateRequest = {
      type: 'ACCIDENT',
      road_name: `EMERGENCY SOS: ${activeVehicle?.vehicle_number || 'AS-01-TR-102'}`,
      description: `[SOS TRIGGERED: ${type}] ${message}`,
      source: 'OFFICER',
      severity: 'CRITICAL',
      latitude: gps.latitude,
      longitude: gps.longitude,
    };
    await handleSubmitReport(reportData);
  };

  // Automated 12-Step Demo Scenario
  const handleRunFullDemoScenario = async () => {
    setDemoModeActive(true);
    setCurrentTab('route');

    // Step 1: Start Guwahati
    setGps((prev) => ({ ...prev, latitude: 26.1445, longitude: 91.7362, status: 'DEMO_GPS' }));
    handleUpdateDeliveryStatus('IN_TRANSIT');

    // Step 2: Move GPS to Nagaon
    setTimeout(() => {
      setGps((prev) => ({ ...prev, latitude: 26.3452, longitude: 92.6840, status: 'DEMO_GPS' }));
    }, 2000);

    // Step 3: Approach Dima Hasao slope & warning
    setTimeout(() => {
      setGps((prev) => ({ ...prev, latitude: 25.1852, longitude: 93.0412, status: 'DEMO_GPS' }));
      setActiveWarning({
        id: 'DEMO-WARN-01',
        type: 'HIGH_RISK_ROAD',
        road_name: 'NH-27 Dima Hasao Hill Pass Km 52',
        risk_level: 'HIGH',
        reason: 'Heavy rainfall + historical landslide zone',
        distance_km: 2.4,
        timestamp: new Date().toISOString(),
      });
    }, 4500);

    // Step 4: Road Closure occurs & Reroute received
    setTimeout(async () => {
      setActiveWarning({
        id: 'DEMO-WARN-CLOSED',
        type: 'ROAD_CLOSED',
        road_name: 'NH-27 Dima Hasao Hill Pass Km 52',
        risk_level: 'CRITICAL',
        reason: 'Verified massive landslide. Carriageway severed.',
        distance_km: 0.5,
        timestamp: new Date().toISOString(),
      });
      // Recalculate detour
      await handleRecalculateRoute('CRITICAL', ['58129033', '310323380']);
      handleUpdateDeliveryStatus('REROUTED', 42);
    }, 8000);
  };

  // Step-by-step executor
  const handleExecuteDemoStep = async (stepIdx: number) => {
    setDemoStepIndex(stepIdx);
    setDemoModeActive(true);

    switch (stepIdx) {
      case 0:
        setCurrentTab('home');
        setGps((prev) => ({ ...prev, latitude: 26.1445, longitude: 91.7362, status: 'DEMO_GPS' }));
        handleUpdateDeliveryStatus('ASSIGNED');
        break;
      case 1:
        setCurrentTab('route');
        handleUpdateDeliveryStatus('IN_TRANSIT');
        setGps((prev) => ({ ...prev, latitude: 26.3452, longitude: 92.6840, status: 'DEMO_GPS' }));
        break;
      case 2:
        setCurrentTab('route');
        setGps((prev) => ({ ...prev, latitude: 25.1852, longitude: 93.0412, status: 'DEMO_GPS' }));
        setActiveWarning({
          id: 'STEP-WARN-1',
          type: 'HIGH_RISK_ROAD',
          road_name: 'Bijni–Panbari / Dima Hasao Hill Pass',
          risk_level: 'HIGH',
          reason: 'Severe heavy rainfall + slope instability',
          distance_km: 2.1,
          timestamp: new Date().toISOString(),
        });
        break;
      case 3:
        setCurrentTab('report');
        break;
      case 4:
        setCurrentTab('route');
        setActiveWarning({
          id: 'STEP-WARN-CLOSED',
          type: 'ROAD_CLOSED',
          road_name: 'NH-27 Dima Hasao Hill Pass Km 52',
          risk_level: 'CRITICAL',
          reason: 'Verified slope failure incident by ASDMA Control Tower',
          timestamp: new Date().toISOString(),
        });
        break;
      case 5:
        setCurrentTab('route');
        await handleRecalculateRoute('CRITICAL', ['58129033', '310323380']);
        handleUpdateDeliveryStatus('REROUTED', 42);
        setActiveWarning(null);
        break;
      case 6:
        setCurrentTab('delivery');
        setGps((prev) => ({ ...prev, latitude: 25.1706, longitude: 93.0175, status: 'DEMO_GPS' }));
        handleUpdateDeliveryStatus('COMPLETED');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Clean Responsive Navigation Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition group active:scale-95"
            title="Switch to Admin Control Tower KPI Dashboard"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-blue-600" />
            <span>Admin Tower</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-wide">
                ASDMA Field Operations
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                Assam Tactical Client
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Utilities: Network, Language, SOS */}
        <div className="flex items-center gap-2.5">
          {/* Online / Offline Network Switch */}
          <button
            type="button"
            onClick={() => setNetworkStatus((prev) => (prev === 'ONLINE' ? 'OFFLINE' : 'ONLINE'))}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              networkStatus === 'ONLINE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse hover:bg-rose-100'
            }`}
            title="Click to toggle network connectivity simulation"
          >
            {networkStatus === 'ONLINE' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>OFFLINE</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="en">English (EN)</option>
            <option value="as">অসমীয়া (AS)</option>
            <option value="hi">हिन्दी (HI)</option>
          </select>

          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => setCurrentTab('emergency')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md shadow-red-600/30 transition active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </button>
        </div>
      </header>

      {/* Desktop & Tablet Navigation Bar */}
      <div className="hidden md:flex bg-white/80 backdrop-blur border-b border-slate-200 px-4 md:px-8 py-2.5 items-center gap-2 overflow-x-auto scrollbar-none sticky top-[57px] z-40">
        {[
          { id: 'home', label: t.home, icon: Home },
          { id: 'route', label: t.route, icon: Navigation },
          { id: 'report', label: t.report, icon: AlertTriangle, highlight: true },
          { id: 'incidents', label: t.incidents, icon: Radio, count: incidents.length },
          { id: 'delivery', label: t.myTask, icon: Truck },
          { id: 'weather', label: 'Weather (Assam)', icon: CloudRain, count: 35 },
          { id: 'alerts', label: t.alerts, icon: Bell, count: alerts.length, isBadge: true },
          { id: 'settings', label: t.settings, icon: Sliders, count: offlineReports.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'weather') {
                  setShowAdminWeatherModal(true);
                } else {
                  setCurrentTab(tab.id as any);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : tab.highlight
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : tab.isBadge ? 'bg-rose-100 text-rose-800 border border-rose-200' : tab.id === 'weather' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Responsive Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-5 pb-24 md:pb-8">
        {currentTab === 'home' && (
          <FieldHomeView
            networkStatus={networkStatus}
            onToggleNetworkStatus={() => setNetworkStatus((p) => (p === 'ONLINE' ? 'OFFLINE' : 'ONLINE'))}
            gps={gps}
            onToggleGPS={() =>
              setGps((p) => ({
                ...p,
                status: p.status === 'ACTIVE' ? 'SIGNAL_LOST' : p.status === 'SIGNAL_LOST' ? 'DEMO_GPS' : 'ACTIVE',
              }))
            }
            pendingReportsCount={offlineReports.length}
            lastSyncTime={lastSyncTime}
            isSyncing={isSyncing}
            onSyncNow={handleSyncNow}
            activeDelivery={activeDelivery}
            activeVehicle={activeVehicle}
            weather={weather}
            language={language}
            onNavigateTab={setCurrentTab}
            demoModeActive={demoModeActive}
            onOpenAdminWeather={() => setShowAdminWeatherModal(true)}
          />
        )}

        {currentTab === 'route' && (
          <FieldRouteView
            routeResponse={routeResponse}
            selectedRouteType={selectedRouteType}
            onSelectRouteType={setSelectedRouteType}
            incidents={incidents}
            activeDelivery={activeDelivery}
            activeVehicle={activeVehicle}
            gps={gps}
            onUpdateGPS={handleUpdateGPS}
            onRecalculateRoute={handleRecalculateRoute}
            isLoadingRoute={isLoadingRoute}
            language={language}
            onStartJourney={() => handleUpdateDeliveryStatus('IN_TRANSIT')}
            onContactControlRoom={() => setCurrentTab('emergency')}
            activeWarning={activeWarning}
            onDismissWarning={() => setActiveWarning(null)}
            demoModeActive={demoModeActive}
            onTriggerDemoReroute={() => handleExecuteDemoStep(5)}
          />
        )}

        {currentTab === 'report' && (
          <FieldReportView
            gps={gps}
            networkStatus={networkStatus}
            onSubmitReport={handleSubmitReport}
            language={language}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'incidents' && (
          <FieldIncidentsView
            incidents={incidents}
            offlineReports={offlineReports}
            gps={gps}
            onSyncNow={handleSyncNow}
            isSyncing={isSyncing}
            onSubmitRadioReport={async (report) => {
              await handleSubmitReport(report);
            }}
            language={language}
            onNavigateToRoute={() => setCurrentTab('route')}
          />
        )}

        {currentTab === 'delivery' && (
          <FieldDeliveryView
            delivery={activeDelivery}
            vehicle={activeVehicle}
            onUpdateStatus={handleUpdateDeliveryStatus}
            language={language}
            onNavigateToRoute={() => setCurrentTab('route')}
          />
        )}

        {currentTab === 'alerts' && (
          <FieldAlertsView
            alerts={alerts}
            onMarkRead={async (id) => {
              await markAlertRead(id).catch(() => null);
              setAlerts((prev) => prev.filter((a) => a.id !== id));
            }}
            onNavigateToRoute={() => setCurrentTab('route')}
            language={language}
          />
        )}

        {currentTab === 'emergency' && (
          <FieldEmergencyView
            gps={gps}
            activeDelivery={activeDelivery}
            activeVehicle={activeVehicle}
            language={language}
            onSendEmergencySOS={handleSendEmergencySOS}
            onNavigateBack={() => setCurrentTab('route')}
          />
        )}

        {currentTab === 'settings' && (
          <FieldSettingsView
            language={language}
            onChangeLanguage={setLanguage}
            pendingReportsCount={offlineReports.length}
            offlineReports={offlineReports}
            isSyncing={isSyncing}
            onSyncNow={handleSyncNow}
            onClearOfflineCache={async () => {
              await clearAllOfflineStorage();
              setOfflineReports([]);
            }}
            demoModeActive={demoModeActive}
            onToggleDemoMode={() => setDemoModeActive(!demoModeActive)}
            onRunFullDemoScenario={handleRunFullDemoScenario}
            demoStepIndex={demoStepIndex}
            onExecuteDemoStep={handleExecuteDemoStep}
          />
        )}
      </main>

      {/* Mobile-Only Bottom Navigation Bar (Hidden on Tablets/Desktops) */}
      <nav className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2.5 flex items-center justify-around fixed bottom-0 left-0 right-0 z-40 shadow-lg">
        {/* Home Tab */}
        <button
          type="button"
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentTab === 'home' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">{t.home}</span>
        </button>

        {/* Route Tab */}
        <button
          type="button"
          onClick={() => setCurrentTab('route')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentTab === 'route' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Navigation className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">{t.route}</span>
        </button>

        {/* Report Tab */}
        <button
          type="button"
          onClick={() => setCurrentTab('report')}
          className="flex flex-col items-center -mt-5 group"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-active:scale-95 transition border-4 border-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-amber-600 mt-1">{t.report}</span>
        </button>

        {/* Alerts Tab */}
        <button
          type="button"
          onClick={() => setCurrentTab('alerts')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition relative ${
            currentTab === 'alerts' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">{t.alerts}</span>
          {alerts.length > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* More Tab */}
        <button
          type="button"
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentTab === 'settings' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">{t.more}</span>
        </button>
      </nav>

      {/* State-wide Assam Weather Observer Modal (Admin View for Field Officer) */}
      {showAdminWeatherModal && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => setShowAdminWeatherModal(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Field Officer Portal</span>
            </button>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800 block">State-wide Weather Observer Mode</span>
              <span className="text-[10px] text-blue-600 font-mono">Assam 35 Administrative Districts</span>
            </div>
          </div>
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            <AssamWeatherView onBack={() => setShowAdminWeatherModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  User, 
  Home, 
  AlertOctagon, 
  ArrowLeftRight, 
  Shield, 
  Smartphone, 
  PlusCircle, 
  BellRing 
} from 'lucide-react';
import type { 
  DriverProfile, 
  DriverGPS, 
  DriverTab, 
  DriverNetworkStatus 
} from '../../types/driver';
import type { Delivery, LogisticsAlert } from '../../types/logistics';
import type { RoutePlanResponse, RouteSummary } from '../../types/route';
import type { SupportedLanguage } from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';
import { planRoute } from '../../services/api';

// Components
import { DriverLogin } from './DriverLogin';
import { DriverHomeView } from './DriverHomeView';
import { DriverNewConsignmentView } from './DriverNewConsignmentView';
import { DriverRouteResultView } from './DriverRouteResultView';
import { DriverActiveTripView } from './DriverActiveTripView';
import { DriverReportIssueView } from './DriverReportIssueView';
import { DriverAlertsView } from './DriverAlertsView';
import { DriverHistoryView } from './DriverHistoryView';
import { DriverProfileView } from './DriverProfileView';
import { DriverEmergencyModal } from './DriverEmergencyModal';

interface DriverAppProps {
  onSwitchRole: (role: 'admin' | 'field_officer') => void;
}

const DEFAULT_DRIVER_PROFILE: DriverProfile = {
  id: 'DRV-AS-401',
  name: 'Ramesh Baruah',
  phone: '+91 94350 12849',
  vehicle_id: 'V-01',
  vehicle_number: 'AS-01-EC-9042',
  vehicle_type: 'Mahindra Bolero Maxi Truck (4x4)',
  carrier_hub: 'Guwahati Regional Hub',
  license_number: 'AS0120190048123',
  rating: 4.9,
};

// Initial default active consignment so driver can test navigation right away
const INITIAL_ACTIVE_DELIVERY: Delivery = {
  id: 'D-102',
  consignment_id: 'CN-2026-00102',
  cargo_name: 'Life-Saving Critical Medicines & IV Saline',
  cargo_type: 'MEDICINE',
  priority: 'CRITICAL',
  origin: 'Guwahati Medical Warehouse Hub',
  origin_coords: { lat: 26.1445, lon: 91.7362 },
  destination: 'Haflong Hill Civil Hospital Depot',
  destination_coords: { lat: 25.1764, lon: 93.0186 },
  assigned_vehicle_id: 'V-01',
  driver_id: 'DRV-AS-401',
  driver_name: 'Ramesh Baruah',
  driver_phone: '+91 94350 12849',
  quantity: 320,
  unit: 'boxes',
  weight_kg: 840,
  description: 'Temperature-sensitive IV saline and trauma antibiotics for flood-hit hill communities.',
  notes: 'High priority dispatch. Avoid low-lying river crossing roads.',
  status: 'IN_TRANSIT',
  scheduled_eta: '2026-09-10 16:45',
  delay_minutes: 0,
  risk_level: 'LOW',
  reroute_active: false,
};

export const DriverApp: React.FC<DriverAppProps> = ({ onSwitchRole }) => {
  // Authentication & Session
  const [driver, setDriver] = useState<DriverProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ner_driver_profile');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return DEFAULT_DRIVER_PROFILE;
  });

  // Current active tab
  const [activeTab, setActiveTab] = useState<DriverTab>('home');

  // Network & GPS status
  const [networkStatus, setNetworkStatus] = useState<DriverNetworkStatus>(() => 
    typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'ONLINE'
  );

  const [currentGps, setCurrentGps] = useState<DriverGPS>({
    latitude: 26.1445,
    longitude: 91.7362,
    speed_kmh: 52,
    heading: 65,
    accuracy: 4,
    last_updated: new Date().toLocaleTimeString(),
    status: 'ACTIVE',
  });

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState<boolean>(false);

  // Deliveries & Active Route
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(INITIAL_ACTIVE_DELIVERY);
  const [activeRoute, setActiveRoute] = useState<RouteSummary | null>(null);
  const [pendingRoutePlan, setPendingRoutePlan] = useState<RoutePlanResponse | null>(null);
  const [historyDeliveries, setHistoryDeliveries] = useState<Delivery[]>([]);
  const [alerts, setAlerts] = useState<LogisticsAlert[]>([]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('ONLINE');
    const handleOffline = () => setNetworkStatus('OFFLINE');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial route for default delivery on mount
  useEffect(() => {
    const loadInitialRoute = async () => {
      try {
        const plan = await planRoute({
          origin_lat: INITIAL_ACTIVE_DELIVERY.origin_coords.lat,
          origin_lon: INITIAL_ACTIVE_DELIVERY.origin_coords.lon,
          dest_lat: INITIAL_ACTIVE_DELIVERY.destination_coords.lat,
          dest_lon: INITIAL_ACTIVE_DELIVERY.destination_coords.lon,
          priority: INITIAL_ACTIVE_DELIVERY.priority,
          blocked_roads: [],
        });
        if (plan.recommended) {
          setActiveRoute(plan.recommended);
        }
      } catch (err) {
        console.warn('Initial route plan fetch fallback:', err);
      }
    };
    loadInitialRoute();
  }, []);

  // Handle new consignment created from DriverNewConsignmentView
  const handleConsignmentCreated = (newDelivery: Delivery, routePlan: RoutePlanResponse) => {
    setActiveDelivery(newDelivery);
    setPendingRoutePlan(routePlan);
    if (routePlan.recommended) {
      setActiveRoute(routePlan.recommended);
    }
    setActiveTab('route_preview');
  };

  // Handle Start Journey from Route Preview
  const handleStartJourney = (selectedRoute: RouteSummary) => {
    setActiveRoute(selectedRoute);
    if (activeDelivery) {
      setActiveDelivery({
        ...activeDelivery,
        status: 'IN_TRANSIT',
      });
    }
    setActiveTab('active_trip');
  };

  // Handle Delivery Completed
  const handleDeliveryCompleted = (completedDelivery: Delivery) => {
    setHistoryDeliveries((prev) => [completedDelivery, ...prev]);
    setActiveDelivery(null);
    setActiveRoute(null);
    setPendingRoutePlan(null);
    setActiveTab('history');
  };

  // Login handler
  const handleLogin = (profile: DriverProfile) => {
    setDriver(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ner_driver_profile', JSON.stringify(profile));
    }
  };

  // Logout handler
  const handleLogout = () => {
    setDriver(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ner_driver_profile');
    }
  };

  const t = getTranslation(selectedLanguage);

  if (!driver) {
    return <DriverLogin onLogin={handleLogin} onSwitchRole={onSwitchRole} />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      {/* Top Professional Driver Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-[3000] shadow-xs shrink-0">
        {/* Brand & Driver Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-xs">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-900 tracking-wide">
                {driver.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold">
                {driver.vehicle_number}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="text-slate-700 font-medium">{t.driver} CONSOLE</span>
              <span>•</span>
              <span className="font-mono text-emerald-600 font-bold">{networkStatus}</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'home' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new_consignment')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 ${
              activeTab === 'new_consignment' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Consignment</span>
          </button>
          {activeDelivery && (
            <button
              type="button"
              onClick={() => setActiveTab('active_trip')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'active_trip' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>In-Transit HUD</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 ${
              activeTab === 'alerts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Tactical Actions (Language, Switch Role, Emergency SOS) */}
        <div className="flex items-center gap-2">
          {/* Quick Role Switcher Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-xs"
              title="Switch Operational Portal"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Role Switch</span>
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-[4000] text-xs space-y-1 animate-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Switch Portal
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleMenuOpen(false);
                    onSwitchRole('field_officer');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Field Officer Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleMenuOpen(false);
                    onSwitchRole('admin');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Admin Control Tower</span>
                </button>
              </div>
            )}
          </div>

          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-xs transition active:scale-95"
          >
            <AlertOctagon className="w-4 h-4" />
            <span className="hidden sm:inline">SOS</span>
          </button>
        </div>
      </header>

      {/* Main View Port */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <DriverHomeView
            driver={driver}
            activeDelivery={activeDelivery}
            activeRoute={activeRoute}
            currentGps={currentGps}
            networkStatus={networkStatus}
            selectedLanguage={selectedLanguage}
            onNavigateToNewConsignment={() => setActiveTab('new_consignment')}
            onNavigateToRoute={() => setActiveTab('route_preview')}
            onNavigateToActiveTrip={() => setActiveTab('active_trip')}
            onOpenReportModal={() => setActiveTab('report_hazard')}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onNavigateToAlerts={() => setActiveTab('alerts')}
          />
        )}

        {activeTab === 'new_consignment' && (
          <DriverNewConsignmentView
            driver={driver}
            currentGps={currentGps}
            onConsignmentCreated={handleConsignmentCreated}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'route_preview' && (
          activeDelivery && (activeRoute || pendingRoutePlan?.recommended) ? (
            <DriverRouteResultView
              delivery={activeDelivery}
              routePlan={pendingRoutePlan || {
                origin: { lon: activeDelivery.origin_coords.lon, lat: activeDelivery.origin_coords.lat },
                destination: { lon: activeDelivery.destination_coords.lon, lat: activeDelivery.destination_coords.lat },
                priority: activeDelivery.priority,
                recommended: activeRoute,
                alternatives: [],
                no_safe_route: false,
              }}
              driver={driver}
              onStartJourney={handleStartJourney}
              onEditConsignment={() => setActiveTab('new_consignment')}
            />
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>No route preview calculated yet. Please register a consignment first.</p>
              <button
                type="button"
                onClick={() => setActiveTab('new_consignment')}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Create Consignment
              </button>
            </div>
          )
        )}

        {activeTab === 'active_trip' && (
          activeDelivery && activeRoute ? (
            <DriverActiveTripView
              delivery={activeDelivery}
              route={activeRoute}
              driver={driver}
              currentGps={currentGps}
              onUpdateGps={setCurrentGps}
              onDeliveryCompleted={handleDeliveryCompleted}
              onOpenReportModal={() => setActiveTab('report_hazard')}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            />
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>No active journey in transit.</p>
              <button
                type="button"
                onClick={() => setActiveTab('new_consignment')}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Start New Consignment
              </button>
            </div>
          )
        )}

        {activeTab === 'report_hazard' && (
          <DriverReportIssueView
            driver={driver}
            currentGps={currentGps}
            onClose={() => setActiveTab('home')}
            onReportSuccess={() => {
              // Can show notification or redirect to alerts
            }}
          />
        )}

        {activeTab === 'alerts' && (
          <DriverAlertsView
            alerts={alerts}
            onMarkRead={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
          />
        )}

        {activeTab === 'history' && (
          <DriverHistoryView
            historyDeliveries={historyDeliveries}
            driver={driver}
          />
        )}

        {activeTab === 'profile' && (
          <DriverProfileView
            driver={driver}
            networkStatus={networkStatus}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile screens md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[3000] bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around text-[10px] font-bold shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
            activeTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('new_consignment')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
            activeTab === 'new_consignment' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Trip</span>
        </button>

        {activeDelivery && (
          <button
            type="button"
            onClick={() => setActiveTab('active_trip')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              activeTab === 'active_trip' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Navigation className="w-5 h-5 animate-pulse text-emerald-600" />
            <span>In-Transit</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
            activeTab === 'alerts' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BellRing className="w-5 h-5" />
          <span>Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
            activeTab === 'profile' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* High-Visibility Emergency SOS Modal */}
      <DriverEmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        gps={currentGps}
        vehicleNumber={driver.vehicle_number}
        driverName={driver.name}
      />
    </div>
  );
};

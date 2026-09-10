import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Radio, 
  User, 
  Shield, 
  MapPin, 
  RefreshCw, 
  ArrowLeft, 
  Search, 
  Flame, 
  ExternalLink,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import type { Incident } from '../../types/incident';
import { fetchIncidents, verifyIncident, rejectIncident, createIncident } from '../../services/api';

interface AllIncidentsViewProps {
  onBackToDashboard: () => void;
  onFocusIncidentOnMap?: (incident: Incident) => void;
}

export const AllIncidentsView: React.FC<AllIncidentsViewProps> = ({
  onBackToDashboard,
  onFocusIncidentOnMap,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Radio report modal
  const [isRadioModalOpen, setIsRadioModalOpen] = useState<boolean>(false);
  const [radioType, setRadioType] = useState<string>('LANDSLIDE');
  const [radioRoadName, setRadioRoadName] = useState<string>('');
  const [radioDesc, setRadioDesc] = useState<string>('');
  const [radioSeverity, setRadioSeverity] = useState<string>('CRITICAL');
  const [radioLat, setRadioLat] = useState<number>(25.6892);
  const [radioLon, setRadioLon] = useState<number>(92.9341);
  const [isSubmittingRadio, setIsSubmittingRadio] = useState<boolean>(false);

  const loadIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchIncidents();
      setIncidents(data.incidents || []);
    } catch (err: any) {
      console.error('Failed to load incidents:', err);
      setError(err?.message || 'Unable to connect to Incident Registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleVerify = async (id: string) => {
    setProcessingId(id);
    try {
      await verifyIncident(id);
      await loadIncidents();
    } catch (err: any) {
      console.error('Verify failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await rejectIncident(id);
      await loadIncidents();
    } catch (err: any) {
      console.error('Reject failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRadioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!radioRoadName || !radioDesc) return;

    setIsSubmittingRadio(true);
    try {
      await createIncident({
        type: radioType,
        road_name: radioRoadName,
        description: radioDesc,
        source: 'RADIO',
        severity: radioSeverity,
        latitude: radioLat,
        longitude: radioLon,
      });
      setIsRadioModalOpen(false);
      setRadioRoadName('');
      setRadioDesc('');
      await loadIncidents();
    } catch (err) {
      console.error('Failed to submit radio report:', err);
    } finally {
      setIsSubmittingRadio(false);
    }
  };

  const unverifiedCount = incidents.filter((i) => i.status === 'UNVERIFIED').length;
  const verifiedCount = incidents.filter((i) => i.status === 'VERIFIED').length;
  const rejectedCount = incidents.filter((i) => i.status === 'REJECTED').length;

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Status filter
      if (selectedStatus !== 'ALL' && inc.status !== selectedStatus) return false;

      // Severity filter
      if (selectedSeverity !== 'ALL' && inc.severity !== selectedSeverity) return false;

      // Source filter
      if (selectedSource !== 'ALL' && inc.source !== selectedSource) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRoad = inc.road_name?.toLowerCase().includes(q);
        const matchesDesc = inc.description?.toLowerCase().includes(q);
        const matchesId = inc.id?.toLowerCase().includes(q);
        const matchesOsm = inc.osm_id?.toLowerCase().includes(q);
        if (!matchesRoad && !matchesDesc && !matchesId && !matchesOsm) return false;
      }

      return true;
    });
  }, [incidents, selectedStatus, selectedSeverity, selectedSource, searchQuery]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Control Tower</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  Field Incident Registry &amp; Verification Desk
                </h1>
                <p className="text-[11px] text-slate-500">
                  Comprehensive multi-source incident queue • Triage, verify, &amp; enforce road closures
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRadioModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>+ Log Radio Report</span>
            </button>

            <button
              onClick={loadIncidents}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition shadow-2xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-3">✕</button>
          </div>
        )}

        {/* KPI Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 border-l-4 border-l-slate-600 rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Logged Reports</div>
            <div className="mt-1 text-2xl font-black text-slate-800">{incidents.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across all districts &amp; highways</div>
          </div>

          <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Pending Verification</div>
            <div className="mt-1 text-2xl font-black text-amber-600">{unverifiedCount}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Awaiting control officer review</div>
          </div>

          <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Verified Active Closures</div>
            <div className="mt-1 text-2xl font-black text-emerald-600">{verifiedCount}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Confirmed barriers in place</div>
          </div>

          <div className="bg-white border border-slate-200 border-l-4 border-l-rose-500 rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Rejected False Alarms</div>
            <div className="mt-1 text-2xl font-black text-rose-600">{rejectedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dismissed after field check</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by road name, corridor, description, incident ID or OSM ID..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Sources</option>
                <option value="OFFICER">Field Officer</option>
                <option value="RADIO">Radio Transmission</option>
                <option value="CITIZEN">Citizen Report</option>
                <option value="SYSTEM">System Telemetry</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
            {[
              { id: 'ALL', label: `All Reports (${incidents.length})` },
              { id: 'UNVERIFIED', label: `Pending Triage (${unverifiedCount})`, badgeColor: 'bg-amber-500 text-white' },
              { id: 'VERIFIED', label: `Verified (${verifiedCount})`, badgeColor: 'bg-emerald-500 text-white' },
              { id: 'REJECTED', label: `Rejected (${rejectedCount})`, badgeColor: 'bg-rose-500 text-white' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="ml-auto text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-800">{filteredIncidents.length}</strong> incidents
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold">Synchronizing incident feeds with control server...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredIncidents.length === 0 && (
          <div className="py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3 p-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Incidents Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No reports match your current search and filter criteria. You can clear filters or log a new radio report.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setSelectedSeverity('ALL');
                setSelectedSource('ALL');
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Incident Cards Grid */}
        {!isLoading && filteredIncidents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {filteredIncidents.map((incident) => {
              const isUnverified = incident.status === 'UNVERIFIED';
              const isVerified = incident.status === 'VERIFIED';
              const isProcessing = processingId === incident.id;

              return (
                <div
                  key={incident.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isUnverified
                      ? 'border-amber-300 border-l-4 border-l-amber-500'
                      : isVerified
                      ? 'border-emerald-300 border-l-4 border-l-emerald-500'
                      : 'border-slate-200 border-l-4 border-l-slate-400 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: ID, Source, Severity */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {incident.id}
                        </span>
                        {/* Source Badge */}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                            incident.source === 'RADIO'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : incident.source === 'OFFICER'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {incident.source === 'RADIO' ? (
                            <Radio className="w-2.5 h-2.5" />
                          ) : incident.source === 'OFFICER' ? (
                            <Shield className="w-2.5 h-2.5" />
                          ) : (
                            <User className="w-2.5 h-2.5" />
                          )}
                          {incident.source}
                        </span>
                      </div>

                      {/* Severity Badge */}
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                          incident.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : incident.severity === 'HIGH'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>

                    {/* Road Corridor Name */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{incident.road_name}</span>
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                        </span>
                        {incident.osm_id && (
                          <span className="font-mono text-slate-400 text-[10px]">
                            OSM #{incident.osm_id}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Narrative Text */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-700 leading-relaxed">
                      {incident.description}
                    </div>

                    {/* Submitted At / Status Details */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Reported: {incident.submitted_at ? new Date(incident.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                      {incident.type && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-semibold text-slate-600">
                          {incident.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions / Verification */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    {isUnverified ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(incident.id)}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 active:scale-95"
                        >
                          {isProcessing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          <span>VERIFY &amp; CLOSE ROAD</span>
                        </button>

                        <button
                          onClick={() => handleReject(incident.id)}
                          disabled={isProcessing}
                          className="py-2 px-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
                          title="Reject False Report"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : isVerified ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          VERIFIED • ROAD BLOCKED
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">Control Officer</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-700 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          REJECTED REPORT
                        </span>
                        <span className="text-[10px] text-rose-600 font-medium">Discarded</span>
                      </div>
                    )}

                    {/* View on Map Link */}
                    <button
                      onClick={() => {
                        if (onFocusIncidentOnMap) {
                          onFocusIncidentOnMap(incident);
                        } else {
                          onBackToDashboard();
                        }
                      }}
                      className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Focus on Control Tower Map</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Radio Report Modal */}
      {isRadioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  Emergency Field Radio Dispatch
                </h3>
              </div>
              <button
                onClick={() => setIsRadioModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRadioSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Incident Hazard Classification
                </label>
                <select
                  value={radioType}
                  onChange={(e) => setRadioType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="LANDSLIDE">Major Landslide / Rockfall</option>
                  <option value="FLOOD">Active River Flooding / Inundation</option>
                  <option value="ROAD_BREACH">Culvert / Embankment Breach</option>
                  <option value="BRIDGE_DAMAGE">Bridge Structural Collapse</option>
                  <option value="TREE_FALL">Uprooted Heavy Timber / Powerlines</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Road / Corridor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., NH-27 Km 142 near Lumding"
                  value={radioRoadName}
                  onChange={(e) => setRadioRoadName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                >
                </input>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={radioLat}
                    onChange={(e) => setRadioLat(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={radioLon}
                    onChange={(e) => setRadioLon(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Severity Assessment
                </label>
                <select
                  value={radioSeverity}
                  onChange={(e) => setRadioSeverity(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="CRITICAL" className="text-rose-600">CRITICAL (Total Obstruction)</option>
                  <option value="HIGH" className="text-amber-600">HIGH (Heavy Delay / Single Lane)</option>
                  <option value="MEDIUM" className="text-blue-600">MEDIUM (Caution Required)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Radio Transmission Details &amp; Field Report *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Officer VHF transmission transcript, physical ground status, vehicle backup queue..."
                  value={radioDesc}
                  onChange={(e) => setRadioDesc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRadioModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRadio}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition shadow-xs disabled:opacity-50"
                >
                  {isSubmittingRadio ? 'Transmitting...' : 'Log & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

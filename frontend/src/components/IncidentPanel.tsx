import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Radio, 
  User, 
  Shield, 
  MapPin, 
  X, 
  RefreshCw,
  Eye,
  Flame,
  ExternalLink
} from 'lucide-react';
import type { Incident, IncidentCreateRequest } from '../types/incident';

interface IncidentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  onVerify: (incidentId: string) => Promise<void>;
  onReject: (incidentId: string) => Promise<void>;
  onCreateIncident: (data: IncidentCreateRequest) => Promise<void>;
  onSelectIncidentOnMap?: (incident: Incident) => void;
  selectedIncidentId?: string | null;
  isLoading?: boolean;
  onOpenAllIncidents?: () => void;
}

export const IncidentPanel: React.FC<IncidentPanelProps> = ({
  isOpen,
  onClose,
  incidents,
  onVerify,
  onReject,
  onCreateIncident,
  onSelectIncidentOnMap,
  selectedIncidentId,
  isLoading = false,
  onOpenAllIncidents,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'>('UNVERIFIED');
  const [isRadioModalOpen, setIsRadioModalOpen] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Radio report form state
  const [radioType, setRadioType] = useState<string>('LANDSLIDE');
  const [radioRoadName, setRadioRoadName] = useState<string>('');
  const [radioDesc, setDesc] = useState<string>('');
  const [radioSeverity, setRadioSeverity] = useState<string>('CRITICAL');
  const [radioLat, setRadioLat] = useState<number>(25.6892);
  const [radioLon, setRadioLon] = useState<number>(92.9341);
  const [isSubmittingRadio, setIsSubmittingRadio] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredIncidents = incidents.filter((inc) => {
    if (filterTab === 'ALL') return true;
    return inc.status === filterTab;
  });

  const unverifiedCount = incidents.filter((i) => i.status === 'UNVERIFIED').length;
  const verifiedCount = incidents.filter((i) => i.status === 'VERIFIED').length;

  const handleVerifyClick = async (id: string) => {
    setProcessingId(id);
    try {
      await onVerify(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = async (id: string) => {
    setProcessingId(id);
    try {
      await onReject(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRadioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!radioRoadName || !radioDesc) return;

    setIsSubmittingRadio(true);
    try {
      await onCreateIncident({
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
      setDesc('');
    } catch (err) {
      console.error('Failed to submit radio report:', err);
    } finally {
      setIsSubmittingRadio(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 bottom-20 z-[1000] w-[420px] max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 text-slate-800">
        {/* Panel Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 select-none shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase truncate">
                Field Incident Queue
              </h2>
              <p className="text-[10px] text-slate-500 truncate">Control Officer Verification Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                if (onOpenAllIncidents) onOpenAllIncidents();
                else window.location.hash = '#incidents';
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition shadow-2xs whitespace-nowrap"
              title="Open All Incidents in Fullscreen Portal"
            >
              <ExternalLink className="w-3 h-3" />
              <span>FULL VIEW</span>
            </button>
            <button
              onClick={() => setIsRadioModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-lg text-[10px] font-bold transition shadow-2xs whitespace-nowrap"
              title="Log Radio Transmission"
            >
              <Radio className="w-3 h-3 text-sky-600 animate-pulse" />
              <span>+ RADIO</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 p-1.5 bg-slate-50/60 border-b border-slate-100 text-[10px] font-bold shrink-0">
          <button
            onClick={() => setFilterTab('UNVERIFIED')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
              filterTab === 'UNVERIFIED'
                ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <span>PENDING</span>
            {unverifiedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[9px]">
                {unverifiedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab('VERIFIED')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
              filterTab === 'VERIFIED'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <span>VERIFIED</span>
            <span className="text-[9px] text-emerald-600 font-bold">({verifiedCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('REJECTED')}
            className={`py-1.5 rounded-lg transition ${
              filterTab === 'REJECTED'
                ? 'bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            REJECTED
          </button>

          <button
            onClick={() => setFilterTab('ALL')}
            className={`py-1.5 rounded-lg transition ${
              filterTab === 'ALL'
                ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            ALL ({incidents.length})
          </button>
        </div>

        {/* Incidents List with flex-1 min-h-0 and bottom padding */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-xs pb-24">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              <span>Updating incident telemetry...</span>
            </div>
          )}

          {!isLoading && filteredIncidents.length === 0 && (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <CheckCircle className="w-6 h-6 mx-auto text-slate-300" />
              <p className="font-semibold text-xs text-slate-600">No incidents in this queue</p>
              <p className="text-[10px]">All reported road hazards have been triaged.</p>
            </div>
          )}

          {filteredIncidents.map((incident) => {
            const isUnverified = incident.status === 'UNVERIFIED';
            const isVerified = incident.status === 'VERIFIED';
            const isProcessing = processingId === incident.id;
            const isSelected = selectedIncidentId === incident.id;

            return (
              <div
                key={incident.id}
                className={`p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-50/50 border-amber-400 shadow-xs'
                    : isUnverified
                    ? 'bg-slate-50 border-amber-200 hover:border-amber-300'
                    : isVerified
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                {/* Header: ID, Source, Severity */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                      {incident.id}
                    </span>
                    {/* Source Tag */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
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

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
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
                <h3 className="font-bold text-slate-900 text-xs leading-tight mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="line-clamp-1">{incident.road_name}</span>
                </h3>

                {/* Location & Coordinates */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1.5">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                  </span>
                  {incident.osm_id && (
                    <span className="text-slate-400 font-medium">OSM: {incident.osm_id}</span>
                  )}
                </div>

                {/* Narrative */}
                <p className="text-[11px] text-slate-600 leading-relaxed mb-2 bg-white p-2 rounded-lg border border-slate-200">
                  {incident.description}
                </p>

                {/* Status Badges or Verification Controls */}
                {isUnverified ? (
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => handleVerifyClick(incident.id)}
                      disabled={isProcessing}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs flex items-center justify-center gap-1 transition disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      <span>VERIFY &amp; CLOSE ROAD</span>
                    </button>

                    <button
                      onClick={() => handleRejectClick(incident.id)}
                      disabled={isProcessing}
                      className="py-1.5 px-2.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-500 border border-slate-200 rounded-lg text-[11px] transition disabled:opacity-50"
                      title="Reject Report"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : isVerified ? (
                  <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[10px] text-emerald-800">
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      VERIFIED BY CONTROL OFFICER
                    </span>
                    <span className="text-slate-500 font-medium">Road Closed</span>
                  </div>
                ) : (
                  <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-[10px] text-rose-700">
                    <span className="flex items-center gap-1 font-semibold">
                      <XCircle className="w-3 h-3" />
                      REJECTED FALSE REPORT
                    </span>
                  </div>
                )}

                {/* Focus on map trigger */}
                {onSelectIncidentOnMap && (
                  <button
                    onClick={() => onSelectIncidentOnMap(incident)}
                    className="w-full text-center mt-2 text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus on Incident Map Pin</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Quick-Link Footer */}
        <div className="p-2.5 border-t border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between shrink-0 text-[10px]">
          <span className="text-slate-500 font-medium">
            <strong className="text-slate-800 font-bold">{filteredIncidents.length}</strong> {filterTab.toLowerCase()} in queue
          </span>
          <button
            onClick={() => {
              if (onOpenAllIncidents) onOpenAllIncidents();
              else window.location.hash = '#incidents';
            }}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
          >
            <span>Open Dedicated Portal</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Radio Report Modal */}
      {isRadioModalOpen && (
        <div className="fixed inset-0 z-[3000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
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
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRadioSubmit} className="p-4 space-y-3 text-xs">
              <p className="text-[11px] text-slate-500">
                Log VHF/HF radio transmissions when mobile network and field internet towers are incapacitated.
              </p>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  Incident Classification
                </label>
                <select
                  value={radioType}
                  onChange={(e) => setRadioType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
                >
                  <option value="LANDSLIDE">Landslide / Mudflow Blockage</option>
                  <option value="FLOOD">Flash Flood River Overwash</option>
                  <option value="ROAD_BREACH">Road Cut / Embankment Sinking</option>
                  <option value="BRIDGE_DAMAGE">Culvert / Bridge Impairment</option>
                  <option value="TREE_FALL">Uprooted Tree Line Obstruction</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  Affected Road / Corridor Segment
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NH-27 Km 140 near Haflong"
                  value={radioRoadName}
                  onChange={(e) => setRadioRoadName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  Radio Telemetry Narrative
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Relay message from field responder: water level, vehicle impassability, damage depth..."
                  value={radioDesc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={radioLat}
                    onChange={(e) => setRadioLat(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={radioLon}
                    onChange={(e) => setRadioLon(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  Severity Assessment
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {['CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setRadioSeverity(sev)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border transition ${
                        radioSeverity === sev
                          ? sev === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                            : 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRadioModalOpen(false)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRadio}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingRadio ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Radio className="w-3.5 h-3.5" />
                  )}
                  <span>LOG RADIO REPORT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

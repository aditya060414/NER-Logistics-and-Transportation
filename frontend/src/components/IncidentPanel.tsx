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
  Flame
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
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'>('UNVERIFIED');
  const [isRadioModalOpen, setIsRadioModalOpen] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Radio report form state
  const [radioType, setRadioType] = useState<string>('LANDSLIDE');
  const [radioRoadName, setRadioRoadName] = useState<string>('');
  const [radioDesc, setRadioDesc] = useState<string>('');
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
      setRadioDesc('');
    } catch (err) {
      console.error('Failed to submit radio report:', err);
    } finally {
      setIsSubmittingRadio(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-[1000] w-96 max-w-[calc(100vw-2rem)] bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 text-gray-200">
        {/* Panel Header */}
        <div className="p-3.5 border-b border-gray-800 flex items-center justify-between bg-gray-950/60 select-none">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                Field Incident Queue
              </h2>
              <p className="text-[10px] text-gray-400">Control Officer Verification Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRadioModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded text-[10px] font-bold transition shadow-sm"
              title="Log Radio Transmission"
            >
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>+ RADIO REPORT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 p-1.5 bg-gray-950/40 border-b border-gray-800 text-[10px] font-bold">
          <button
            onClick={() => setFilterTab('UNVERIFIED')}
            className={`py-1 rounded flex items-center justify-center gap-1 transition ${
              filterTab === 'UNVERIFIED'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>PENDING</span>
            {unverifiedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center font-bold text-[9px]">
                {unverifiedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab('VERIFIED')}
            className={`py-1 rounded flex items-center justify-center gap-1 transition ${
              filterTab === 'VERIFIED'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>VERIFIED</span>
            <span className="text-[9px] text-emerald-400">({verifiedCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('REJECTED')}
            className={`py-1 rounded transition ${
              filterTab === 'REJECTED'
                ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            REJECTED
          </button>

          <button
            onClick={() => setFilterTab('ALL')}
            className={`py-1 rounded transition ${
              filterTab === 'ALL'
                ? 'bg-gray-800 text-gray-200 border border-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ALL ({incidents.length})
          </button>
        </div>

        {/* Incidents List */}
        <div className="p-3 space-y-3 overflow-y-auto text-xs">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Updating incident telemetry...</span>
            </div>
          )}

          {!isLoading && filteredIncidents.length === 0 && (
            <div className="text-center py-8 text-gray-500 space-y-1">
              <CheckCircle className="w-6 h-6 mx-auto text-gray-600" />
              <p className="font-semibold text-xs">No incidents in this queue</p>
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
                className={`p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : isUnverified
                    ? 'bg-gray-950/70 border-amber-900/50 hover:border-amber-700/80'
                    : isVerified
                    ? 'bg-emerald-950/20 border-emerald-900/50'
                    : 'bg-gray-950/40 border-gray-800/80 opacity-60'
                }`}
              >
                {/* Header: ID, Source, Severity */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white text-[11px]">
                      {incident.id}
                    </span>
                    {/* Source Tag */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                        incident.source === 'RADIO'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : incident.source === 'OFFICER'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-purple-950 text-purple-300 border-purple-800'
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
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : incident.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-gray-800 text-gray-300 border-gray-700'
                    }`}
                  >
                    {incident.severity}
                  </span>
                </div>

                {/* Road Corridor Name */}
                <h3 className="font-bold text-white text-xs leading-tight mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="line-clamp-1">{incident.road_name}</span>
                </h3>

                {/* Location & Coordinates */}
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1.5">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                  </span>
                  {incident.osm_id && (
                    <span className="text-gray-500">OSM: {incident.osm_id}</span>
                  )}
                </div>

                {/* Narrative */}
                <p className="text-[11px] text-gray-300 leading-relaxed mb-2 bg-gray-900/60 p-2 rounded border border-gray-800/80">
                  {incident.description}
                </p>

                {/* Status Badges or Verification Controls */}
                {isUnverified ? (
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => handleVerifyClick(incident.id)}
                      disabled={isProcessing}
                      className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded text-[11px] shadow-sm flex items-center justify-center gap-1 transition disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      <span>VERIFY & CLOSE ROAD</span>
                    </button>

                    <button
                      onClick={() => handleRejectClick(incident.id)}
                      disabled={isProcessing}
                      className="py-1.5 px-2.5 bg-gray-800 hover:bg-red-950/60 hover:text-red-300 text-gray-400 border border-gray-700 rounded text-[11px] transition disabled:opacity-50"
                      title="Reject Report"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : isVerified ? (
                  <div className="p-1.5 bg-emerald-950/30 border border-emerald-900/60 rounded flex items-center justify-between text-[10px] text-emerald-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      VERIFIED BY CONTROL OFFICER
                    </span>
                    <span className="text-gray-400">Road Closed</span>
                  </div>
                ) : (
                  <div className="p-1.5 bg-red-950/20 border border-red-900/40 rounded flex items-center justify-between text-[10px] text-red-400">
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      REJECTED FALSE REPORT
                    </span>
                  </div>
                )}

                {/* Focus on map trigger */}
                {onSelectIncidentOnMap && (
                  <button
                    onClick={() => onSelectIncidentOnMap(incident)}
                    className="w-full text-center mt-2 text-[10px] text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus on Incident Map Pin</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Radio Report Modal */}
      {isRadioModalOpen && (
        <div className="fixed inset-0 z-[3000] bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-800/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-cyan-950/40">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase">
                  Emergency Field Radio Dispatch
                </h3>
              </div>
              <button
                onClick={() => setIsRadioModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRadioSubmit} className="p-4 space-y-3 text-xs">
              <p className="text-[11px] text-gray-400">
                Log VHF/HF radio transmissions when mobile network and field internet towers are incapacitated.
              </p>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                  Incident Classification
                </label>
                <select
                  value={radioType}
                  onChange={(e) => setRadioType(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded py-1.5 px-2 text-white"
                >
                  <option value="LANDSLIDE">Landslide / Mudflow Blockage</option>
                  <option value="FLOOD">Flash Flood River Overwash</option>
                  <option value="ROAD_BREACH">Road Cut / Embankment Sinking</option>
                  <option value="BRIDGE_DAMAGE">Culvert / Bridge Impairment</option>
                  <option value="TREE_FALL">Uprooted Tree Line Obstruction</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                  Affected Road / Corridor Segment
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NH-27 Km 140 near Haflong"
                  value={radioRoadName}
                  onChange={(e) => setRadioRoadName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded py-1.5 px-2 text-white placeholder-gray-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                  Radio Telemetry Narrative
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Relay message from field responder: water level, vehicle impassability, damage depth..."
                  value={radioDesc}
                  onChange={(e) => setRadioDesc(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded py-1.5 px-2 text-white placeholder-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={radioLat}
                    onChange={(e) => setRadioLat(parseFloat(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-700 rounded py-1.5 px-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={radioLon}
                    onChange={(e) => setRadioLon(parseFloat(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-700 rounded py-1.5 px-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                  Severity Assessment
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {['CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setRadioSeverity(sev)}
                      className={`py-1 text-[10px] font-bold rounded border transition ${
                        radioSeverity === sev
                          ? sev === 'CRITICAL'
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-amber-600 text-white border-amber-500'
                          : 'bg-gray-950 text-gray-400 border-gray-800'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsRadioModalOpen(false)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRadio}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
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

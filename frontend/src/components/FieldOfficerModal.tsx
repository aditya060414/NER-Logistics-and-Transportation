import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Camera, 
  MapPin, 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  UploadCloud,
  Shield,
  Smartphone
} from 'lucide-react';
import type { IncidentCreateRequest } from '../types/incident';
import { 
  saveOfflineReport, 
  getPendingReports, 
  markReportsSynced, 
  type OfflineReport 
} from '../services/offlineStorage';
import { syncOfflineIncidents, createIncident } from '../services/api';

interface FieldOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentSynced: () => void;
}

export const FieldOfficerModal: React.FC<FieldOfficerModalProps> = ({
  isOpen,
  onClose,
  onIncidentSynced,
}) => {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingReports, setPendingReports] = useState<OfflineReport[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [incidentType, setIncidentType] = useState<string>('LANDSLIDE');
  const [roadName, setRoadName] = useState<string>('NH-27 Dima Hasao Hill Pass Km 52');
  const [desc, setDesc] = useState<string>('Heavy slope slide blocking highway corridor. 4-foot debris across both lanes.');
  const [severity, setSeverity] = useState<string>('CRITICAL');
  const [lat, setLat] = useState<number>(25.1852);
  const [lon, setLon] = useState<number>(93.0412);
  const [hasPhoto, setHasPhoto] = useState<boolean>(true);

  const loadPending = async () => {
    try {
      const pending = await getPendingReports();
      setPendingReports(pending);
    } catch (e) {
      console.warn('Could not load pending reports:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPending();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUseGPS = () => {
    setLat(25.1852 + (Math.random() - 0.5) * 0.02);
    setLon(93.0412 + (Math.random() - 0.5) * 0.02);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadName || !desc) return;

    setIsSubmitting(true);
    setSubmitSuccessMsg(null);

    const reportData: IncidentCreateRequest = {
      type: incidentType,
      road_name: roadName,
      description: desc,
      source: 'OFFICER',
      severity,
      latitude: lat,
      longitude: lon,
      photo_url: hasPhoto ? '/demo/assets/evidence_hill_slide.jpg' : undefined,
    };

    try {
      if (isSimulatedOffline) {
        // Save to IndexedDB
        const offlineRec = await saveOfflineReport(reportData);
        await loadPending();
        setSubmitSuccessMsg(`✓ Saved locally to IndexedDB (${offlineRec.local_id}). Status: PENDING SYNC.`);
      } else {
        // Direct Online Submission
        await createIncident(reportData);
        setSubmitSuccessMsg('✓ Directly transmitted to Control Tower (SYNCED).');
        onIncidentSynced();
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      // Fallback to IndexedDB if network fails
      await saveOfflineReport(reportData);
      await loadPending();
      setSubmitSuccessMsg('Network error: Stored safely in IndexedDB (Pending Sync).');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccessMsg(null), 5000);
    }
  };

  const handleSyncAll = async () => {
    if (pendingReports.length === 0) return;

    setIsSyncing(true);
    try {
      const payload: IncidentCreateRequest[] = pendingReports.map((p) => ({
        type: p.type,
        road_name: p.road_name,
        description: p.description,
        source: 'OFFICER',
        severity: p.severity,
        latitude: p.latitude,
        longitude: p.longitude,
        photo_url: p.photo_url,
      }));

      const res = await syncOfflineIncidents(payload);
      if (res.success) {
        const localIds = pendingReports.map((p) => p.local_id);
        await markReportsSynced(localIds);
        await loadPending();
        onIncidentSynced();
        setSubmitSuccessMsg(`✓ Successfully synced ${res.synced_count} reports from IndexedDB to Server!`);
      }
    } catch (err: any) {
      console.error('Batch sync failed:', err);
      setSubmitSuccessMsg('Sync failed: Backend unreachable. Data preserved in IndexedDB.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSubmitSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Device Simulation Top Header */}
        <div className="bg-gray-950 px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-gray-300">ASDMA Field Officer Mobile Client</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulated Network Toggle */}
            <button
              type="button"
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                isSimulatedOffline
                  ? 'bg-red-950/80 text-red-300 border-red-700'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
              }`}
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-red-400 animate-pulse" />
                  <span>SIMULATED OFFLINE</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>ONLINE</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {/* Status Alert Banner */}
          {isSimulatedOffline ? (
            <div className="p-2.5 bg-red-950/50 border border-red-800 rounded-lg flex items-center justify-between text-[11px] text-red-200">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  <strong>Offline Mode Active:</strong> Cellular data severed. Reports will be cached locally in <strong>IndexedDB</strong>.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 rounded-lg flex items-center gap-2 text-[11px] text-emerald-200">
              <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Connected:</strong> Direct encrypted satellite telemetry uplink active.
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                Hazard Classification
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded py-1.5 px-2.5 text-white"
              >
                <option value="LANDSLIDE">Landslide / Mudflow Road Block</option>
                <option value="FLOOD">Flash Flood Inundation</option>
                <option value="ROAD_BREACH">Road Carriageway Breach / Subsidence</option>
                <option value="BRIDGE_DAMAGE">Culvert / Bridge Structural Damage</option>
                <option value="TREE_FALL">Uprooted Tree Line Barrier</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">
                  Location / Corridor Segment
                </label>
                <button
                  type="button"
                  onClick={handleUseGPS}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                >
                  <MapPin className="w-3 h-3" />
                  <span>📍 Refresh GPS Pin</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded py-1.5 px-2.5 text-white"
              />
              <div className="text-[10px] text-gray-500 mt-0.5">
                Current Device GPS: {lat.toFixed(4)} N, {lon.toFixed(4)} E (Accuracy ±4m)
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                Field Observations / Passage Conditions
              </label>
              <textarea
                required
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded py-1.5 px-2.5 text-white placeholder-gray-600"
              />
            </div>

            {/* Severity Assessment */}
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                Immediate Hazard Severity
              </label>
              <div className="grid grid-cols-3 gap-1">
                {['CRITICAL', 'HIGH', 'MEDIUM'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-1 text-[10px] font-bold rounded border transition ${
                      severity === s
                        ? s === 'CRITICAL'
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-amber-600 text-white border-amber-500'
                        : 'bg-gray-950 text-gray-400 border-gray-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Evidence Attachment */}
            <div className="bg-gray-950/60 border border-gray-800 rounded p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] text-gray-300">
                  {hasPhoto ? 'Photo Attached (evidence_hill_slide.jpg)' : 'No Photo'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasPhoto(!hasPhoto)}
                className="text-[10px] text-blue-400 hover:text-blue-300 underline"
              >
                {hasPhoto ? 'Remove' : 'Attach Photo'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition text-xs text-white ${
                isSimulatedOffline
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Report...</span>
                </>
              ) : isSimulatedOffline ? (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>SAVE OFFLINE IN INDEXEDDB</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  <span>SUBMIT REPORT TO CONTROL TOWER</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback Message */}
          {submitSuccessMsg && (
            <div className="p-2.5 bg-gray-950 border border-emerald-700 text-emerald-300 rounded-lg text-center text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          {/* Offline Pending Sync Queue */}
          <div className="pt-2 border-t border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-gray-300">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  IndexedDB Queue: <strong>{pendingReports.length}</strong> Pending Sync
                </span>
              </div>

              {pendingReports.length > 0 && (
                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded text-[10px] flex items-center gap-1 transition shadow-sm"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3 h-3" />
                  )}
                  <span>SYNC ALL NOW</span>
                </button>
              )}
            </div>

            {pendingReports.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-1 bg-gray-950/80 p-2 rounded border border-gray-800">
                {pendingReports.map((p) => (
                  <div
                    key={p.local_id}
                    className="flex items-center justify-between text-[10px] p-1 bg-gray-900 rounded"
                  >
                    <div>
                      <strong className="text-amber-300">{p.type}</strong> • {p.road_name}
                    </div>
                    <span className="font-mono text-gray-500 text-[9px]">{p.local_id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
      console.error('Failed to submit report:', err);
      // Fallback save to IndexedDB on failure
      await saveOfflineReport(reportData);
      await loadPending();
      setSubmitSuccessMsg('Network error: Auto-saved to IndexedDB offline queue.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccessMsg(null), 5000);
    }
  };

  const handleSyncAll = async () => {
    if (pendingReports.length === 0) return;
    setIsSyncing(true);

    try {
      const payload: IncidentCreateRequest[] = pendingReports.map(
        ({ local_id, created_at, sync_status, photo_data_url, ...req }) => req
      );
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
    <div className="fixed inset-0 z-[3000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Device Simulation Top Header */}
        <div className="bg-slate-50/70 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-slate-800">ASDMA Field Officer Mobile Client</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulated Network Toggle */}
            <button
              type="button"
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                isSimulatedOffline
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-rose-600 animate-pulse" />
                  <span>SIMULATED OFFLINE</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span>ONLINE</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs pb-20">
          {/* Status Alert Banner */}
          {isSimulatedOffline ? (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-[11px] text-rose-900">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Offline Mode Active:</strong> Cellular data severed. Reports will be cached locally in <strong>IndexedDB</strong>.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] text-emerald-900">
              <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Connected:</strong> Direct encrypted satellite telemetry uplink active.
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Hazard Classification
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
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
                <label className="text-[10px] font-semibold text-slate-500 uppercase">
                  Location / Corridor Segment
                </label>
                <button
                  type="button"
                  onClick={handleUseGPS}
                  className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Refresh GPS Pin</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
              <div className="text-[10px] text-slate-500 mt-0.5">
                Current Device GPS: {lat.toFixed(4)} N, {lon.toFixed(4)} E (Accuracy ±4m)
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Field Observations / Passage Conditions
              </label>
              <textarea
                required
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            {/* Severity Assessment */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Immediate Hazard Severity
              </label>
              <div className="grid grid-cols-3 gap-1">
                {['CRITICAL', 'HIGH', 'MEDIUM'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition ${
                      severity === s
                        ? s === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                          : 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Evidence Attachment */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] text-slate-700">
                  {hasPhoto ? 'Photo Attached (evidence_hill_slide.jpg)' : 'No Photo'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasPhoto(!hasPhoto)}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                {hasPhoto ? 'Remove' : 'Attach Photo'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition text-xs text-white ${
                isSimulatedOffline
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
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
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs flex items-center justify-center gap-1.5 animate-in fade-in font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          {/* Offline Pending Sync Queue */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  IndexedDB Queue: <strong>{pendingReports.length}</strong> Pending Sync
                </span>
              </div>

              {pendingReports.length > 0 && (
                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition shadow-xs"
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
              <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {pendingReports.map((p) => (
                  <div
                    key={p.local_id}
                    className="flex items-center justify-between text-[10px] p-1.5 bg-white border border-slate-100 rounded-lg"
                  >
                    <div>
                      <strong className="text-amber-800">{p.type}</strong> • {p.road_name}
                    </div>
                    <span className="font-mono text-slate-400 text-[9px]">{p.local_id}</span>
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

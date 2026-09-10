import React, { useState } from 'react';
import { 
  Radio, 
  CheckCircle2, 
  MapPin, 
  RefreshCw, 
  Database,
  Navigation,
  X
} from 'lucide-react';
import type { Incident, IncidentCreateRequest } from '../../types/incident';
import type { OfflineReport } from '../../services/offlineStorage';
import type { FieldOfficerGPS, SupportedLanguage } from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';

interface FieldIncidentsViewProps {
  incidents: Incident[];
  offlineReports: OfflineReport[];
  gps: FieldOfficerGPS;
  onSyncNow: () => void;
  isSyncing: boolean;
  onSubmitRadioReport: (data: IncidentCreateRequest) => Promise<void>;
  language: SupportedLanguage;
  onNavigateToRoute: () => void;
}

export const FieldIncidentsView: React.FC<FieldIncidentsViewProps> = ({
  incidents,
  offlineReports,
  gps,
  onSyncNow,
  isSyncing,
  onSubmitRadioReport,
  language,
  onNavigateToRoute,
}) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'nearby' | 'my_reports'>('nearby');
  const [isRadioModalOpen, setIsRadioModalOpen] = useState(false);

  // Radio form fields
  const [radioType, setRadioType] = useState('LANDSLIDE');
  const [radioRoad, setRadioRoad] = useState('Dima Hasao Hill Link Km 48');
  const [radioDesc, setRadioDesc] = useState('Relayed via VHF emergency frequency 156.800 MHz: Debris accumulation.');
  const [radioSeverity, setRadioSeverity] = useState('HIGH');
  const [isSubmittingRadio, setIsSubmittingRadio] = useState(false);

  const handleRadioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRadio(true);
    try {
      await onSubmitRadioReport({
        type: radioType,
        road_name: radioRoad,
        description: radioDesc,
        source: 'RADIO',
        severity: radioSeverity,
        latitude: gps.latitude,
        longitude: gps.longitude,
      });
      setIsRadioModalOpen(false);
    } catch (err) {
      console.error('Radio report error:', err);
    } finally {
      setIsSubmittingRadio(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-sm md:text-base font-bold text-white uppercase">{t.incidents}</h2>
          <span className="text-xs text-gray-400">Hazard Queue, Road Disruptions & Corridor Alerts</span>
        </div>

        {/* Radio Fallback Action Button */}
        <button
          type="button"
          onClick={() => setIsRadioModalOpen(true)}
          className="px-3.5 py-2 bg-amber-950/90 hover:bg-amber-900 border border-amber-700 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow transition active:scale-95"
        >
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{t.radioReport}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1.5 rounded-2xl border border-gray-800 text-xs max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('nearby')}
          className={`py-2.5 rounded-xl font-bold transition ${
            activeTab === 'nearby'
              ? 'bg-gray-800 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Corridor Hazards ({incidents.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my_reports')}
          className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'my_reports'
              ? 'bg-gray-800 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>My Queue</span>
          {offlineReports.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-900 border border-amber-700 text-amber-300 text-[10px] rounded-full font-mono">
              {offlineReports.length}
            </span>
          )}
        </button>
      </div>

      {/* Nearby Corridor Incidents */}
      {activeTab === 'nearby' && (
        <div>
          {incidents.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-gray-900 rounded-2xl border border-gray-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-white text-sm">No Active Corridor Blockages</p>
              <p className="text-xs text-gray-500 mt-1">All monitored arterial routes report normal flow.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-3 shadow-md hover:border-gray-700 transition text-xs text-gray-200"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-amber-400 text-sm">
                      {inc.type === 'LANDSLIDE' ? '⛰' : inc.type === 'FLOOD' ? '🌊' : '🚧'} {inc.type}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                        inc.status === 'VERIFIED'
                          ? 'bg-red-950 text-red-300 border-red-700'
                          : 'bg-amber-950 text-amber-300 border-amber-700'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{inc.id}</span>
                </div>

                <p className="font-bold text-white text-xs">{inc.road_name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{inc.description}</p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800 text-[10px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span>{inc.latitude.toFixed(3)} N, {inc.longitude.toFixed(3)} E</span>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToRoute}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>View Map</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Officer's Offline Reports Queue */}
      {activeTab === 'my_reports' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              IndexedDB Storage Cache
            </span>
            {offlineReports.length > 0 && (
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-cyan-900 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Pending'}</span>
              </button>
            )}
          </div>

          {offlineReports.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-gray-900 rounded-2xl border border-gray-800">
              <Database className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              <p className="font-bold text-white text-sm">{t.allSynced}</p>
              <p className="text-xs text-gray-500 mt-1">No pending offline reports queued in device IndexedDB.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offlineReports.map((r) => (
                <div
                  key={r.local_id}
                  className="bg-gray-900 border border-amber-800/60 rounded-2xl p-4 shadow text-xs text-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-amber-300 text-sm">{r.type}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                        PENDING SYNC
                      </span>
                    </div>
                    <p className="font-bold text-white text-xs">{r.road_name}</p>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{r.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-800 text-[10px] text-gray-500 font-mono">
                    <span>Local ID: {r.local_id}</span>
                    <span>{new Date(r.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Radio Report Modal */}
      {isRadioModalOpen && (
        <div className="fixed inset-0 z-[3000] bg-gray-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-gray-200 animate-in fade-in">
            <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-xs text-white uppercase">VHF Radio Relay Entry</span>
              </div>
              <button onClick={() => setIsRadioModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRadioSubmit} className="p-4 space-y-3 text-xs">
              <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-800">
                Log verbal radio dispatch from field vehicle or radio tower. Flagged as SOURCE: RADIO (Unverified).
              </p>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Incident Type</label>
                <select
                  value={radioType}
                  onChange={(e) => setRadioType(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg py-1.5 px-2 text-white"
                >
                  <option value="LANDSLIDE">Landslide</option>
                  <option value="FLOOD">Flood Overtopping</option>
                  <option value="ROAD_BREACH">Road Breach</option>
                  <option value="BRIDGE_DAMAGE">Bridge Structural Issue</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Severity Assessment</label>
                <select
                  value={radioSeverity}
                  onChange={(e) => setRadioSeverity(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg py-1.5 px-2 text-white"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>


              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Corridor Location</label>
                <input
                  type="text"
                  required
                  value={radioRoad}
                  onChange={(e) => setRadioRoad(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg py-1.5 px-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Verbal Transmission Summary</label>
                <textarea
                  required
                  rows={2}
                  value={radioDesc}
                  onChange={(e) => setRadioDesc(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg py-1.5 px-2 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRadioModalOpen(false)}
                  className="py-2 bg-gray-800 text-gray-300 font-bold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRadio}
                  className="py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs shadow flex items-center justify-center gap-1"
                >
                  {isSubmittingRadio ? 'Recording...' : 'Log Radio Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

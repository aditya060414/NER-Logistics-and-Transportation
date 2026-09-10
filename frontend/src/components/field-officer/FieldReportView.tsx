import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  Database, 
  UploadCloud, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Image as ImageIcon,
  AlertCircle,
  X
} from 'lucide-react';
import type { IncidentCreateRequest } from '../../types/incident';
import type { FieldOfficerGPS, OfficerNetworkStatus, SupportedLanguage } from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';

interface FieldReportViewProps {
  gps: FieldOfficerGPS;
  networkStatus: OfficerNetworkStatus;
  onSubmitReport: (data: IncidentCreateRequest, photoDataUrl?: string) => Promise<{ success: boolean; offline: boolean }>;
  language: SupportedLanguage;
  onNavigateTab: (tab: any) => void;
}

export const FieldReportView: React.FC<FieldReportViewProps> = ({
  gps,
  networkStatus,
  onSubmitReport,
  language,
  onNavigateTab,
}) => {
  const t = getTranslation(language);
  const isOnline = networkStatus === 'ONLINE';

  const [type, setType] = useState<string>('LANDSLIDE');
  const [severity, setSeverity] = useState<string>('CRITICAL');
  const [roadName, setRoadName] = useState<string>('NH-27 Dima Hasao Hill Pass Km 52');
  const [description, setDescription] = useState<string>('Heavy boulder and mudflow slide blocking primary transit corridor.');
  const [latitude, setLatitude] = useState<number>(gps.latitude || 25.1852);
  const [longitude, setLongitude] = useState<number>(gps.longitude || 93.0412);
  const [photoPreview, setPhotoPreview] = useState<string | null>('/demo/assets/evidence_hill_slide.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRefreshGps = () => {
    if (gps.status === 'ACTIVE' || gps.status === 'DEMO_GPS') {
      setLatitude(gps.latitude);
      setLongitude(gps.longitude);
    } else {
      // Slight demo offset
      setLatitude(25.1852 + (Math.random() - 0.5) * 0.01);
      setLongitude(93.0412 + (Math.random() - 0.5) * 0.01);
    }
  };

  const handleSimulateCamera = () => {
    setPhotoPreview('/demo/assets/evidence_hill_slide.jpg');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadName || !description) return;

    setIsSubmitting(true);
    setSubmitFeedback(null);

    const reportData: IncidentCreateRequest = {
      type,
      road_name: roadName,
      description,
      source: 'OFFICER',
      severity,
      latitude,
      longitude,
      photo_url: photoPreview || undefined,
    };

    try {
      const result = await onSubmitReport(reportData, photoPreview || undefined);
      if (result.offline) {
        setSubmitFeedback({
          type: 'success',
          message: 'Saved safely in IndexedDB (PENDING_SYNC). Will automatically upload when network returns.',
        });
      } else {
        setSubmitFeedback({
          type: 'success',
          message: '✓ Transmitted directly to SDMA Control Tower (SYNCED). Status: UNVERIFIED.',
        });
      }
    } catch (err: any) {
      console.error('Report submission failed:', err);
      setSubmitFeedback({
        type: 'error',
        message: 'Submission error. Report cached in IndexedDB queue.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-sm md:text-base font-bold text-white uppercase">{t.reportIncident}</h2>
            <span className="text-xs text-gray-400">Tactical Field Geo-Hazard Ground Verification Form</span>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            isOnline
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : 'bg-red-950 text-red-300 border-red-700'
          }`}
        >
          {isOnline ? '🟢 ONLINE UPLINK' : '🔴 OFFLINE QUEUE'}
        </span>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5 text-xs text-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Hazard Classification */}
          <div className="space-y-4">
            {/* Incident Type Grid */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Hazard / Disruption Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'LANDSLIDE', label: 'Landslide', icon: '⛰' },
                  { id: 'FLOOD', label: 'Flood Breach', icon: '🌊' },
                  { id: 'ROAD_DAMAGE', label: 'Road Damage', icon: '🚧' },
                  { id: 'BRIDGE_DAMAGE', label: 'Bridge Damage', icon: '🌉' },
                  { id: 'ACCIDENT', label: 'Accident', icon: '💥' },
                  { id: 'TRAFFIC', label: 'Severe Traffic', icon: '🚚' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`py-2.5 px-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                      type === item.id
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                        : 'bg-gray-950 text-gray-300 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Hazard Severity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-2.5 rounded-xl font-black text-xs border transition ${
                      severity === s
                        ? s === 'CRITICAL'
                          ? 'bg-red-600 text-white border-red-500 shadow'
                          : s === 'HIGH'
                          ? 'bg-orange-600 text-white border-orange-500 shadow'
                          : s === 'MEDIUM'
                          ? 'bg-amber-600 text-white border-amber-500 shadow'
                          : 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Road Corridor Name */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Affected Corridor / Road Name
              </label>
              <input
                type="text"
                required
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-blue-500 text-xs"
                placeholder="e.g. NH-27 Km 52 or Bijni-Panbari"
              />
            </div>
          </div>

          {/* Right Column: Telemetry & Notes & Photo */}
          <div className="space-y-4">
            {/* Geo-Tagged Coordinates */}
            <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Geo-Tag Coordinates
                </span>
                <button
                  type="button"
                  onClick={handleRefreshGps}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.useCurrentGps}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
                  <span className="text-[9px] text-gray-500 block">Latitude</span>
                  <span className="text-white font-bold">{latitude.toFixed(5)} N</span>
                </div>
                <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
                  <span className="text-[9px] text-gray-500 block">Longitude</span>
                  <span className="text-white font-bold">{longitude.toFixed(5)} E</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 block">
                Accuracy: {gps.status === 'ACTIVE' ? `±${gps.accuracy}m` : 'Simulation / Cache Active'}
              </span>
            </div>

            {/* Description Field */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Passage Conditions / Notes
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500 resize-none text-xs"
                placeholder="Describe debris height, lane blockages, bridge structural fissures..."
              />
            </div>

            {/* Photo Attachment Section */}
            <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Visual Evidence (Photo)
                </span>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="text-xs text-red-400 hover:underline flex items-center gap-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {photoPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-800 h-28 bg-black flex items-center justify-center">
                  <img src={photoPreview} alt="Evidence" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] text-gray-300">
                    Geo-Stamped
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateCamera}
                    className="py-2.5 px-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl text-center flex items-center justify-center gap-1.5 text-xs text-blue-400 font-bold"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>
                  <label className="py-2.5 px-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl text-center flex items-center justify-center gap-1.5 text-xs text-gray-300 font-bold cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Source Tag */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1 pt-2 border-t border-gray-800">
          <span>Source: <strong className="text-gray-200">OFFICER TELEMETRY</strong></span>
          <span>Status: <strong className="text-amber-400">UNVERIFIED</strong></span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 text-xs md:text-sm text-white transition active:scale-[0.98] ${
            !isOnline
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 shadow-amber-600/25'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 shadow-blue-600/25'
          }`}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing Geo-Report...</span>
            </>
          ) : !isOnline ? (
            <>
              <Database className="w-4 h-4" />
              <span>SAVE REPORT IN INDEXEDDB</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>{t.submitReport}</span>
            </>
          )}
        </button>

        {/* Feedback Alert */}
        {submitFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2 animate-in fade-in ${
              submitFeedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                : 'bg-red-950/80 border-red-700 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {submitFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="flex-1">{submitFeedback.message}</span>
            </div>
            {submitFeedback.type === 'success' && (
              <button
                type="button"
                onClick={() => onNavigateTab('route')}
                className="mt-1 py-1.5 px-3 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 rounded-lg font-bold text-center text-xs self-start"
              >
                Return to Active Route →
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

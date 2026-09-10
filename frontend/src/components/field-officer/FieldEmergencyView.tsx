import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Share2, 
  CheckCircle2, 
  RefreshCw, 
  Send 
} from 'lucide-react';
import type { FieldOfficerGPS, SupportedLanguage } from '../../types/fieldOfficer';
import type { Delivery, Vehicle } from '../../types/logistics';
import { getTranslation } from '../../services/i18n';

interface FieldEmergencyViewProps {
  gps: FieldOfficerGPS;
  activeDelivery: Delivery | null;
  activeVehicle: Vehicle | null;
  language: SupportedLanguage;
  onSendEmergencySOS: (type: string, message: string) => Promise<void>;
  onNavigateBack: () => void;
}

export const FieldEmergencyView: React.FC<FieldEmergencyViewProps> = ({
  gps,
  activeDelivery,
  activeVehicle,
  language,
  onSendEmergencySOS,
  onNavigateBack,
}) => {
  const t = getTranslation(language);
  const [confirmedSOS, setConfirmedSOS] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('ROAD_BLOCKED');
  const [customNotes, setCustomNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sosSentSuccess, setSosSentSuccess] = useState(false);

  const handleDispatchSOS = async () => {
    setIsSending(true);
    try {
      await onSendEmergencySOS(selectedEmergencyType, customNotes || 'EMERGENCY: Vehicle halted on hill corridor.');
      setSosSentSuccess(true);
    } catch (e) {
      console.error('Failed to send SOS:', e);
    } finally {
      setIsSending(false);
    }
  };

  const handleShareLocation = () => {
    const text = `EMERGENCY LOCATION: Officer Vehicle ${activeVehicle?.vehicle_number || 'AS-01-TR-102'} at ${gps.latitude.toFixed(5)} N, ${gps.longitude.toFixed(5)} E. Delivery: ${activeDelivery?.id || 'D102'}.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Location copied to clipboard: ' + text);
    } else {
      alert(text);
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-xs text-gray-200">
      {/* Emergency Header Banner */}
      <div className="bg-red-950 border-2 border-red-600 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-900 border border-red-500 flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
            <ShieldAlert className="w-7 h-7 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wider uppercase">
              🚨 {t.emergency} PROTOCOL
            </h1>
            <p className="text-[11px] text-red-200 mt-0.5">
              Rapid Disruption & Critical Safety Dispatch Tower Link
            </p>
          </div>
        </div>
      </div>

      {/* Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Telemetry & Notes */}
        <div className="space-y-4">
          {/* Live Officer Telemetry Confirmation */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl space-y-2.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Current Incident Location Telemetry
            </span>

            <div className="grid grid-cols-2 gap-2 bg-gray-950 p-3 rounded-xl border border-gray-800 font-mono text-xs">
              <div>
                <span className="text-[9px] text-gray-500 block">Latitude</span>
                <span className="font-bold text-white">{gps.latitude.toFixed(5)} N</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block">Longitude</span>
                <span className="font-bold text-white">{gps.longitude.toFixed(5)} E</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                <span className="text-[9px] text-gray-500 block">Transport Vehicle</span>
                <strong className="text-white">{activeVehicle?.vehicle_number || 'AS-01-TR-102'}</strong>
              </div>
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                <span className="text-[9px] text-gray-500 block">Active Mission</span>
                <strong className="text-red-400">{activeDelivery?.id || 'D102'} • MEDICINE</strong>
              </div>
            </div>
          </div>

          {/* Emergency Field Notes */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
              Emergency Field Notes / Situation
            </label>
            <textarea
              rows={4}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-red-500 resize-none text-xs leading-relaxed"
              placeholder="e.g. Mudslide breached both lanes. Heavy vehicle stranded without cellular connectivity."
            />
          </div>

          {/* Secondary Utility Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleShareLocation}
              className="py-3 px-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-gray-200 flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Copy GPS Pin</span>
            </button>

            <button
              type="button"
              onClick={onNavigateBack}
              className="py-3 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <span>Return to Map</span>
            </button>
          </div>
        </div>

        {/* Right Column: Emergency Actions & SOS Dispatch */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Immediate Hazard Dispatch Action
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'ACCIDENT', label: 'Report Accident', icon: '💥' },
                { id: 'ROAD_BLOCKED', label: 'Report Road Block', icon: '🚧' },
                { id: 'VEHICLE_BREAKDOWN', label: 'Vehicle Breakdown', icon: '🔧' },
                { id: 'MEDICAL_DISTRESS', label: 'Medical Distress', icon: '🩺' },
              ].map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setSelectedEmergencyType(action.id)}
                  className={`p-3.5 rounded-xl border font-bold text-left transition flex items-center gap-2.5 ${
                    selectedEmergencyType === action.id
                      ? 'bg-red-950/80 border-red-500 text-white shadow'
                      : 'bg-gray-950 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-xs leading-tight">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Accidental Click Confirmation Checkbox */}
            <div className="p-3.5 bg-red-950/40 rounded-xl border border-red-800/60 flex items-center gap-3">
              <input
                type="checkbox"
                id="sosConfirm"
                checked={confirmedSOS}
                onChange={(e) => setConfirmedSOS(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 bg-gray-950 border-red-700 focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="sosConfirm" className="text-xs text-red-200 cursor-pointer select-none leading-snug">
                I verify this is a critical operational emergency requiring SDMA Control Room dispatch intervention.
              </label>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Send SOS Trigger Button */}
            <button
              type="button"
              disabled={!confirmedSOS || isSending}
              onClick={handleDispatchSOS}
              className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 text-white font-black rounded-xl shadow-xl shadow-red-700/30 flex items-center justify-center gap-2 text-sm tracking-wider uppercase transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>TRANSMITTING PRIORITY SOS...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>TRANSMIT EMERGENCY SOS</span>
                </>
              )}
            </button>

            {sosSentSuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>✓ Emergency SOS transmitted to ASDMA Control Tower. Response protocol activated.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

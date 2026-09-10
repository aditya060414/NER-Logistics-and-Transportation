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
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-xs text-slate-700">
      {/* Emergency Header Banner */}
      <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs animate-pulse">
            <ShieldAlert className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <h1 className="text-base font-black text-rose-900 tracking-wider uppercase">
              🚨 {t.emergency} PROTOCOL
            </h1>
            <p className="text-[11px] text-rose-700 mt-0.5">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Current Incident Location Telemetry
            </span>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-[9px] text-slate-500 block">Latitude</span>
                <span className="font-bold text-slate-900">{gps.latitude.toFixed(5)} N</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">Longitude</span>
                <span className="font-bold text-slate-900">{gps.longitude.toFixed(5)} E</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Transport Vehicle</span>
                <strong className="text-slate-800">{activeVehicle?.vehicle_number || 'AS-01-TR-102'}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Active Mission</span>
                <strong className="text-rose-600">{activeDelivery?.id || 'D102'} • MEDICINE</strong>
              </div>
            </div>
          </div>

          {/* Emergency Field Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Emergency Field Notes / Situation
            </label>
            <textarea
              rows={4}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-rose-500 resize-none text-xs leading-relaxed"
              placeholder="e.g. Mudslide breached both lanes. Heavy vehicle stranded without cellular connectivity."
            />
          </div>

          {/* Secondary Utility Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleShareLocation}
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl font-bold text-slate-800 flex items-center justify-center gap-1.5 transition text-xs"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Copy GPS Pin</span>
            </button>

            <button
              type="button"
              onClick={onNavigateBack}
              className="py-3 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
            >
              <span>Return to Map</span>
            </button>
          </div>
        </div>

        {/* Right Column: Emergency Actions & SOS Dispatch */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
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
                      ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-1 ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-xs leading-tight">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Accidental Click Confirmation Checkbox */}
            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="sosConfirm"
                checked={confirmedSOS}
                onChange={(e) => setConfirmedSOS(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 bg-white border-rose-300 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="sosConfirm" className="text-xs text-rose-900 cursor-pointer select-none leading-snug">
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
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm tracking-wider uppercase transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✓ Emergency SOS transmitted to ASDMA Control Tower. Response protocol activated.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

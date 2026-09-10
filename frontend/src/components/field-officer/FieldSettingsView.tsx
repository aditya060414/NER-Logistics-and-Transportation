import React, { useState } from 'react';
import { 
  Languages, 
  Database, 
  RefreshCw, 
  Play, 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  Sliders 
} from 'lucide-react';
import type { SupportedLanguage } from '../../types/fieldOfficer';
import type { OfflineReport } from '../../services/offlineStorage';
import { getTranslation } from '../../services/i18n';

interface FieldSettingsViewProps {
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  pendingReportsCount: number;
  offlineReports: OfflineReport[];
  isSyncing: boolean;
  onSyncNow: () => void;
  onClearOfflineCache: () => void;
  demoModeActive: boolean;
  onToggleDemoMode: () => void;
  onRunFullDemoScenario: () => void;
  demoStepIndex: number;
  onExecuteDemoStep: (step: number) => void;
}

export const FieldSettingsView: React.FC<FieldSettingsViewProps> = ({
  language,
  onChangeLanguage,
  pendingReportsCount,
  offlineReports,
  isSyncing,
  onSyncNow,
  onClearOfflineCache,
  demoModeActive,
  onToggleDemoMode,
  onRunFullDemoScenario,
  demoStepIndex,
  onExecuteDemoStep,
}) => {
  const t = getTranslation(language);
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClear = () => {
    if (confirm('Clear local IndexedDB offline reports and route cache?')) {
      onClearOfflineCache();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  const demoSteps = [
    { title: '1. Start Guwahati Mission', desc: 'Initialize D102 Critical Medicine delivery' },
    { title: '2. Start Journey & Move GPS', desc: 'Vehicle departs Guwahati Central Store along NH corridor' },
    { title: '3. High-Risk Road Warning', desc: 'Approach heavy rainfall landslide zone (Dima Hasao Hill Km 52)' },
    { title: '4. Submit Field Incident', desc: 'Officer files geo-tagged landslide blockage report' },
    { title: '5. Control Tower Verification', desc: 'Control Room confirms hazard -> Road status turns CLOSED' },
    { title: '6. Auto Safe Detour Recalculation', desc: 'New risk-aware route calculated (+28km, +42min, LOW risk)' },
    { title: '7. Mission Completion', desc: 'Vehicle arrives safely at Haflong Civil Hospital' },
  ];

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-xs text-gray-200">
      {/* Settings Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm md:text-base font-bold text-white uppercase">{t.settings} & DEMO CONTROL</h2>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-gray-800 text-gray-300">
          Field App v1.0 • NER Logistics
        </span>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Language & Offline Storage */}
        <div className="space-y-4">
          {/* LANGUAGE SELECTOR */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-xs md:text-sm">{t.language} / ভাষা / भाषा</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { code: 'en', label: 'English', sub: 'Default' },
                { code: 'as', label: 'অসমীয়া', sub: 'Assamese' },
                { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onChangeLanguage(lang.code as SupportedLanguage)}
                  className={`p-3 rounded-xl border text-center transition ${
                    language === lang.code
                      ? 'bg-emerald-950 border-emerald-500 text-white shadow'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <strong className="text-xs md:text-sm block text-white">{lang.label}</strong>
                  <span className="text-[10px] text-gray-400">{lang.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* OFFLINE STORAGE & SYNC MANAGER */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs md:text-sm">IndexedDB Offline Sync Engine</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  pendingReportsCount > 0
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}
              >
                {pendingReportsCount > 0 ? `${pendingReportsCount} PENDING` : 'ALL SYNCED'}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Database Name:</span>
                <span className="font-mono text-gray-200">ner_logistics_offline_db</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Offline Route Cache:</span>
                <span className="font-mono text-emerald-400">Guwahati-Haflong (Active)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pending Queue:</span>
                <span className="font-mono text-amber-300">{pendingReportsCount} Reports ({offlineReports.length} queued)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : t.syncNow}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="py-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>
            </div>

            {clearedNotice && (
              <div className="p-2.5 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-center text-xs">
                ✓ Offline database cache cleared.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SIH 2026 DEMO CONTROLLER */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-900 to-blue-950/40 border-2 border-blue-600/60 rounded-2xl p-4 md:p-5 shadow-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
                <div>
                  <span className="font-black text-white text-xs md:text-sm uppercase tracking-wider block">
                    SIH 2026 Interactive Demo Mode
                  </span>
                  <span className="text-[10px] text-blue-300">End-to-End Tactical Flow Automation</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleDemoMode}
                className={`px-3 py-1 rounded-full text-[10px] font-black border transition ${
                  demoModeActive
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-gray-950 text-gray-400 border-gray-800'
                }`}
              >
                {demoModeActive ? 'DEMO ACTIVE' : 'DISABLED'}
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Walks judges step-by-step through: Departure → GPS tracking → Landslide risk warning → Officer report → Road closure → Instant safe reroute!
            </p>

            {/* Full Automation Button */}
            <button
              type="button"
              onClick={onRunFullDemoScenario}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs tracking-wide uppercase transition active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>RUN FULL AUTOMATED DEMO SCENARIO</span>
            </button>

            {/* Step by Step Execution Panel */}
            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Manual Step Execution:
              </span>
              {demoSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onExecuteDemoStep(idx)}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs ${
                    demoStepIndex === idx
                      ? 'bg-blue-950 border-blue-500 text-white shadow'
                      : 'bg-gray-950/80 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div>
                    <strong className="text-xs text-white block">{step.title}</strong>
                    <span className="text-[10px] text-gray-400">{step.desc}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

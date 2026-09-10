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
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-xs text-slate-700">
      {/* Settings Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase">{t.settings} & DEMO CONTROL</h2>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          Field App v1.0 • NER Logistics
        </span>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Language & Offline Storage */}
        <div className="space-y-4">
          {/* LANGUAGE SELECTOR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Languages className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900 text-xs md:text-sm">{t.language} / ভাষা / भाषा</span>
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
                      ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <strong className="text-xs md:text-sm block text-slate-900">{lang.label}</strong>
                  <span className="text-[10px] text-slate-500">{lang.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* OFFLINE STORAGE & SYNC MANAGER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-slate-900 text-xs md:text-sm">IndexedDB Offline Sync Engine</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  pendingReportsCount > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                }`}
              >
                {pendingReportsCount > 0 ? `${pendingReportsCount} PENDING` : 'ALL SYNCED'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Database Name:</span>
                <span className="font-mono text-slate-900">ner_logistics_offline_db</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Offline Route Cache:</span>
                <span className="font-mono text-emerald-700 font-semibold">Guwahati-Haflong (Active)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pending Queue:</span>
                <span className="font-mono text-amber-700 font-semibold">{pendingReportsCount} Reports ({offlineReports.length} queued)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : t.syncNow}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-rose-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>
            </div>

            {clearedNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs">
                ✓ Offline database cache cleared.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SIH 2026 DEMO CONTROLLER */}
        <div className="space-y-4">
          <div className="bg-white border border-blue-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <span className="font-black text-slate-900 text-xs md:text-sm uppercase tracking-wider block">
                    SIH 2026 Interactive Demo Mode
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">End-to-End Tactical Flow Automation</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleDemoMode}
                className={`px-3 py-1 rounded-full text-[10px] font-black border transition ${
                  demoModeActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {demoModeActive ? 'DEMO ACTIVE' : 'DISABLED'}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Walks judges step-by-step through: Departure → GPS tracking → Landslide risk warning → Officer report → Road closure → Instant safe reroute!
            </p>

            {/* Full Automation Button */}
            <button
              type="button"
              onClick={onRunFullDemoScenario}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs tracking-wide uppercase transition active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>RUN FULL AUTOMATED DEMO SCENARIO</span>
            </button>

            {/* Step by Step Execution Panel */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Manual Step Execution:
              </span>
              {demoSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onExecuteDemoStep(idx)}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs ${
                    demoStepIndex === idx
                      ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <strong className="text-xs text-slate-900 block">{step.title}</strong>
                    <span className="text-[10px] text-slate-500">{step.desc}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

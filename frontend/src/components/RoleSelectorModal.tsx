import React from 'react';
import { Shield, Smartphone, ArrowRight, CheckCircle2, X, Truck } from 'lucide-react';

export type UserRole = 'admin' | 'field_officer' | 'driver';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-gray-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-gray-200 animate-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="bg-gray-950 px-6 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
              SIH 2026 • Accessibility Intelligence Platform
            </span>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              Select Operational Role
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Three Role Cards */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-gray-400">
            Choose your operations portal. The platform automatically adapts its features, network resilience protocols, and tactical capabilities based on your operational responsibilities:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Logistics Driver Card */}
            <button
              type="button"
              onClick={() => {
                onSelectRole('driver');
                onClose();
              }}
              className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between group ${
                currentRole === 'driver'
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/50'
                  : 'bg-gray-950/70 border-gray-800 hover:border-emerald-700/60 hover:bg-gray-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  {currentRole === 'driver' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                      ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="font-black text-white text-sm uppercase">Logistics Driver</h3>
                <span className="text-[10px] font-mono text-emerald-300 block mb-2">
                  Consignment &amp; Turn-by-Turn Safe HUD
                </span>

                <ul className="space-y-1 text-[11px] text-gray-400">
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Consignment &amp; Cargo Priority Entry</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>NetworkX Safe Route Calculation</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>In-Transit Speedometer &amp; ETA HUD</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live Road Closure Detour Prompts</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Multilingual (English, Assamese, Hindi)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                <span>Enter Driver Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 2. Field Officer Card */}
            <button
              type="button"
              onClick={() => {
                onSelectRole('field_officer');
                onClose();
              }}
              className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between group ${
                currentRole === 'field_officer'
                  ? 'bg-blue-950/60 border-blue-500 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/50'
                  : 'bg-gray-950/70 border-gray-800 hover:border-blue-700/60 hover:bg-gray-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  {currentRole === 'field_officer' && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                      ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="font-black text-white text-sm uppercase">Field Officer</h3>
                <span className="text-[10px] font-mono text-blue-300 block mb-2">
                  Emergency Relief Dispatch &amp; Operations
                </span>

                <ul className="space-y-1 text-[11px] text-gray-400">
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Active D102 Medicine Corridor</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Real-time GPS &amp; Proximity Warnings</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Offline IndexedDB Incident Queue</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Tactical Detour Acceptance</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Enter Field App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 3. Admin Control Tower Card */}
            <button
              type="button"
              onClick={() => {
                onSelectRole('admin');
                onClose();
              }}
              className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between group ${
                currentRole === 'admin'
                  ? 'bg-purple-950/60 border-purple-500 shadow-xl shadow-purple-500/20 ring-2 ring-purple-500/50'
                  : 'bg-gray-950/70 border-gray-800 hover:border-purple-700/60 hover:bg-gray-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  {currentRole === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black">
                      ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="font-black text-white text-sm uppercase">Admin Control Tower</h3>
                <span className="text-[10px] font-mono text-purple-300 block mb-2">
                  Dispatch, KPI &amp; Network Analytics
                </span>

                <ul className="space-y-1 text-[11px] text-gray-400">
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Full 13,093 Road Risk KPI Gauges</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Fleet Tracking &amp; Closure Impact Engine</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Incident Verification &amp; Road Closure</span>
                  </li>
                  <li className="flex items-center gap-1 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Multi-Criteria Safe Detour Dispatch</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
                <span>Enter Admin Tower</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

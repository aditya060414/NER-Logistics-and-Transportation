import React from 'react';
import { 
  Truck, 
  Languages, 
  LogOut, 
  CheckCircle2, 
  Phone, 
  FileText,
  HardDrive
} from 'lucide-react';
import type { DriverProfile, DriverNetworkStatus } from '../../types/driver';
import type { SupportedLanguage } from '../../types/fieldOfficer';

interface DriverProfileViewProps {
  driver: DriverProfile;
  networkStatus: DriverNetworkStatus;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onLogout: () => void;
}

export const DriverProfileView: React.FC<DriverProfileViewProps> = ({
  driver,
  networkStatus,
  selectedLanguage,
  onSelectLanguage,
  onLogout,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 p-4 sm:p-6 text-slate-800 font-sans pb-28">
      {/* Driver Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {driver.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{driver.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold">
                  {driver.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {driver.carrier_hub} • <span className="text-amber-600 font-bold">★ {driver.rating} Rating</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Driver</span>
            </button>
          </div>
        </div>

        {/* Driver Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-600 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Contact Mobile</span>
            </span>
            <span className="font-mono text-slate-900 font-bold">{driver.phone}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-600 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Heavy Transport License</span>
            </span>
            <span className="font-mono text-slate-900 font-bold">{driver.license_number}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Specification Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Assigned Vehicle Specifications</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold">
            MONSOON ACCREDITED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">PLATE NUMBER</span>
            <span className="text-sm font-black text-slate-900 font-mono">{driver.vehicle_number}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">CHASSIS &amp; DRIVE</span>
            <span className="text-xs font-bold text-slate-800">{driver.vehicle_type}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">BASE DEPOT</span>
            <span className="text-xs font-bold text-slate-800">{driver.carrier_hub}</span>
          </div>
        </div>
      </div>

      {/* Language Selection Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-600" />
            <span>Driver Interface Language (ভাষা / भाषा)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">NER Multilingual</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { code: 'en' as const, label: 'English', sub: 'Standard' },
            { code: 'as' as const, label: 'অসমীয়া', sub: 'Assamese' },
            { code: 'hi' as const, label: 'हिन्दी', sub: 'Hindi' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onSelectLanguage(item.code)}
              className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                selectedLanguage === item.code
                  ? 'bg-blue-50 border-blue-300 text-blue-800 ring-2 ring-blue-500/40 shadow-xs font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/60'
              }`}
            >
              <span className="font-bold text-sm">{item.label}</span>
              <span className="text-[10px] opacity-70 mt-0.5">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Offline Cache & Telemetry Health */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-600" />
            <span>Offline Terrain Cache &amp; Network Resilience</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
              networkStatus === 'ONLINE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            ● {networkStatus}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-800 font-bold block">Assam Road Network Graph (13,093 segments)</span>
            <span className="text-[11px] text-slate-500">IndexedDB local route memory cached for offline Dijkstra execution.</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        </div>
      </div>
    </div>
  );
};

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
    <div className="w-full max-w-3xl mx-auto space-y-4 p-4 sm:p-6 text-gray-100 font-sans pb-28">
      {/* Driver Header Profile Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-600/30">
              {driver.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{driver.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-bold">
                  {driver.id}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {driver.carrier_hub} • <span className="text-amber-400 font-bold">★ {driver.rating} Rating</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 font-bold text-xs transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Driver</span>
            </button>
          </div>
        </div>

        {/* Driver Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-800 text-xs">
          <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Contact Mobile</span>
            </span>
            <span className="font-mono text-white font-bold">{driver.phone}</span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Heavy Transport License</span>
            </span>
            <span className="font-mono text-white font-bold">{driver.license_number}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Specification Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Assigned Vehicle Specifications</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] font-bold">
            MONSOON ACCREDITED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold block mb-0.5">PLATE NUMBER</span>
            <span className="text-sm font-black text-white font-mono">{driver.vehicle_number}</span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold block mb-0.5">CHASSIS &amp; DRIVE</span>
            <span className="text-xs font-black text-gray-200">{driver.vehicle_type}</span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold block mb-0.5">BASE DEPOT</span>
            <span className="text-xs font-black text-gray-200">{driver.carrier_hub}</span>
          </div>
        </div>
      </div>

      {/* Language Selection Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-400" />
            <span>Driver Interface Language (ভাষা / भाषा)</span>
          </span>
          <span className="text-[11px] font-mono text-gray-400">NER Multilingual</span>
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
                  ? 'bg-blue-950/80 border-blue-500 text-blue-200 ring-2 ring-blue-500/50 shadow-lg'
                  : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <span className="font-black text-sm">{item.label}</span>
              <span className="text-[10px] opacity-70 mt-0.5">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Offline Cache & Telemetry Health */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>Offline Terrain Cache &amp; Network Resilience</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
              networkStatus === 'ONLINE'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}
          >
            ● {networkStatus}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-200 font-bold block">Assam Road Network Graph (13,093 segments)</span>
            <span className="text-[11px] text-gray-400">IndexedDB local route memory cached for offline Dijkstra execution.</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        </div>
      </div>
    </div>
  );
};

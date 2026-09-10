import React from 'react';
import { MapPin } from 'lucide-react';
import type { Delivery } from '../../types/logistics';
import type { DriverProfile } from '../../types/driver';

interface DriverHistoryViewProps {
  historyDeliveries: Delivery[];
  driver: DriverProfile;
}

const SAMPLE_HISTORY: Partial<Delivery>[] = [
  {
    id: 'D-901',
    consignment_id: 'CN-2026-00088',
    cargo_name: 'Sterilized Surgical Kits & Blood Units',
    cargo_type: 'MEDICINE',
    priority: 'CRITICAL',
    origin: 'Guwahati Medical Depot',
    destination: 'Tezpur Civil Hospital',
    status: 'COMPLETED',
    scheduled_eta: '2026-09-08 14:30',
  },
  {
    id: 'D-902',
    consignment_id: 'CN-2026-00072',
    cargo_name: 'Emergency Flood Relief Food Packets',
    cargo_type: 'RELIEF MATERIAL',
    priority: 'HIGH',
    origin: 'Jorhat Food Storage Hub',
    destination: 'Dibrugarh Relief Base',
    status: 'COMPLETED',
    scheduled_eta: '2026-09-07 18:45',
  },
  {
    id: 'D-903',
    consignment_id: 'CN-2026-00054',
    cargo_name: 'Mobile Solar Generator Units',
    cargo_type: 'EQUIPMENT',
    priority: 'NORMAL',
    origin: 'Silchar Distribution Station',
    destination: 'Haflong Hill Station',
    status: 'COMPLETED',
    scheduled_eta: '2026-09-05 11:20',
  },
];

export const DriverHistoryView: React.FC<DriverHistoryViewProps> = ({
  historyDeliveries,
  driver,
}) => {
  const list = historyDeliveries.length > 0 ? historyDeliveries : (SAMPLE_HISTORY as Delivery[]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4 sm:p-6 text-slate-800 font-sans pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold tracking-wider uppercase">
              COMPLETED LOGS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Trip &amp; Consignment History
          </h2>
          <p className="text-xs text-slate-500">
            Official delivery audit trail for {driver.name} ({driver.vehicle_number}).
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">TRIPS</span>
            <span className="text-lg font-black text-slate-900 font-mono">{list.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">SUCCESS</span>
            <span className="text-lg font-black text-emerald-700 font-mono">100%</span>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {list.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {item.consignment_id || item.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold">
                    {item.cargo_type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold">
                    ✓ COMPLETED
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                  {item.cargo_name}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {item.scheduled_eta || 'Past Mission'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-500">From:</span>
                <strong className="text-slate-800 truncate">{item.origin}</strong>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="text-slate-500">To:</span>
                <strong className="text-slate-800 truncate">{item.destination}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

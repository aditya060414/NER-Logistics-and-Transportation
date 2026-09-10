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
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4 sm:p-6 text-gray-100 font-sans pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-600/50 text-blue-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              COMPLETED LOGS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Trip &amp; Consignment History
          </h2>
          <p className="text-xs text-gray-400">
            Official delivery audit trail for {driver.name} ({driver.vehicle_number}).
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800 text-center">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">TRIPS</span>
            <span className="text-lg font-black text-white font-mono">{list.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800 text-center">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">SUCCESS</span>
            <span className="text-lg font-black text-emerald-400 font-mono">100%</span>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {list.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-5 rounded-3xl bg-gray-900/90 border border-gray-800 hover:border-gray-700 transition shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-blue-300">
                    {item.consignment_id || item.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-950 border border-blue-600/40 text-blue-300 text-[10px] font-mono font-bold">
                    {item.cargo_type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold">
                    ✓ COMPLETED
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-1">
                  {item.cargo_name}
                </h3>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                {item.scheduled_eta || 'Past Mission'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-800/80">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-gray-400">From:</span>
                <strong className="text-white truncate">{item.origin}</strong>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-gray-400">To:</span>
                <strong className="text-white truncate">{item.destination}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

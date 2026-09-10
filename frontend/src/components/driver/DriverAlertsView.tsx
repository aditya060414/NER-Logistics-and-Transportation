import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CloudRain, 
  CheckCircle2, 
  MapPin, 
  BellRing
} from 'lucide-react';
import type { LogisticsAlert } from '../../types/logistics';

interface DriverAlertsViewProps {
  alerts: LogisticsAlert[];
  onMarkRead: (alertId: string) => void;
}

const SAMPLE_DRIVER_ALERTS: LogisticsAlert[] = [
  {
    id: 'ALT-DRV-01',
    type: 'ROAD_CLOSURE',
    severity: 'CRITICAL',
    title: 'NH-27 Segment Blocked: Dima Hasao Foothills',
    message: 'Active mudflow and fallen trees at km 84. Heavy commercial vehicles redirected to secondary bypass.',
    district: 'Dima Hasao',
    road_id: '10928374',
    delivery_id: null,
    vehicle_id: null,
    status: 'UNREAD',
    created_at: '12 mins ago',
  },
  {
    id: 'ALT-DRV-02',
    type: 'HEAVY_RAIN',
    severity: 'WARNING',
    title: 'High Precipitation Warning (IMD Orange Alert)',
    message: 'Continuous heavy monsoon rainfall exceeding 85mm in 6h across Barak Valley. Reduce convoy speed below 40 km/h.',
    district: 'Cachar',
    road_id: null,
    delivery_id: null,
    vehicle_id: null,
    status: 'UNREAD',
    created_at: '45 mins ago',
  },
  {
    id: 'ALT-DRV-03',
    type: 'FLEET_REROUTED',
    severity: 'INFO',
    title: 'Bridge Load Restriction on Brahmaputra Crossing',
    message: 'Maintenance ongoing on Kolia Bhomora Bridge. Vehicles over 25 tonnes advised to use Bogibeel alternative.',
    district: 'Sonitpur',
    road_id: '9827461',
    delivery_id: null,
    vehicle_id: null,
    status: 'READ',
    created_at: '2 hours ago',
  },
];

export const DriverAlertsView: React.FC<DriverAlertsViewProps> = ({
  alerts: propAlerts,
  onMarkRead,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const alerts = propAlerts && propAlerts.length > 0 ? propAlerts : SAMPLE_DRIVER_ALERTS;

  const filtered = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4 sm:p-6 text-slate-800 font-sans pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold tracking-wider uppercase">
              SAFETY BROADCASTS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Corridor Alerts &amp; Advisories
          </h2>
          <p className="text-xs text-slate-500">
            Real-time hazard notifications, weather advisories, and reroute bulletins.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl">
          {(['ALL', 'CRITICAL', 'WARNING'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === f
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-3xl border transition shadow-xs space-y-3 ${
                isCritical
                  ? 'bg-rose-50/70 border-rose-200'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCritical
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-100 border border-amber-200 text-amber-800'
                        : 'bg-blue-50 border border-blue-200 text-blue-600'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : isWarning ? (
                      <CloudRain className="w-5 h-5" />
                    ) : (
                      <BellRing className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      {alert.district && (
                        <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{alert.district} District</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                      {alert.title}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {alert.created_at}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-13">
                {alert.message}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onMarkRead(alert.id)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 transition shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Acknowledge Notice</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

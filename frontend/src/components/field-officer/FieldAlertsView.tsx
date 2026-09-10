import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CloudRain, 
  Navigation, 
  CheckCircle2,
  ChevronRight,
  Bell
} from 'lucide-react';
import type { LogisticsAlert } from '../../types/logistics';
import type { SupportedLanguage } from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';

interface FieldAlertsViewProps {
  alerts: LogisticsAlert[];
  onMarkRead: (alertId: string) => void;
  onNavigateToRoute: () => void;
  language: SupportedLanguage;
}

export const FieldAlertsView: React.FC<FieldAlertsViewProps> = ({
  alerts,
  onMarkRead,
  onNavigateToRoute,
  language,
}) => {
  const t = getTranslation(language);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ROAD_CLOSURE':
        return <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />;
      case 'HEAVY_RAIN':
        return <CloudRain className="w-5 h-5 text-cyan-400" />;
      case 'ROUTE_CHANGE':
        return <Navigation className="w-5 h-5 text-purple-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-xs text-slate-700">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase">{t.alerts}</h2>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          {alerts.length} Total Alerts
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-slate-900 text-sm">No Active Critical Alerts</p>
          <p className="text-xs text-slate-500 mt-1">All corridor sections operating within acceptable risk limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`bg-white border rounded-2xl p-4 shadow-xs transition space-y-2.5 flex flex-col justify-between ${
                a.severity === 'CRITICAL'
                  ? 'border-red-200 bg-rose-50/40'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {getAlertIcon(a.type)}
                    <div>
                      <span className="font-black text-slate-900 text-xs md:text-sm block">{a.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {a.district || 'Assam Corridor'} • {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase ${
                      a.severity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {a.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2">{a.message}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onMarkRead(a.id)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  {a.status === 'READ' ? '✓ Acknowledged' : 'Mark as read'}
                </button>

                <button
                  type="button"
                  onClick={onNavigateToRoute}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>{t.viewRoute}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

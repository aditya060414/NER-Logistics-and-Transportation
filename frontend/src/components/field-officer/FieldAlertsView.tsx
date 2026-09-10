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
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-xs text-gray-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm md:text-base font-bold text-white uppercase">{t.alerts}</h2>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-gray-800 text-gray-300">
          {alerts.length} Total Alerts
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-gray-900 rounded-2xl border border-gray-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-white text-sm">No Active Critical Alerts</p>
          <p className="text-xs text-gray-500 mt-1">All corridor sections operating within acceptable risk limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`bg-gray-900 border rounded-2xl p-4 shadow-md transition space-y-2.5 flex flex-col justify-between ${
                a.severity === 'CRITICAL'
                  ? 'border-red-800/80 bg-red-950/20'
                  : 'border-gray-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {getAlertIcon(a.type)}
                    <div>
                      <span className="font-black text-white text-xs md:text-sm block">{a.title}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {a.district || 'Assam Corridor'} • {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase ${
                      a.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border-red-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    {a.severity}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mt-2">{a.message}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                <button
                  type="button"
                  onClick={() => onMarkRead(a.id)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  {a.status === 'READ' ? '✓ Acknowledged' : 'Mark as read'}
                </button>

                <button
                  type="button"
                  onClick={onNavigateToRoute}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
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

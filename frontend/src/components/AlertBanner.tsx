import React from 'react';
import { ShieldAlert, AlertTriangle, X, ArrowRight } from 'lucide-react';
import type { LogisticsAlert } from '../types/logistics';

interface AlertBannerProps {
  alerts: LogisticsAlert[];
  onDismiss: (alertId: string) => void;
  onOpenAlertDetails?: (alert: LogisticsAlert) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  onDismiss,
  onOpenAlertDetails,
}) => {
  const unreadAlerts = alerts.filter((a) => a.status === 'UNREAD');

  if (unreadAlerts.length === 0) return null;

  const topAlert = unreadAlerts[0];
  const isCritical = topAlert.severity === 'CRITICAL';

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1500] max-w-xl w-[90%] animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`p-3 rounded-2xl border backdrop-blur-md shadow-xl flex items-center gap-3 select-none bg-white/95 ${
          isCritical
            ? 'border-rose-300 text-slate-900'
            : 'border-amber-300 text-slate-900'
        }`}
      >
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isCritical ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}
        >
          {isCritical ? (
            <ShieldAlert className="w-5 h-5 animate-bounce" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
              {topAlert.type.replace('_', ' ')}
            </span>
            <span className="text-xs font-bold text-slate-900 truncate">{topAlert.title}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{topAlert.message}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenAlertDetails && (
            <button
              onClick={() => onOpenAlertDetails(topAlert)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[10px] font-bold rounded-lg flex items-center gap-1 transition shadow-2xs"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => onDismiss(topAlert.id)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

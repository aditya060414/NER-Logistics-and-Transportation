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
        className={`p-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 select-none ${
          isCritical
            ? 'bg-red-950/90 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)] text-red-100'
            : 'bg-amber-950/90 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-100'
        }`}
      >
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
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
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/40 border border-white/20">
              {topAlert.type.replace('_', ' ')}
            </span>
            <span className="text-xs font-bold text-white truncate">{topAlert.title}</span>
          </div>
          <p className="text-[11px] text-gray-200 mt-0.5 line-clamp-1">{topAlert.message}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenAlertDetails && (
            <button
              onClick={() => onOpenAlertDetails(topAlert)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded flex items-center gap-1 transition"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => onDismiss(topAlert.id)}
            className="p-1 text-white/60 hover:text-white rounded transition"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

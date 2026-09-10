import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Navigation
} from 'lucide-react';
import type { Delivery, Vehicle } from '../../types/logistics';
import type { SupportedLanguage, TaskOperationalStatus } from '../../types/fieldOfficer';
import { getTranslation } from '../../services/i18n';

interface FieldDeliveryViewProps {
  delivery: Delivery | null;
  vehicle: Vehicle | null;
  onUpdateStatus: (status: TaskOperationalStatus, delayMinutes?: number) => Promise<void>;
  language: SupportedLanguage;
  onNavigateToRoute: () => void;
}

export const FieldDeliveryView: React.FC<FieldDeliveryViewProps> = ({
  delivery,
  vehicle,
  onUpdateStatus,
  language,
  onNavigateToRoute,
}) => {
  const t = getTranslation(language);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatus = (delivery?.status || 'IN_TRANSIT') as TaskOperationalStatus;

  const handleStatusClick = async (newStatus: TaskOperationalStatus, delayMinutes?: number) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(newStatus, delayMinutes);
    } catch (err) {
      console.error('Failed to transition status:', err);
    } finally {
      setIsUpdating(false);
    }
  };


  const getStatusBadgeColor = (st: string) => {
    switch (st) {
      case 'CRITICAL':
      case 'AT_RISK':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'REROUTED':
      case 'REROUTED_IN_TRANSIT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELAYED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IN_TRANSIT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
      case 'ARRIVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-xs text-slate-700">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">{delivery?.id || 'D102'}</span>
              <span className="text-[10px] font-bold text-rose-700 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-full">
                PRIORITY: {delivery?.priority || 'CRITICAL'}
              </span>
            </div>
            <span className="text-xs text-slate-500 block mt-0.5">Assam Essential Cargo Lifeline Dispatch</span>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-xs font-black border uppercase tracking-wider ${getStatusBadgeColor(currentStatus)}`}>
          {currentStatus}
        </span>
      </div>

      {/* 2-Column Responsive Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Delivery Details & Consignment Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Consignment & Corridor Specifications
          </span>

          {/* Cargo Summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">{t.cargo}</span>
            <p className="font-bold text-slate-900 text-sm">{delivery?.cargo_name || 'Emergency IV Fluids & Trauma Kits'}</p>
            <p className="text-[11px] text-slate-500">Class: Temperature-Controlled Pharmaceuticals / Emergency Relief</p>
          </div>

          {/* Origin & Destination Corridor */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">{t.from}</span>
              <p className="font-bold text-slate-800 text-sm">{delivery?.origin ? delivery.origin.split(' ')[0] : 'Guwahati'}</p>
              <span className="text-[11px] text-slate-500 block truncate">Central Supply Depot</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">{t.to}</span>
              <p className="font-bold text-emerald-700 text-sm">{delivery?.destination ? delivery.destination.split(' ')[0] : 'Haflong'}</p>
              <span className="text-[11px] text-emerald-600 block truncate">Civil Hospital Depot</span>
            </div>
          </div>

          {/* Schedule, ETA and Delays */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
            <div>
              <span className="text-[9px] text-slate-500 block">Scheduled ETA</span>
              <span className="font-bold text-slate-900">16:00 UTC</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Reported Delay</span>
              <span className="font-bold text-amber-600">
                +{delivery?.delay_minutes || 42} min
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Corridor Risk</span>
              <span className="font-bold text-amber-600">{delivery?.risk_level || 'MEDIUM'}</span>
            </div>
          </div>

          {/* Assigned Vehicle & Driver */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[9px] text-slate-500 block">Assigned Transport</span>
              <span className="font-bold text-slate-800">{vehicle?.vehicle_number || 'AS-01-TR-102'}</span>
              <span className="text-[10px] text-slate-500 block">{vehicle?.vehicle_type || 'Medium Heavy Relief'}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 block">Assigned Driver</span>
              <span className="font-bold text-slate-800">{vehicle?.driver_name || 'Ramen Barman'}</span>
              <span className="text-[10px] text-slate-500 block">{vehicle?.driver_phone || '+91 94350-XXXXX'}</span>
            </div>
          </div>

          {/* Action: Open Map */}
          <button
            type="button"
            onClick={onNavigateToRoute}
            className="w-full py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow-xs"
          >
            <Navigation className="w-4 h-4" />
            <span>{t.viewRoute}</span>
          </button>
        </div>

        {/* Right Column: TASK WORKFLOW STATUS PROGRESSION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Operational Task Actions
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Update dispatch telemetry and mission phase timestamps for SDMA control tower synchronization.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={isUpdating || currentStatus === 'ACCEPTED'}
                onClick={() => handleStatusClick('ACCEPTED')}
                className="py-3 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-blue-700 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                ✓ ACCEPT MISSION
              </button>

              <button
                type="button"
                disabled={isUpdating || currentStatus === 'IN_TRANSIT'}
                onClick={() => handleStatusClick('IN_TRANSIT')}
                className="py-3 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-emerald-700 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                ▶ START TRANSIT
              </button>

              <button
                type="button"
                disabled={isUpdating || currentStatus === 'DELAYED'}
                onClick={() => handleStatusClick('DELAYED', 45)}
                className="py-3 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-amber-700 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                ⚠ REPORT DELAY (+45m)
              </button>

              <button
                type="button"
                disabled={isUpdating || currentStatus === 'ARRIVED'}
                onClick={() => handleStatusClick('ARRIVED')}
                className="py-3 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-purple-700 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                📍 ARRIVED DESTINATION
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={isUpdating || currentStatus === 'COMPLETED'}
              onClick={() => handleStatusClick('COMPLETED')}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs flex items-center justify-center gap-2 transition text-sm uppercase tracking-wider disabled:opacity-40"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>MARK MISSION COMPLETED</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

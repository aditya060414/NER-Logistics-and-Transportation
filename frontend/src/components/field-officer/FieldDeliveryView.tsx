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
        return 'bg-red-950 text-red-300 border-red-700';
      case 'REROUTED':
      case 'REROUTED_IN_TRANSIT':
        return 'bg-purple-950 text-purple-300 border-purple-700';
      case 'DELAYED':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'IN_TRANSIT':
        return 'bg-blue-950 text-blue-300 border-blue-700';
      case 'COMPLETED':
      case 'ARRIVED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-xs text-gray-200">
      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white">{delivery?.id || 'D102'}</span>
              <span className="text-[10px] font-bold text-red-400 px-2 py-0.5 bg-red-950 border border-red-800 rounded-full">
                PRIORITY: {delivery?.priority || 'CRITICAL'}
              </span>
            </div>
            <span className="text-xs text-gray-400 block mt-0.5">Assam Essential Cargo Lifeline Dispatch</span>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-xs font-black border uppercase tracking-wider ${getStatusBadgeColor(currentStatus)}`}>
          {currentStatus}
        </span>
      </div>

      {/* 2-Column Responsive Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Delivery Details & Consignment Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Consignment & Corridor Specifications
          </span>

          {/* Cargo Summary */}
          <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase">{t.cargo}</span>
            <p className="font-bold text-white text-sm">{delivery?.cargo_name || 'Emergency IV Fluids & Trauma Kits'}</p>
            <p className="text-[11px] text-gray-400">Class: Temperature-Controlled Pharmaceuticals / Emergency Relief</p>
          </div>

          {/* Origin & Destination Corridor */}
          <div className="grid grid-cols-2 gap-3 bg-gray-950 p-3.5 rounded-xl border border-gray-800">
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase block">{t.from}</span>
              <p className="font-bold text-white text-sm">{delivery?.origin ? delivery.origin.split(' ')[0] : 'Guwahati'}</p>
              <span className="text-[11px] text-gray-400 block truncate">Central Supply Depot</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase block">{t.to}</span>
              <p className="font-bold text-emerald-300 text-sm">{delivery?.destination ? delivery.destination.split(' ')[0] : 'Haflong'}</p>
              <span className="text-[11px] text-emerald-400/80 block truncate">Civil Hospital Depot</span>
            </div>
          </div>

          {/* Schedule, ETA and Delays */}
          <div className="grid grid-cols-3 gap-2 bg-gray-950 p-3 rounded-xl border border-gray-800 text-center text-xs">
            <div>
              <span className="text-[9px] text-gray-500 block">Scheduled ETA</span>
              <span className="font-bold text-white">16:00 UTC</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 block">Reported Delay</span>
              <span className="font-bold text-amber-400">
                +{delivery?.delay_minutes || 42} min
              </span>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 block">Corridor Risk</span>
              <span className="font-bold text-amber-300">{delivery?.risk_level || 'MEDIUM'}</span>
            </div>
          </div>

          {/* Assigned Vehicle & Driver */}
          <div className="bg-gray-950/70 p-3 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[9px] text-gray-500 block">Assigned Transport</span>
              <span className="font-bold text-gray-200">{vehicle?.vehicle_number || 'AS-01-TR-102'}</span>
              <span className="text-[10px] text-gray-400 block">{vehicle?.vehicle_type || 'Medium Heavy Relief'}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-gray-500 block">Assigned Driver</span>
              <span className="font-bold text-gray-200">{vehicle?.driver_name || 'Ramen Barman'}</span>
              <span className="text-[10px] text-gray-400 block">{vehicle?.driver_phone || '+91 94350-XXXXX'}</span>
            </div>
          </div>

          {/* Action: Open Map */}
          <button
            type="button"
            onClick={onNavigateToRoute}
            className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
          >
            <Navigation className="w-4 h-4" />
            <span>{t.viewRoute}</span>
          </button>
        </div>

        {/* Right Column: TASK WORKFLOW STATUS PROGRESSION */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Operational Task Actions
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Update dispatch telemetry and mission phase timestamps for SDMA control tower synchronization.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={isUpdating || currentStatus === 'ACCEPTED'}
                onClick={() => handleStatusClick('ACCEPTED')}
                className="py-3 px-3.5 bg-gray-950 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-xs text-blue-400 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                ✓ ACCEPT MISSION
              </button>

              <button
                type="button"
                disabled={isUpdating || currentStatus === 'IN_TRANSIT'}
                onClick={() => handleStatusClick('IN_TRANSIT')}
                className="py-3 px-3.5 bg-gray-950 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-xs text-emerald-400 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                ▶ START TRANSIT
              </button>

              <button
                type="button"
                disabled={isUpdating || currentStatus === 'DELAYED'}
                onClick={() => handleStatusClick('DELAYED', 45)}
                className="py-3 px-3.5 bg-gray-950 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-xs text-amber-400 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                ⚠ REPORT DELAY (+45m)
              </button>

              <button
                type="button"
                disabled={isUpdating || currentStatus === 'ARRIVED'}
                onClick={() => handleStatusClick('ARRIVED')}
                className="py-3 px-3.5 bg-gray-950 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-xs text-purple-400 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                📍 ARRIVED DESTINATION
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <button
              type="button"
              disabled={isUpdating || currentStatus === 'COMPLETED'}
              onClick={() => handleStatusClick('COMPLETED')}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition text-sm uppercase tracking-wider disabled:opacity-40"
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

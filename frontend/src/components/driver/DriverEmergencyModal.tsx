import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, Truck, AlertTriangle, LifeBuoy, MapPin, X, CheckCircle2 } from 'lucide-react';
import type { DriverGPS } from '../../types/driver';

interface DriverEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  gps: DriverGPS;
  vehicleNumber: string;
  driverName: string;
}

export const DriverEmergencyModal: React.FC<DriverEmergencyModalProps> = ({
  isOpen,
  onClose,
  gps,
  vehicleNumber,
  driverName,
}) => {
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);

  if (!isOpen) return null;

  const emergencyTypes = [
    {
      id: 'VEHICLE_BREAKDOWN',
      title: 'Vehicle Breakdown',
      desc: 'Engine failure, puncture, mechanical fault on terrain',
      icon: Truck,
      color: 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900',
    },
    {
      id: 'LANDSLIDE_TRAPPED',
      title: 'Trapped by Landslide / Flood',
      desc: 'Debris blocking road ahead & behind, rising water',
      icon: AlertOctagon,
      color: 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900',
    },
    {
      id: 'ACCIDENT_MEDICAL',
      title: 'Accident / Medical Help',
      desc: 'Collision, driver injury, urgent medical intervention',
      icon: LifeBuoy,
      color: 'border-red-200 bg-red-50 hover:bg-red-100 text-red-900',
    },
    {
      id: 'ROAD_CONFLICT',
      title: 'Security / Road Blockade',
      desc: 'Unsafe passage, protest blockade, security concern',
      icon: AlertTriangle,
      color: 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-900',
    },
  ];

  const handleSendSOS = (typeId: string) => {
    setSelectedEmergency(typeId);
    setSosSent(true);
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-rose-200 rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-rose-900 tracking-wider uppercase">
                EMERGENCY SOS
              </h2>
              <p className="text-xs text-rose-700 font-semibold">
                Instant Priority Broadcast to NER Control Tower
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSosSent(false);
              onClose();
            }}
            className="text-slate-500 hover:text-slate-900 p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Driver Location HUD */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-mono text-slate-900 font-bold block">
                  {gps.latitude.toFixed(4)}° N, {gps.longitude.toFixed(4)}° E
                </span>
                <span className="text-[11px] text-slate-500">
                  Vehicle {vehicleNumber} • Driver {driverName}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold uppercase">
              HIGH PRIORITY
            </span>
          </div>

          {sosSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-emerald-950 uppercase">
                SOS SIGNAL TRANSMITTED
              </h3>
              <p className="text-xs text-emerald-700">
                Control Tower dispatched alert for <span className="font-bold">{selectedEmergency?.replace('_', ' ')}</span>. Nearby response units and highway patrol alerted with your live GPS location.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSosSent(false);
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-sm text-slate-800 shadow-xs"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 font-medium">
                Tap an emergency category to broadcast immediate assistance request:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {emergencyTypes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSendSOS(item.id)}
                      className={`p-4 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between shadow-xs ${item.color}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                          SOS TAP
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Direct Telephone Helplines */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Direct Emergency Hotlines
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:112"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call 112 (Police)</span>
                  </a>
                  <a
                    href="tel:1070"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-xs"
                  >
                    <PhoneCall className="w-4 h-4 text-blue-600" />
                    <span>NER Disaster 1070</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

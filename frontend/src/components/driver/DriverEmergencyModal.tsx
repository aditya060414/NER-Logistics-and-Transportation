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
      color: 'border-amber-600 bg-amber-950/40 text-amber-300',
    },
    {
      id: 'LANDSLIDE_TRAPPED',
      title: 'Trapped by Landslide / Flood',
      desc: 'Debris blocking road ahead & behind, rising water',
      icon: AlertOctagon,
      color: 'border-red-600 bg-red-950/50 text-red-300',
    },
    {
      id: 'ACCIDENT_MEDICAL',
      title: 'Accident / Medical Help',
      desc: 'Collision, driver injury, urgent medical intervention',
      icon: LifeBuoy,
      color: 'border-rose-600 bg-rose-950/50 text-rose-300',
    },
    {
      id: 'ROAD_CONFLICT',
      title: 'Security / Road Blockade',
      desc: 'Unsafe passage, protest blockade, security concern',
      icon: AlertTriangle,
      color: 'border-orange-600 bg-orange-950/40 text-orange-300',
    },
  ];

  const handleSendSOS = (typeId: string) => {
    setSelectedEmergency(typeId);
    setSosSent(true);
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-950 border-2 border-red-600/80 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.5)] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-gray-100 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="bg-red-950/80 border-b border-red-800/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wider uppercase">
                EMERGENCY SOS
              </h2>
              <p className="text-xs text-red-300 font-semibold">
                Instant Priority Broadcast to NER Control Tower
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSosSent(false);
              onClose();
            }}
            className="text-gray-400 hover:text-white p-2 rounded-xl bg-gray-900 border border-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Driver Location HUD */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <span className="font-mono text-white font-bold block">
                  {gps.latitude.toFixed(4)}° N, {gps.longitude.toFixed(4)}° E
                </span>
                <span className="text-[11px] text-gray-400">
                  Vehicle {vehicleNumber} • Driver {driverName}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-[10px] font-mono font-bold uppercase">
              HIGH PRIORITY
            </span>
          </div>

          {sosSent ? (
            <div className="bg-green-950/70 border border-green-700/80 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-green-600/30 border border-green-500 text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white uppercase">
                SOS SIGNAL TRANSMITTED
              </h3>
              <p className="text-xs text-green-300">
                Control Tower dispatched alert for <span className="font-bold">{selectedEmergency?.replace('_', ' ')}</span>. Nearby response units and highway patrol alerted with your live GPS location.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSosSent(false);
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 font-bold text-sm text-white"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-300 font-medium">
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
                      className={`p-4 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between ${item.color} hover:brightness-125`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                          SOS TAP
                        </span>
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">{item.title}</h4>
                        <p className="text-[11px] text-gray-300 mt-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Direct Telephone Helplines */}
              <div className="pt-3 border-t border-gray-800 space-y-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Direct Emergency Hotlines
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:112"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call 112 (Police)</span>
                  </a>
                  <a
                    href="tel:1070"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold text-sm"
                  >
                    <PhoneCall className="w-4 h-4 text-blue-400" />
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

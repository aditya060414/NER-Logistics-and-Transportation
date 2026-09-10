import React, { useState } from 'react';
import { Truck, ShieldCheck, ArrowRight, User, KeyRound, Sparkles, Navigation } from 'lucide-react';
import type { DriverProfile } from '../../types/driver';

interface DriverLoginProps {
  onLogin: (profile: DriverProfile) => void;
  onSwitchRole: (role: 'admin' | 'field_officer') => void;
}

const DEMO_DRIVERS: DriverProfile[] = [
  {
    id: 'DRV-AS-401',
    name: 'Ramesh Baruah',
    phone: '+91 94350 12849',
    vehicle_id: 'V-01',
    vehicle_number: 'AS-01-EC-9042',
    vehicle_type: 'Mahindra Bolero Maxi Truck (4x4)',
    carrier_hub: 'Guwahati Regional Hub',
    license_number: 'AS0120190048123',
    rating: 4.9,
  },
  {
    id: 'DRV-AS-512',
    name: 'Bipul Das',
    phone: '+91 98640 55219',
    vehicle_id: 'V-02',
    vehicle_number: 'AS-03-BC-4112',
    vehicle_type: 'Tata 407 High-Clearance Truck',
    carrier_hub: 'Tezpur Base Depot',
    license_number: 'AS0320170031908',
    rating: 4.8,
  },
  {
    id: 'DRV-AS-619',
    name: 'Monjit Saikia',
    phone: '+91 91012 88341',
    vehicle_id: 'V-03',
    vehicle_number: 'AS-11-AC-7809',
    vehicle_type: 'Ashok Leyland Ecomet All-Terrain',
    carrier_hub: 'Silchar Distribution Station',
    license_number: 'AS1120210091873',
    rating: 4.7,
  },
];

export const DriverLogin: React.FC<DriverLoginProps> = ({ onLogin, onSwitchRole }) => {
  const [driverId, setDriverId] = useState<string>('DRV-AS-401');
  const [pin, setPin] = useState<string>('1234');
  const [vehicleNo, setVehicleNo] = useState<string>('AS-01-EC-9042');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = DEMO_DRIVERS.find((d) => d.id === driverId || d.vehicle_number === vehicleNo);
    if (matched) {
      onLogin(matched);
    } else {
      onLogin({
        id: driverId || 'DRV-NEW',
        name: 'Assam Fleet Driver',
        phone: '+91 90000 00000',
        vehicle_id: 'V-CUSTOM',
        vehicle_number: vehicleNo || 'AS-01-XX-0000',
        vehicle_type: 'Heavy All-Terrain Vehicle',
        carrier_hub: 'Assam Corridor Station',
        license_number: 'AS0120240099881',
        rating: 5.0,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>SIH 2026 • Driver Navigation &amp; Consignment System</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
              NER Driver Portal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            High-contrast, offline-first tactical route &amp; consignment console for Northeast India logistics corridors.
          </p>
        </div>

        {/* 1-Click Quick Demo Presets */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>1-Click Demo Login</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Assam Fleet</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {DEMO_DRIVERS.map((driver) => (
              <button
                key={driver.id}
                type="button"
                onClick={() => onLogin(driver)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-left transition flex items-center justify-between group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {driver.id.slice(-3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-700">
                        {driver.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                        {driver.vehicle_number}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {driver.vehicle_type} • <span className="text-slate-700">{driver.carrier_hub}</span>
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-500 flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4"
        >
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Custom Driver Credentials
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Driver ID / Mobile</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-slate-900 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. DRV-AS-401"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Vehicle Plate</label>
                <div className="relative">
                  <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-slate-900 text-xs font-mono focus:border-blue-500 focus:outline-none uppercase"
                    placeholder="AS-01-EC-9042"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Security PIN</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-slate-900 text-xs font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wide shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Enter Driver Console</span>
          </button>
        </form>

        {/* Role Switcher Links */}
        <div className="flex items-center justify-between text-xs px-2 pt-2 text-slate-500">
          <span>Need a different portal?</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSwitchRole('field_officer')}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              Field Officer Client
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onSwitchRole('admin')}
              className="text-purple-600 hover:text-purple-700 font-bold hover:underline"
            >
              Admin Control Tower
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

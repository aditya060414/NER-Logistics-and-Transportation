import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Navigation, 
  Scale, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert,
  LocateFixed,
  FileText
} from 'lucide-react';
import type { DriverProfile, DriverGPS, CargoCategory, PriorityLevel } from '../../types/driver';
import type { Delivery } from '../../types/logistics';
import type { RoutePlanResponse } from '../../types/route';
import { createConsignmentDelivery, planRoute } from '../../services/api';

interface DriverNewConsignmentViewProps {
  driver: DriverProfile;
  currentGps: DriverGPS;
  onConsignmentCreated: (delivery: Delivery, routePlan: RoutePlanResponse) => void;
  onCancel: () => void;
}

interface HubOption {
  name: string;
  city: string;
  lat: number;
  lon: number;
  label: string;
}

const NER_HUBS: HubOption[] = [
  { name: 'Guwahati Regional Hub', city: 'Guwahati', lat: 26.1445, lon: 91.7362, label: 'Guwahati (Main Depot)' },
  { name: 'Tezpur Base Depot', city: 'Tezpur', lat: 26.6338, lon: 92.7926, label: 'Tezpur (Sonitpur)' },
  { name: 'Haflong Supply Depot', city: 'Haflong', lat: 25.1764, lon: 93.0186, label: 'Haflong (Dima Hasao - Hill Corridor)' },
  { name: 'Silchar Distribution Station', city: 'Silchar', lat: 24.8333, lon: 92.7789, label: 'Silchar (Barak Valley)' },
  { name: 'Jorhat Logistics Hub', city: 'Jorhat', lat: 26.7509, lon: 94.2037, label: 'Jorhat (Upper Assam)' },
  { name: 'Dibrugarh Terminal', city: 'Dibrugarh', lat: 27.4728, lon: 94.9120, label: 'Dibrugarh (Eastern Depot)' },
  { name: 'Bongaigaon Depot', city: 'Bongaigaon', lat: 26.5019, lon: 90.5436, label: 'Bongaigaon (Western Assam)' },
  { name: 'Nagaon Distribution Center', city: 'Nagaon', lat: 26.3468, lon: 92.6840, label: 'Nagaon (Central Junction)' },
];

const CARGO_PRESETS: { category: CargoCategory; defaultPriority: PriorityLevel; sampleName: string; defaultUnit: string }[] = [
  { category: 'MEDICINE', defaultPriority: 'CRITICAL', sampleName: 'Emergency Antibiotics & Vaccines', defaultUnit: 'boxes' },
  { category: 'FOOD', defaultPriority: 'HIGH', sampleName: 'Dry Ration Kits & Grains', defaultUnit: 'bags' },
  { category: 'RELIEF MATERIAL', defaultPriority: 'CRITICAL', sampleName: 'Disaster Shelter Tents & Blankets', defaultUnit: 'kits' },
  { category: 'FUEL / ESSENTIAL SUPPLY', defaultPriority: 'HIGH', sampleName: 'Diesel Cans & Generator Fuel', defaultUnit: 'litres' },
  { category: 'AGRICULTURAL GOODS', defaultPriority: 'NORMAL', sampleName: 'Assam Tea Crates & Harvest Goods', defaultUnit: 'crates' },
  { category: 'CONSTRUCTION MATERIAL', defaultPriority: 'NORMAL', sampleName: 'Road Repair Sandbags & Bitumen', defaultUnit: 'sacks' },
  { category: 'GENERAL GOODS', defaultPriority: 'NORMAL', sampleName: 'FMCG & Commercial Packages', defaultUnit: 'cartons' },
  { category: 'OTHER', defaultPriority: 'LOW', sampleName: 'Standard Parcel Cargo', defaultUnit: 'packages' },
];

export const DriverNewConsignmentView: React.FC<DriverNewConsignmentViewProps> = ({
  driver,
  currentGps,
  onConsignmentCreated,
  onCancel,
}) => {
  // Generate random consignment ID CN-2026-XXXXX
  const generateConsignmentId = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `CN-2026-${randomDigits}`;
  };

  const [consignmentId, setConsignmentId] = useState<string>(generateConsignmentId());
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>('MEDICINE');
  const [cargoName, setCargoName] = useState<string>('Emergency Antibiotics & Vaccines');
  const [priority, setPriority] = useState<PriorityLevel>('CRITICAL');
  const [quantity, setQuantity] = useState<number>(250);
  const [unit, setUnit] = useState<string>('boxes');
  const [weightKg, setWeightKg] = useState<number>(850);
  
  // Origin states
  const [originType, setOriginType] = useState<'HUB' | 'GPS' | 'CUSTOM'>('GPS');
  const [originName, setOriginName] = useState<string>('Guwahati Current Location (GPS)');
  const [originLat, setOriginLat] = useState<number>(currentGps.latitude);
  const [originLon, setOriginLon] = useState<number>(currentGps.longitude);

  // Destination states
  const [destHubIndex, setDestHubIndex] = useState<number>(2); // Default to Haflong (Dima Hasao)
  const [destName, setDestName] = useState<string>(NER_HUBS[2].name);
  const [destLat, setDestLat] = useState<number>(NER_HUBS[2].lat);
  const [destLon, setDestLon] = useState<number>(NER_HUBS[2].lon);

  const [notes, setNotes] = useState<string>('Fragile cargo. Prioritize low-vibration elevated corridors.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When cargo category changes, update default priority and sample name
  const handleCategoryChange = (cat: CargoCategory) => {
    setCargoCategory(cat);
    const preset = CARGO_PRESETS.find((p) => p.category === cat);
    if (preset) {
      setPriority(preset.defaultPriority);
      setCargoName(preset.sampleName);
      setUnit(preset.defaultUnit);
    }
  };

  const handleUseCurrentGpsOrigin = () => {
    setOriginType('GPS');
    setOriginName(`Live GPS (${currentGps.latitude.toFixed(3)}°N, ${currentGps.longitude.toFixed(3)}°E)`);
    setOriginLat(currentGps.latitude);
    setOriginLon(currentGps.longitude);
  };

  const handleSelectOriginHub = (index: number) => {
    setOriginType('HUB');
    const hub = NER_HUBS[index];
    setOriginName(hub.name);
    setOriginLat(hub.lat);
    setOriginLon(hub.lon);
  };

  const handleSelectDestHub = (index: number) => {
    setDestHubIndex(index);
    const hub = NER_HUBS[index];
    setDestName(hub.name);
    setDestLat(hub.lat);
    setDestLon(hub.lon);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Create and register delivery on backend
      const deliveryRes = await createConsignmentDelivery({
        consignment_id: consignmentId,
        cargo_name: cargoName,
        cargo_type: cargoCategory,
        priority: priority,
        origin: originName,
        origin_lat: originLat,
        origin_lon: originLon,
        destination: destName,
        dest_lat: destLat,
        dest_lon: destLon,
        driver_id: driver.id,
        vehicle_id: driver.vehicle_id,
        quantity: quantity,
        unit: unit,
        weight_kg: weightKg,
        notes: notes,
      });

      // 2. Call NetworkX routing engine for safe corridor calculation
      const routePlan = await planRoute({
        origin_lat: originLat,
        origin_lon: originLon,
        dest_lat: destLat,
        dest_lon: destLon,
        priority: priority,
        blocked_roads: [],
      });

      onConsignmentCreated(deliveryRes.delivery, routePlan);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register consignment and calculate route');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 p-4 sm:p-6 text-slate-800 font-sans pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
              STEP 1 OF 3 • CONSIGNMENT ENTRY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase mt-1">
            New Cargo Consignment
          </h2>
          <p className="text-xs text-slate-500">
            Assigned to {driver.name} ({driver.vehicle_number})
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs"
        >
          Cancel
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Consignment ID & Cargo Category */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Consignment Identification</span>
            </span>
            <button
              type="button"
              onClick={() => setConsignmentId(generateConsignmentId())}
              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-mono font-bold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regenerate ID</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Consignment Waybill #</label>
              <input
                type="text"
                value={consignmentId}
                onChange={(e) => setConsignmentId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-mono text-sm text-blue-700 font-bold focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Cargo Category</label>
              <select
                value={cargoCategory}
                onChange={(e) => handleCategoryChange(e.target.value as CargoCategory)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
              >
                {CARGO_PRESETS.map((p) => (
                  <option key={p.category} value={p.category}>
                    {p.category} (Default: {p.defaultPriority})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold text-xs mb-1">Cargo Manifest Title</label>
            <input
              type="text"
              value={cargoName}
              onChange={(e) => setCargoName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Life-saving medical supplies for Dima Hasao relief center"
              required
            />
          </div>
        </div>

        {/* Section 2: Priority Level & Smart Mapping */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Logistics Priority Classification</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Impacts AI Road Risk Weighting
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(['CRITICAL', 'HIGH', 'NORMAL', 'LOW'] as PriorityLevel[]).map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                    isSelected
                      ? p === 'CRITICAL'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500 shadow-xs'
                        : p === 'HIGH'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500 shadow-xs'
                        : p === 'NORMAL'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-xs'
                        : 'bg-slate-100 border-slate-400 text-slate-900 ring-1 ring-slate-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="font-black text-xs uppercase">{p}</span>
                  <span className="text-[9px] mt-0.5 opacity-80">
                    {p === 'CRITICAL' && 'Life-Critical Relief'}
                    {p === 'HIGH' && 'Perishable / Priority'}
                    {p === 'NORMAL' && 'Commercial Standard'}
                    {p === 'LOW' && 'Non-Urgent Bulk'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Quantity & Weight */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>Load &amp; Quantity Specifications</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Packaging Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                placeholder="boxes / kg / bags"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Gross Weight (KG)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Origin & Destination */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Route Origin &amp; Destination Corridors</span>
          </div>

          {/* Origin Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-700 font-bold">1. Pickup / Origin Point</label>
              <button
                type="button"
                onClick={handleUseCurrentGpsOrigin}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Use Live GPS Location</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleUseCurrentGpsOrigin}
                className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                  originType === 'GPS'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LocateFixed className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold block">Current GPS Position</span>
                  <span className="text-[10px] font-mono opacity-80">
                    {currentGps.latitude.toFixed(4)}°N, {currentGps.longitude.toFixed(4)}°E
                  </span>
                </div>
              </button>

              <select
                onChange={(e) => handleSelectOriginHub(parseInt(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
              >
                <option value="">Or Select NER Hub Origin...</option>
                {NER_HUBS.map((hub, idx) => (
                  <option key={hub.name} value={idx}>
                    {hub.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>Selected Origin: <strong className="text-slate-900">{originName}</strong></span>
              <span>({originLat.toFixed(3)}, {originLon.toFixed(3)})</span>
            </div>
          </div>

          {/* Destination Picker */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <label className="block text-slate-700 font-bold text-xs">2. Delivery Destination</label>
            <select
              value={destHubIndex}
              onChange={(e) => handleSelectDestHub(parseInt(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
            >
              {NER_HUBS.map((hub, idx) => (
                <option key={hub.name} value={idx}>
                  📍 {hub.label} — ({hub.lat.toFixed(3)}°N, {hub.lon.toFixed(3)}°E)
                </option>
              ))}
            </select>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>Selected Destination: <strong className="text-slate-900">{destName}</strong></span>
              <span>({destLat.toFixed(3)}, {destLon.toFixed(3)})</span>
            </div>
          </div>
        </div>

        {/* Section 5: Handling Instructions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Driver Notes / Special Handling Instructions</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            placeholder="Special convoy or off-road clearance notes..."
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider shadow-xs transition active:scale-98 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>ANALYZING ROAD RISK &amp; CALCULATING SAFE CORRIDOR...</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span>SAVE CONSIGNMENT &amp; CALCULATE SAFE ROUTE</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

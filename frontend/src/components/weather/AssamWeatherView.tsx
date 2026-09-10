import React, { useState, useEffect, useMemo } from 'react';
import { 
  CloudRain, 
  Droplets, 
  AlertTriangle, 
  AlertOctagon, 
  Search, 
  ArrowLeft, 
  RefreshCw, 
  ChevronRight, 
  X, 
  MapPin, 
  ShieldAlert, 
  Calendar
} from 'lucide-react';
import type { DistrictWeatherReport } from '../../types/weather';
import { fetchDistrictWeatherList } from '../../services/api';

interface AssamWeatherViewProps {
  onBackToDashboard?: () => void;
  onBack?: () => void;
  selectedInitialDistrict?: string | null;
}

export const AssamWeatherView: React.FC<AssamWeatherViewProps> = ({
  onBackToDashboard,
  onBack,
  selectedInitialDistrict,
}) => {
  const handleBack = onBackToDashboard || onBack || (() => { window.location.hash = ''; });
  const [districts, setDistricts] = useState<DistrictWeatherReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAlert, setFilterAlert] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rainfall' | 'alert' | 'saturation' | 'name'>('rainfall');
  const [activeDistrictDetail, setActiveDistrictDetail] = useState<DistrictWeatherReport | null>(null);

  const loadWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDistrictWeatherList();
      setDistricts(data);
      if (selectedInitialDistrict) {
        const found = data.find(
          (d) => d.district.toLowerCase() === selectedInitialDistrict.toLowerCase()
        );
        if (found) setActiveDistrictDetail(found);
      }
    } catch (err: any) {
      console.error('Failed to load district weather:', err);
      setError(err?.message || 'Could not connect to weather telemetry service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [selectedInitialDistrict]);

  // Telemetry Aggregates
  const stats = useMemo(() => {
    if (!districts.length) return null;
    const redAlerts = districts.filter((d) => d.flood_alert_level === 'RED').length;
    const orangeAlerts = districts.filter((d) => d.flood_alert_level === 'ORANGE').length;
    const avgRain = districts.reduce((acc, d) => acc + d.rainfall_24h_mm, 0) / districts.length;
    const maxRainDist = [...districts].sort((a, b) => b.rainfall_24h_mm - a.rainfall_24h_mm)[0];
    const avgSaturation = districts.reduce((acc, d) => acc + d.soil_saturation_pct, 0) / districts.length;

    return {
      total: districts.length,
      redAlerts,
      orangeAlerts,
      avgRain: avgRain.toFixed(1),
      maxRainDist,
      avgSaturation: avgSaturation.toFixed(1),
    };
  }, [districts]);

  // Filtered and Sorted list
  const filteredDistricts = useMemo(() => {
    return districts
      .filter((item) => {
        const matchesSearch =
          item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.hq.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAlert =
          filterAlert === 'ALL' || item.flood_alert_level === filterAlert;
        return matchesSearch && matchesAlert;
      })
      .sort((a, b) => {
        if (sortBy === 'rainfall') return b.rainfall_24h_mm - a.rainfall_24h_mm;
        if (sortBy === 'saturation') return b.soil_saturation_pct - a.soil_saturation_pct;
        if (sortBy === 'name') return a.district.localeCompare(b.district);
        if (sortBy === 'alert') {
          const rank = { RED: 4, ORANGE: 3, YELLOW: 2, GREEN: 1 };
          return (rank[b.flood_alert_level] || 0) - (rank[a.flood_alert_level] || 0);
        }
        return 0;
      });
  }, [districts, searchQuery, filterAlert, sortBy]);

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'RED':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'ORANGE':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'YELLOW':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition shadow-xs flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Control Tower</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-600" />
                  <span>Assam Weather Intelligence Center</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold">
                  STATE REGIONAL RADAR
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live hydro-meteorological telemetry across all 35 Assam districts • IMD &amp; ASDMA Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={loadWeather}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadWeather}
              className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 font-bold hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Macro Telemetry Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Monitored Districts</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats.total} <span className="text-xs text-slate-500 font-sans">Districts</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">100% Sensor Coverage</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Red Alert Flood Zones</span>
              </div>
              <div className="text-2xl font-black text-rose-600 font-mono">
                {stats.redAlerts} <span className="text-xs text-slate-500 font-sans">Zones</span>
              </div>
              <span className="text-[10px] text-rose-700 font-bold">Severe Inundation Risk</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Orange Alert (High Risk)</span>
              </div>
              <div className="text-2xl font-black text-amber-600 font-mono">
                {stats.orangeAlerts} <span className="text-xs text-slate-500 font-sans">Districts</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold">Slope Watch Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                <span>State Mean 24h Rain</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats.avgRain} <span className="text-xs text-slate-500 font-sans">MM</span>
              </div>
              <span className="text-[10px] text-slate-500">Peak: {stats.maxRainDist?.district} ({stats.maxRainDist?.rainfall_24h_mm} mm)</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <Droplets className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mean Soil Moisture</span>
              </div>
              <div className="text-2xl font-black text-indigo-600 font-mono">
                {stats.avgSaturation}%
              </div>
              <span className="text-[10px] text-indigo-700 font-bold">High Sub-Surface Wetness</span>
            </div>
          </div>
        )}

        {/* Filter and Search Controls */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Assam district, station, or observatory..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-slate-500 font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="rainfall">24h Rainfall (Highest First)</option>
                <option value="alert">Flood Alert Severity</option>
                <option value="saturation">Soil Moisture Saturation</option>
                <option value="name">District Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Alert Level Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px] font-bold mr-1 shrink-0 uppercase tracking-wider">
              Filter Alert:
            </span>
            {[
              { id: 'ALL', label: `All (${districts.length})` },
              { id: 'RED', label: 'Red Alert (Severe Inundation)' },
              { id: 'ORANGE', label: 'Orange Alert (High Risk)' },
              { id: 'YELLOW', label: 'Yellow Watch' },
              { id: 'GREEN', label: 'Normal / Stable' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterAlert(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-xs ${
                  filterAlert === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Districts Grid */}
        {isLoading ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Synchronizing Assam District Weather Telemetry Vectors...
            </p>
          </div>
        ) : filteredDistricts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No matching districts found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or alert level filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDistricts.map((d) => {
              const isRed = d.flood_alert_level === 'RED';
              const isOrange = d.flood_alert_level === 'ORANGE';

              return (
                <div
                  key={d.district}
                  onClick={() => setActiveDistrictDetail(d)}
                  className={`p-5 rounded-3xl border transition shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 bg-white ${
                    isRed
                      ? 'hover:border-rose-300 border-slate-200'
                      : isOrange
                      ? 'hover:border-amber-300 border-slate-200'
                      : 'hover:border-slate-300 border-slate-200'
                  }`}
                >
                  {/* Top: District Name and Alert Pill */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 tracking-tight">
                            {d.district}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {d.hq}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getAlertBadge(
                          d.flood_alert_level
                        )}`}
                      >
                        {d.flood_alert_level} ALERT
                      </span>
                    </div>

                    {/* Condition Strip */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold truncate">{d.condition}</span>
                    </div>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 font-bold block mb-0.5">24H RAIN</span>
                      <span className="text-sm font-black text-blue-700 font-mono">{d.rainfall_24h_mm}</span>
                      <span className="text-[9px] text-slate-400 block font-sans">mm</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 font-bold block mb-0.5">TEMP</span>
                      <span className="text-sm font-black text-slate-900 font-mono">{d.temp_c}°C</span>
                      <span className="text-[9px] text-slate-400 block font-sans">{d.humidity_pct}% hum</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 font-bold block mb-0.5">SOIL WET</span>
                      <span className="text-sm font-black text-indigo-700 font-mono">{d.soil_saturation_pct}%</span>
                      <span className="text-[9px] text-slate-400 block font-sans">{d.landslide_risk} risk</span>
                    </div>
                  </div>

                  {/* Advisory preview and action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                      {d.advisory}
                    </span>
                    <span className="text-blue-600 font-bold text-xs flex items-center gap-1 shrink-0">
                      <span>Report</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* District Detailed Weather Modal */}
      {activeDistrictDetail && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {activeDistrictDetail.district} District
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getAlertBadge(
                      activeDistrictDetail.flood_alert_level
                    )}`}
                  >
                    {activeDistrictDetail.flood_alert_level} FLOOD ALERT
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Station: <strong className="text-slate-800">{activeDistrictDetail.hq}</strong> • GPS: {activeDistrictDetail.lat.toFixed(4)}°N, {activeDistrictDetail.lon.toFixed(4)}°E
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveDistrictDetail(null)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Weather Condition Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <CloudRain className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider block">
                      CURRENT METEOROLOGICAL STATE
                    </span>
                    <div className="text-sm sm:text-base font-black text-slate-900">
                      {activeDistrictDetail.condition}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-blue-700 font-mono">
                    {activeDistrictDetail.rainfall_24h_mm}
                  </span>
                  <span className="text-xs text-slate-500 font-sans block">mm / 24h ({activeDistrictDetail.rainfall_intensity})</span>
                </div>
              </div>

              {/* Telemetry Gauge Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Sensor Telemetry Array
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">TEMPERATURE</span>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {activeDistrictDetail.temp_c}°C
                    </div>
                    <span className="text-[10px] text-slate-400">Ambient dry bulb</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">HUMIDITY</span>
                    <div className="text-xl font-black text-blue-600 font-mono">
                      {activeDistrictDetail.humidity_pct}%
                    </div>
                    <span className="text-[10px] text-slate-400">Relative humidity</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">WIND VECTOR</span>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {activeDistrictDetail.wind_speed_kmh} <span className="text-xs font-sans">km/h</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{activeDistrictDetail.wind_direction} Direction</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">VISIBILITY</span>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {activeDistrictDetail.visibility_km} <span className="text-xs font-sans">km</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Atmospheric view</span>
                  </div>
                </div>
              </div>

              {/* Hydro-Terrain Hazard Matrix */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Hydro-Terrain Hazard Evaluation
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">SOIL MOISTURE SATURATION</span>
                      <strong className="text-sm font-mono font-black text-slate-900">{activeDistrictDetail.soil_saturation_pct}%</strong>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Saturated
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">LANDSLIDE &amp; SLOPE RISK</span>
                      <strong className="text-sm font-mono font-black text-slate-900">{activeDistrictDetail.landslide_risk}</strong>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                        activeDistrictDetail.landslide_risk === 'CRITICAL'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : activeDistrictDetail.landslide_risk === 'HIGH'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}
                    >
                      {activeDistrictDetail.landslide_risk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Road & Freight Logistics Advisory */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Freight &amp; Logistics Corridor Advisory</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {activeDistrictDetail.advisory}
                </p>
              </div>

              {/* 3-Day Precipitation Forecast Timeline */}
              {activeDistrictDetail.forecast && activeDistrictDetail.forecast.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>3-Day District Weather Outlook</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {activeDistrictDetail.forecast.map((fc, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{fc.day}</span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              fc.risk === 'HIGH'
                                ? 'bg-rose-100 text-rose-800'
                                : fc.risk === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {fc.risk} RISK
                          </span>
                        </div>
                        <div className="text-lg font-black text-blue-700 font-mono">
                          {fc.rainfall_mm} <span className="text-[10px] text-slate-500 font-sans">mm</span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">{fc.condition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveDistrictDetail(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase shadow-xs transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

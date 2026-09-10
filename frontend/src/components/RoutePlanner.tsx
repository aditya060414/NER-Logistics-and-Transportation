import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ArrowUpDown, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  X, 
  CheckCircle2,
} from 'lucide-react';
import type { LogisticsHub, RoutePlanResponse } from '../types/route';
import { fetchLogisticsHubs, planRoute } from '../services/api';

interface RoutePlannerProps {
  isOpen: boolean;
  onClose: () => void;
  onRoutesCalculated: (response: RoutePlanResponse | null) => void;
  activeRouteResponse: RoutePlanResponse | null;
  selectedRouteType: 'recommended' | 'alternative' | null;
  onSelectRouteType: (type: 'recommended' | 'alternative') => void;
  blockedRoadOsmIds: string[];
  onRemoveBlockedRoad?: (osmId: string) => void;
  onClearBlockedRoads?: () => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  isOpen,
  onClose,
  onRoutesCalculated,
  activeRouteResponse,
  selectedRouteType,
  onSelectRouteType,
  blockedRoadOsmIds,
  onRemoveBlockedRoad,
  onClearBlockedRoads,
}) => {
  const [hubs, setHubs] = useState<LogisticsHub[]>([]);
  const [originCity, setOriginCity] = useState<string>('guwahati');
  const [destCity, setDestCity] = useState<string>('haflong');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW'>('CRITICAL');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Fetch logistics hubs on mount
  useEffect(() => {
    fetchLogisticsHubs()
      .then((data) => {
        setHubs(data);
      })
      .catch((err) => {
        console.error('Failed to load logistics hubs:', err);
      });
  }, []);

  const handleSwap = () => {
    const temp = originCity;
    setOriginCity(destCity);
    setDestCity(temp);
  };

  const handlePlanRoute = async () => {
    setIsCalculating(true);
    setCalcError(null);

    try {
      const response = await planRoute({
        origin_city: originCity,
        dest_city: destCity,
        priority: priority,
        blocked_roads: blockedRoadOsmIds,
      });

      onRoutesCalculated(response);
      if (response && response.recommended) {
        onSelectRouteType('recommended');
      }
    } catch (err: any) {
      console.error('Routing failed:', err);
      setCalcError(err.message || 'Routing engine error. Please check server connection.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClear = () => {
    onRoutesCalculated(null);
    setCalcError(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-4 left-4 z-[1000] w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex flex-col transition-all duration-300 text-slate-800 overflow-hidden ${
        isMinimized ? 'max-h-14' : 'max-h-[calc(100vh-6rem)]'
      }`}
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Risk-Aware Route Planner
            </h2>
            <p className="text-[10px] text-slate-500">Multi-criteria Dijkstra Safety Corridor</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title={isMinimized ? 'Expand Planner' : 'Minimize'}
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3.5 space-y-3.5 overflow-y-auto text-xs pb-20">
          {/* Origin & Destination Hub Selectors */}
          <div className="relative space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {/* Origin */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                FROM (Origin Logistics Depot)
              </label>
              <select
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs transition"
              >
                {hubs.map((hub) => (
                  <option key={`orig-${hub.city}`} value={hub.city.toLowerCase()}>
                    {hub.name} ({hub.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-1 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-blue-600 border border-slate-200 shadow-2xs transition"
                title="Swap Origin and Destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                TO (Critical Destination / Relief Center)
              </label>
              <select
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs transition"
              >
                {hubs.map((hub) => (
                  <option key={`dest-${hub.city}`} value={hub.city.toLowerCase()}>
                    {hub.name} ({hub.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cargo Priority Selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Cargo Priority (Risk Tolerance)
              </label>
              <span className="text-[10px] text-blue-600 font-medium">
                {priority === 'CRITICAL' && '5.0x Strongest Risk Avoidance'}
                {priority === 'HIGH' && '3.0x High Risk Penalty'}
                {priority === 'NORMAL' && '1.5x Balanced Penalty'}
                {priority === 'LOW' && '0.5x Fast Corridor Priority'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(['CRITICAL', 'HIGH', 'NORMAL', 'LOW'] as const).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition ${
                      isSelected
                        ? p === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                          : p === 'HIGH'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                          : 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blocked Roads / Dynamic Closures Badge */}
          {blockedRoadOsmIds.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-800">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    <strong>{blockedRoadOsmIds.length}</strong> Road Segments Marked Closed
                  </span>
                </div>
                {onClearBlockedRoads && (
                  <button
                    type="button"
                    onClick={onClearBlockedRoads}
                    className="text-[10px] text-rose-700 hover:text-rose-900 font-semibold underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                {blockedRoadOsmIds.map((id) => (
                  <span
                    key={`blocked-${id}`}
                    className="inline-flex items-center gap-1 bg-white border border-rose-200 text-rose-700 text-[10px] px-1.5 py-0.5 rounded shadow-2xs"
                  >
                    <span>OSM: {id}</span>
                    {onRemoveBlockedRoad && (
                      <button
                        type="button"
                        onClick={() => onRemoveBlockedRoad(id)}
                        className="hover:text-rose-950 font-bold"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePlanRoute}
              disabled={isCalculating || originCity === destCity}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating Safe Corridors...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>FIND SAFE ROUTE</span>
                </>
              )}
            </button>

            {activeRouteResponse && (
              <button
                onClick={handleClear}
                className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200 text-xs font-semibold"
                title="Clear active routes"
              >
                Clear
              </button>
            )}
          </div>

          {calcError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">Routing Calculation Failed</span>
                <span>{calcError}</span>
              </div>
            </div>
          )}

          {/* Route Results Display */}
          {activeRouteResponse && (
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              {/* No Safe Route State */}
              {activeRouteResponse.no_safe_route ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-rose-700 font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4" />
                    <span>NO SAFE ROUTE AVAILABLE</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    {activeRouteResponse.message ||
                      'All available corridors contain critical flood inundations, landslides, or confirmed road closures.'}
                  </p>
                  <div className="p-2 bg-white rounded-lg border border-rose-200 text-[10px] text-rose-900 font-semibold">
                    RECOMMENDED PROTOCOL:{' '}
                    <span className="text-rose-700 underline font-bold">
                      {activeRouteResponse.recommended_action ||
                        'HOLD VEHICLE AT SAFE LOCATION / RELIEF DEPOT'}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Generated Route Options</span>
                    <span>Click card to inspect</span>
                  </div>

                  {/* Recommended Safe Route Card */}
                  {activeRouteResponse.recommended && (
                    <div
                      onClick={() => onSelectRouteType('recommended')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedRouteType === 'recommended'
                          ? 'bg-blue-50/50 border-blue-400 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                            RECOMMENDED SAFE ROUTE
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            activeRouteResponse.recommended.risk_level === 'LOW'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : activeRouteResponse.recommended.risk_level === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {activeRouteResponse.recommended.risk_level} RISK
                        </span>
                      </div>

                      {/* Distance & ETA */}
                      <div className="grid grid-cols-2 gap-2 text-center my-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Distance</span>
                          <span className="text-xs font-bold text-slate-900">
                            {activeRouteResponse.recommended.distance_km} km
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Estimated Time</span>
                          <span className="text-xs font-bold text-blue-600">
                            {activeRouteResponse.recommended.eta_hours} hrs{' '}
                            <span className="text-[10px] text-slate-500">
                              ({Math.round(activeRouteResponse.recommended.eta_minutes)}m)
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Avoided Hazards Highlight */}
                      {activeRouteResponse.recommended.avoided_high_risk_roads &&
                      activeRouteResponse.recommended.avoided_high_risk_roads > 0 ? (
                        <div className="mb-2 p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-emerald-800 text-[10px]">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>
                            Avoids{' '}
                            <strong>
                              {activeRouteResponse.recommended.avoided_high_risk_roads}
                            </strong>{' '}
                            high-risk road segments
                          </span>
                        </div>
                      ) : null}

                      {/* Rationale explanation */}
                      {activeRouteResponse.recommended.explanation && (
                        <div className="text-[10px] text-slate-600 leading-snug bg-white p-2 rounded-lg border border-slate-200">
                          <span className="font-semibold text-blue-700">Routing Tradeoff: </span>
                          {activeRouteResponse.recommended.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Alternative / Fastest Route Card */}
                  {activeRouteResponse.alternatives &&
                    activeRouteResponse.alternatives.map((alt, idx) => (
                      <div
                        key={`alt-${idx}`}
                        onClick={() => onSelectRouteType('alternative')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedRouteType === 'alternative'
                            ? 'bg-purple-50/50 border-purple-400 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                              {alt.name}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              alt.risk_level === 'LOW'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : alt.risk_level === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {alt.risk_level} RISK
                          </span>
                        </div>

                        {/* Distance & ETA */}
                        <div className="grid grid-cols-2 gap-2 text-center my-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Distance</span>
                            <span className="text-xs font-bold text-slate-900">
                              {alt.distance_km} km
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Estimated Time</span>
                            <span className="text-xs font-bold text-purple-600">
                              {alt.eta_hours} hrs{' '}
                              <span className="text-[10px] text-slate-500">
                                ({Math.round(alt.eta_minutes)}m)
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Hazards Warning */}
                        {alt.high_risk_segments > 0 && (
                          <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 text-rose-800 text-[10px]">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span>
                              Traverses <strong>{alt.high_risk_segments}</strong> high-hazard segments
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

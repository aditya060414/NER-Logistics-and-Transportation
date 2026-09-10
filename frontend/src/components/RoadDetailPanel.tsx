import React, { useEffect, useState } from 'react';
import { X, CloudRain, ShieldCheck, History, Info, Compass, Ban } from 'lucide-react';
import type { RoadRiskDetail, RoadRiskProperties } from '../types/risk';
import { fetchRoadDetail } from '../services/api';

interface RoadDetailPanelProps {
  selectedRoad: RoadRiskProperties | null;
  onClose: () => void;
  onPlanRouteFromRoad?: (road: RoadRiskProperties) => void;
  onToggleClosure?: (osmId: string, currentStatus: string) => void;
}

export const RoadDetailPanel: React.FC<RoadDetailPanelProps> = ({
  selectedRoad,
  onClose,
  onPlanRouteFromRoad,
  onToggleClosure
}) => {
  const [detail, setDetail] = useState<RoadRiskDetail | null>(null);

  useEffect(() => {
    if (!selectedRoad) {
      setDetail(null);
      return;
    }

    let isMounted = true;

    fetchRoadDetail(selectedRoad.osm_id)
      .then((data) => {
        if (isMounted) setDetail(data);
      })
      .catch((err) => {
        console.error('Failed to load road details:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRoad]);

  if (!selectedRoad) return null;

  const currentRoad = detail || selectedRoad;
  const isHigh = currentRoad.risk_level === 'HIGH';
  const isMedium = currentRoad.risk_level === 'MEDIUM';
  const isClosed = currentRoad.road_status === 'CLOSED';

  const badgeColor = isClosed
    ? 'bg-slate-100 text-slate-700 border-slate-200'
    : isHigh
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isMedium
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const riskPct = Math.round(currentRoad.risk_score * 100);

  return (
    <div className="absolute top-4 right-4 z-[1000] w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 text-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
              {isClosed ? 'CLOSED' : `${currentRoad.risk_level} RISK`}
            </span>
            <span className="text-xs text-slate-500 capitalize font-medium">{currentRoad.fclass} Road</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-1 leading-tight line-clamp-1">
            {currentRoad.name || 'Unnamed Corridor Segment'}
          </h2>
          <p className="text-xs text-slate-500">
            District: <span className="text-slate-800 font-semibold">{currentRoad.district || 'Assam'}</span> • OSM: {currentRoad.osm_id}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 overflow-y-auto text-xs pb-20">
        {/* Risk Score Progress */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-slate-600 font-medium">Disruption Risk Score</span>
            <span className="text-sm font-bold text-slate-900">
              {currentRoad.risk_score.toFixed(3)}{' '}
              <span className="text-xs text-slate-500 font-normal">({riskPct}%)</span>
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isClosed
                  ? 'bg-slate-400'
                  : isHigh
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : isMedium
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(5, riskPct)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0.0 (Safe)</span>
            <span>0.33</span>
            <span>0.66</span>
            <span>1.0 (Critical)</span>
          </div>
        </div>

        {/* Precipitation Attributes */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-2">
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation Exposure (2022-06-18)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">24h Rainfall</span>
              <span className="text-xs font-bold text-blue-600">
                {currentRoad.rainfall_1d ? `${currentRoad.rainfall_1d.toFixed(1)} mm` : '0.0 mm'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">3-Day Sum</span>
              <span className="text-xs font-bold text-blue-600">
                {currentRoad.rainfall_3d ? `${currentRoad.rainfall_3d.toFixed(1)} mm` : '0.0 mm'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">7-Day Sum</span>
              <span className="text-xs font-bold text-blue-600">
                {currentRoad.rainfall_7d ? `${currentRoad.rainfall_7d.toFixed(1)} mm` : '0.0 mm'}
              </span>
            </div>
          </div>
        </div>

        {/* Structural & Historical Vulnerability */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-slate-500 mb-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Static Vulnerability</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {currentRoad.static_vulnerability ? currentRoad.static_vulnerability.toFixed(2) : '0.35'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Class: {currentRoad.fclass}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-slate-500 mb-1">
              <History className="w-3 h-3 text-amber-600" />
              <span>Historical Disruption</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {currentRoad.historical_risk === 1 ? 'MATCHED' : 'NONE'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {currentRoad.historical_risk === 1 ? 'ASDMA Corridor Evidence' : 'No recorded breach'}
            </span>
          </div>
        </div>

        {/* Explainability Attribution */}
        {detail?.explanation && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Why is this road classified {currentRoad.risk_level}?</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              {detail.explanation.primary_factor}
            </p>
            <div className="mt-2 text-[10px] text-slate-500">
              Confidence: {detail.explanation.confidence}
            </div>
          </div>
        )}

        {/* Operational Actions */}
        <div className="pt-2 flex flex-col gap-2">
          {onPlanRouteFromRoad && (
            <button
              onClick={() => onPlanRouteFromRoad(currentRoad)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Find Alternate Route Avoiding This Segment</span>
            </button>
          )}

          {onToggleClosure && (
            <button
              onClick={() => onToggleClosure(currentRoad.osm_id, currentRoad.road_status)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 border rounded-xl transition text-xs font-semibold shadow-xs ${
                isClosed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{isClosed ? 'Mark Road As OPEN (Remove Closure)' : 'Simulate Verified Field Closure'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

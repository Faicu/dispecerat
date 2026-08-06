import React from 'react';
import { GameState, Unit } from '../types';
import { UNIT_THEME } from '../constants';
import { calculateETA, formatReward } from '../utils';
import { X } from 'lucide-react';

const TYPE_SHORT: Record<string, string> = {
  police: 'POL', ambulance: 'AMB', fire: 'ISU',
  gendarmerie: 'JAN', swat: 'SAS', helicopter: 'AVI',
};

interface IncidentDetailsPanelProps {
  incidentId: string;
  gameState: GameState;
  availableUnits: Unit[];
  onDispatch: (unitId: string) => void;
  onSelectIncident?: (id: string | null) => void;
  onSelectUnit?: (id: string | null) => void;
  onResolveComplication?: (incidentId: string, optionId?: string) => void;
  hideInlineClose?: boolean;
}

export default function IncidentDetailsPanel({
  incidentId,
  gameState,
  availableUnits,
  onDispatch,
  onSelectIncident,
  onSelectUnit,
  onResolveComplication,
  hideInlineClose,
}: IncidentDetailsPanelProps) {
  const incident = gameState.incidents[incidentId];

  if (!incident) return null;

  return (
    <div className="h-full w-full md:border-l border-slate-800 bg-slate-950 p-4 flex flex-col gap-4 z-20 relative overflow-y-auto overflow-x-hidden">
      <div className="w-full flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                incident.severity === 5
                  ? 'bg-purple-500 animate-pulse'
                  : incident.severity === 4
                  ? 'bg-red-500 animate-pulse'
                  : incident.severity === 3
                  ? 'bg-orange-500'
                  : incident.severity === 2
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
            ></span>
            <span className="text-xs font-bold uppercase tracking-widest text-white truncate max-w-[180px] sm:max-w-none">
              Incident {incident.id}: {incident.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                incident.severity === 5
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : incident.severity === 4
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : incident.severity === 3
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  : incident.severity === 2
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              }`}
            >
              COD {incident.severity}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase px-2 py-0.5 rounded bg-emerald-900/20 border border-emerald-800/50 flex items-center">
              +€{formatReward(incident.reward)}
            </div>
            {!hideInlineClose && onSelectIncident && (
              <button
                onClick={() => {
                  onSelectIncident(null);
                  if (onSelectUnit) onSelectUnit(null);
                }}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs font-bold uppercase transition-colors ml-1"
                title="Deselectează"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row gap-3">
          {incident.imageUrl && (
            <img
              src={incident.imageUrl}
              alt={incident.name}
              className="w-full sm:w-24 h-24 object-cover rounded border border-slate-700 shadow-md opacity-90 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 flex flex-col">
            <div className="text-[10px] text-slate-400 font-mono mb-2 flex items-center justify-between flex-wrap gap-1">
              <span>📍 {incident.address || 'Se localizează...'}</span>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] uppercase font-bold text-slate-500 mr-1">Necesare:</span>
                {incident.requiredUnits.map((req, idx) => {
                  const typeReqIndex = incident.requiredUnits.slice(0, idx).filter(r => r === req).length;
                  const assignedIdsForType = incident.assignedUnits.filter(uid => gameState.units[uid]?.type === req);
                  const assignedUnitId = assignedIdsForType[typeReqIndex];
                  const assignedUnit = assignedUnitId ? gameState.units[assignedUnitId] : null;

                  let badgeStyle = 'bg-slate-950 border-slate-800 text-slate-500 font-semibold'; // Gri (netrimis)
                  let titleText = `${req.toUpperCase()} - Netrimis`;

                  if (assignedUnit) {
                    const isOnScene = assignedUnit.state === 'on_scene';
                    if (isOnScene || incident.resolved) {
                      badgeStyle = 'bg-emerald-500 border-emerald-300 text-slate-950 font-black shadow-sm shadow-emerald-500/40'; // Culoare aprinsă (la fața locului)
                      titleText = `${req.toUpperCase()} (${assignedUnit.name}) - La fața locului`;
                    } else {
                      badgeStyle = 'bg-sky-900/80 border-sky-400 text-sky-200 font-bold animate-pulse shadow-sm shadow-sky-400/30'; // Pulsat (pe drum)
                      titleText = `${req.toUpperCase()} (${assignedUnit.name}) - Pe drum`;
                    }
                  }

                  return (
                    <div
                      key={idx}
                      title={titleText}
                      className={`text-[9px] px-1.5 py-0.5 rounded border uppercase transition-all ${badgeStyle}`}
                    >
                      {TYPE_SHORT[req] ?? req.slice(0, 3).toUpperCase()}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{incident.description}</p>
            {incident.activities && incident.activities.length > 0 && (
              <div className="mb-2 space-y-1 bg-slate-950/80 p-2 rounded border border-slate-800">
                <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Activități la fața locului</div>
                {incident.activities.map((act, i) => (
                  <div key={i} className="text-[10px] text-emerald-400 font-mono flex gap-1">
                    <span className="opacity-50">&gt;</span> {act}
                  </div>
                ))}
              </div>
            )}

            {/* Complication — manual decision required */}
            {incident.complication && !incident.complication.resolved && onResolveComplication && (
              <div className="mt-2 p-3 bg-red-950/60 border border-red-700/60 rounded-lg flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-red-300">Decizie Manuală Necesară</span>
                </div>
                <div className="text-[11px] text-red-200 leading-snug">{incident.complication.message}</div>
                {incident.complication.options ? (
                  <div className="flex flex-col gap-1.5">
                    {incident.complication.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => onResolveComplication(incident.id, opt.id)}
                        className="bg-red-900/60 hover:bg-red-800 border border-red-700 text-white text-[10px] py-1.5 px-3 rounded text-left flex justify-between items-center gap-2 transition-colors font-medium"
                      >
                        <span>{opt.label}</span>
                        {opt.cost > 0 && <span className="text-red-300 font-bold shrink-0">-€{opt.cost.toLocaleString()}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => onResolveComplication(incident.id)}
                    className="bg-red-800/80 hover:bg-red-700 text-white text-[10px] py-1.5 px-3 rounded uppercase font-bold tracking-wider transition-colors"
                  >
                    {incident.complication.actionLabel}
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Unități Alocate</div>
              <div className="space-y-1">
                {incident.assignedUnits.length === 0 && (
                  <div className="text-[10px] text-slate-500 italic">Nicio unitate alocată.</div>
                )}
                {incident.assignedUnits.map((uid) => {
                  const unit = gameState.units[uid];
                  if (!unit) return null;
                  const isEnRoute = unit.state === 'moving' || unit.state === 'routing';
                  const isOnScene = unit.state === 'on_scene';
                  const eta = isEnRoute ? calculateETA(unit, incident.location, gameState) : 0;

                  return (
                    <div key={uid} className="flex justify-between items-center bg-slate-800/60 p-1.5 px-2 rounded text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${UNIT_THEME[unit.type].dot}`}></div>
                        <span className="font-mono text-slate-200 font-bold">{unit.name}</span>
                      </div>
                      <div className="font-mono">
                        {isOnScene ? (
                          <span className="text-emerald-400 font-bold">La fața locului</span>
                        ) : (
                          <span className="text-blue-400 font-bold">ETA: {eta}s</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          Unități Disponibile (Trimite pe teren)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
          {availableUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => onDispatch(unit.id)}
              className={`flex flex-col justify-start gap-1 ${
                unit.state === 'idle'
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                  : 'bg-orange-950/40 border-orange-800/80 hover:bg-orange-900/60'
              } border-2 rounded-lg text-xs text-white py-2.5 px-3 transition-colors shadow-sm text-left`}
              title={unit.name}
            >
              <div className="flex justify-between items-center w-full gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${UNIT_THEME[unit.type].dot}`}></div>
                  <span className="uppercase font-bold tracking-wide truncate">{unit.name}</span>
                </div>
                {incident && (
                  <span className="text-[10px] text-sky-400 font-mono font-bold whitespace-nowrap bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-800/40">
                    ETA: {calculateETA(unit, incident.location, gameState)}s
                  </span>
                )}
              </div>
              {unit.vehicleModel && (
                <span className="text-[9px] text-slate-500 italic truncate w-full pl-3">
                  {unit.vehicleModel}
                </span>
              )}
              {unit.state !== 'idle' && (
                <span className="text-[9px] text-orange-400 font-mono uppercase truncate w-full pl-3 font-bold">
                  - {unit.state}
                </span>
              )}
            </button>
          ))}
          {availableUnits.length === 0 && (
            <div className="col-span-full text-center text-xs text-slate-500 py-4 font-mono uppercase tracking-widest bg-slate-900/40 rounded border border-slate-800">
              No units available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

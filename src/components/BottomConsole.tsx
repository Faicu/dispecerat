import { GameState, OperatorRole } from '../types';
import { calculateETA, formatReward } from '../utils';
import { Command } from 'lucide-react';

const TYPE_SHORT: Record<string, string> = {
  police: 'POL', ambulance: 'AMB', fire: 'ISU',
  gendarmerie: 'JAN', swat: 'SAS', helicopter: 'AVI',
};
import UnitDetailsPanel from './UnitDetailsPanel';
import IncidentDetailsPanel from './IncidentDetailsPanel';

interface BottomConsoleProps {
  playerRoles: OperatorRole[];
  gameState: GameState;
  selectedIncidentId: string | null;
  selectedUnitId: string | null;
  onDispatch: (unitId: string) => void;
  onRefuel: (unitId: string) => void;
  onReturnToBase: (unitId: string) => void;
  onSelectIncident?: (id: string | null) => void;
  onSelectUnit?: (id: string | null) => void;
  onResolveComplication?: (incidentId: string, optionId?: string) => void;
  onBackToMap?: () => void;
  hideInlineClose?: boolean;
}

export default function BottomConsole({
  gameState,
  selectedIncidentId,
  selectedUnitId,
  onDispatch,
  onRefuel,
  onReturnToBase,
  playerRoles,
  onSelectIncident,
  onSelectUnit,
  onResolveComplication,
  onBackToMap,
  hideInlineClose,
}: BottomConsoleProps) {
  const incident = selectedIncidentId ? gameState.incidents[selectedIncidentId] : null;
  const selectedUnit = selectedUnitId ? gameState.units[selectedUnitId] : null;

  const getRoleForUnitType = (type: string) => {
    if (type === 'police' || type === 'swat' || type === 'helicopter') return 'police';
    if (type === 'fire') return 'fire';
    if (type === 'ambulance') return 'ambulance';
    if (type === 'gendarmerie') return 'gendarmerie';
    return null;
  };

  const hasRoleForUnit = (type: string) => {
    const role = getRoleForUnitType(type);
    return role ? playerRoles.includes(role as OperatorRole) : false;
  };

  const availableUnits = Object.values(gameState.units)
    .filter(
      (u) =>
        (u.state === 'idle' ||
          u.state === 'patrolling' ||
          u.state === 'moving' ||
          u.state === 'routing' ||
          u.state === 'transporting') &&
        hasRoleForUnit(u.type)
    )
    .sort((a, b) => {
      const aAvail = a.state === 'idle' || a.state === 'patrolling' ? 1 : 0;
      const bAvail = b.state === 'idle' || b.state === 'patrolling' ? 1 : 0;
      if (aAvail !== bAvail) return bAvail - aAvail;

      if (incident) {
        const etaA = calculateETA(a, incident.location, gameState);
        const etaB = calculateETA(b, incident.location, gameState);
        return etaA - etaB;
      }
      return 0;
    });

  // 1. Overview when nothing selected
  if ((!incident || incident.resolved) && !selectedUnit) {
    const activeIncidents = Object.values(gameState.incidents || {})
      .filter((i) => !i.resolved && !(i.isPhoneCall && i.callStatus !== 'completed'))
      .sort((a, b) => b.severity - a.severity);

    return (
      <div className="h-full w-full md:border-l border-slate-800 bg-slate-950 p-4 flex flex-col items-center z-20 relative overflow-y-auto overflow-x-hidden">
        {onBackToMap && (
          <button
            onClick={onBackToMap}
            className="md:hidden self-start flex items-center gap-1.5 px-3 py-1.5 mb-2 rounded-lg bg-sky-950/80 border border-sky-700/80 text-sky-300 hover:text-white hover:bg-sky-900 transition-colors text-xs font-bold uppercase shadow cursor-pointer"
          >
            ← Înapoi la Hartă
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center my-2 text-sky-400 border border-slate-700 shrink-0 shadow">
          <Command size={20} />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">Consolă Dispecerat</h3>
        <p className="text-[11px] text-slate-400 max-w-xs text-center leading-relaxed mb-4">
          Selectează un incident sau o unitate pe hartă ori alege un incident din lista de mai jos:
        </p>

        {activeIncidents.length > 0 ? (
          <div className="w-full flex-1 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Incidente Active ({activeIncidents.length})
            </span>
            <div className="space-y-2">
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident && onSelectIncident(inc.id)}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg cursor-pointer flex flex-col gap-2 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            inc.severity >= 4 ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-white truncate">{inc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono truncate">📍 {inc.address || 'București'}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className="text-[9px] font-bold text-red-400 uppercase bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/50">
                        COD {inc.severity}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold mt-1">+€{formatReward(inc.reward)}</span>
                    </div>
                  </div>

                  {/* Required units status chips */}
                  <div className="flex gap-1 flex-wrap pt-1 border-t border-slate-800">
                    {inc.requiredUnits.map((req, idx) => {
                      const typeReqIndex = inc.requiredUnits.slice(0, idx).filter(r => r === req).length;
                      const assignedIdsForType = inc.assignedUnits.filter(uid => gameState.units[uid]?.type === req);
                      const assignedUnitId = assignedIdsForType[typeReqIndex];
                      const assignedUnit = assignedUnitId ? gameState.units[assignedUnitId] : null;

                      let badgeStyle = 'bg-slate-950 border-slate-800 text-slate-500 font-semibold'; // Gri (netrimis)
                      let titleText = `${req.toUpperCase()} - Netrimis`;

                      if (assignedUnit) {
                        const isOnScene = assignedUnit.state === 'on_scene';
                        if (isOnScene || inc.resolved) {
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
                          className={`text-[8px] px-1.5 py-0.5 rounded border uppercase transition-all ${badgeStyle}`}
                        >
                          {TYPE_SHORT[req] ?? req.slice(0, 3).toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-6">Niciun incident activ momentan.</div>
        )}
      </div>
    );
  }

  // 2. Unit Details Panel file
  if (selectedUnitId && (!incident || incident.resolved)) {
    return (
      <UnitDetailsPanel
        unitId={selectedUnitId}
        gameState={gameState}
        onRefuel={onRefuel}
        onReturnToBase={onReturnToBase}
        onSelectUnit={onSelectUnit}
        onSelectIncident={onSelectIncident}
        hideInlineClose={hideInlineClose}
      />
    );
  }

  // 3. Incident Details Panel file
  if (selectedIncidentId) {
    return (
      <IncidentDetailsPanel
        incidentId={selectedIncidentId}
        gameState={gameState}
        availableUnits={availableUnits}
        onDispatch={onDispatch}
        onSelectIncident={onSelectIncident}
        onSelectUnit={onSelectUnit}
        onResolveComplication={onResolveComplication}
        hideInlineClose={hideInlineClose}
      />
    );
  }

  return null;
}

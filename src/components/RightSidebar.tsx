import { useState } from 'react';
import { GameState, OperatorRole } from '../types';
import { INCIDENT_THEME } from '../constants';
import { formatReward, calculateETA } from '../utils';
import { Filter, Navigation } from 'lucide-react';

interface RightSidebarProps {
  playerRoles: OperatorRole[];
  gameState: GameState;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  onResolveComplication: (incidentId: string, optionId?: string) => void;
}

const ROLE_FOR_TYPE: Record<string, string> = {
  police: 'police', swat: 'police', helicopter: 'police',
  fire: 'fire', ambulance: 'ambulance', gendarmerie: 'gendarmerie',
};

export default function RightSidebar({ gameState, selectedIncidentId, onSelectIncident, onResolveComplication, playerRoles }: RightSidebarProps) {
  const [myIncidentsOnly, setMyIncidentsOnly] = useState(false);
  const now = gameState.gameTime || Date.now();

  const isMyIncident = (incident: GameState['incidents'][string]) =>
    incident.requiredUnits.some(u => playerRoles.includes(ROLE_FOR_TYPE[u] as OperatorRole));

  const isCallInProgress = (i: any) => i.isPhoneCall && i.callStatus !== 'completed';
  const incidentsList = Object.values(gameState.incidents)
    .filter(i => !isCallInProgress(i))
    .filter(i => myIncidentsOnly ? isMyIncident(i) : true)
    .sort((a, b) => b.severity !== a.severity ? b.severity - a.severity : b.createdAt - a.createdAt);

  const myCount = Object.values(gameState.incidents).filter(i => !isCallInProgress(i) && isMyIncident(i)).length;

  return (
    <div className="w-full flex flex-col z-10 relative h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-2.5 py-2 bg-slate-800/80 flex items-center justify-between shrink-0 gap-1 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">Incidente Active</span>
            <span className="text-[10px] font-mono text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded-full shrink-0">
              {incidentsList.length}
            </span>
          </div>
          <button
            onClick={() => setMyIncidentsOnly(v => !v)}
            title={myIncidentsOnly ? 'Arată toate incidentele' : 'Arată doar incidentele mele'}
            className={`flex items-center gap-1 px-1.5 py-1 rounded border text-[8.5px] font-bold uppercase tracking-wider shrink-0 transition-colors ${myIncidentsOnly ? 'bg-sky-900/50 border-sky-600 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
          >
            <Filter size={10} />
            {myIncidentsOnly ? `Ale mele (${myCount})` : 'Toate'}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {incidentsList.map(incident => {
            const isSelected = selectedIncidentId === incident.id;
            const incidentTheme = INCIDENT_THEME[incident.type] ?? INCIDENT_THEME.crime;
            const theme = {
              border: isSelected ? incidentTheme.selectedBorder : incidentTheme.border,
              bg: isSelected ? incidentTheme.selectedBg : 'bg-slate-800/50',
              text: isSelected ? incidentTheme.selectedText : incidentTheme.text,
            };

            const timeElapsed = now - incident.createdAt;
            const countdownMs = incident.assignedUnits.length > 0 ? 300000 : 60000;
            const timeRemaining = Math.max(0, countdownMs - timeElapsed);
            const mins = Math.floor(timeRemaining / 60000);
            const secs = Math.floor((timeRemaining % 60000) / 1000);
            const timeStr = incident.isResolving
              ? 'Soluționare...'
              : incident.resolved
              ? 'Rezolvat'
              : `${mins}:${secs.toString().padStart(2, '0')}`;

            const isMine = isMyIncident(incident);
            const urgentTimer = timeRemaining < 30000 && !incident.isResolving && !incident.resolved;

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident.id === selectedIncidentId ? null : incident.id)}
                className={`p-3 ${theme.bg} border-l-4 ${theme.border} border-y border-r border-y-transparent border-r-transparent rounded-r cursor-pointer flex flex-col gap-1 transition-all ${isSelected ? 'border-y-slate-700 border-r-slate-700 shadow-lg' : 'hover:bg-slate-800'}`}
              >
                {/* Title row */}
                <div className="flex justify-between items-start gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isMine && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400" title="Incident relevant pentru rolul tău" />}
                    <span className={`text-[10px] font-bold uppercase truncate ${incident.resolved ? 'text-emerald-500' : theme.text}`}>
                      {incident.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[9px] font-mono ${urgentTimer ? 'text-red-500 animate-pulse font-bold' : 'text-slate-500'}`}>
                      {timeStr}
                    </span>
                    <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${incident.severity === 5 ? 'bg-purple-900/50 text-purple-400' : incident.severity === 4 ? 'bg-red-900/50 text-red-400' : incident.severity === 3 ? 'bg-orange-900/50 text-orange-400' : incident.severity === 2 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-blue-900/50 text-blue-400'}`}>
                      C{incident.severity}
                    </span>
                  </div>
                </div>

                {/* Response time */}
                {incident.firstResponseAt && (
                  <span className="text-[9px] text-slate-500 font-mono">
                    ⏱ Răspuns în {Math.floor((incident.firstResponseAt - incident.createdAt) / 1000)}s
                  </span>
                )}

                {/* Address */}
                <div className="text-[9px] text-slate-400 font-mono truncate" title={incident.address}>
                  📍 {incident.address || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}
                </div>

                {/* Progress bar */}
                {incident.isResolving && !incident.resolved && (
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden relative mt-0.5">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${Math.min(incident.resolutionProgress || 0, 100)}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white/60">
                      {Math.floor(incident.resolutionProgress || 0)}%
                    </span>
                  </div>
                )}

                {/* Complication indicator */}
                {incident.complication && !incident.complication.resolved && (
                  <div className="w-full bg-red-950/60 h-1 rounded-full overflow-hidden mt-0.5">
                    <div className="bg-red-500 h-full w-full animate-pulse" />
                  </div>
                )}

                {/* Description (only when selected) */}
                {isSelected && (
                  <div className="text-[10px] text-slate-300 leading-tight mt-1">{incident.description}</div>
                )}

                {/* Complication panel */}
                {incident.complication && !incident.complication.resolved && isSelected && (
                  <div className="mt-2 p-2 bg-red-950/40 border border-red-900/50 rounded flex flex-col gap-2">
                    <div className="text-[10px] text-red-300">{incident.complication.message}</div>
                    {incident.complication.options ? (
                      <div className="flex flex-col gap-1">
                        {incident.complication.options.map(opt => (
                          <button
                            key={opt.id}
                            onClick={e => { e.stopPropagation(); onResolveComplication(incident.id, opt.id); }}
                            className="bg-red-800/60 hover:bg-red-700 border border-red-700 text-white text-[10px] py-1 px-2 rounded text-left flex justify-between transition-colors"
                          >
                            <span>{opt.label}</span>
                            {opt.cost > 0 && <span className="text-red-300">-€{opt.cost.toLocaleString()}</span>}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); onResolveComplication(incident.id); }}
                        className="bg-red-800/80 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded uppercase font-bold tracking-wider transition-colors"
                      >
                        {incident.complication.actionLabel}
                      </button>
                    )}
                  </div>
                )}

                {/* Units en-route ETA */}
                {isSelected && incident.assignedUnits.length > 0 && (
                  <div className="flex flex-col gap-0.5 mb-1">
                    {incident.assignedUnits.map(uid => {
                      const u = gameState.units[uid];
                      if (!u || u.state === 'on_scene') return null;
                      const eta = calculateETA(u, incident.location, gameState);
                      return (
                        <div key={uid} className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                          <Navigation size={8} className="text-sky-500" />
                          <span className="text-slate-300">{u.name}</span>
                          <span className="text-sky-400">~{eta}s</span>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                )}

                {/* Nearest available unit suggestion (when selected & unassigned slots exist) */}
                {isSelected && !incident.isResolving && !incident.resolved && (() => {
                  const neededTypes = [...incident.requiredUnits];
                  incident.assignedUnits.forEach(uid => {
                    const u = gameState.units[uid];
                    if (u) { const i = neededTypes.indexOf(u.type); if (i !== -1) neededTypes.splice(i, 1); }
                  });
                  if (neededTypes.length === 0) return null;

                  const suggestions = neededTypes.map(type => {
                    const role = ROLE_FOR_TYPE[type] as OperatorRole;
                    if (!playerRoles.includes(role)) return null;
                    const best = Object.values(gameState.units)
                      .filter(u => u.type === type && (u.state === 'idle' || u.state === 'patrolling'))
                      .sort((a, b) => {
                        const dA = Math.pow(a.location.lat - incident.location.lat, 2) + Math.pow(a.location.lng - incident.location.lng, 2);
                        const dB = Math.pow(b.location.lat - incident.location.lat, 2) + Math.pow(b.location.lng - incident.location.lng, 2);
                        return dA - dB;
                      })[0];
                    if (!best) return null;
                    const eta = calculateETA(best, incident.location, gameState);
                    return { unit: best, type, eta };
                  }).filter(Boolean);

                  if (suggestions.length === 0) return null;
                  return (
                    <div className="mt-1 p-2 bg-sky-950/30 border border-sky-900/50 rounded">
                      <div className="text-[8px] uppercase tracking-widest text-sky-600 mb-1 flex items-center gap-1">
                        <Navigation size={8} /> Cel mai apropiat disponibil
                      </div>
                      {suggestions.map((s, i) => s && (
                        <div key={i} className="text-[9px] text-sky-300 font-mono flex justify-between">
                          <span>{s.unit.name} ({s.type})</span>
                          <span className="text-sky-500">~{s.eta}s</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Required units */}
                <div className="mt-1.5 pt-1.5 border-t border-slate-700/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] uppercase tracking-widest text-slate-600">Echipaje necesare</span>
                    <span className="text-[9px] font-bold text-emerald-400">+€{formatReward(incident.reward)}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {incident.requiredUnits.map((req, idx) => {
                      const assigned = incident.assignedUnits.filter(uid => gameState.units[uid]?.type === req);
                      const isAssigned = assigned.length > idx;
                      const reqRole = ROLE_FOR_TYPE[req] as OperatorRole;
                      const isRelevant = playerRoles.includes(reqRole);

                      return (
                        <div
                          key={idx}
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase transition-colors ${
                            isAssigned
                              ? 'bg-emerald-900/40 border-emerald-700 text-emerald-400'
                              : isRelevant
                              ? 'bg-sky-900/40 border-sky-600 text-sky-400 animate-pulse'
                              : 'bg-slate-900 border-slate-700 text-slate-600'
                          }`}
                        >
                          {req.slice(0, 3)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {incidentsList.length === 0 && (
            <div className="text-center py-10 text-slate-600 text-xs italic">
              {myIncidentsOnly ? 'Niciun incident pentru rolul tău.' : 'Niciun incident activ.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

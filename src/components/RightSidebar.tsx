import { GameState, OperatorRole } from '../types';
import { INCIDENT_THEME, INCIDENT_COUNTDOWN_MS } from '../constants';
import { formatReward } from '../utils';

interface RightSidebarProps {
  playerRoles: OperatorRole[];
  gameState: GameState;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  onResolveComplication: (incidentId: string, optionId?: string) => void;
}

export default function RightSidebar({ gameState, selectedIncidentId, onSelectIncident, onResolveComplication, playerRoles }: RightSidebarProps) {
  const incidentsList = Object.values(gameState.incidents).sort((a, b) => {
    if (b.severity !== a.severity) {
      return b.severity - a.severity;
    }
    return b.createdAt - a.createdAt;
  });
  const now = gameState.gameTime || Date.now();
  const getRoleForUnit = (type: string) => {
    if (type === 'police' || type === 'swat' || type === 'helicopter') return 'police';
    if (type === 'fire') return 'fire';
    if (type === 'ambulance') return 'ambulance';
    if (type === 'gendarmerie') return 'gendarmerie';
    return null;
  };

  return (
    <div className="w-full md:w-72 border-l border-slate-800 bg-slate-900/50 flex flex-col z-10 relative h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 bg-slate-800/80 text-[10px] font-bold uppercase tracking-widest flex justify-between">
          <span>Active Incidents</span>
          <span className="text-red-400">{incidentsList.length}</span>
        </div>
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {incidentsList.map(incident => {
            const isSelected = selectedIncidentId === incident.id;
            const incidentTheme = INCIDENT_THEME[incident.type];
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
            const timeStr = incident.isResolving ? 'Soluționare...' : (incident.resolved ? 'Rezolvat' : `${mins}:${secs.toString().padStart(2, '0')} rămas`);

            return (
              <div 
                key={incident.id} 
                onClick={() => onSelectIncident(incident.id === selectedIncidentId ? null : incident.id)}
                className={`p-3 ${theme.bg} border-l-4 ${theme.border} border-y border-r border-y-transparent border-r-transparent rounded-r cursor-pointer flex flex-col gap-1 transition-all ${isSelected ? 'border-y-slate-700 border-r-slate-700 shadow-lg' : 'hover:bg-slate-800'}`}
              >
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                  <span className={incident.resolved ? 'text-green-500' : theme.text}>{incident.name}</span>
                  <span className={timeRemaining < 30000 && !incident.isResolving && !incident.resolved ? 'text-red-500 animate-pulse' : 'text-slate-400'}>{timeStr}</span>
                </div>
                {incident.firstResponseAt && (
                  <div className="text-[9px] text-slate-500 font-mono">
                    ⏱ Răspuns: {Math.floor((incident.firstResponseAt - incident.createdAt) / 1000)}s
                  </div>
                )}
                <div className="text-[10px] text-slate-400 font-mono mb-1 truncate" title={incident.address || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}>
                  <span aria-hidden="true">📍</span> {incident.address || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}
                </div>
                {incident.isResolving && !incident.resolved && (
                  <div className="w-full bg-slate-950 h-1.5 mt-1 rounded-full overflow-hidden flex relative">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${Math.min(incident.resolutionProgress || 0, 100)}%` }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white/50">{Math.floor(incident.resolutionProgress || 0)}%</span>
                  </div>
                )}
                {incident.complication && !incident.complication.resolved && (
                  <div className="w-full bg-slate-950 h-1.5 mt-1 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-full animate-pulse"></div>
                  </div>
                )}
                <div className="text-xs text-white leading-tight">{incident.description}</div>
                
                {incident.complication && !incident.complication.resolved && isSelected && (
                  <div className="mt-2 p-2 bg-red-950/40 border border-red-900/50 rounded flex flex-col gap-2">
                    <div className="text-[10px] text-red-300">{incident.complication.message}</div>
                    {incident.complication.options ? (
                      <div className="flex flex-col gap-1 mt-1">
                        {incident.complication.options.map(opt => (
                          <button 
                            key={opt.id}
                            onClick={(e) => { e.stopPropagation(); onResolveComplication(incident.id, opt.id); }}
                            className="bg-red-800/60 hover:bg-red-700 border border-red-700 text-white text-[10px] py-1 px-2 rounded tracking-wide text-left flex justify-between"
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onResolveComplication(incident.id); }}
                        className="bg-red-800/80 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded uppercase font-bold tracking-wider mt-1"
                      >
                        {incident.complication.actionLabel}
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-2 flex justify-between items-center">
                  <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest border-t border-slate-700/50 pt-2 mb-1">
                    Echipaje Necesare:
                  </div>
                  <div className="flex gap-1.5 flex-wrap w-full mb-2">
                    {incident.requiredUnits.map((req, idx) => {
                      const assigned = incident.assignedUnits.filter(uid => gameState.units[uid]?.type === req);
                      const isAssigned = assigned.length > idx;
                      const reqRole = getRoleForUnit(req);
                      const isRelevantToPlayer = reqRole && playerRoles.includes(reqRole as OperatorRole);
                      
                      let displayClasses = '';
                      if (isAssigned) {
                        displayClasses = 'bg-green-900/40 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)] text-[10px] font-bold';
                      } else if (isRelevantToPlayer) {
                        displayClasses = 'bg-sky-900/40 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.2)] text-[11px] font-black animate-pulse';
                      } else {
                        displayClasses = 'bg-slate-900 border-slate-700 text-slate-500 text-[9px] opacity-70';
                      }

                      return (
                        <div key={idx} className={`flex items-center gap-1.5 uppercase px-2 py-1 rounded-sm border-2 ${displayClasses}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isAssigned ? 'bg-green-500' : (isRelevantToPlayer ? 'bg-sky-400' : 'bg-slate-700')}`}></div>
                          {req}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold tracking-widest bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    +€{formatReward(incident.reward)}
                  </div>
                </div>
              </div>
            );
          })}
          {incidentsList.length === 0 && (
            <div className="text-center py-8 text-slate-500 italic text-xs">No active calls</div>
          )}
        </div>
      </div>
    </div>
  );
}

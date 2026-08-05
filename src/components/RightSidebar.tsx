import { GameState } from '../types';

interface RightSidebarProps {
  gameState: GameState;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  onResolveComplication: (incidentId: string, optionId?: string) => void;
}

export default function RightSidebar({ gameState, selectedIncidentId, onSelectIncident, onResolveComplication }: RightSidebarProps) {
  const incidentsList = Object.values(gameState.incidents).sort((a, b) => b.createdAt - a.createdAt);
  const now = gameState.gameTime || Date.now();

  return (
    <div className="w-72 border-l border-slate-800 bg-slate-900/50 flex flex-col z-10 relative">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 bg-slate-800/80 text-[10px] font-bold uppercase tracking-widest flex justify-between">
          <span>Active Incidents</span>
          <span className="text-red-400">{incidentsList.length}</span>
        </div>
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {incidentsList.map(incident => {
            const isSelected = selectedIncidentId === incident.id;
            let theme = { border: 'border-slate-600', bg: 'bg-slate-800/50', text: 'text-white' };
            
            if (incident.type === 'fire') {
              theme.border = isSelected ? 'border-red-500' : 'border-red-800/50';
              theme.bg = isSelected ? 'bg-red-900/20' : 'bg-slate-800/50';
              theme.text = isSelected ? 'text-red-300' : 'text-red-400';
            } else if (incident.type === 'crime') {
              theme.border = isSelected ? 'border-blue-500' : 'border-blue-800/50';
              theme.bg = isSelected ? 'bg-blue-900/20' : 'bg-slate-800/50';
              theme.text = isSelected ? 'text-blue-300' : 'text-blue-400';
            } else {
              theme.border = isSelected ? 'border-orange-500' : 'border-orange-800/50';
              theme.bg = isSelected ? 'bg-orange-900/20' : 'bg-slate-800/50';
              theme.text = isSelected ? 'text-orange-300' : 'text-orange-400';
            }
            
            const timeElapsed = now - incident.createdAt;
            const timeRemaining = Math.max(0, 180000 - timeElapsed);
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
                  <span className={incident.resolved ? 'text-green-500' : theme.text}>{incident.id} - {incident.name}</span>
                  <span className={timeRemaining < 30000 && !incident.isResolving && !incident.resolved ? 'text-red-500 animate-pulse' : 'text-slate-400'}>{timeStr}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mb-1 truncate" title={incident.address || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}>
                  📍 {incident.address || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}
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
                  <div className="flex gap-1">
                    {incident.requiredUnits.map((req, idx) => {
                      const assigned = incident.assignedUnits.filter(uid => gameState.units[uid]?.type === req);
                      const isAssigned = assigned.length > idx;
                      return (
                        <div key={idx} className={`w-3 h-3 rounded-sm border ${isAssigned ? 'bg-green-500 border-green-400' : 'bg-slate-800 border-slate-600'}`}></div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold tracking-widest bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    +€{(incident.reward / 1000).toFixed(1).replace('.0', '')}k
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

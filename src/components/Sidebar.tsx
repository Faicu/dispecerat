import { GameState, IncidentType, UnitType } from '../types';
import { AlertCircle, Flame, ShieldAlert, Cross, Activity, Send, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  gameState: GameState;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  onDispatch: (unitId: string, incidentId: string) => void;
}

const getIncidentIcon = (type: IncidentType) => {
  switch (type) {
    case 'crime': return <ShieldAlert className="text-blue-400" />;
    case 'fire': return <Flame className="text-red-400" />;
    case 'medical': return <Activity className="text-orange-400" />;
  }
};

const getUnitColor = (type: UnitType) => {
  switch (type) {
    case 'police': return 'bg-blue-500';
    case 'fire': return 'bg-red-500';
    case 'ambulance': return 'bg-green-500';
  }
};

export default function Sidebar({ gameState, selectedIncidentId, onSelectIncident, onDispatch }: SidebarProps) {
  const incidentsList = Object.values(gameState.incidents).sort((a, b) => b.createdAt - a.createdAt);
  
  const selectedIncident = selectedIncidentId ? gameState.incidents[selectedIncidentId] : null;

  const availableUnits = Object.values(gameState.units).filter(u => u.state === 'idle');

  return (
    <div className="w-96 bg-slate-900 border-r border-slate-700 flex flex-col shadow-2xl z-10 relative">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <AlertCircle className="text-red-500" />
          112 Dispatch
        </h1>
        <div className="text-sm text-slate-400 mt-1">Multiplayer Operator Terminal</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Active Incidents ({incidentsList.length})
        </div>

        {incidentsList.map(incident => (
          <div
            key={incident.id}
            onClick={() => onSelectIncident(incident.id === selectedIncidentId ? null : incident.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedIncidentId === incident.id 
                ? 'bg-slate-800 border-slate-500 shadow-lg' 
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg">
                  {getIncidentIcon(incident.type)}
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{incident.description}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">
                    {incident.type}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              {incident.requiredUnits.map((req, idx) => {
                const assignedOfType = incident.assignedUnits.filter(uid => gameState.units[uid]?.type === req);
                // We just match visually how many are required vs assigned
                // This is a bit simplified
                const isAssigned = assignedOfType.length > idx;
                return (
                  <div key={idx} className={`text-xs px-2 py-1 rounded-md border ${isAssigned ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-slate-600 bg-slate-700 text-slate-300'}`}>
                    {req}
                  </div>
                );
              })}
            </div>
            {incident.resolved && (
              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircle2 size={16} /> Resolved
              </div>
            )}
          </div>
        ))}
        {incidentsList.length === 0 && (
          <div className="text-center py-8 text-slate-500 italic">No active incidents</div>
        )}
      </div>

      {selectedIncident && !selectedIncident.resolved && (
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="text-sm font-semibold text-slate-300 mb-3">Dispatch Units to {selectedIncident.id}</div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {availableUnits.map(unit => (
              <div key={unit.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className={`w-3 h-3 rounded-full ${getUnitColor(unit.type)}`} />
                  <span className="uppercase text-slate-300">{unit.type}</span> 
                  <span className="text-slate-500 text-xs">({unit.id})</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDispatch(unit.id, selectedIncident.id);
                  }}
                  className="p-1.5 hover:bg-slate-600 rounded-md transition-colors text-slate-300 hover:text-white"
                >
                  <Send size={16} />
                </button>
              </div>
            ))}
            {availableUnits.length === 0 && (
              <div className="text-center text-sm text-slate-500 py-2">No units available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

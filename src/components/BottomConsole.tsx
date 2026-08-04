import { GameState, UnitType, Unit, Location } from '../types';

interface BottomConsoleProps {
  gameState: GameState;
  selectedIncidentId: string | null;
  selectedUnitId: string | null;
  onDispatch: (unitId: string) => void;
  onRefuel: (unitId: string) => void;
  onReturnToBase: (unitId: string) => void;
}

const getUnitColor = (type: UnitType) => {
  switch (type) {
    case 'police': return 'bg-blue-500';
    case 'fire': return 'bg-red-500';
    case 'ambulance': return 'bg-emerald-500';
    case 'gendarmerie': return 'bg-indigo-500';
    case 'swat': return 'bg-slate-500';
    case 'helicopter': return 'bg-sky-500';
  }
};

const calculateETA = (unit: Unit, incidentLoc: Location, gameState: GameState) => {
  let dist = 0;
  let prev = unit.location;
  if (unit.route && unit.route.length > 0) {
    for (const pt of unit.route) {
       dist += Math.sqrt(Math.pow(pt.lng - prev.lng, 2) + Math.pow(pt.lat - prev.lat, 2));
       prev = pt;
    }
  }
  // Add distance from the last route point (or current location) to the exact incident location
  dist += Math.sqrt(Math.pow(incidentLoc.lng - prev.lng, 2) + Math.pow(incidentLoc.lat - prev.lat, 2));
  
  let speedMult = 1;
  if (gameState.weather === 'rain') speedMult = 0.8;
  if (gameState.weather === 'snow') speedMult = 0.6;
  if (gameState.weather === 'storm') speedMult = 0.5;
  if (unit.fuel <= 0) speedMult *= 0.2;
  
  const speedPerSec = (unit.type === 'helicopter' ? 0.0002 * 3 * 10 : 0.0002 * 10) * speedMult;
  return Math.ceil(dist / speedPerSec);
};

export default function BottomConsole({ gameState, selectedIncidentId, selectedUnitId, onDispatch, onRefuel, onReturnToBase }: BottomConsoleProps) {
  const incident = selectedIncidentId ? gameState.incidents[selectedIncidentId] : null;
  const selectedUnit = selectedUnitId ? gameState.units[selectedUnitId] : null;
  const availableUnits = Object.values(gameState.units).filter(u => u.state === 'idle');

  if ((!incident || incident.resolved) && !selectedUnit) {
    return (
      <div className="h-40 border-t border-slate-800 bg-slate-900/90 p-4 flex items-center justify-center z-20 relative">
        <span className="text-slate-500 font-mono tracking-widest uppercase text-sm">Select an incident or unit to view details</span>
      </div>
    );
  }

  if (selectedUnit && (!incident || incident.resolved)) {
    return (
      <div className="h-40 border-t border-slate-800 bg-slate-900/90 p-4 flex gap-6 z-20 relative">
        <div className="w-1/3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 ${getUnitColor(selectedUnit.type)}`}></span>
            <span className="text-xs font-bold uppercase tracking-widest text-white">Unit {selectedUnit.name}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-slate-800 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[11px] text-slate-300 font-mono">
                Status: <span className="text-emerald-400">{selectedUnit.state.toUpperCase()}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                COMBUSTIBIL: <span className={selectedUnit.fuel > 50 ? 'text-emerald-400' : selectedUnit.fuel > 20 ? 'text-yellow-400' : 'text-red-400'}>{Math.floor(selectedUnit.fuel)}%</span>
              </div>
            </div>
            {selectedUnit.activity && (
              <div className="text-[10px] text-sky-400 italic">
                "{selectedUnit.activity}"
              </div>
            )}
            <div className="mt-auto text-[9px] text-slate-500 uppercase flex justify-between">
              <span>Type: {selectedUnit.type}</span>
              <span>ID: {selectedUnit.id}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center border-l border-slate-800 pl-6 gap-4">
           <div className="text-slate-400 text-xs font-mono">
             Pentru a deplasa manual unitatea, dă click pe hartă unde vrei să o trimiți.
           </div>
           <div className="flex gap-2">
             {selectedUnit.fuel < 100 && (
               <button 
                 onClick={() => onRefuel(selectedUnit.id)}
                 className="bg-emerald-900/40 border border-emerald-700/50 hover:bg-emerald-800/60 hover:border-emerald-500 text-emerald-400 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded transition-colors"
               >
                 Realimentare (1000 RON)
               </button>
             )}
             <button 
               onClick={() => onReturnToBase(selectedUnit.id)}
               className="bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 text-slate-300 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded transition-colors"
             >
               Retrage la Bază
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 border-t border-slate-800 bg-slate-900/90 p-4 flex gap-6 z-20 relative">
      <div className="w-1/2 flex flex-col gap-2">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 ${incident.severity === 3 ? 'bg-red-500 animate-pulse' : incident.severity === 2 ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
            <span className="text-xs font-bold uppercase tracking-widest text-white">Incident {incident.id}: {incident.name}</span>
          </div>
          <div className="flex gap-2">
            <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${incident.severity === 3 ? 'bg-red-500/20 text-red-400 border border-red-500/50' : incident.severity === 2 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'}`}>
              Prioritate: COD {incident.severity}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase px-2 py-0.5 rounded bg-emerald-900/20 border border-emerald-800/50 flex items-center">
              Recompensă: +€{(incident.reward / 1000).toFixed(1).replace('.0', '')}k
            </div>
          </div>
        </div>
        <div className="bg-black/40 p-3 rounded border border-slate-800 flex-1 overflow-y-auto flex gap-3">
          {incident.imageUrl && (
            <img 
              src={incident.imageUrl} 
              alt={incident.name} 
              className="w-24 h-24 object-cover rounded border border-slate-700 shadow-md opacity-80" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="flex-1 flex flex-col">
            <div className="text-[10px] text-slate-400 font-mono mb-1 flex justify-between">
              <span>📍 {incident.address || 'Se localizează...'}</span>
              <span>Req: <span className="text-slate-300">{incident.requiredUnits.join(', ')}</span></span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
              {incident.description}
            </p>
            {incident.activities && incident.activities.length > 0 && (
              <div className="mt-auto mb-2 space-y-1 bg-slate-900/50 p-2 rounded border border-slate-800">
                <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Activități la fața locului</div>
                {incident.activities.map((act, i) => (
                  <div key={i} className="text-[10px] text-emerald-400 font-mono flex gap-1">
                    <span className="opacity-50">&gt;</span> {act}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-auto pt-2 border-t border-slate-800">
              <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Unități Alocate</div>
              <div className="space-y-1">
                {incident.assignedUnits.length === 0 && <div className="text-[10px] text-slate-500 italic">Nicio unitate alocată.</div>}
                {incident.assignedUnits.map(uid => {
                  const unit = gameState.units[uid];
                  if (!unit) return null;
                  const isEnRoute = unit.state === 'moving' || unit.state === 'routing';
                  const isOnScene = unit.state === 'on_scene';
                  const eta = isEnRoute ? calculateETA(unit, incident.location, gameState) : 0;
                  
                  return (
                    <div key={uid} className="flex justify-between items-center bg-slate-800/40 p-1 px-2 rounded text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${getUnitColor(unit.type)}`}></div>
                        <span className="font-mono text-slate-200">{unit.name}</span>
                      </div>
                      <div className="font-mono">
                        {isOnScene ? (
                          <span className="text-emerald-400">La fața locului</span>
                        ) : (
                          <span className="text-blue-400">ETA: {eta}s</span>
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
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Dispatch Console (Available Units)</span>
        <div className="grid grid-cols-3 gap-2 flex-1 overflow-y-auto content-start pr-2">
          {availableUnits.map(unit => (
            <button 
              key={unit.id}
              onClick={() => onDispatch(unit.id)}
              className="flex items-center justify-start gap-2 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 rounded text-[10px] text-slate-300 py-2 px-3 transition-colors shadow-sm truncate text-left"
              title={unit.name}
            >
              <div className={`w-2 h-2 flex-shrink-0 ${getUnitColor(unit.type)}`}></div> 
              <span className="uppercase font-bold tracking-wide truncate">{unit.name}</span>
            </button>
          ))}
          {availableUnits.length === 0 && (
            <div className="col-span-3 text-center text-xs text-slate-500 py-4 font-mono uppercase tracking-widest">No units available</div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { GameState } from '../types';
import { REFUEL_COST } from '../constants';
import { X } from 'lucide-react';

interface UnitDetailsPanelProps {
  unitId: string;
  gameState: GameState;
  onRefuel: (unitId: string) => void;
  onReturnToBase: (unitId: string) => void;
  onSelectUnit?: (id: string | null) => void;
  onSelectIncident?: (id: string | null) => void;
  hideInlineClose?: boolean;
}

export default function UnitDetailsPanel({
  unitId,
  gameState,
  onRefuel,
  onReturnToBase,
  onSelectUnit,
  onSelectIncident,
  hideInlineClose,
}: UnitDetailsPanelProps) {
  const selectedUnit = gameState.units[unitId];

  if (!selectedUnit) return null;

  return (
    <div className="h-full w-full md:border-l border-slate-800 bg-slate-950 p-4 flex flex-col gap-4 z-20 relative overflow-y-auto pb-16">
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-white">Unit {selectedUnit.name}</span>
          </div>
          {!hideInlineClose && onSelectUnit && (
            <button
              onClick={() => {
                onSelectUnit(null);
                if (onSelectIncident) onSelectIncident(null);
              }}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs font-bold uppercase transition-colors"
              title="Deselectează"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[11px] text-slate-300 font-mono">
              Status: <span className="text-emerald-400 font-bold">{selectedUnit.state.toUpperCase()}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              COMBUSTIBIL: <span className={selectedUnit.fuel > 50 ? 'text-emerald-400' : selectedUnit.fuel > 20 ? 'text-yellow-400' : 'text-red-400'}>{Math.floor(selectedUnit.fuel)}%</span>
            </div>
          </div>
          {selectedUnit.activity && (
            <div className="text-[10px] text-sky-400 italic mb-2">
              "{selectedUnit.activity}"
            </div>
          )}
          {selectedUnit.vehicleModel && (
            <div className="text-[9px] text-sky-500 italic mb-1">{selectedUnit.vehicleModel}</div>
          )}
          <div className="mt-auto text-[9px] text-slate-500 uppercase flex justify-between pt-2 border-t border-slate-800">
            <span>{selectedUnit.state === 'on_break' ? '🕐 Schimb de tură' : `Type: ${selectedUnit.type}`}</span>
            <span>ID: {selectedUnit.id}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-start border-t border-slate-800 pt-4 mt-2 gap-4">
        <div className="text-slate-400 text-xs font-mono">
          Pentru a deplasa manual unitatea, dă click pe hartă unde vrei să o trimiți.
        </div>
        <div className="flex gap-2">
          {selectedUnit.fuel < 100 && (
            <button
              onClick={() => onRefuel(selectedUnit.id)}
              className="bg-emerald-900/40 border border-emerald-700/50 hover:bg-emerald-800/60 hover:border-emerald-500 text-emerald-400 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded transition-colors"
            >
              Realimentare ({REFUEL_COST} RON)
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

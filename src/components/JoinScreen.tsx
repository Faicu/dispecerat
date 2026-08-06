import React from 'react';
import { GameState, OperatorRole } from '../types';

interface JoinScreenProps {
  playerName: string;
  onPlayerName: (name: string) => void;
  selectedRoles: OperatorRole[];
  onToggleRole: (role: OperatorRole) => void;
  onSubmit: (e: React.FormEvent) => void;
  gameState: GameState;
}

const ROLE_LABELS: Record<OperatorRole, string> = {
  police: 'Poliție',
  fire: 'Pompieri',
  ambulance: 'Ambulanță',
  gendarmerie: 'Jandarmi',
};

export default function JoinScreen({
  playerName,
  onPlayerName,
  selectedRoles,
  onToggleRole,
  onSubmit,
  gameState,
}: JoinScreenProps) {
  return (
    <div className="flex w-screen items-center justify-center bg-slate-950 text-slate-300 font-sans" style={{ height: '100dvh' }}>
      <form
        onSubmit={onSubmit}
        className="bg-slate-900/80 p-8 rounded border border-slate-800 shadow-2xl max-w-sm w-full relative z-10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-red-600 animate-pulse rounded-full" />
          <h1 className="text-2xl font-black text-white tracking-tighter">
            112 <span className="font-light opacity-60">OPERATOR WEB</span>
          </h1>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
            Operator Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={e => onPlayerName(e.target.value)}
            className="w-full bg-black/40 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors font-mono text-sm mb-4"
            placeholder="e.g. Disp. John"
            required
            autoFocus
          />

          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
            Selectează Rolurile
          </label>
          <div className="flex flex-col gap-2">
            {(['police', 'fire', 'ambulance', 'gendarmerie'] as OperatorRole[]).map(role => (
              <label
                key={role}
                className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                  selectedRoles.includes(role)
                    ? 'bg-sky-900/30 border-sky-500 text-sky-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedRoles.includes(role)}
                  onChange={() => onToggleRole(role)}
                />
                <div
                  className={`w-4 h-4 rounded-sm flex items-center justify-center border shrink-0 ${
                    selectedRoles.includes(role) ? 'bg-sky-500 border-sky-400' : 'border-slate-500'
                  }`}
                >
                  {selectedRoles.includes(role) && <span className="text-white text-[10px]">✔</span>}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-wide">
                    Operator {ROLE_LABELS[role]}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {gameState.operators.filter(o => o.roles.includes(role)).length > 0
                      ? `${gameState.operators.filter(o => o.roles.includes(role)).length} activi`
                      : 'Liber'}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 text-white font-bold py-3 text-xs uppercase tracking-widest rounded transition-colors shadow-sm"
        >
          Start Shift
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { GameState } from '../types';

export default function TopNav({ playerName, gameState }: { playerName: string, gameState: GameState }) {
  const [realTime, setRealTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    const timer = setInterval(() => setRealTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatGameTime = (timestamp: number) => {
    if (!timestamp) return '08:00';
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-12 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between px-4 z-20 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 animate-pulse rounded-full"></div>
          <span className="font-black text-white tracking-tighter text-xl">
            112 <span className="font-light opacity-60">OPERATOR WEB</span>
          </span>
        </div>
        <div className="h-6 w-px bg-slate-700"></div>
        <div className="flex gap-4 text-xs font-mono">
          <div><span className="opacity-40">CITY:</span> BUCHAREST</div>
          <div><span className="opacity-40">OPERATOR:</span> {playerName.toUpperCase()}</div>
          {gameState.operators.length > 1 && (
            <div className="flex items-center gap-2">
               <span className="opacity-40">ACTIVE:</span> 
               <div className="flex -space-x-1">
                 {gameState.operators.filter(o => o !== playerName).slice(0, 3).map((op, i) => (
                   <div key={i} title={op} className="w-4 h-4 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[8px] font-bold uppercase text-white truncate">
                     {op.substring(0, 2)}
                   </div>
                 ))}
                 {gameState.operators.length > 4 && (
                   <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-400">
                     +{gameState.operators.length - 4}
                   </div>
                 )}
               </div>
            </div>
          )}
          {gameState.rentedOperators && gameState.rentedOperators.length > 0 && (
             <div className="flex items-center gap-2 bg-fuchsia-900/30 text-fuchsia-400 px-2 py-0.5 rounded border border-fuchsia-800/50" title={gameState.aiStatus}>
               <div className="flex items-center gap-1.5 border-r border-fuchsia-800/50 pr-2">
                 <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                 <span className="text-[10px] font-bold uppercase">AI Op ({Math.max(0, (gameState.rentedOperators[0].expiresAt - gameState.gameTime) / (1000 * 60 * 60)).toFixed(1)}h rămase)</span>
               </div>
               <span className="text-[9px] max-w-[200px] truncate">{gameState.aiStatus || 'Activ și în așteptare'}</span>
             </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end border-r border-slate-700 pr-8">
          <div className="text-xs font-mono text-sky-400 capitalize">
            {gameState.weather === 'clear' ? 'Senin' : gameState.weather === 'rain' ? 'Ploaie' : gameState.weather === 'snow' ? 'Ninsoare' : 'Furtună'}
          </div>
          <div className="text-[10px] opacity-40 uppercase tracking-widest">Vremea</div>
        </div>
        <div className="flex flex-col items-end border-r border-slate-700 pr-8">
          <div className={`text-xs font-mono ${gameState.reputation > 50 ? 'text-emerald-400' : gameState.reputation > 20 ? 'text-yellow-400' : 'text-red-500'}`}>
            {gameState.reputation || 0}%
          </div>
          <div className="text-[10px] opacity-40 uppercase tracking-widest">Reputație</div>
        </div>
        <div className="flex flex-col items-end border-r border-slate-700 pr-8">
          <div className="text-xs font-mono text-emerald-400">
            {gameState.resolvedCountPerOperator?.[playerName] || 0} <span className="opacity-50">/</span> {gameState.resolvedCountTotal || 0}
          </div>
          <div className="text-[10px] opacity-40 uppercase tracking-widest">Soluționate</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs font-mono text-emerald-400">€{gameState.budget?.toLocaleString() || 0}</div>
          <div className="text-[10px] opacity-40 uppercase tracking-widest">Budget</div>
        </div>
        <div className="flex items-center gap-4 bg-black/40 px-3 py-1 rounded border border-slate-700">
          <div className="flex flex-col items-end">
            <span className="text-lg font-mono text-sky-400 font-bold tracking-widest leading-tight">{formatGameTime(gameState.gameTime)}</span>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest leading-none">REAL: {realTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

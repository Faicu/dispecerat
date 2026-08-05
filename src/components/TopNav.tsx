import { useEffect, useState } from 'react';
import { GameState } from '../types';
import { formatGameTime } from '../utils';
import { WEATHER_LABELS } from '../constants';

import { CloudRain, CloudLightning, Snowflake, Sun, Volume2, VolumeX } from 'lucide-react';
import { isMuted as audioIsMuted, setMuted as audioSetMuted } from '../audio';
export default function TopNav({ playerName, gameState }: { playerName: string, gameState: GameState }) {
  const [isMuted, setIsMuted] = useState(audioIsMuted);
  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    audioSetMuted(newVal);
  };
  const [realTime, setRealTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setRealTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          {gameState.operators.length > 0 && (
            <div className="flex items-center gap-2">
               <span className="opacity-40">TEAM:</span> 
               <div className="flex gap-1">
                 {gameState.operators.slice(0, 3).map((op, i) => (
                   <div key={i} title={op} className={`w-5 h-5 rounded bg-slate-800 border ${op === playerName ? 'border-sky-500 text-sky-400' : 'border-slate-700 text-slate-400'} flex items-center justify-center text-[9px] font-bold uppercase`}>
                     {op.substring(0, 2)}
                   </div>
                 ))}
                 {gameState.operators.length > 3 && (
                   <div className="text-[10px] text-slate-500">+{gameState.operators.length - 3}</div>
                 )}
               </div>
            </div>
          )}
          {gameState.rentedOperators && gameState.rentedOperators.length > 0 && (
             <div className="flex items-center gap-1.5 bg-fuchsia-900/30 text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-800/50" title={gameState.aiStatus || 'Activ și în așteptare'}>
               <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse"></span>
               <span className="text-[9px] font-bold uppercase tracking-wider">AI ON</span>
             </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end border-r border-slate-700 pr-8">
          <div className="text-xs font-mono text-sky-400 capitalize">
            {gameState.weather === 'clear' && <Sun size={12} className="inline mr-1" />}
            {gameState.weather === 'rain' && <CloudRain size={12} className="inline mr-1" />}
            {gameState.weather === 'storm' && <CloudLightning size={12} className="inline mr-1" />}
            {gameState.weather === 'snow' && <Snowflake size={12} className="inline mr-1" />}
            {WEATHER_LABELS[gameState.weather] || gameState.weather}
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
        <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div className="flex items-center gap-4 bg-black/40 px-3 py-1 rounded border border-slate-700">
          <div className="flex flex-col items-end justify-center">
            <span className="text-lg font-mono text-white font-bold tracking-widest leading-tight">{realTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

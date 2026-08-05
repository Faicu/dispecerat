import { useEffect, useRef, useState } from 'react';
import { GameState } from '../types';
import { WEATHER_LABELS } from '../constants';
import { CloudRain, CloudLightning, Snowflake, Sun, Settings, X, Volume2, VolumeX, RotateCcw, Users, Waves, Wind } from 'lucide-react';
import { isMuted as audioIsMuted, setMuted as audioSetMuted } from '../audio';

const WAVE_LABELS: Record<string, { label: string; color: string }> = {
  calm:     { label: 'Liniște',   color: 'text-emerald-400' },
  building: { label: 'Tensiune',  color: 'text-yellow-400'  },
  wave:     { label: 'Val!',      color: 'text-red-400'     },
  decay:    { label: 'Calmare',   color: 'text-sky-400'     },
};

export default function TopNav({
  playerName,
  gameState,
  onToggleBreak,
  onReset,
  onSetMultiplier,
}: {
  playerName: string;
  gameState: GameState;
  onToggleBreak?: () => void;
  onReset?: () => void;
  onSetMultiplier?: (v: number) => void;
}) {
  const [isMuted, setIsMuted] = useState(audioIsMuted);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [realTime, setRealTime] = useState(new Date().toLocaleTimeString());
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleMute = () => {
    const v = !isMuted;
    setIsMuted(v);
    audioSetMuted(v);
  };

  useEffect(() => {
    const timer = setInterval(() => setRealTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  const wave = WAVE_LABELS[gameState?.wavePhase ?? 'calm'] || WAVE_LABELS['calm'];
  const myOperator = (gameState?.operators || []).find(o => o.name === playerName);

  return (
    <div className="h-11 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between px-3 z-[100] relative shrink-0 backdrop-blur-sm">
      {/* LEFT — logo + operator info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 bg-red-600 animate-pulse rounded-full" />
          <span className="font-black text-white tracking-tighter text-base leading-none">
            112
          </span>
        </div>

        <div className="h-5 w-px bg-slate-700 shrink-0" />

        {playerName && (
          <div className="flex items-center gap-2 text-[10px] font-mono min-w-0">
            <span className="text-slate-500 shrink-0">OP:</span>
            <span className="text-sky-400 font-bold truncate max-w-[80px]">{playerName.toUpperCase()}</span>
            {onToggleBreak && (
              <button
                onClick={onToggleBreak}
                className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border transition-colors ${myOperator?.isOnBreak ? 'bg-yellow-500/20 border-yellow-600 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'}`}
              >
                {myOperator?.isOnBreak ? 'AI' : 'Pauză'}
              </button>
            )}
          </div>
        )}

        <div className="flex sm:hidden items-center gap-1.5 text-[10px] font-mono shrink-0 ml-1">
          <span className="text-emerald-400 font-bold">€{(gameState?.budget ?? 0).toLocaleString()}</span>
          <span className="text-slate-600">|</span>
          <span className={`font-bold ${(gameState?.reputation ?? 100) > 50 ? 'text-emerald-400' : (gameState?.reputation ?? 100) > 20 ? 'text-yellow-400' : 'text-red-500'}`}>{gameState?.reputation ?? 100}%</span>
        </div>
      </div>

      {/* CENTER — key stats */}
      <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono absolute left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center">
          <span className={`font-bold ${(gameState?.reputation ?? 100) > 50 ? 'text-emerald-400' : (gameState?.reputation ?? 100) > 20 ? 'text-yellow-400' : 'text-red-500'}`}>
            {gameState?.reputation ?? 0}%
          </span>
          <span className="text-slate-600 text-[8px] uppercase tracking-wider">Rep</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex flex-col items-center">
          <span className="text-emerald-400 font-bold">€{(gameState?.budget ?? 0).toLocaleString()}</span>
          <span className="text-slate-600 text-[8px] uppercase tracking-wider">Buget</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex flex-col items-center">
          <span className="text-sky-400 font-bold">{gameState?.resolvedCountTotal ?? 0}</span>
          <span className="text-slate-600 text-[8px] uppercase tracking-wider">Soluționate</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex flex-col items-center">
          <span className={`font-bold ${wave.color}`}>{wave.label}</span>
          <span className="text-slate-600 text-[8px] uppercase tracking-wider">Starea</span>
        </div>
      </div>

      {/* RIGHT — time + settings */}
      <div className="flex items-center gap-2 shrink-0" ref={panelRef}>
        <span className="hidden sm:block text-xs font-mono text-slate-400">{realTime}</span>

        <button
          onClick={() => setSettingsOpen(v => !v)}
          className={`p-1.5 rounded border transition-colors ${settingsOpen ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
          title="Setări Joc"
        >
          <Settings size={14} />
        </button>

        {/* Settings panel */}
        {settingsOpen && (
          <div className="absolute top-12 right-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[110] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Setări Dispecerat</span>
              <button onClick={() => setSettingsOpen(false)} className="text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            </div>

            {/* Sound */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                {isMuted ? <VolumeX size={15} className="text-slate-500" /> : <Volume2 size={15} className="text-sky-400" />}
                <span>Sunet</span>
              </div>
              <button
                onClick={toggleMute}
                className={`relative w-10 h-5 rounded-full border transition-colors ${isMuted ? 'bg-slate-800 border-slate-600' : 'bg-sky-600 border-sky-500'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isMuted ? 'left-0.5' : 'left-5'}`} />
              </button>
            </div>

            {/* Wave status */}
            <div className="px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Waves size={13} className="text-slate-500" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Status Val Incidente</span>
              </div>
              <div className="flex gap-1">
                {(['calm', 'building', 'wave', 'decay'] as const).map(phase => (
                  <div
                    key={phase}
                    className={`flex-1 py-1 rounded text-center text-[9px] font-bold uppercase border transition-all ${gameState?.wavePhase === phase ? `${WAVE_LABELS[phase].color} bg-slate-800 border-slate-600` : 'text-slate-700 border-slate-800'}`}
                  >
                    {WAVE_LABELS[phase].label}
                  </div>
                ))}
              </div>
            </div>

            {/* Manual incident multiplier */}
            {onSetMultiplier && (
              <div className="px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Waves size={13} className="text-slate-500" />
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Flux Incidente Manual</span>
                  <span className={`ml-auto text-[10px] font-bold ${(gameState?.incidentMultiplier ?? 1) > 1 ? 'text-yellow-400' : 'text-slate-500'}`}>
                    x{gameState?.incidentMultiplier ?? 1}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 5, 10].map(v => (
                    <button
                      key={v}
                      onClick={() => onSetMultiplier(v)}
                      className={`flex-1 py-1 rounded border text-[9px] font-bold transition-colors ${
                        (gameState?.incidentMultiplier ?? 1) === v
                          ? 'bg-yellow-600/30 border-yellow-600 text-yellow-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      x{v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weather */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 text-sm text-slate-300">
              <Wind size={13} className="text-slate-500" />
              <span className="text-slate-500 text-xs">Vreme:</span>
              <span className="text-xs font-mono">{WEATHER_LABELS[gameState?.weather ?? 'sunny'] || gameState?.weather}</span>
            </div>

            {/* Active operators */}
            <div className="px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Users size={13} className="text-slate-500" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  Operatori Activi ({(gameState?.operators || []).length})
                </span>
              </div>
              {(gameState?.operators || []).length === 0 ? (
                <p className="text-[10px] text-slate-600 italic">Niciun operator conectat.</p>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(gameState?.operators || []).map((op, i) => (
                    <div key={i} className={`flex items-center justify-between rounded px-2 py-1 ${op.name === playerName ? 'bg-sky-900/30 border border-sky-800/50' : 'bg-slate-800/50'}`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${op.isOnBreak ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-bold text-slate-300">{op.name}</span>
                        {op.name === playerName && <span className="text-[8px] text-sky-500">(tu)</span>}
                      </div>
                      <div className="flex gap-0.5">
                        {(op.roles || []).map(r => (
                          <span key={r} className="text-[8px] px-1 py-0.5 bg-slate-700 text-slate-400 rounded uppercase">{r.slice(0, 3)}</span>
                        ))}
                        {op.isOnBreak && <span className="text-[8px] px-1 py-0.5 bg-yellow-900/40 text-yellow-500 rounded">AI</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset */}
            {onReset && (
              <div className="px-4 py-3">
                <button
                  onClick={() => {
                    if (window.confirm('Resetezi jocul? Toată progresul va fi pierdut.')) {
                      onReset();
                      setSettingsOpen(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-900/30 border border-red-800/60 hover:bg-red-800/40 text-red-400 text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  <RotateCcw size={13} />
                  Reset Joc
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

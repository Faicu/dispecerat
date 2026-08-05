import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, UnitType, OperatorRole } from './types';
import MapView from './components/MapView';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import BottomConsole from './components/BottomConsole';
import { playClick, playDispatch, playIncident, playIncidentByType, playSuccess, playError, playSiren, speak, playRadioChatter } from './audio';
import { UNIT_PRICES } from './constants';
import { Shield, Map as MapIcon, AlertTriangle, Command } from 'lucide-react';

const socket: Socket = io();

// Empty shell rendered until the server sends the first `stateUpdate` — kept
// in sync with GameState's shape so no `as any` cast is needed.
const EMPTY_GAME_STATE: GameState = {
  units: {},
  incidents: {},
  budget: 0,
  reputation: 100,
  gameTime: 0,
  weather: 'clear',
  logs: [],
  operators: [],
  rentedOperators: [],
  stations: [],
  hospitals: [],
  fireStations: [],
  resolvedCountTotal: 0,
  resolvedCountPerOperator: {},
  incidentRate: 1,
  suggestions: [],
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(EMPTY_GAME_STATE);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<OperatorRole[]>([]);
  const [mobileView, setMobileView] = useState<'map' | 'units' | 'incidents' | 'console'>('map');
  const [isJoined, setIsJoined] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'cod3' | 'wave' | 'success' }[]>([]);

  const addToast = (msg: string, type: 'cod3' | 'wave' | 'success') => {
    const id = Date.now();
    setToasts(t => [...t.slice(-3), { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  };

  const prevIncidentsRef = useRef<number>(0);
  const prevResolvedRef = useRef<number>(0);
  const prevWaveRef = useRef<string>('');

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    socket.on('stateUpdate', (newState: GameState) => {
      setGameState(newState);
      
      const incidentCount = Object.keys(newState.incidents || {}).length;
      if (incidentCount > prevIncidentsRef.current && prevIncidentsRef.current > 0) {
         const newIncidentId = Object.keys(newState.incidents || {}).find(id => !Object.keys(gameState.incidents || {}).includes(id));
         if (newIncidentId) {
           const inc = newState.incidents[newIncidentId];
           if (inc.severity === 3) {
             playSiren();
             speak(`Atenție, incident COD 3 raportat: ${inc.name}`);
             addToast(`🚨 COD 3: ${inc.name}`, 'cod3');
           } else {
             playIncidentByType(inc.type);
             speak(`Incident nou: ${inc.name}`);
           }
         }
      }
      prevIncidentsRef.current = incidentCount;

      const resolvedCount = Object.values(newState.incidents || {}).filter(i => i.resolved).length;
      if (resolvedCount > prevResolvedRef.current && prevResolvedRef.current > 0) {
         playSuccess();
         speak('Incident soluționat cu succes.');
         addToast('✅ Incident soluționat', 'success');
      }
      prevResolvedRef.current = resolvedCount;

      if (newState.wavePhase !== prevWaveRef.current) {
        if (newState.wavePhase === 'wave') addToast('⚡ Val de incidente în desfășurare!', 'wave');
        if (newState.wavePhase === 'calm') addToast('🟢 Perioadă liniștită', 'success');
        prevWaveRef.current = newState.wavePhase ?? '';
      }
    });

    return () => {
      socket.off('stateUpdate');
    };
  }, [gameState.incidents]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && selectedRoles.length > 0) {
      playClick();
      socket.emit('join', { name: playerName, roles: selectedRoles });
      setIsJoined(true);
    }
  };

  const toggleRole = (role: OperatorRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleDispatch = (unitId: string) => {
    if (selectedIncidentId) {
      playDispatch();
      socket.emit('dispatchUnit', { unitId, incidentId: selectedIncidentId, operator: playerName });
    }
  };

  const handleRefuel = (unitId: string) => {
    playClick();
    socket.emit('refuelUnit', { unitId });
  };

  const handleReturnToBase = (unitId: string) => {
    playClick();
    socket.emit('returnToBase', { unitId });
  };

  const handlePurchase = (type: UnitType) => {
    if (gameState.budget < UNIT_PRICES[type]) {
      playError();
      return;
    }
    playClick();
    socket.emit('purchaseUnit', { type });
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (selectedUnitId) {
      playRadioChatter();
      socket.emit('manualMoveUnit', { unitId: selectedUnitId, targetLoc: { lat, lng } });
      setSelectedUnitId(null);
    } else {
      setSelectedIncidentId(null);
      setSelectedUnitId(null);
    }
  };


  if (!isJoined) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-300 font-sans">
        <form onSubmit={handleJoin} className="bg-slate-900/80 p-8 rounded border border-slate-800 shadow-2xl max-w-sm w-full relative z-10 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-red-600 animate-pulse rounded-full"></div>
            <h1 className="text-2xl font-black text-white tracking-tighter">
              112 <span className="font-light opacity-60">OPERATOR WEB</span>
            </h1>
          </div>
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Operator Name</label>
            <input 
              type="text" 
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors font-mono text-sm mb-4"
              placeholder="e.g. Disp. John"
              required
              autoFocus
            />
            
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Selectează Rolurile</label>
            <div className="flex flex-col gap-2">
              {(['police', 'fire', 'ambulance', 'gendarmerie'] as OperatorRole[]).map(role => (
                <label key={role} className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${selectedRoles.includes(role) ? 'bg-sky-900/30 border-sky-500 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={selectedRoles.includes(role)} 
                    onChange={() => toggleRole(role)} 
                  />
                  <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${selectedRoles.includes(role) ? 'bg-sky-500 border-sky-400' : 'border-slate-500'}`}>
                    {selectedRoles.includes(role) && <span className="text-white text-[10px]">✔</span>}
                  </div>
                  
  <div className="flex-1 flex justify-between items-center">
    <span className="font-bold text-xs uppercase tracking-wide">Operator {role === 'police' ? 'Poliție' : role === 'fire' ? 'Pompieri' : role === 'ambulance' ? 'Ambulanță' : 'Jandarmi'}</span>
    <span className="text-[10px] opacity-70">{(gameState?.operators?.filter(o => o.roles.includes(role)).length || 0) > 0 ? `${gameState.operators.filter(o => o.roles.includes(role)).length} activi` : 'Liber'}</span>
  </div>
  
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 text-white font-bold py-3 text-xs uppercase tracking-widest rounded transition-colors shadow-sm">
            Start Shift
          </button>
        </form>
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
      </div>
    );
  }

  const isPlayerOnBreak = gameState?.operators?.find(o => o.name === playerName)?.isOnBreak;
      
  const renderMapOverlay = () => {
    if (!gameState || !gameState.gameTime) return null;
    
    // Day/Night logic
    const d = new Date(gameState.gameTime);
    const hour = d.getHours() + (d.getMinutes() / 60);
    
    let color = 'rgba(0,0,0,0)'; // transparent

    if (hour < 6 || hour > 21) {
      color = 'rgba(10, 15, 30, 0.6)'; // Night dark blue
    } else if (hour >= 6 && hour < 8) {
      color = 'rgba(40, 20, 10, 0.3)'; // Sunrise orange
    } else if (hour > 19 && hour <= 21) {
      color = 'rgba(30, 10, 20, 0.4)'; // Sunset purple
    }

    let weatherOverlay = null;
    if (gameState.weather === 'rain') {
      weatherOverlay = <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" style={{ animation: 'rain 0.5s linear infinite' }}></div>;
    } else if (gameState.weather === 'snow') {
      weatherOverlay = <div className="absolute inset-0 pointer-events-none z-10 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" style={{ animation: 'snow 2s linear infinite' }}></div>;
    } else if (gameState.weather === 'storm') {
      weatherOverlay = <div className="absolute inset-0 pointer-events-none z-10 bg-slate-900/40 mix-blend-multiply flex items-center justify-center">
         <div className="w-full h-full animate-pulse bg-white/5 mix-blend-overlay"></div>
      </div>;
    }

    return (
      <>
        <div className="absolute inset-0 pointer-events-none z-[11] transition-colors duration-[2000ms]" style={{ backgroundColor: color }}></div>
        {weatherOverlay}
      </>
    );
  };

  const handleSelectUnit = (unitId: string | null) => {
    if (!unitId) {
      setSelectedUnitId(null);
      return;
    }
    if (!gameState) return;
    const unit = gameState.units[unitId];
    if (unit) {
      const getRoleForUnitType = (type: string) => {
        if (type === 'police' || type === 'swat' || type === 'helicopter') return 'police';
        if (type === 'fire') return 'fire';
        if (type === 'ambulance') return 'ambulance';
        if (type === 'gendarmerie') return 'gendarmerie';
        return null;
      };
      const role = getRoleForUnitType(unit.type);
      if (role && selectedRoles.includes(role as OperatorRole)) {
        setSelectedUnitId(unitId);
      }
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden select-none relative">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none scanlines z-50 opacity-20 mix-blend-overlay"></div>
      <TopNav playerName={playerName} gameState={gameState} onToggleBreak={() => socket.emit('toggleBreak')} onReset={() => socket.emit('restartGame')} onSetMultiplier={v => socket.emit('setIncidentMultiplier', { multiplier: v })} />
      
      <div className="flex-1 flex overflow-hidden relative">
        <div className={`absolute inset-0 z-30 md:relative md:w-64 md:z-0 ${mobileView === 'units' ? 'flex' : 'hidden md:flex'}`}>
          <LeftSidebar
          gameState={gameState}
          onPurchase={handlePurchase}
          onRefuelAll={() => socket.emit('refuelAll')}
          playerRoles={selectedRoles}
        />
        </div>
        
        <div className={`flex-1 relative bg-slate-900 overflow-hidden ${mobileView !== 'map' && mobileView !== 'console' ? 'hidden md:block' : ''}`}>
          <MapView
            gameState={gameState}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={setSelectedIncidentId}
            selectedUnitId={selectedUnitId}
            onSelectUnit={handleSelectUnit}
            onMapClick={handleMapClick}
            playerRoles={selectedRoles}
          />
          {renderMapOverlay()}
   

          {isPlayerOnBreak && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/90 text-yellow-950 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(234,179,8,0.3)] backdrop-blur border border-yellow-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-900 animate-pulse"></span>
              Mod Spectator - AI-ul a preluat postul tău
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(15,23,42,0.8)] z-10"></div>
        </div>
        
        <div className={`absolute inset-0 z-30 md:relative md:w-72 md:z-0 ${mobileView === 'incidents' ? 'flex' : 'hidden md:flex'}`}>
        <RightSidebar
          gameState={gameState}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={setSelectedIncidentId}
          onResolveComplication={(incidentId, optionId) => socket.emit('resolveComplication', { incidentId, optionId })}
          playerRoles={selectedRoles}
        />
        </div>
      </div>
      
      <div className={`${mobileView === 'console' || mobileView === 'map' ? 'block' : 'hidden md:block'}`}>
      <BottomConsole 
        gameState={gameState} 
        selectedIncidentId={selectedIncidentId}
        selectedUnitId={selectedUnitId}
        onDispatch={handleDispatch}
        onRefuel={handleRefuel}
        onReturnToBase={handleReturnToBase}
        playerRoles={selectedRoles}
      />
      </div>
      {/* Scanline / Grain Overlay for Game Feel */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 z-50"></div>
      
      <div className="md:hidden flex bg-slate-900 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider h-16 shrink-0 pb-2 pt-1 z-40 relative">
        <button onClick={() => setMobileView('units')} className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'units' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'}`}>
          <Shield size={20} className="mb-1" />
          Unități
        </button>
        <button onClick={() => setMobileView('map')} className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'map' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}>
          <MapIcon size={20} className="mb-1" />
          Hartă
        </button>
        <button onClick={() => setMobileView('incidents')} className={`flex-1 flex flex-col items-center justify-center relative transition-colors ${mobileView === 'incidents' ? 'text-red-400' : 'text-slate-500 hover:text-slate-400'}`}>
          <AlertTriangle size={20} className="mb-1" />
          Incidente
          {Object.keys(gameState?.incidents || {}).length > 0 && (
            <span className="absolute top-1 right-[25%] w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        <button onClick={() => setMobileView('console')} className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'console' ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-400'}`}>
          <Command size={20} className="mb-1" />
          Consolă
        </button>
      </div>

      {/* Toast notifications */}
      <div className="fixed top-14 right-3 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-3 py-2 rounded border text-xs font-bold shadow-xl backdrop-blur-sm animate-in slide-in-from-right-4 duration-300 max-w-[260px] ${
              toast.type === 'cod3'
                ? 'bg-red-950/90 border-red-700 text-red-300'
                : toast.type === 'wave'
                ? 'bg-yellow-950/90 border-yellow-700 text-yellow-300'
                : 'bg-emerald-950/90 border-emerald-700 text-emerald-300'
            }`}
          >
            {toast.msg}
          </div>
        ))}
      </div>
    </div>
  );
}


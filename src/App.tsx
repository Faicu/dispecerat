import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { io, Socket } from 'socket.io-client';
import { GameState, UnitType, OperatorRole } from './types';
import MapView from './components/MapView';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import BottomConsole from './components/BottomConsole';
import { PhoneCallModal } from './components/PhoneCallModal';
import { playClick, playDispatch, playIncident, playIncidentByType, playSuccess, playError, playSiren, speak, playRadioChatter } from './audio';
import { UNIT_PRICES } from './constants';
import { Shield, Map as MapIcon, AlertTriangle, Command, X, Coffee, Play } from 'lucide-react';

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
  incidentMultiplier: 1,
  wavePhase: 'calm',
  waveTimer: 0,
  incidentRate: 1,
  suggestions: [],
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(EMPTY_GAME_STATE);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<OperatorRole[]>([]);
  const [leftTab, setLeftTab] = useState<'units' | 'logs' | 'incidents'>('units');
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
  const selectedIncidentIdRef = useRef<string | null>(null);
  const selectedRolesRef = useRef<OperatorRole[]>([]);
  const gameStateRef = useRef<GameState>(EMPTY_GAME_STATE);
  const lastSelectionTimeRef = useRef<number>(0);

  // Keep refs in sync so keyboard handler always has current values
  useEffect(() => { selectedIncidentIdRef.current = selectedIncidentId; }, [selectedIncidentId]);
  useEffect(() => { selectedRolesRef.current = selectedRoles; }, [selectedRoles]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    const onConnect = () => {
      if (isJoined && playerName.trim() && selectedRoles.length > 0) {
        socket.emit('join', { name: playerName, roles: selectedRoles });
      }
    };
    socket.on('connect', onConnect);
    return () => {
      socket.off('connect', onConnect);
    };
  }, [isJoined, playerName, selectedRoles]);

  // Keyboard shortcuts (only when joined and no input focused)
  useEffect(() => {
    if (!isJoined) return;
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        setSelectedIncidentId(null);
        setSelectedUnitId(null);
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        const gs = gameStateRef.current;
        const unattended = Object.values(gs.incidents)
          .filter(i => !i.resolved && i.assignedUnits.length === 0 && !(i.isPhoneCall && i.callStatus !== 'completed'))
          .sort((a, b) => b.severity - a.severity);
        if (unattended.length > 0) {
          const cur = unattended.findIndex(i => i.id === selectedIncidentIdRef.current);
          const next = unattended[(cur + 1) % unattended.length];
          setSelectedIncidentId(next.id);
          setLeftTab('incidents');
        }
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const incId = selectedIncidentIdRef.current;
        if (!incId) return;
        const gs = gameStateRef.current;
        const inc = gs.incidents[incId];
        if (!inc || inc.resolved) return;
        const roles = selectedRolesRef.current;
        const getRoleForType = (t: string) => {
          if (t === 'police' || t === 'swat' || t === 'helicopter') return 'police';
          if (t === 'fire') return 'fire';
          if (t === 'ambulance') return 'ambulance';
          if (t === 'gendarmerie') return 'gendarmerie';
          return null;
        };
        const available = Object.values(gs.units)
          .filter(u => (u.state === 'idle' || u.state === 'patrolling') && roles.includes(getRoleForType(u.type) as OperatorRole))
          .sort((a, b) => {
            const dA = Math.pow(a.location.lat - inc.location.lat, 2) + Math.pow(a.location.lng - inc.location.lng, 2);
            const dB = Math.pow(b.location.lat - inc.location.lat, 2) + Math.pow(b.location.lng - inc.location.lng, 2);
            return dA - dB;
          });
        const unit = available[num - 1];
        if (unit) {
          playDispatch();
          socket.emit('dispatchUnit', { unitId: unit.id, incidentId: incId, operator: playerName });
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isJoined, playerName]);

  useEffect(() => {
    socket.on('stateUpdate', (newState: GameState) => {
      setGameState(newState);
      
      const incidentCount = Object.keys(newState.incidents || {}).length;
      if (incidentCount > prevIncidentsRef.current && prevIncidentsRef.current > 0) {
         const newIncidentId = Object.keys(newState.incidents || {}).find(id => !Object.keys(gameState.incidents || {}).includes(id));
         if (newIncidentId) {
           const inc = newState.incidents[newIncidentId];
           if (inc.isPhoneCall && inc.callStatus !== 'completed') return;
           if (inc.severity >= 4) {
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

      setSelectedIncidentId(prev => {
        if (prev && (!newState.incidents || !newState.incidents[prev])) {
          return null;
        }
        return prev;
      });
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
    if (Date.now() - lastSelectionTimeRef.current < 600) {
      return;
    }
    if (selectedUnitId) {
      playRadioChatter();
      socket.emit('manualMoveUnit', { unitId: selectedUnitId, targetLoc: { lat, lng } });
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
    lastSelectionTimeRef.current = Date.now();
    setSelectedUnitId(unitId);
    if (unitId) {
      setSelectedIncidentId(null);
    } else {
      setMobileView('map');
    }
  };

  const handleSelectIncident = (id: string | null) => {
    lastSelectionTimeRef.current = Date.now();
    setSelectedIncidentId(id);
    if (id) {
      setSelectedUnitId(null);
      setLeftTab('incidents');
    } else {
      setMobileView('map');
    }
  };

  const hasActiveIncident = Boolean(selectedIncidentId && gameState?.incidents?.[selectedIncidentId] && !gameState.incidents[selectedIncidentId].resolved);
  const hasActiveUnit = Boolean(selectedUnitId && gameState?.units?.[selectedUnitId]);
  const showRightConsole = hasActiveIncident || hasActiveUnit || mobileView === 'console';

  // Incidents of severity 4-5 with no assigned units for >30s
  const urgentUnattended = Object.values(gameState.incidents).filter(inc =>
    !inc.resolved &&
    inc.severity >= 4 &&
    inc.assignedUnits.length === 0 &&
    Date.now() - inc.createdAt > 30000 &&
    !(inc.isPhoneCall && inc.callStatus !== 'completed')
  );

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden select-none relative">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none scanlines z-50 opacity-20 mix-blend-overlay"></div>
      <TopNav playerName={playerName} gameState={gameState} onToggleBreak={() => socket.emit('toggleBreak')} onReset={() => socket.emit('restartGame')} onSetMultiplier={v => socket.emit('setIncidentMultiplier', { multiplier: v })} />

      {urgentUnattended.length > 0 && (
        <div
          className="bg-red-950/95 border-b border-red-700 text-red-300 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 flex items-center gap-2 animate-pulse cursor-pointer shrink-0 z-40"
          onClick={() => { handleSelectIncident(urgentUnattended[0].id); }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
          {urgentUnattended.length === 1
            ? `⚠ Incident COD ${urgentUnattended[0].severity} fără unitate: ${urgentUnattended[0].name} — acționează acum!`
            : `⚠ ${urgentUnattended.length} incidente de urgență fără unități alocate!`}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`absolute inset-0 z-30 md:relative md:w-80 lg:w-[22rem] shrink-0 md:z-0 ${mobileView === 'units' || mobileView === 'incidents' ? 'flex' : 'hidden md:flex'}`}>
          <LeftSidebar
          gameState={gameState}
          selectedUnitId={selectedUnitId}
          onSelectUnit={handleSelectUnit}
          onPurchase={handlePurchase}
          onRefuelAll={() => socket.emit('refuelAll')}
          playerRoles={selectedRoles}
          activeTab={leftTab}
          onTabChange={setLeftTab}
          incidentListContent={
            <RightSidebar
              gameState={gameState}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={handleSelectIncident}
              onResolveComplication={(incidentId, optionId) => socket.emit('resolveComplication', { incidentId, optionId })}
              playerRoles={selectedRoles}
            />
          }
        />
        </div>
        
        <div className={`flex-1 relative bg-slate-900 overflow-hidden ${mobileView !== 'map' && mobileView !== 'console' ? 'hidden md:block' : ''}`}>
          <MapView
            gameState={gameState}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={handleSelectIncident}
            selectedUnitId={selectedUnitId}
            onSelectUnit={handleSelectUnit}
            onMapClick={handleMapClick}
            playerRoles={selectedRoles}
          />
          {renderMapOverlay()}

          {/* Full-screen Mobile Modal when an incident or unit is selected */}
          {(Boolean(selectedIncidentId || selectedUnitId)) && (
            <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col overflow-hidden md:hidden animate-in fade-in duration-150">
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2">
                  <Command size={18} /> Dispecerat Incident / Unitate
                </span>
                <button
                  onClick={() => {
                    setSelectedIncidentId(null);
                    setSelectedUnitId(null);
                    setMobileView('map');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors text-xs font-bold uppercase shadow cursor-pointer"
                >
                  <X size={16} /> Închide
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-950 p-2">
                <BottomConsole 
                  gameState={gameState} 
                  selectedIncidentId={selectedIncidentId}
                  selectedUnitId={selectedUnitId}
                  onDispatch={handleDispatch}
                  onRefuel={handleRefuel}
                  onReturnToBase={handleReturnToBase}
                  playerRoles={selectedRoles}
                  onSelectIncident={handleSelectIncident}
                  onSelectUnit={handleSelectUnit}
                  hideInlineClose={true}
                />
              </div>
            </div>
          )}
   

          {isPlayerOnBreak && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/90 text-yellow-950 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(234,179,8,0.3)] backdrop-blur border border-yellow-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-900 animate-pulse"></span>
              Mod Spectator - AI-ul a preluat postul tău
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(15,23,42,0.8)] z-10"></div>
        </div>
        
        {/* Console Panel for Desktop or Mobile Console Tab */}
        <div className={`fixed inset-0 z-[800] bg-slate-950 md:static md:z-0 md:w-80 lg:w-96 shrink-0 ${mobileView === 'console' ? 'flex flex-col' : 'hidden md:flex'}`}>
          <BottomConsole 
            gameState={gameState} 
            selectedIncidentId={selectedIncidentId}
            selectedUnitId={selectedUnitId}
            onDispatch={handleDispatch}
            onRefuel={handleRefuel}
            onReturnToBase={handleReturnToBase}
            playerRoles={selectedRoles}
            onSelectIncident={handleSelectIncident}
            onSelectUnit={handleSelectUnit}
            onBackToMap={() => setMobileView('map')}
          />
        </div>
      </div>
      
      
      {/* Scanline / Grain Overlay for Game Feel */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 z-50"></div>
      
      <div className="md:hidden flex bg-slate-900 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider h-16 shrink-0 pb-2 pt-1 z-40 relative">
        <button onClick={() => { setMobileView('units'); setLeftTab('units'); }} className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'units' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'}`}>
          <Shield size={20} className="mb-1" />
          Unități
        </button>
        <button onClick={() => setMobileView('map')} className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'map' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}>
          <MapIcon size={20} className="mb-1" />
          Hartă
        </button>
        <button onClick={() => { setMobileView('incidents'); setLeftTab('incidents'); }} className={`flex-1 flex flex-col items-center justify-center relative transition-colors ${mobileView === 'incidents' ? 'text-red-400' : 'text-slate-500 hover:text-slate-400'}`}>
          <AlertTriangle size={20} className="mb-1" />
          Incidente
          {Object.keys(gameState?.incidents || {}).length > 0 && (
            <span className="absolute top-1 right-[25%] w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        <button onClick={() => {
          setMobileView('console');
          if (!selectedIncidentId) {
            const topIncident = Object.values(gameState.incidents)
              .filter(i => !i.resolved && !(i.isPhoneCall && i.callStatus !== 'completed'))
              .sort((a, b) => b.severity - a.severity)[0];
            if (topIncident) setSelectedIncidentId(topIncident.id);
          }
        }} className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'console' ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-400'}`}>
          <Command size={20} className="mb-1" />
          Consolă
        </button>
      </div>

      {/* 112 Emergency Call Modal */}
      {isJoined && !isPlayerOnBreak && (
        <PhoneCallModal
          gameState={gameState}
          playerName={playerName}
          playerRoles={selectedRoles}
          onSelectIncident={(incidentId) => {
            setSelectedIncidentId(incidentId);
            if (window.innerWidth < 768) setMobileView('console');
          }}
          onAnswer={(incidentId) => {
            setSelectedIncidentId(incidentId);
            if (window.innerWidth < 768) setMobileView('console');
            socket.emit('answerCall', { incidentId, operator: playerName });
          }}
          onProgress={(incidentId, nextStep) => {
            setSelectedIncidentId(incidentId);
            if (window.innerWidth < 768) setMobileView('console');
            socket.emit('progressCall', { incidentId, nextStep });
          }}
          onDispatch={(unitId, incidentId) => {
            setSelectedIncidentId(incidentId);
            playDispatch();
            socket.emit('dispatchUnit', { unitId, incidentId, operator: playerName });
          }}
        />
      )}

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

      {/* Pause Status Overlay */}
      {isPlayerOnBreak && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-slate-900/95 border border-sky-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-sky-950/80 text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-sky-950 border-2 border-sky-400 flex items-center justify-center text-sky-400 animate-pulse shadow-lg shadow-sky-500/30">
              <Coffee size={32} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-2">
                OPERATOR ÎN PAUZĂ
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Sunteți în pauză. Dispeceratul AI preia și gestionează automat toate apelurile și incidentele în locul dumneavoastră.
              </p>
            </div>
            <div className="w-full bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-[11px] text-sky-300 font-mono flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              Sistemul AI este activ &amp; operațional
            </div>
            <button
              onClick={() => socket.emit('toggleBreak')}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm uppercase tracking-widest transition-all shadow-lg shadow-sky-600/40 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Play size={18} fill="currentColor" /> Reia Tura de Dispecerat
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


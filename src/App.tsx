import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, UnitType, OperatorRole } from './types';
import MapView from './components/MapView';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import BottomConsole from './components/BottomConsole';
import JoinScreen from './components/JoinScreen';
import { PhoneCallModal } from './components/PhoneCallModal';
import { playClick, playDispatch, playIncidentByType, playSuccess, playError, playSiren, speak, playRadioChatter } from './audio';
import { UNIT_PRICES } from './constants';
import { FULL_HEIGHT_STYLE } from './config/mobile';
import { Shield, Map as MapIcon, AlertTriangle, Command, Coffee, Play } from 'lucide-react';

const socket: Socket = io();

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
  const prevIncidentKeysRef = useRef<Set<string>>(new Set());
  const selectedIncidentIdRef = useRef<string | null>(null);
  const selectedRolesRef = useRef<OperatorRole[]>([]);
  const gameStateRef = useRef<GameState>(EMPTY_GAME_STATE);
  const lastSelectionTimeRef = useRef<number>(0);

  useEffect(() => { selectedIncidentIdRef.current = selectedIncidentId; }, [selectedIncidentId]);
  useEffect(() => { selectedRolesRef.current = selectedRoles; }, [selectedRoles]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  }, []);

  // Re-join after reconnect
  useEffect(() => {
    const onConnect = () => {
      if (isJoined && playerName.trim() && selectedRoles.length > 0) {
        socket.emit('join', { name: playerName, roles: selectedRoles });
      }
    };
    socket.on('connect', onConnect);
    return () => { socket.off('connect', onConnect); };
  }, [isJoined, playerName, selectedRoles]);

  // Keyboard shortcuts
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
        const getRoleForType = (t: string): OperatorRole | null => {
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

  // State sync from server — uses a ref for previous incident keys to avoid stale closure
  useEffect(() => {
    socket.on('stateUpdate', (newState: GameState) => {
      setGameState(newState);

      const incidentCount = Object.keys(newState.incidents || {}).length;
      if (incidentCount > prevIncidentsRef.current && prevIncidentsRef.current > 0) {
        const newIncidentId = Object.keys(newState.incidents || {}).find(
          id => !prevIncidentKeysRef.current.has(id)
        );
        if (newIncidentId) {
          const inc = newState.incidents[newIncidentId];
          if (!(inc.isPhoneCall && inc.callStatus !== 'completed')) {
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
      }
      prevIncidentsRef.current = incidentCount;
      prevIncidentKeysRef.current = new Set(Object.keys(newState.incidents || {}));

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
        if (prev && (!newState.incidents || !newState.incidents[prev])) return null;
        return prev;
      });
    });

    return () => { socket.off('stateUpdate'); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && selectedRoles.length > 0) {
      playClick();
      socket.emit('join', { name: playerName, roles: selectedRoles });
      setIsJoined(true);
    }
  };

  const toggleRole = (role: OperatorRole) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
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
    if (gameState.budget < UNIT_PRICES[type]) { playError(); return; }
    playClick();
    socket.emit('purchaseUnit', { type });
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (Date.now() - lastSelectionTimeRef.current < 600) return;
    if (selectedUnitId) {
      playRadioChatter();
      socket.emit('manualMoveUnit', { unitId: selectedUnitId, targetLoc: { lat, lng } });
      setSelectedUnitId(null);
    }
  };

  const handleSelectUnit = (unitId: string | null) => {
    lastSelectionTimeRef.current = Date.now();
    setSelectedUnitId(unitId);
    if (unitId) {
      setSelectedIncidentId(null);
      // Switch to map view on mobile so the dispatch overlay is visible
      if (window.innerWidth < 768) setMobileView('map');
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
      // Switch to map view on mobile so the dispatch overlay is visible
      if (window.innerWidth < 768) setMobileView('map');
    } else {
      setMobileView('map');
    }
  };

  const closeConsole = () => {
    setSelectedIncidentId(null);
    setSelectedUnitId(null);
    if (mobileView === 'console') setMobileView('map');
  };

  if (!isJoined) {
    return (
      <JoinScreen
        playerName={playerName}
        onPlayerName={setPlayerName}
        selectedRoles={selectedRoles}
        onToggleRole={toggleRole}
        onSubmit={handleJoin}
        gameState={gameState}
      />
    );
  }

  const isPlayerOnBreak = gameState?.operators?.find(o => o.name === playerName)?.isOnBreak;

  const hasActiveIncident = Boolean(
    selectedIncidentId &&
    gameState?.incidents?.[selectedIncidentId] &&
    !gameState.incidents[selectedIncidentId].resolved
  );
  const hasActiveUnit = Boolean(selectedUnitId && gameState?.units?.[selectedUnitId]);
  const showConsole = hasActiveIncident || hasActiveUnit || mobileView === 'console';

  const urgentUnattended = Object.values(gameState.incidents).filter(inc =>
    !inc.resolved &&
    inc.severity >= 4 &&
    inc.assignedUnits.length === 0 &&
    Date.now() - inc.createdAt > 30000 &&
    !(inc.isPhoneCall && inc.callStatus !== 'completed')
  );

  const renderMapOverlay = () => {
    if (!gameState?.gameTime) return null;
    const d = new Date(gameState.gameTime);
    const hour = d.getHours() + d.getMinutes() / 60;

    let color = 'rgba(0,0,0,0)';
    if (hour < 6 || hour > 21)         color = 'rgba(10, 15, 30, 0.6)';
    else if (hour >= 6 && hour < 8)    color = 'rgba(40, 20, 10, 0.3)';
    else if (hour > 19 && hour <= 21)  color = 'rgba(30, 10, 20, 0.4)';

    let weatherOverlay: React.ReactNode = null;
    if (gameState.weather === 'rain') {
      weatherOverlay = <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" style={{ animation: 'rain 0.5s linear infinite' }} />;
    } else if (gameState.weather === 'snow') {
      weatherOverlay = <div className="absolute inset-0 pointer-events-none z-10 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" style={{ animation: 'snow 2s linear infinite' }} />;
    } else if (gameState.weather === 'storm') {
      weatherOverlay = <div className="absolute inset-0 pointer-events-none z-10 bg-slate-900/40 mix-blend-multiply"><div className="w-full h-full animate-pulse bg-white/5 mix-blend-overlay" /></div>;
    }

    return (
      <>
        <div className="absolute inset-0 pointer-events-none z-[11] transition-colors duration-[2000ms]" style={{ backgroundColor: color }} />
        {weatherOverlay}
      </>
    );
  };

  return (
    <div
      className="w-screen bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden select-none relative"
      style={FULL_HEIGHT_STYLE}
    >
      {/* Scanline overlay for game feel */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none scanlines z-50 opacity-20 mix-blend-overlay" />
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 z-50" />

      <TopNav
        playerName={playerName}
        gameState={gameState}
        onToggleBreak={() => socket.emit('toggleBreak')}
        onReset={() => socket.emit('restartGame')}
        onSetMultiplier={v => socket.emit('setIncidentMultiplier', { multiplier: v })}
      />

      {urgentUnattended.length > 0 && (
        <div
          className="bg-red-950/95 border-b border-red-700 text-red-300 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 flex items-center gap-2 animate-pulse cursor-pointer shrink-0 z-40"
          onClick={() => handleSelectIncident(urgentUnattended[0].id)}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
          {urgentUnattended.length === 1
            ? `⚠ Incident COD ${urgentUnattended[0].severity} fără unitate: ${urgentUnattended[0].name} — acționează acum!`
            : `⚠ ${urgentUnattended.length} incidente de urgență fără unități alocate!`}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left sidebar — units/incidents list */}
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

        {/* Map area — fills remaining space, console overlays it */}
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

          {/* Inner vignette */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(15,23,42,0.8)] z-10" />


        </div>
      </div>

      {/* Break status — fixed so it's above Leaflet's stacking context (z-600 for markers) */}
      {isPlayerOnBreak && (
        <div className="fixed top-12 inset-x-0 z-[3000] pointer-events-none flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-2.5 bg-yellow-950/95 border border-yellow-700/60 backdrop-blur-md rounded-full px-4 py-2 shadow-lg shadow-yellow-950/60 max-w-xs">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
            <Coffee size={13} className="text-yellow-400 shrink-0" />
            <span className="text-yellow-200 text-[10px] font-bold uppercase tracking-wide">Pauză · AI activ</span>
            <button
              onClick={() => socket.emit('toggleBreak')}
              className="flex items-center gap-1 px-2.5 py-1 bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 rounded-full text-[9px] text-white font-bold uppercase transition-colors"
            >
              <Play size={9} fill="currentColor" /> Reia
            </button>
          </div>
        </div>
      )}

      {/* Dispatch console — fixed overlay so it sits above Leaflet's stacking context.
          Semi-transparent backdrop keeps the map dimly visible behind the panel. */}
      {showConsole && (
        <>
          <div
            className="fixed inset-0 z-[5000] bg-slate-950/65 backdrop-blur-sm"
            onClick={closeConsole}
          />
          <div className="fixed inset-0 z-[5001] pointer-events-none flex items-center justify-center p-4">
            <div
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
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
                onResolveComplication={(incidentId, optionId) => socket.emit('resolveComplication', { incidentId, optionId })}
                onBackToMap={closeConsole}
              />
            </div>
          </div>
        </>
      )}

      {/* Mobile bottom navigation — z-[900] stays above any map overlay */}
      <div className="md:hidden flex bg-slate-900 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider h-16 shrink-0 pb-2 pt-1 z-[900] relative">
        <button
          onClick={() => { setMobileView('units'); setLeftTab('units'); }}
          className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'units' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <Shield size={20} className="mb-1" />
          Unități
        </button>
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'map' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <MapIcon size={20} className="mb-1" />
          Hartă
        </button>
        <button
          onClick={() => { setMobileView('incidents'); setLeftTab('incidents'); }}
          className={`flex-1 flex flex-col items-center justify-center relative transition-colors ${mobileView === 'incidents' ? 'text-red-400' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <AlertTriangle size={20} className="mb-1" />
          Incidente
          {Object.values(gameState?.incidents || {}).some(i => !i.resolved) && (
            <span className="absolute top-1 right-[25%] w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        <button
          onClick={() => {
            setMobileView('console');
            if (!selectedIncidentId) {
              const topIncident = Object.values(gameState.incidents)
                .filter(i => !i.resolved && !(i.isPhoneCall && i.callStatus !== 'completed'))
                .sort((a, b) => b.severity - a.severity)[0];
              if (topIncident) setSelectedIncidentId(topIncident.id);
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center transition-colors ${mobileView === 'console' ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <Command size={20} className="mb-1" />
          Consolă
        </button>
      </div>

      {/* Emergency call modal */}
      {isJoined && !isPlayerOnBreak && (
        <PhoneCallModal
          gameState={gameState}
          playerName={playerName}
          playerRoles={selectedRoles}
          onSelectIncident={incidentId => {
            setSelectedIncidentId(incidentId);
            if (window.innerWidth < 768) setMobileView('map');
          }}
          onAnswer={incidentId => {
            setSelectedIncidentId(incidentId);
            if (window.innerWidth < 768) setMobileView('map');
            socket.emit('answerCall', { incidentId, operator: playerName });
          }}
          onProgress={(incidentId, nextStep) => {
            setSelectedIncidentId(incidentId);
            if (window.innerWidth < 768) setMobileView('map');
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
      <div className="fixed top-14 right-3 z-[500] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-3 py-2 rounded border text-xs font-bold shadow-xl backdrop-blur-sm animate-in slide-in-from-right-4 duration-300 max-w-[260px] ${
              toast.type === 'cod3'   ? 'bg-red-950/90 border-red-700 text-red-300'
              : toast.type === 'wave' ? 'bg-yellow-950/90 border-yellow-700 text-yellow-300'
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

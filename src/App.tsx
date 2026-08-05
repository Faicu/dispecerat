import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, UnitType } from './types';
import MapView from './components/MapView';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import BottomConsole from './components/BottomConsole';
import { playClick, playDispatch, playIncident, playSuccess, playError, playSiren, speak, playRadioChatter } from './audio';
import { UNIT_PRICES } from './constants';

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
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(EMPTY_GAME_STATE);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  
  const prevIncidentsRef = useRef<number>(0);
  const prevResolvedRef = useRef<number>(0);

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
         if (newIncidentId && newState.incidents[newIncidentId].severity === 3) {
            playSiren();
            speak(`Atenție, incident COD 3 raportat: ${newState.incidents[newIncidentId].name}`);
         } else {
            playIncident();
            if (newIncidentId) {
               speak(`Incident nou raportat: ${newState.incidents[newIncidentId].name}`);
            }
         }
      }
      prevIncidentsRef.current = incidentCount;

      const resolvedCount = Object.values(newState.incidents || {}).filter(i => i.resolved).length;
      if (resolvedCount > prevResolvedRef.current && prevResolvedRef.current > 0) {
         playSuccess();
         speak('Incident soluționat cu succes.');
      }
      prevResolvedRef.current = resolvedCount;
    });

    return () => {
      socket.off('stateUpdate');
    };
  }, [gameState.incidents]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      playClick();
      socket.emit('join', { name: playerName });
      setIsJoined(true);
    }
  };

  const handleDispatch = (unitId: string) => {
    if (selectedIncidentId) {
      playDispatch();
      socket.emit('dispatchUnit', { unitId, incidentId: selectedIncidentId, operator: playerName });
    }
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
              className="w-full bg-black/40 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
              placeholder="e.g. Disp. John"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 text-white font-bold py-3 text-xs uppercase tracking-widest rounded transition-colors shadow-sm">
            Start Shift
          </button>
        </form>
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
      </div>
    );
  }

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

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden select-none relative">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none scanlines z-50 opacity-20 mix-blend-overlay"></div>
      <TopNav playerName={playerName} gameState={gameState} />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar 
          gameState={gameState} 
          onPurchase={handlePurchase} 
          onRentOperator={() => socket.emit('rentOperator')} 
          onFireOperator={() => socket.emit('fireOperator')}
          onSetIncidentRate={(rate) => socket.emit('setIncidentRate', { rate })}
          onRefuelAll={() => socket.emit('refuelAll')}
        />
        
        <div className="flex-1 relative bg-slate-900 overflow-hidden">
          <MapView
            gameState={gameState}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={setSelectedIncidentId}
            selectedUnitId={selectedUnitId}
            onSelectUnit={setSelectedUnitId}
            onMapClick={handleMapClick}
          />
          {renderMapOverlay()}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(15,23,42,0.8)] z-10"></div>
        </div>
        
        <RightSidebar 
          gameState={gameState}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={setSelectedIncidentId}
          onResolveComplication={(incidentId, optionId) => socket.emit('resolveComplication', { incidentId, optionId })}
        />
      </div>
      
      <BottomConsole 
        gameState={gameState}
        selectedIncidentId={selectedIncidentId}
        selectedUnitId={selectedUnitId}
        onDispatch={handleDispatch}
        onRefuel={(unitId) => socket.emit('refuelUnit', { unitId })}
        onReturnToBase={(unitId) => socket.emit('returnToBase', { unitId })}
      />

      {/* Scanline / Grain Overlay for Game Feel */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 z-50"></div>
    </div>
  );
}

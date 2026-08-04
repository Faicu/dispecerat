import { useState } from 'react';
import { GameState, UnitType } from '../types';
import { motion } from 'motion/react';

const getUnitStyles = (type: UnitType, isIdle: boolean) => {
  if (isIdle) {
    return {
      bg: 'bg-slate-800',
      border: 'border-slate-700',
      title: 'text-white',
      badge: 'text-emerald-400 bg-transparent',
      bar: 'bg-emerald-500'
    };
  }
  switch (type) {
    case 'police': return { bg: 'bg-blue-900/20', border: 'border-blue-800/40', title: 'text-blue-400', badge: 'bg-blue-600 text-white', bar: 'bg-blue-500' };
    case 'fire': return { bg: 'bg-red-900/20', border: 'border-red-800/40', title: 'text-red-400', badge: 'bg-red-600 text-white', bar: 'bg-red-500' };
    case 'ambulance': return { bg: 'bg-emerald-900/20', border: 'border-emerald-800/40', title: 'text-emerald-400', badge: 'bg-emerald-600 text-white', bar: 'bg-emerald-500' };
    case 'gendarmerie': return { bg: 'bg-indigo-900/20', border: 'border-indigo-800/40', title: 'text-indigo-400', badge: 'bg-indigo-600 text-white', bar: 'bg-indigo-500' };
    case 'swat': return { bg: 'bg-slate-900/80', border: 'border-slate-600', title: 'text-slate-300', badge: 'bg-slate-800 text-white', bar: 'bg-slate-500' };
    case 'helicopter': return { bg: 'bg-sky-900/20', border: 'border-sky-800/40', title: 'text-sky-400', badge: 'bg-sky-600 text-white', bar: 'bg-sky-500' };
  }
};

export default function LeftSidebar({ gameState, onPurchase, onRentOperator, onSetIncidentRate, onRefuelAll }: { gameState: GameState, onPurchase: (type: UnitType) => void, onRentOperator: () => void, onSetIncidentRate: (rate: number) => void, onRefuelAll: () => void }) {
  const [activeTab, setActiveTab] = useState<'units' | 'logs'>('units');
  const unitsList = Object.values(gameState.units || {});
  
  const groupedUnits: Record<string, typeof unitsList> = {
    'police': unitsList.filter(u => u.type === 'police'),
    'gendarmerie': unitsList.filter(u => u.type === 'gendarmerie'),
    'swat': unitsList.filter(u => u.type === 'swat'),
    'helicopter': unitsList.filter(u => u.type === 'helicopter'),
    'ambulance': unitsList.filter(u => u.type === 'ambulance'),
    'fire': unitsList.filter(u => u.type === 'fire'),
  };

  const groupLabels: Record<string, string> = {
    'police': 'Poliție',
    'gendarmerie': 'Jandarmerie',
    'swat': 'SIAS / Mascați',
    'helicopter': 'Elicopter Aviație',
    'ambulance': 'Ambulanță (SMURD)',
    'fire': 'Pompieri (ISU)',
  };

  const formatGameTime = (timestamp: number) => {
    if (!timestamp) return '08:00';
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col z-10 relative h-full">
      <div className="flex border-b border-slate-800 bg-slate-800/80 text-[10px] font-bold uppercase tracking-widest shrink-0">
        <button 
          onClick={() => setActiveTab('units')}
          className={`flex-1 p-3 text-center transition-colors ${activeTab === 'units' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Unități ({unitsList.length})
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex-1 p-3 text-center transition-colors ${activeTab === 'logs' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Jurnal
        </button>
      </div>

      <div className="flex-1 p-2 space-y-4 overflow-y-auto">
        {activeTab === 'units' ? (
          <>
            {Object.entries(groupedUnits).map(([type, units]) => {
          if (units.length === 0) return null;
          return (
            <div key={type} className="space-y-2">
              <div className="text-[9px] uppercase font-bold text-slate-500 border-b border-slate-800 pb-1">{groupLabels[type]} ({units.length})</div>
              {units.map(unit => {
                const isIdle = unit.state === 'idle';
                const styles = getUnitStyles(unit.type, isIdle);
                
                return (
                  <motion.div 
                    layout
                    key={unit.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`px-2 py-1.5 ${styles.bg} border ${styles.border} rounded transition-colors flex flex-col`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold uppercase ${styles.title} truncate mr-2`} title={unit.name}>
                        {unit.name}
                      </span>
                      <span className={`text-[8px] px-1 font-bold tracking-wider ${styles.badge} flex-shrink-0 rounded-sm`}>
                        {isIdle ? (unit.activity ? 'PATROL' : 'FREE') : unit.state === 'transporting' ? 'TRANS' : unit.state.substring(0, 5).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-900 rounded-full h-1 mt-1.5 mb-0.5 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full ${unit.fuel > 50 ? 'bg-emerald-500' : unit.fuel > 20 ? 'bg-yellow-500' : 'bg-red-500'} transition-all`} 
                        style={{ width: `${Math.max(0, unit.fuel)}%` }} 
                      />
                    </div>
                    
                    {unit.activity ? (
                      <div className="text-[9px] italic text-slate-400 truncate" title={unit.activity}>
                         {unit.activity}
                      </div>
                    ) : unit.state === 'transporting' ? (
                      <div className="text-[9px] italic text-slate-400 truncate">
                        Spre bază
                      </div>
                    ) : unit.targetIncidentId ? (
                      <div className="text-[9px] italic text-slate-400 truncate">
                        Inc. {unit.targetIncidentId}
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
          </>
        ) : (
          <div className="space-y-2">
            {(gameState.logs || []).map(log => (
              <div key={log.id} className="p-2 bg-slate-800/40 border border-slate-700/50 rounded flex flex-col gap-1 text-[10px]">
                <div className="flex justify-between items-center opacity-50 font-mono">
                  <span>{formatGameTime(log.timestamp)}</span>
                </div>
                <div className={`
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'warning' ? 'text-yellow-400' : ''}
                  ${log.type === 'success' ? 'text-emerald-400' : ''}
                  ${log.type === 'info' ? 'text-sky-400' : ''}
                `}>
                  {log.message}
                </div>
              </div>
            ))}
            {(!gameState.logs || gameState.logs.length === 0) && (
              <div className="text-center text-slate-500 text-xs italic mt-4">Niciun eveniment recent.</div>
            )}
          </div>
        )}
      </div>
      <div className="p-2 bg-slate-800/50 border-t border-slate-800 shrink-0">
         <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Purchase Units</div>
         <div className="grid grid-cols-2 gap-1 text-[9px] uppercase font-bold text-center">
            <button onClick={() => onPurchase('police')} className="bg-slate-800 border border-slate-700 hover:bg-blue-900/40 hover:border-blue-700 text-slate-300 p-1 rounded transition-colors">
              Poliție<br/><span className="text-emerald-500">€15k</span>
            </button>
            <button onClick={() => onPurchase('ambulance')} className="bg-slate-800 border border-slate-700 hover:bg-emerald-900/40 hover:border-emerald-700 text-slate-300 p-1 rounded transition-colors">
              Ambulanță<br/><span className="text-emerald-500">€25k</span>
            </button>
            <button onClick={() => onPurchase('fire')} className="bg-slate-800 border border-slate-700 hover:bg-red-900/40 hover:border-red-700 text-slate-300 p-1 rounded transition-colors">
              Pompieri<br/><span className="text-emerald-500">€40k</span>
            </button>
            <button onClick={() => onPurchase('gendarmerie')} className="bg-slate-800 border border-slate-700 hover:bg-indigo-900/40 hover:border-indigo-700 text-slate-300 p-1 rounded transition-colors">
              Jandarmi<br/><span className="text-emerald-500">€20k</span>
            </button>
            <button onClick={() => onPurchase('swat')} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 text-slate-300 p-1 rounded transition-colors">
              SIAS<br/><span className="text-emerald-500">€35k</span>
            </button>
            <button onClick={() => onPurchase('helicopter')} className="bg-slate-800 border border-slate-700 hover:bg-sky-900/40 hover:border-sky-700 text-slate-300 p-1 rounded transition-colors">
              Elicopter<br/><span className="text-emerald-500">€100k</span>
            </button>
         </div>
         <div className="mt-2 pt-2 border-t border-slate-700/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] uppercase font-bold text-slate-500">Rată Incidente</span>
              <span className="text-[9px] uppercase font-bold text-sky-400">x{gameState.incidentRate || 1}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onSetIncidentRate(0.5)} className={`flex-1 text-[9px] font-bold p-1 rounded border ${gameState.incidentRate === 0.5 ? 'bg-sky-900/40 border-sky-700 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>0.5x</button>
              <button onClick={() => onSetIncidentRate(1)} className={`flex-1 text-[9px] font-bold p-1 rounded border ${gameState.incidentRate === 1 ? 'bg-sky-900/40 border-sky-700 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>1x</button>
              <button onClick={() => onSetIncidentRate(2)} className={`flex-1 text-[9px] font-bold p-1 rounded border ${gameState.incidentRate === 2 ? 'bg-sky-900/40 border-sky-700 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>2x</button>
              <button onClick={() => onSetIncidentRate(5)} className={`flex-1 text-[9px] font-bold p-1 rounded border ${gameState.incidentRate === 5 ? 'bg-sky-900/40 border-sky-700 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>5x</button>
            </div>
         </div>
         <div className="mt-2 pt-2 border-t border-slate-700/50 flex gap-2">
            <button onClick={onRentOperator} className="flex-1 bg-fuchsia-900/40 border border-fuchsia-800 hover:bg-fuchsia-800/60 hover:border-fuchsia-500 text-fuchsia-300 p-1.5 rounded transition-colors text-[10px] uppercase font-bold tracking-widest flex flex-col items-center justify-center">
              <span>Operator AI</span>
              <span className="text-emerald-500 text-[8px]">€15k/4h</span>
            </button>
            <button onClick={onRefuelAll} className="flex-1 bg-orange-900/40 border border-orange-800 hover:bg-orange-800/60 hover:border-orange-500 text-orange-300 p-1.5 rounded transition-colors text-[10px] uppercase font-bold tracking-widest flex flex-col items-center justify-center">
              <span>Realimentare Gen.</span>
              <span className="text-emerald-500 text-[8px]">€500/unit</span>
            </button>
         </div>
      </div>
    </div>
  );
}

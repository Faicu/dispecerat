import { useState } from 'react';
import { GameState, UnitType } from '../types';
import { motion } from 'motion/react';
import { UNIT_THEME, UNIT_ORDER, UNIT_PRICES, RENT_OPERATOR_COST, REFUEL_ALL_COST_PER_UNIT } from '../constants';
import { formatGameTime } from '../utils';

const IDLE_STYLES = {
  bg: 'bg-slate-800',
  border: 'border-slate-700',
  title: 'text-white',
  badge: 'text-emerald-400 bg-transparent',
  bar: 'bg-emerald-500',
};

const getUnitStyles = (type: UnitType, isIdle: boolean) => (isIdle ? IDLE_STYLES : UNIT_THEME[type]);

export default function LeftSidebar({ gameState, onPurchase, onRentOperator, onFireOperator, onSetIncidentRate, onRefuelAll }: { gameState: GameState, onPurchase: (type: UnitType) => void, onRentOperator: () => void, onFireOperator: () => void, onSetIncidentRate: (rate: number) => void, onRefuelAll: () => void }) {
  const [activeTab, setActiveTab] = useState<'units' | 'logs'>('units');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['police', 'fire', 'ambulance', 'gendarmerie', 'swat', 'helicopter']);
  const [showPurchaseMenu, setShowPurchaseMenu] = useState(false);
  const toggleCategory = (type: string) => setExpandedCategories(prev => prev.includes(type) ? prev.filter(c => c !== type) : [...prev, type]);
  const unitsList = Object.values(gameState.units || {});

  const groupedUnits: Record<UnitType, typeof unitsList> = {
    police: unitsList.filter(u => u.type === 'police'),
    gendarmerie: unitsList.filter(u => u.type === 'gendarmerie'),
    swat: unitsList.filter(u => u.type === 'swat'),
    helicopter: unitsList.filter(u => u.type === 'helicopter'),
    ambulance: unitsList.filter(u => u.type === 'ambulance'),
    fire: unitsList.filter(u => u.type === 'fire'),
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
        {gameState.suggestions && gameState.suggestions.length > 0 && (
          <div className="space-y-1 mb-2">
            {gameState.suggestions.map((s, i) => (
              <div key={i} className="bg-orange-900/40 border border-orange-800/50 text-orange-400 text-[9px] p-2 rounded flex items-center gap-2 font-bold leading-tight animate-pulse">
                {s}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'units' ? (
          <>
            {UNIT_ORDER.map((type) => {
          const units = groupedUnits[type];
          if (units.length === 0) return null;
          return (
            <div key={type} className="space-y-2">
              <div onClick={() => toggleCategory(type)} className="cursor-pointer text-[9px] uppercase font-bold text-slate-400 bg-slate-800/40 p-1.5 rounded flex justify-between items-center hover:bg-slate-800/80 transition-colors">
                <span>{UNIT_THEME[type].label} ({units.filter(u => u.state === 'idle').length}/{units.length})</span>
                <span>{expandedCategories.includes(type) ? '▲' : '▼'}</span>
              </div>
              {expandedCategories.includes(type) && units.map(unit => {
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
         
         <button onClick={() => setShowPurchaseMenu(!showPurchaseMenu)} className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 p-2 rounded text-[10px] uppercase font-bold tracking-widest transition-colors">
            {showPurchaseMenu ? 'Ascunde Magazin' : 'Magazin Unități'}
         </button>
         {showPurchaseMenu && (
           <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] uppercase font-bold text-center">
              {(['police', 'ambulance', 'fire', 'gendarmerie', 'swat', 'helicopter'] as UnitType[]).map(type => {
                const canAfford = gameState.budget >= UNIT_PRICES[type];
                return (
                  <button
                    key={type}
                    onClick={() => onPurchase(type)}
                    disabled={!canAfford}
                    className={`border p-1 rounded transition-colors ${canAfford ? `bg-slate-800 border-slate-700 text-slate-300 ${UNIT_THEME[type].hoverClasses}` : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'}`}
                  >
                    {UNIT_THEME[type].label.split(' ')[0]}<br/><span className={canAfford ? 'text-emerald-500' : 'text-slate-600'}>€{UNIT_PRICES[type] / 1000}k</span>
                  </button>
                );
              })}
           </div>
         )}
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
            {(gameState.rentedOperators && gameState.rentedOperators.length > 0) ? (
              <button onClick={onFireOperator} className="flex-1 bg-red-900/40 border border-red-800 hover:bg-red-800/60 hover:border-red-500 text-red-300 p-1.5 rounded transition-colors text-[10px] uppercase font-bold tracking-widest flex flex-col items-center justify-center">
                <span>Concediază</span>
                <span className="text-red-400 text-[8px]">Operator AI</span>
              </button>
            ) : (
              <button onClick={onRentOperator} className="flex-1 bg-fuchsia-900/40 border border-fuchsia-800 hover:bg-fuchsia-800/60 hover:border-fuchsia-500 text-fuchsia-300 p-1.5 rounded transition-colors text-[10px] uppercase font-bold tracking-widest flex flex-col items-center justify-center">
                <span>Operator AI</span>
                <span className="text-emerald-500 text-[8px]">€3k/min</span>
              </button>
            )}
            <button onClick={onRefuelAll} className="flex-1 bg-orange-900/40 border border-orange-800 hover:bg-orange-800/60 hover:border-orange-500 text-orange-300 p-1.5 rounded transition-colors text-[10px] uppercase font-bold tracking-widest flex flex-col items-center justify-center">
              <span>Realimentare Gen.</span>
              <span className="text-emerald-500 text-[8px]">€{REFUEL_ALL_COST_PER_UNIT}/unit</span>
            </button>
         </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { GameState, UnitType, OperatorRole } from '../types';
import { motion } from 'motion/react';
import { UNIT_THEME, UNIT_ORDER, UNIT_PRICES, RENT_OPERATOR_COST, REFUEL_ALL_COST_PER_UNIT } from '../constants';
import { formatGameTime } from '../utils';
import { Shield, AlertTriangle, FileText, ChevronRight, ChevronLeft, ShoppingCart } from 'lucide-react';

const IDLE_STYLES = {
  bg: 'bg-slate-800',
  border: 'border-slate-700',
  title: 'text-white',
  badge: 'text-emerald-400 bg-transparent',
  bar: 'bg-emerald-500',
};

const getUnitStyles = (type: UnitType, isIdle: boolean) => (isIdle ? IDLE_STYLES : UNIT_THEME[type]);

interface LeftSidebarProps {
  gameState: GameState;
  onPurchase: (type: UnitType) => void;
  onRefuelAll: () => void;
  playerRoles: OperatorRole[];
  activeTab: 'units' | 'logs' | 'incidents';
  onTabChange: (tab: 'units' | 'logs' | 'incidents') => void;
  incidentListContent?: React.ReactNode;
  selectedUnitId?: string | null;
  onSelectUnit?: (id: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function LeftSidebar({
  gameState,
  onPurchase,
  onRefuelAll,
  playerRoles,
  activeTab,
  onTabChange,
  incidentListContent,
  selectedUnitId,
  onSelectUnit,
  isCollapsed = false,
  onToggleCollapse,
}: LeftSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'police', 'fire', 'ambulance', 'gendarmerie', 'swat', 'helicopter',
  ]);
  const [showPurchaseMenu, setShowPurchaseMenu] = useState(false);

  const toggleCategory = (type: string) =>
    setExpandedCategories(prev =>
      prev.includes(type) ? prev.filter(c => c !== type) : [...prev, type]
    );

  const getRoleForUnitType = (t: string): OperatorRole | null => {
    if (t === 'police' || t === 'swat' || t === 'helicopter') return 'police';
    if (t === 'fire') return 'fire';
    if (t === 'ambulance') return 'ambulance';
    if (t === 'gendarmerie') return 'gendarmerie';
    return null;
  };

  const unitsList = Object.values(gameState.units || {});
  const filteredUnitsList = unitsList.filter(u => {
    const role = getRoleForUnitType(u.type);
    return role && playerRoles.includes(role);
  });

  const groupedUnits: Record<UnitType, typeof filteredUnitsList> = {
    police: filteredUnitsList.filter(u => u.type === 'police'),
    gendarmerie: filteredUnitsList.filter(u => u.type === 'gendarmerie'),
    swat: filteredUnitsList.filter(u => u.type === 'swat'),
    helicopter: filteredUnitsList.filter(u => u.type === 'helicopter'),
    ambulance: filteredUnitsList.filter(u => u.type === 'ambulance'),
    fire: filteredUnitsList.filter(u => u.type === 'fire'),
  };

  const activeIncidentCount = Object.values(gameState.incidents || {}).filter(
    i => !i.resolved && !(i.isPhoneCall && i.callStatus !== 'completed')
  ).length;

  const busyUnitCount = filteredUnitsList.filter(
    u => u.state !== 'idle' && u.state !== 'patrolling'
  ).length;

  // ── Collapsed icon rail (desktop only) ─────────────────────────────────────
  if (isCollapsed) {
    return (
      <div className="hidden md:flex w-14 h-full flex-col bg-slate-900/80 border-r border-slate-800 shrink-0">
        {/* Expand toggle */}
        <button
          onClick={onToggleCollapse}
          title="Extinde meniu lateral"
          className="h-11 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 border-b border-slate-800 transition-colors shrink-0"
        >
          <ChevronRight size={18} />
        </button>

        {/* Tab icon: Units */}
        <button
          onClick={() => { onTabChange('units'); onToggleCollapse?.(); }}
          title={`Unități (${filteredUnitsList.length})`}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-4 transition-colors hover:bg-slate-800 ${activeTab === 'units' ? 'text-sky-400 bg-slate-800/60' : 'text-slate-500'}`}
        >
          <Shield size={20} />
          {busyUnitCount > 0 && (
            <span className="absolute top-2.5 right-2 w-4 h-4 rounded-full bg-orange-500 text-[8px] font-bold text-white flex items-center justify-center">
              {busyUnitCount > 9 ? '9+' : busyUnitCount}
            </span>
          )}
          <span className="text-[8px] font-bold uppercase tracking-tight">{filteredUnitsList.length}</span>
        </button>

        {/* Tab icon: Incidents */}
        <button
          onClick={() => { onTabChange('incidents'); onToggleCollapse?.(); }}
          title={`Incidente (${activeIncidentCount})`}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-4 transition-colors hover:bg-slate-800 ${activeTab === 'incidents' ? 'text-red-400 bg-slate-800/60' : 'text-slate-500'}`}
        >
          <AlertTriangle size={20} />
          {activeIncidentCount > 0 && (
            <span className="absolute top-2.5 right-2 w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
              {activeIncidentCount > 9 ? '9+' : activeIncidentCount}
            </span>
          )}
          <span className="text-[8px] font-bold uppercase tracking-tight">{activeIncidentCount}</span>
        </button>

        {/* Tab icon: Logs */}
        <button
          onClick={() => { onTabChange('logs'); onToggleCollapse?.(); }}
          title="Jurnal Evenimente"
          className={`flex flex-col items-center justify-center gap-0.5 py-4 transition-colors hover:bg-slate-800 ${activeTab === 'logs' ? 'text-yellow-400 bg-slate-800/60' : 'text-slate-500'}`}
        >
          <FileText size={20} />
          <span className="text-[8px] font-bold uppercase tracking-tight">Log</span>
        </button>

        {/* Shop shortcut */}
        <button
          onClick={() => { onToggleCollapse?.(); setTimeout(() => setShowPurchaseMenu(true), 210); }}
          title="Magazin Unități"
          className="flex flex-col items-center justify-center gap-0.5 py-4 transition-colors hover:bg-slate-800 text-slate-500 hover:text-emerald-400 mt-auto border-t border-slate-800"
        >
          <ShoppingCart size={18} />
          <span className="text-[8px] font-bold uppercase tracking-tight">Shop</span>
        </button>
      </div>
    );
  }

  // ── Expanded sidebar ────────────────────────────────────────────────────────
  return (
    <div className="w-full shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col z-10 relative h-full overflow-hidden">
      {/* Tab bar with collapse button */}
      <div className="flex border-b border-slate-800 bg-slate-800/80 text-[10px] font-bold uppercase tracking-wider shrink-0">
        <button
          onClick={() => onTabChange('units')}
          className={`flex-1 px-2 py-2.5 text-center truncate transition-colors ${activeTab === 'units' ? 'text-blue-400 border-b-2 border-blue-500 font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Unități ({filteredUnitsList.length})
        </button>
        <button
          onClick={() => onTabChange('logs')}
          className={`flex-1 px-2 py-2.5 text-center truncate transition-colors ${activeTab === 'logs' ? 'text-blue-400 border-b-2 border-blue-500 font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Jurnal
        </button>
        <button
          onClick={() => onTabChange('incidents')}
          className={`flex-1 px-2 py-2.5 text-center truncate transition-colors ${activeTab === 'incidents' ? 'text-blue-400 border-b-2 border-blue-500 font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Incidente
        </button>
        {/* Collapse toggle — desktop only */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Ascunde meniu lateral"
            className="hidden md:flex px-3 items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 border-l border-slate-700 transition-colors shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      <div className={`flex-1 ${activeTab === 'incidents' ? 'flex flex-col overflow-hidden min-h-0' : 'p-2 space-y-4 overflow-y-auto'}`}>
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
            {UNIT_ORDER.map(type => {
              const units = groupedUnits[type];
              if (units.length === 0) return null;
              return (
                <div key={type} className="space-y-2">
                  <div
                    onClick={() => toggleCategory(type)}
                    className="cursor-pointer text-[9px] uppercase font-bold text-slate-400 bg-slate-800/40 p-1.5 rounded flex justify-between items-center hover:bg-slate-800/80 transition-colors"
                  >
                    <span>{UNIT_THEME[type].label} ({units.filter(u => u.state === 'idle').length}/{units.length})</span>
                    <span>{expandedCategories.includes(type) ? '▲' : '▼'}</span>
                  </div>
                  {expandedCategories.includes(type) && units.map(unit => {
                    const isIdle = unit.state === 'idle';
                    const isSelected = selectedUnitId === unit.id;
                    const styles = getUnitStyles(unit.type, isIdle);
                    return (
                      <motion.div
                        layout
                        key={unit.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => onSelectUnit && onSelectUnit(unit.id)}
                        className={`px-2 py-1.5 ${styles.bg} border ${isSelected ? 'border-sky-400 ring-1 ring-sky-400 bg-sky-950/40' : styles.border} rounded cursor-pointer transition-colors flex flex-col hover:border-slate-500`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold uppercase ${styles.title} truncate mr-2`} title={unit.name}>
                            {unit.name}
                          </span>
                          <span className={`text-[8px] px-1 font-bold tracking-wider ${styles.badge} flex-shrink-0 rounded-sm`}>
                            {unit.state === 'on_break' ? 'TURĂ' : isIdle ? (unit.activity ? 'PATROL' : 'FREE') : unit.state === 'transporting' ? 'TRANS' : unit.state.substring(0, 5).toUpperCase()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 mt-1.5 mb-0.5 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${unit.fuel > 50 ? 'bg-emerald-500' : unit.fuel > 20 ? 'bg-yellow-500' : 'bg-red-500'} transition-all`}
                            style={{ width: `${Math.max(0, unit.fuel)}%` }}
                          />
                        </div>
                        {unit.activity ? (
                          <div className="text-[9px] italic text-slate-400 truncate" title={unit.activity}>{unit.activity}</div>
                        ) : unit.state === 'transporting' ? (
                          <div className="text-[9px] italic text-slate-400 truncate">Spre bază</div>
                        ) : unit.targetIncidentId ? (
                          <div className="text-[9px] italic text-slate-400 truncate">Inc. {unit.targetIncidentId}</div>
                        ) : null}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </>
        ) : activeTab === 'logs' ? (
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
        ) : (
          <div className="h-full relative">{incidentListContent}</div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-2 bg-slate-800/50 border-t border-slate-800 shrink-0">
        <button
          onClick={() => setShowPurchaseMenu(!showPurchaseMenu)}
          className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 p-2 rounded text-[10px] uppercase font-bold tracking-widest transition-colors"
        >
          {showPurchaseMenu ? 'Ascunde Magazin' : 'Magazin Unități'}
        </button>
        {showPurchaseMenu && (
          <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] uppercase font-bold text-center">
            {(['police', 'ambulance', 'fire', 'gendarmerie', 'swat', 'helicopter'] as UnitType[])
              .filter(type => {
                const role = getRoleForUnitType(type);
                return role && playerRoles.includes(role);
              })
              .map(type => {
                const canAfford = gameState.budget >= UNIT_PRICES[type];
                return (
                  <button
                    key={type}
                    onClick={() => onPurchase(type)}
                    disabled={!canAfford}
                    className={`border p-1 rounded transition-colors ${canAfford ? `bg-slate-800 border-slate-700 text-slate-300 ${UNIT_THEME[type].hoverClasses}` : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'}`}
                  >
                    {UNIT_THEME[type].label.split(' ')[0]}<br />
                    <span className={canAfford ? 'text-emerald-500' : 'text-slate-600'}>€{UNIT_PRICES[type] / 1000}k</span>
                  </button>
                );
              })}
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-slate-700/50 flex gap-2">
          <button
            onClick={onRefuelAll}
            className="flex-1 bg-orange-900/40 border border-orange-800 hover:bg-orange-800/60 hover:border-orange-500 text-orange-300 p-1.5 rounded transition-colors text-[10px] uppercase font-bold tracking-widest flex flex-col items-center justify-center"
          >
            <span>Realimentare Gen.</span>
            <span className="text-emerald-500 text-[8px]">€{REFUEL_ALL_COST_PER_UNIT}/unit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Phone, PhoneCall as PhoneCallIcon, PhoneOff, Send, Shield, Flame, Heart, Users } from 'lucide-react';
import { GameState, OperatorRole } from '../types';

interface PhoneCallModalProps {
  gameState: GameState;
  playerName: string;
  playerRoles?: OperatorRole[];
  onSelectIncident?: (incidentId: string) => void;
  onAnswer: (incidentId: string) => void;
  onProgress: (incidentId: string, nextStep: number | 'dispatch') => void;
  onDispatch: (unitId: string, incidentId: string) => void;
}

const AGENCY_META: Record<string, { label: string; icon: React.ReactNode; color: string; ring: string }> = {
  police:       { label: 'Poliție',     icon: <Shield size={18} />,  color: 'text-blue-400',   ring: 'border-blue-500' },
  fire:         { label: 'Pompieri',    icon: <Flame size={18} />,   color: 'text-orange-400', ring: 'border-orange-500' },
  ambulance:    { label: 'SMURD/SAJ',   icon: <Heart size={18} />,   color: 'text-red-400',    ring: 'border-red-500' },
  gendarmerie:  { label: 'Jandarmi',    icon: <Users size={18} />,   color: 'text-green-400',  ring: 'border-green-500' },
};

const getRoleForUnitType = (t: string) => {
  if (t === 'police' || t === 'swat' || t === 'helicopter') return 'police';
  if (t === 'fire') return 'fire';
  if (t === 'ambulance') return 'ambulance';
  if (t === 'gendarmerie') return 'gendarmerie';
  return null;
};

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({
  gameState, playerName, playerRoles = [],
  onSelectIncident, onAnswer, onProgress, onDispatch,
}) => {
  const [_activeCallId, setActiveCallId] = useState<string | null>(null);

  const allIncidents = Object.values(gameState.incidents || {});

  // Only show ringing calls that belong to this operator's agency
  const ringingCalls = allIncidents.filter(i =>
    i.isPhoneCall &&
    i.callStatus === 'ringing' &&
    (playerRoles.length === 0 || (i.primaryAgency && playerRoles.includes(i.primaryAgency as OperatorRole)))
  );

  const answeredCalls = allIncidents.filter(i =>
    i.isPhoneCall && i.callStatus === 'answered' && i.primaryOperator === playerName
  );

  if (ringingCalls.length === 0 && answeredCalls.length === 0) {
    return null;
  }

  const displayCall = answeredCalls.length > 0 ? answeredCalls[0] : ringingCalls[0];
  const agency = AGENCY_META[displayCall.primaryAgency ?? ''] ?? AGENCY_META['police'];

  const handleAnswer = () => {
    setActiveCallId(displayCall.id);
    if (onSelectIncident) onSelectIncident(displayCall.id);
    onAnswer(displayCall.id);
  };

  const handleOption = (nextStep: number | 'dispatch') => {
    if (onSelectIncident) onSelectIncident(displayCall.id);
    onProgress(displayCall.id, nextStep);
  };

  const hasRoleForUnit = (type: string) => {
    if (playerRoles.length === 0) return true;
    const role = getRoleForUnitType(type);
    return role ? playerRoles.includes(role as OperatorRole) : false;
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 pointer-events-auto">
      <div className={`bg-slate-900 border ${agency.ring} p-4 sm:p-6 rounded-2xl shadow-2xl max-w-md w-full max-h-[88vh] overflow-y-auto relative z-10`}>

        {displayCall.callStatus === 'ringing' ? (
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse mb-3`}>
              <PhoneCallIcon className="text-green-500 animate-bounce" size={40} />
            </div>

            {/* Agency badge */}
            <div className={`flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full bg-slate-800 border ${agency.ring} ${agency.color} text-xs font-bold uppercase tracking-wider`}>
              {agency.icon}
              <span>{agency.label}</span>
            </div>

            <h2 className="text-xl text-white font-bold mb-1">Apel de urgență 112</h2>
            <p className="text-slate-400 mb-2 text-center text-sm font-semibold">{displayCall.name}</p>
            <p className="text-slate-500 mb-7 text-center text-xs leading-snug">{displayCall.description}</p>

            <button
              onClick={handleAnswer}
              className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-green-900/50"
            >
              <Phone size={20} /> Răspunde Apel
            </button>
          </div>

        ) : (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className={`w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center ${agency.color}`}>
                {agency.icon}
              </div>
              <div>
                <h2 className="text-white font-bold">{displayCall.name}</h2>
                <p className="text-slate-400 text-xs">
                  <span className={`font-semibold ${agency.color}`}>{agency.label}</span>
                  {' · '}Operator: {playerName}
                </p>
              </div>
            </div>

            {/* Dialogue */}
            {displayCall.callerDialogue &&
             displayCall.currentDialogueStep !== undefined &&
             displayCall.callerDialogue[displayCall.currentDialogueStep] ? (
              <div className="mb-6">
                <div className={`bg-slate-800 p-4 rounded-xl text-white mb-4 rounded-tl-none border-l-4 ${agency.ring} font-medium text-sm leading-relaxed`}>
                  "{displayCall.callerDialogue[displayCall.currentDialogueStep].text}"
                </div>
                <div className="flex flex-col gap-2">
                  {displayCall.callerDialogue[displayCall.currentDialogueStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOption(opt.nextStep)}
                      className="bg-slate-800 hover:bg-slate-700 text-left p-3 rounded-xl text-slate-200 transition-colors border border-slate-700 hover:border-slate-500 cursor-pointer text-sm"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-slate-300 mb-4 text-center text-sm">Apelul a fost preluat. Alegeți unitățile pentru dispecerizare:</p>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                  {Object.values(gameState.units)
                    .filter(u => (u.state === 'idle' || u.state === 'patrolling') && hasRoleForUnit(u.type))
                    .map(unit => {
                      const isAssigned = displayCall.assignedUnits.includes(unit.id);
                      const isNeeded = displayCall.requiredUnits.includes(unit.type);
                      return (
                        <div key={unit.id} className="bg-slate-800 p-2 rounded-lg flex items-center justify-between">
                          <div>
                            <span className="text-white font-bold text-sm block">{unit.name}</span>
                            <span className="text-slate-400 text-xs uppercase">{unit.type}</span>
                          </div>
                          <button
                            onClick={() => onDispatch(unit.id, displayCall.id)}
                            disabled={isAssigned}
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              isAssigned
                                ? 'bg-green-500/20 text-green-400'
                                : isNeeded
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            }`}
                          >
                            {isAssigned ? 'Trimis' : <><Send size={12} /> Trimite</>}
                          </button>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => handleOption('dispatch')}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-6 py-2 rounded-full font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <PhoneOff size={16} /> Închide apelul (Finalizat)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

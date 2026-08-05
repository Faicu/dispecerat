import React, { useState } from 'react';
import { Phone, PhoneCall as PhoneCallIcon, PhoneOff, Send } from 'lucide-react';
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

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({ gameState, playerName, playerRoles = [], onSelectIncident, onAnswer, onProgress, onDispatch }) => {
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  const ringingCalls = Object.values(gameState.incidents || {}).filter(i => i.isPhoneCall && i.callStatus === 'ringing');
  const answeredCalls = Object.values(gameState.incidents || {}).filter(i => i.isPhoneCall && i.callStatus === 'answered' && i.primaryOperator === playerName);

  if (ringingCalls.length === 0 && answeredCalls.length === 0) {
    return null;
  }

  // Choose which call to display. Prioritize answered calls for this operator, else a ringing call.
  const displayCall = answeredCalls.length > 0 ? answeredCalls[0] : ringingCalls[0];

  const handleAnswer = () => {
    if (onSelectIncident) onSelectIncident(displayCall.id);
    onAnswer(displayCall.id);
  };

  const handleOption = (nextStep: number | 'dispatch') => {
    if (onSelectIncident) onSelectIncident(displayCall.id);
    onProgress(displayCall.id, nextStep);
  };

  const getRoleForUnitType = (t: string) => {
    if (t === 'police' || t === 'swat' || t === 'helicopter') return 'police';
    if (t === 'fire') return 'fire';
    if (t === 'ambulance') return 'ambulance';
    if (t === 'gendarmerie') return 'gendarmerie';
    return null;
  };

  const hasRoleForUnit = (type: string) => {
    if (playerRoles.length === 0) return true;
    const role = getRoleForUnitType(type);
    return role ? playerRoles.includes(role as OperatorRole) : false;
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 p-4 sm:p-6 rounded-2xl shadow-2xl max-w-md w-full max-h-[88vh] overflow-y-auto relative z-10">
        
        {displayCall.callStatus === 'ringing' ? (
          <div className="flex flex-col items-center">
             <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse mb-4">
               <PhoneCallIcon className="text-green-500 animate-bounce" size={40} />
             </div>
             <h2 className="text-xl text-white font-bold mb-2">Apel de urgență 112</h2>
             <p className="text-slate-400 mb-8 text-center text-sm">Un cetățean raportează o urgență...</p>
             <button 
               onClick={handleAnswer} 
               className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-green-900/50"
             >
               <Phone size={20} /> Răspunde Apel
             </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
               <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                 <Phone className="text-green-400" size={20} />
               </div>
               <div>
                 <h2 className="text-white font-bold">Apel în desfășurare</h2>
                 <p className="text-slate-400 text-sm">Operator 112: {playerName}</p>
               </div>
            </div>

            {displayCall.callerDialogue && displayCall.currentDialogueStep !== undefined && displayCall.callerDialogue[displayCall.currentDialogueStep] ? (
              <div className="mb-6">
                <div className="bg-slate-800 p-4 rounded-xl text-white mb-4 rounded-tl-none border-l-4 border-red-500 font-medium">
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
                   {/* Dispatch UI */}
                   {Object.values(gameState.units).filter(u => (u.state === 'idle' || u.state === 'patrolling') && hasRoleForUnit(u.type)).map(unit => {
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
                           className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${isAssigned ? 'bg-green-500/20 text-green-400' : isNeeded ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                         >
                           {isAssigned ? 'Trimis' : <><Send size={12} /> Trimite</>}
                         </button>
                       </div>
                     )
                   })}
                 </div>
                 <div className="mt-4 flex justify-center">
                   <button onClick={() => handleOption('dispatch')} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-6 py-2 rounded-full font-bold flex items-center gap-2 cursor-pointer transition-colors">
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

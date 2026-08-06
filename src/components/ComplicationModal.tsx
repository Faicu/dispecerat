import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Incident } from '../types';

interface ComplicationModalProps {
  incident: Incident;
  onResolve: (incidentId: string, optionId?: string) => void;
}

export const ComplicationModal: React.FC<ComplicationModalProps> = ({ incident, onResolve }) => {
  const c = incident.complication;
  if (!c || c.resolved) return null;

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 pointer-events-auto">
      <div className="bg-slate-900 border border-red-700/70 p-5 sm:p-6 rounded-2xl shadow-2xl max-w-md w-full relative z-10 animate-in fade-in duration-200">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-red-950/80 border border-red-700/60 flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle className="text-red-400" size={22} />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-0.5">
              Decizie Manuală Necesară
            </div>
            <div className="text-white font-bold text-sm leading-tight">{incident.name}</div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-4 mb-5">
          <p className="text-red-100 text-sm leading-relaxed">{c.message}</p>
        </div>

        {/* Options */}
        {c.options ? (
          <div className="flex flex-col gap-2">
            {c.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => onResolve(incident.id, opt.id)}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle size={15} className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-200 text-sm font-medium truncate">{opt.label}</span>
                </div>
                {opt.cost > 0 && (
                  <span className="text-red-300 font-bold text-xs shrink-0 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800/50">
                    -€{opt.cost.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => onResolve(incident.id)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-800/50 hover:bg-red-700/60 border border-red-700/60 hover:border-red-500 transition-colors text-red-100 font-bold text-sm cursor-pointer"
          >
            <XCircle size={17} />
            {c.actionLabel ?? 'Confirmă Procedura'}
          </button>
        )}

        {/* Incident address */}
        {incident.address && incident.address !== 'Se localizează...' && (
          <p className="text-slate-500 text-[10px] text-center mt-3 font-mono">
            📍 {incident.address}
          </p>
        )}
      </div>
    </div>
  );
};

const fs = require('fs');
let code = fs.readFileSync('src/components/TopNav.tsx', 'utf8');

const s1 = '{gameState.operators.length > 1 && (';
const e1 = '{gameState.rentedOperators && gameState.rentedOperators.length > 0 && (';
if (code.includes(s1) && code.includes(e1)) {
  const replacement1 = `{gameState.operators.length > 0 && (
            <div className="flex items-center gap-2">
               <span className="opacity-40">TEAM:</span> 
               <div className="flex gap-1">
                 {gameState.operators.slice(0, 3).map((op, i) => (
                   <div key={i} title={op} className={\`w-5 h-5 rounded bg-slate-800 border \${op === playerName ? 'border-sky-500 text-sky-400' : 'border-slate-700 text-slate-400'} flex items-center justify-center text-[9px] font-bold uppercase\`}>
                     {op.substring(0, 2)}
                   </div>
                 ))}
                 {gameState.operators.length > 3 && (
                   <div className="text-[10px] text-slate-500">+{gameState.operators.length - 3}</div>
                 )}
               </div>
            </div>
          )}
          `;
  code = code.substring(0, code.indexOf(s1)) + replacement1 + code.substring(code.indexOf(e1));
}

const s2 = '{gameState.rentedOperators && gameState.rentedOperators.length > 0 && (';
const e2 = '</div>\n      </div>\n      \n      <div className="flex items-center gap-8">';
if (code.includes(s2) && code.includes(e2)) {
  const replacement2 = `{gameState.rentedOperators && gameState.rentedOperators.length > 0 && (
             <div className="flex items-center gap-1.5 bg-fuchsia-900/30 text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-800/50" title={gameState.aiStatus || 'Activ și în așteptare'}>
               <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse"></span>
               <span className="text-[9px] font-bold uppercase tracking-wider">AI ON</span>
             </div>
          )}
        `;
  code = code.substring(0, code.indexOf(s2)) + replacement2 + code.substring(code.indexOf(e2));
}

fs.writeFileSync('src/components/TopNav.tsx', code);

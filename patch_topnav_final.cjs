const fs = require('fs');
let code = fs.readFileSync('src/components/TopNav.tsx', 'utf8');

// Replace operators
code = code.replace(
  /\{gameState\.operators\.length > 1 && \([\s\S]*?<\div>\s*<\/div>\s*\)\}/,
  `{gameState.operators.length > 0 && (
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
          )}`
);

// Replace AI Op
code = code.replace(
  /\{gameState\.rentedOperators && gameState\.rentedOperators\.length > 0 && \([\s\S]*?<\div>\s*<\/div>\s*\)\}/,
  `{gameState.rentedOperators && gameState.rentedOperators.length > 0 && (
             <div className="flex items-center gap-1.5 bg-fuchsia-900/30 text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-800/50" title={gameState.aiStatus || 'Activ și în așteptare'}>
               <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse"></span>
               <span className="text-[9px] font-bold uppercase tracking-wider">AI ON</span>
             </div>
          )}`
);

fs.writeFileSync('src/components/TopNav.tsx', code);

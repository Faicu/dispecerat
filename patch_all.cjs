const fs = require('fs');

// 1. LeftSidebar.tsx
let leftCode = fs.readFileSync('src/components/LeftSidebar.tsx', 'utf8');
leftCode = leftCode.replace(
  /<span>\{UNIT_THEME\[type\]\.label\} \(\{units\.length\}\)<\/span>/,
  `<span>{UNIT_THEME[type].label} ({units.filter(u => u.state === 'idle').length}/{units.length})</span>`
);
// replace globally just in case
leftCode = leftCode.replace(/<span>\{UNIT_THEME\[type\]\.label\} \(\{units\.length\}\)<\/span>/g, `<span>{UNIT_THEME[type].label} ({units.filter(u => u.state === 'idle').length}/{units.length})</span>`);
fs.writeFileSync('src/components/LeftSidebar.tsx', leftCode);

// 2. BottomConsole.tsx
let bottomCode = fs.readFileSync('src/components/BottomConsole.tsx', 'utf8');
bottomCode = bottomCode.replace(
  /className={\`flex flex-col justify-start gap-1 \$\{unit\.state === 'idle' \? 'bg-slate-800\/80 border-slate-700 hover:bg-slate-700' : 'bg-orange-900\/20 border-orange-800\/50 hover:bg-orange-800\/40'\} border rounded text-\[10px\] text-slate-300 py-1\.5 px-2 transition-colors shadow-sm truncate text-left\`}/,
  `className={\`flex flex-col justify-start gap-1 \${unit.state === 'idle' ? 'bg-slate-800/80 border-slate-600 hover:bg-slate-700' : 'bg-orange-900/40 border-orange-800/80 hover:bg-orange-800/60'} border-2 rounded text-xs text-white py-2 px-3 transition-colors shadow-sm truncate text-left\`}`
);
bottomCode = bottomCode.replace(
  /<div className="grid grid-cols-3 gap-2 flex-1 overflow-y-auto content-start pr-2">/,
  `<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 flex-1 overflow-y-auto content-start pr-2">`
);
fs.writeFileSync('src/components/BottomConsole.tsx', bottomCode);

// 3. RightSidebar.tsx
let rightCode = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');
rightCode = rightCode.replace(
  /<div className="flex gap-1">\s*\{incident\.requiredUnits\.map\(\(req, idx\) => \{\s*const assigned = incident\.assignedUnits\.filter\(uid => gameState\.units\[uid\]\?\.type === req\);\s*const isAssigned = assigned\.length > idx;\s*return \(\s*<div key=\{idx\} className=\{\`w-3 h-3 rounded-sm border \$\{isAssigned \? 'bg-green-500 border-green-400' : 'bg-slate-800 border-slate-600'\}\`\}><\/div>\s*\);\s*\}\)\}\s*<\/div>/,
  `<div className="flex gap-1 flex-wrap w-full mt-2">
                    {incident.requiredUnits.map((req, idx) => {
                      const assigned = incident.assignedUnits.filter(uid => gameState.units[uid]?.type === req);
                      const isAssigned = assigned.length > idx;
                      return (
                        <div key={idx} className={\`flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border \${isAssigned ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}\`}>
                          <div className={\`w-1.5 h-1.5 rounded-full \${isAssigned ? 'bg-green-500' : 'bg-slate-600'}\`}></div>
                          {req.substring(0, 3)}
                        </div>
                      );
                    })}
                  </div>`
);
fs.writeFileSync('src/components/RightSidebar.tsx', rightCode);

// 4. TopNav.tsx
let topCode = fs.readFileSync('src/components/TopNav.tsx', 'utf8');
topCode = topCode.replace(
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

topCode = topCode.replace(
  /\{gameState\.rentedOperators && gameState\.rentedOperators\.length > 0 && \([\s\S]*?<\div>\s*<\/div>\s*\)\}/,
  `{gameState.rentedOperators && gameState.rentedOperators.length > 0 && (
             <div className="flex items-center gap-1.5 bg-fuchsia-900/30 text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-800/50" title={gameState.aiStatus || 'Activ și în așteptare'}>
               <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse"></span>
               <span className="text-[9px] font-bold uppercase tracking-wider">AI ON</span>
             </div>
          )}`
);

fs.writeFileSync('src/components/TopNav.tsx', topCode);

const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
      {/* Scanline / Grain Overlay for Game Feel */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 z-50"></div>
      
      <div className="md:hidden flex bg-slate-900 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider h-16 shrink-0 pb-2 pt-1 z-40 relative">
        <button onClick={() => setMobileView('units')} className={\`flex-1 flex flex-col items-center justify-center transition-colors \${mobileView === 'units' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'}\`}>
          <Shield size={20} className="mb-1" />
          Unități
        </button>
        <button onClick={() => setMobileView('map')} className={\`flex-1 flex flex-col items-center justify-center transition-colors \${mobileView === 'map' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'}\`}>
          <MapIcon size={20} className="mb-1" />
          Hartă
        </button>
        <button onClick={() => setMobileView('incidents')} className={\`flex-1 flex flex-col items-center justify-center relative transition-colors \${mobileView === 'incidents' ? 'text-red-400' : 'text-slate-500 hover:text-slate-400'}\`}>
          <AlertTriangle size={20} className="mb-1" />
          Incidente
          {Object.keys(gameState?.incidents || {}).length > 0 && (
            <span className="absolute top-1 right-[25%] w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        <button onClick={() => setMobileView('console')} className={\`flex-1 flex flex-col items-center justify-center transition-colors \${mobileView === 'console' ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-400'}\`}>
          <Command size={20} className="mb-1" />
          Consolă
        </button>
      </div>
    </div>
  );
}

export default App;
`;

code = code.replace(
  /\s*\{\/\* Scanline \/ Grain Overlay for Game Feel \*\/\}\n\s*<div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-\[\S*\] opacity-\[\S*\] contrast-150 z-50"><\/div>\n\s*<\/div>\n\s*\);\n\s*\}\n\s*export default App;/m,
  replacement
);

// We also need to fix the wrapping of BottomConsole because it wasn't closed properly
code = code.replace(
  /onReturnToBase=\{handleReturnToBase\}\n\s*playerRoles=\{selectedRoles\}\n\s*\/>\n\s*\{\/\* Scanline/,
  `onReturnToBase={handleReturnToBase}\n        playerRoles={selectedRoles}\n      />\n      </div>\n      {/* Scanline`
);

fs.writeFileSync('src/App.tsx', code);

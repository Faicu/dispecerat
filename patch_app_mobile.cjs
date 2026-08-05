const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for mobileView
code = code.replace(
  /const \[selectedRoles, setSelectedRoles\] = useState<OperatorRole\[\]>\(\[\]\);/,
  `const [selectedRoles, setSelectedRoles] = useState<OperatorRole[]>([]);\n  const [mobileView, setMobileView] = useState<'map' | 'units' | 'incidents' | 'console'>('map');`
);

// 2. Add lucide-react imports
code = code.replace(
  /import \{ UNIT_PRICES \} from '\.\/constants';/,
  `import { UNIT_PRICES } from './constants';\nimport { Shield, Map as MapIcon, AlertTriangle, Command } from 'lucide-react';`
);

// 3. Wrap Sidebars and Content
code = code.replace(
  /<div className="flex-1 flex overflow-hidden">/,
  `<div className="flex-1 flex overflow-hidden relative">`
);

code = code.replace(
  /<LeftSidebar/,
  `<div className={\`absolute inset-0 z-30 md:relative md:w-64 md:z-0 \${mobileView === 'units' ? 'flex' : 'hidden md:flex'}\`}>\n          <LeftSidebar`
);

code = code.replace(
  /playerRoles=\{selectedRoles\}\n\s*\/>/,
  `playerRoles={selectedRoles}\n        />\n        </div>`
);

code = code.replace(
  /<div className="flex-1 relative bg-slate-900 overflow-hidden">/,
  `<div className={\`flex-1 relative bg-slate-900 overflow-hidden \${mobileView !== 'map' && mobileView !== 'console' ? 'hidden md:block' : ''}\`}>`
);

code = code.replace(
  /<RightSidebar/,
  `<div className={\`absolute inset-0 z-30 md:relative md:w-72 md:z-0 \${mobileView === 'incidents' ? 'flex' : 'hidden md:flex'}\`}>\n        <RightSidebar`
);

code = code.replace(
  /onResolveComplication=\{\(incidentId, optionId\) => socket\.emit\('resolveComplication', \{ incidentId, optionId \}\)\}\n\s*playerRoles=\{selectedRoles\}\n\s*\/>/,
  `onResolveComplication={(incidentId, optionId) => socket.emit('resolveComplication', { incidentId, optionId })}\n          playerRoles={selectedRoles}\n        />\n        </div>`
);

// 4. Wrap Bottom Console
code = code.replace(
  /<BottomConsole/,
  `<div className={\`\${mobileView === 'console' || mobileView === 'map' ? 'block' : 'hidden md:block'}\`}>\n      <BottomConsole`
);

code = code.replace(
  /onReturnToBase=\{\(unitId\) => socket\.emit\('returnToBase', \{ unitId \}\)\}\n\s*playerRoles=\{selectedRoles\}\n\s*\/>/,
  `onReturnToBase={(unitId) => socket.emit('returnToBase', { unitId })}\n        playerRoles={selectedRoles}\n      />\n      </div>`
);

// 5. Add Bottom Navigation for Mobile
const mobileNav = `
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
`;

code = code.replace(
  /<\/div>\n\s*\n\s*\}\n\s*export default App;/,
  mobileNav + '\n\n}\n\nexport default App;'
);

code = code.replace(
  /<\/div>\n\s*<\/div>\n\s*\n\s*\}\n\s*export default App;/g, // just in case it has </div>
  mobileNav + '\n\n}\n\nexport default App;'
);

fs.writeFileSync('src/App.tsx', code);

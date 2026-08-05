const fs = require('fs');
let code = fs.readFileSync('src/components/TopNav.tsx', 'utf8');

code = code.replace(
  /export default function TopNav/g,
  `import { CloudRain, CloudLightning, Snowflake, Sun } from 'lucide-react';\nexport default function TopNav`
);

code = code.replace(
  /\{WEATHER_LABELS\[gameState\.weather\] \|\| gameState\.weather\}/,
  `{gameState.weather === 'clear' && <Sun size={12} className="inline mr-1" />}
            {gameState.weather === 'rain' && <CloudRain size={12} className="inline mr-1" />}
            {gameState.weather === 'storm' && <CloudLightning size={12} className="inline mr-1" />}
            {gameState.weather === 'snow' && <Snowflake size={12} className="inline mr-1" />}
            {WEATHER_LABELS[gameState.weather] || gameState.weather}`
);

code = code.replace(
  /AI Op \(\{Math\.max.*?\h rămase\)/,
  `AI Op (-3k RON/min)`
);

code = code.replace(
  /<div className="flex items-center gap-4 bg-black\/40 px-3 py-1 rounded border border-slate-700">[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="flex items-center gap-4 bg-black/40 px-3 py-1 rounded border border-slate-700">
          <div className="flex flex-col items-end justify-center">
            <span className="text-lg font-mono text-white font-bold tracking-widest leading-tight">{realTime}</span>
          </div>
        </div>`
);

fs.writeFileSync('src/components/TopNav.tsx', code);

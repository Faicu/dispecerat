const fs = require('fs');
let code = fs.readFileSync('src/components/LeftSidebar.tsx', 'utf8');

// Display suggestions above the activeTab content
code = code.replace(
  /<div className="flex-1 p-2 space-y-4 overflow-y-auto">/,
  `<div className="flex-1 p-2 space-y-4 overflow-y-auto">
        {gameState.suggestions && gameState.suggestions.length > 0 && (
          <div className="space-y-1 mb-2">
            {gameState.suggestions.map((s, i) => (
              <div key={i} className="bg-orange-900/40 border border-orange-800/50 text-orange-400 text-[9px] p-2 rounded flex items-center gap-2 font-bold leading-tight animate-pulse">
                {s}
              </div>
            ))}
          </div>
        )}`
);

fs.writeFileSync('src/components/LeftSidebar.tsx', code);

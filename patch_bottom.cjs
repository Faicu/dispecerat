const fs = require('fs');
let code = fs.readFileSync('src/components/BottomConsole.tsx', 'utf8');

// Line 65 is for unit selection when incident is null, so wait, it shouldn't try to access incident.severity at all!
// In fact, it's just the unit status!
code = code.replace(
  /<span className=\{\`w-2 h-2 \$\{incident\.severity === 5 \? 'bg-purple-500 animate-pulse' : incident\.severity === 4 \? 'bg-red-500 animate-pulse' : incident\.severity === 3 \? 'bg-orange-500' : incident\.severity === 2 \? 'bg-yellow-500' : 'bg-blue-500'\}\`\}><\/span>/,
  '<span className="w-2 h-2 rounded-full bg-emerald-500"></span>'
);

fs.writeFileSync('src/components/BottomConsole.tsx', code);

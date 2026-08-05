const fs = require('fs');
const glob = require('glob'); // wait, I don't have glob, just use standard node modules

const files = [
  'src/components/RightSidebar.tsx',
  'src/components/BottomConsole.tsx',
  'src/components/MapView.tsx',
  'src/App.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // App.tsx
  if (file.includes('App.tsx')) {
    code = code.replace(/inc\.severity === 3/g, 'inc.severity >= 4');
  }

  // RightSidebar.tsx
  if (file.includes('RightSidebar.tsx')) {
    code = code.replace(/incident\.severity === 3/g, 'incident.severity >= 4');
    code = code.replace(/incident\.severity === 2/g, 'incident.severity === 3');
  }

  // BottomConsole.tsx
  if (file.includes('BottomConsole.tsx')) {
    code = code.replace(/incident\.severity === 3/g, 'incident.severity >= 4');
    code = code.replace(/incident\.severity === 2/g, 'incident.severity === 3');
  }

  // MapView.tsx
  if (file.includes('MapView.tsx')) {
    code = code.replace(/severity === 3/g, 'severity >= 4');
    code = code.replace(/inc\.severity === 3/g, 'inc.severity >= 4');
    code = code.replace(/inc\.severity === 2/g, 'inc.severity === 3');
  }

  fs.writeFileSync(file, code);
});

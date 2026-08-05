const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/resolvedCountPerOperator: \{\},/, 
`resolvedCountPerOperator: {},
  incidentMultiplier: 1,
  wavePhase: 'calm',
  waveTimer: 0,`);

fs.writeFileSync('src/App.tsx', code);

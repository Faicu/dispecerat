const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /incidentRate: 1,/,
  'incidentRate: 1,\n  suggestions: [],'
);
fs.writeFileSync('src/App.tsx', code);

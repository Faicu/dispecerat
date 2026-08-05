const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /        addLog\('Ai închiriat un Operator AI pentru 4 ore \(timp joc\)\.', 'success'\);\n        io\.emit\("stateUpdate", gameState\);\n      \} else if \(gameState\.rentedOperators\.length > 0\) \{\n        addLog\('Ai deja un Operator AI activ\.', 'warning'\);\n        io\.emit\("stateUpdate", gameState\);\n      \}\n    \}\);/g;

code = code.replace(regex, "");
fs.writeFileSync('server.ts', code);

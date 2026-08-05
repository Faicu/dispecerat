const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(stateChanged\) \{\s*io\.emit\("stateUpdate", gameState\);\s*\}/,
  `if (stateChanged) {
    io.emit("stateUpdate", gameState);
  }
}`
);

fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace rentOperator logic
code = code.replace(
/socket\.on\("rentOperator", \(\) => \{[\s\S]*?\}\);/,
`socket.on("rentOperator", () => {
      const INITIAL_COST = 3000;
      if (gameState.budget >= INITIAL_COST && gameState.rentedOperators.length === 0) {
        gameState.budget -= INITIAL_COST;
        gameState.rentedOperators.push({ id: \`op_\${Date.now()}\`, expiresAt: Infinity, lastActionTime: 0, lastChargeTime: Date.now() });
        addLog('Ai activat Operatorul AI (3000 RON / minut).', 'success');
        io.emit("stateUpdate", gameState);
      } else if (gameState.rentedOperators.length > 0) {
        addLog('Ai deja un Operator AI activ.', 'warning');
        io.emit("stateUpdate", gameState);
      }
    });`
);

// Update AI Operator update logic
code = code.replace(
/const initialLen = gameState\.rentedOperators\.length;[\s\S]*?const timeSinceLastAction = Date\.now\(\) - \(aiOp\.lastActionTime \|\| 0\);/g,
`  if (gameState.rentedOperators.length > 0) {
    const aiOp = gameState.rentedOperators[0];
    const timeSinceLastCharge = Date.now() - (aiOp.lastChargeTime || 0);
    if (timeSinceLastCharge >= 60000) {
        if (gameState.budget >= 3000) {
            gameState.budget -= 3000;
            aiOp.lastChargeTime = Date.now();
            stateChanged = true;
        } else {
            gameState.rentedOperators = [];
            addLog('Operatorul AI a fost dezactivat (fonduri insuficiente).', 'warning');
            stateChanged = true;
        }
    }
    const timeSinceLastAction = Date.now() - (aiOp.lastActionTime || 0);`
);

fs.writeFileSync('server.ts', code);

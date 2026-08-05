const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add suggestions to initial state
code = code.replace(
  /incidentRate: 1,/,
  `incidentRate: 1,
  suggestions: [],`
);

// Add logic in tick() to update suggestions periodically
code = code.replace(
  /if \(stateChanged\) \{[\s\S]*?io\.emit\("stateUpdate", gameState\);[\s\S]*?\}/,
  `if (Math.random() < 0.05) {
    const activeIncidents = Object.values(gameState.incidents).filter(i => !i.resolved);
    const idlePolice = Object.values(gameState.units).filter(u => u.type === 'police' && u.state === 'idle').length;
    const idleAmbulance = Object.values(gameState.units).filter(u => u.type === 'ambulance' && u.state === 'idle').length;
    const idleFire = Object.values(gameState.units).filter(u => u.type === 'fire' && u.state === 'idle').length;
    
    gameState.suggestions = [];
    if (idlePolice === 0 && activeIncidents.some(i => i.requiredUnits.includes('police'))) {
      gameState.suggestions.push("⚠️ Echipajele de poliție sunt epuizate. Achiziționează unități noi!");
    }
    if (idleAmbulance === 0 && activeIncidents.some(i => i.requiredUnits.includes('ambulance'))) {
      gameState.suggestions.push("⚠️ Nu avem ambulanțe disponibile. Victimele sunt în pericol!");
    }
    if (idleFire === 0 && activeIncidents.some(i => i.requiredUnits.includes('fire'))) {
      gameState.suggestions.push("⚠️ Echipajele ISU sunt insuficiente. Focul se extinde!");
    }
    if (gameState.budget > 100000 && idlePolice > 0 && idleAmbulance > 0) {
      gameState.suggestions.push("💡 Ai fonduri suficiente pentru un Elicopter IGAV.");
    }
    
    stateChanged = true;
  }
  
  if (stateChanged) {
    io.emit("stateUpdate", gameState);
  }`
);

fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Game time initial
code = code.replace(
  /gameTime: new Date\(\)\.setHours\(8, 0, 0, 0\),/,
  'gameTime: Date.now(),'
);

// 2. Suggestions field
code = code.replace(
  /incidentRate: 1,/,
  'incidentRate: 1,\n  suggestions: [],'
);

// 3. Tick update (game time)
code = code.replace(
  /gameState\.gameTime \+= 6000;/,
  'gameState.gameTime = Date.now();'
);

// 4. Weather accidents and speed
code = code.replace(
  /let speedMult = 1;\n\s*if \(gameState\.weather === 'rain'\) speedMult = 0\.8;\n\s*if \(gameState\.weather === 'snow'\) speedMult = 0\.6;\n\s*if \(gameState\.weather === 'storm'\) speedMult = 0\.5;/,
  `let speedMult = 1;
  if (gameState.weather === 'rain') speedMult = 0.8;
  if (gameState.weather === 'snow') speedMult = 0.6;
  if (gameState.weather === 'storm') speedMult = 0.5;
  
  if (gameState.weather !== 'clear' && unit.state === 'moving' && Math.random() < 0.0001) {
     const id = \`inc-\${Date.now()}\`;
     gameState.incidents[id] = {
        id,
        name: \`Accident Rutier (Unitate \${unit.name})\`,
        type: 'medical',
        location: { ...unit.location },
        description: \`Unitatea \${unit.name} a fost implicată într-un accident rutier din cauza condițiilor meteo nefavorabile!\`,
        imageUrl: 'https://images.unsplash.com/photo-1542282811-943ef1a647a5?auto=format&fit=crop&w=300&q=80',
        resolved: false,
        isResolving: false,
        resolutionProgress: 0,
        activities: ['Echipajul raportează un accident. Este necesară intervenția.'],
        requiredUnits: ['ambulance', 'police'],
        assignedUnits: [],
        createdAt: Date.now(),
        reward: 5000,
        severity: 3
     };
     addLog(\`🚨 ACCIDENT! Unitatea \${unit.name} a suferit un accident din cauza vremii!\`, 'error');
     unit.state = 'idle';
     unit.route = [];
     unit.targetIncidentId = null;
  }`
);

// 5. Increase complication chance
code = code.replace(
  /if \(incident\.resolutionProgress! > 40 && incident\.resolutionProgress! < 60 && !incident\.escalated && Math\.random\(\) < 0\.25\) \{/,
  'if (incident.resolutionProgress! > 40 && incident.resolutionProgress! < 60 && !incident.escalated && Math.random() < 0.6) {'
);

// 6. Fix timer expiration logic
code = code.replace(
  /if \(Date\.now\(\) - incident\.createdAt > 180000 && !incident\.isResolving\) \{/g,
  `const isAssigned = incident.assignedUnits && incident.assignedUnits.length > 0;
      const timeLimit = isAssigned ? 300000 : 60000;
      if (Date.now() - incident.createdAt > timeLimit && !incident.isResolving) {`
);

// 7. Suggestions logic at the end of tick
code = code.replace(
  /if \(stateChanged\) \{\n\s*io\.emit\("stateUpdate", gameState\);\n\s*\}/,
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

// 8. Operator logic in tick
code = code.replace(
  /const initialLen = gameState\.rentedOperators\.length;\n\s*gameState\.rentedOperators = gameState\.rentedOperators\.filter\(op => op\.expiresAt > now\);\n\s*if \(gameState\.rentedOperators\.length < initialLen\) \{\n\s*addLog\('Un operator închiriat a expirat\.', 'info'\);\n\s*stateChanged = true;\n\s*\}\n\s*if \(gameState\.rentedOperators\.length > 0\) \{\n\s*const aiOp = gameState\.rentedOperators\[0\];\n\s*const timeSinceLastAction = Date\.now\(\) - \(aiOp\.lastActionTime \|\| 0\);/,
  `if (gameState.rentedOperators.length > 0) {
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

// 9. Rent Operator socket event
code = code.replace(
  /socket\.on\("rentOperator", \(\) => \{\n\s*const COST = 15000;\n\s*if \(gameState\.budget >= COST && gameState\.rentedOperators\.length === 0\) \{\n\s*gameState\.budget -= COST;\n\s*\/\/ 4 in-game hours duration \(4 \* 60 \* 60 \* 1000 ms\)\n\s*const expiresAt = gameState\.gameTime \+ \(4 \* 60 \* 60 \* 1000\);\n\s*gameState\.rentedOperators\.push\(\{ id: \`op_\$\{Date\.now\(\)\}\`, expiresAt, lastActionTime: 0 \}\);\n\s*addLog\('Ai închiriat un Operator AI pentru 4 ore \(timp joc\)\.', 'success'\);\n\s*io\.emit\("stateUpdate", gameState\);\n\s*\} else if \(gameState\.rentedOperators\.length > 0\) \{\n\s*addLog\('Ai deja un Operator AI activ\.', 'warning'\);\n\s*io\.emit\("stateUpdate", gameState\);\n\s*\}\n\s*\}\);/,
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

fs.writeFileSync('server.ts', code);

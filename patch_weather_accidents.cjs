const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add weather accidents
code = code.replace(
  /let speedMult = 1;[\s\S]*?if \(gameState\.weather === 'storm'\) speedMult = 0\.5;/,
  `let speedMult = 1;
  if (gameState.weather === 'rain') speedMult = 0.8;
  if (gameState.weather === 'snow') speedMult = 0.6;
  if (gameState.weather === 'storm') speedMult = 0.5;
  
  if (gameState.weather !== 'clear' && unit.state === 'moving' && Math.random() < 0.0001) {
     // Accident!
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
     unit.state = 'idle'; // Stop the unit
     unit.route = [];
     unit.targetIncidentId = null;
  }`
);

// Complications frequency increase
code = code.replace(
  /if \(incident\.resolutionProgress! > 40 && incident\.resolutionProgress! < 60 && !incident\.escalated && Math\.random\(\) < 0\.25\) \{/,
  `if (incident.resolutionProgress! > 40 && incident.resolutionProgress! < 60 && !incident.escalated && Math.random() < 0.6) {`
);

fs.writeFileSync('server.ts', code);

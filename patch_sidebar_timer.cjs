const fs = require('fs');
let code = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');

code = code.replace(
  /const timeRemaining = Math\.max\(0, INCIDENT_COUNTDOWN_MS - timeElapsed\);/,
  `const countdownMs = incident.assignedUnits.length > 0 ? 300000 : 60000;
            const timeRemaining = Math.max(0, countdownMs - timeElapsed);`
);

fs.writeFileSync('src/components/RightSidebar.tsx', code);

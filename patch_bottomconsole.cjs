const fs = require('fs');
let code = fs.readFileSync('src/components/BottomConsole.tsx', 'utf8');

const originalAvailableUnits = `  const availableUnits = Object.values(gameState.units).filter(u => 
    (u.state === 'idle' || 
    u.state === 'patrolling' || 
    u.state === 'moving' || 
    u.state === 'routing' || 
    u.state === 'transporting') &&
    hasRoleForUnit(u.type)
  );`;

const newAvailableUnits = `  const availableUnits = Object.values(gameState.units).filter(u => 
    (u.state === 'idle' || 
    u.state === 'patrolling' || 
    u.state === 'moving' || 
    u.state === 'routing' || 
    u.state === 'transporting') &&
    hasRoleForUnit(u.type)
  ).sort((a, b) => {
    const aAvail = a.state === 'idle' || a.state === 'patrolling' ? 1 : 0;
    const bAvail = b.state === 'idle' || b.state === 'patrolling' ? 1 : 0;
    if (aAvail !== bAvail) return bAvail - aAvail;

    if (incident) {
      const etaA = calculateETA(a, incident.location, gameState);
      const etaB = calculateETA(b, incident.location, gameState);
      return etaA - etaB;
    }
    return 0;
  });`;

code = code.replace(originalAvailableUnits, newAvailableUnits);

// Let's also display the ETA in the dispatch button
const originalButtonContent = `              <div className="flex items-center gap-1.5 w-full">
                <div className={\`w-1.5 h-1.5 rounded-full flex-shrink-0 \${UNIT_THEME[unit.type].dot}\`}></div> 
                <span className="uppercase font-bold tracking-wide truncate">{unit.name}</span>
              </div>
              {unit.state !== 'idle' && (
                <span className="text-[8px] text-orange-400 font-mono uppercase truncate w-full pl-3">- {unit.state}</span>
              )}`;

const newButtonContent = `              <div className="flex justify-between items-center w-full gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={\`w-1.5 h-1.5 rounded-full flex-shrink-0 \${UNIT_THEME[unit.type].dot}\`}></div> 
                  <span className="uppercase font-bold tracking-wide truncate">{unit.name}</span>
                </div>
                {incident && (
                  <span className="text-[9px] text-slate-300 font-mono whitespace-nowrap">
                    {calculateETA(unit, incident.location, gameState)}s
                  </span>
                )}
              </div>
              {unit.state !== 'idle' && (
                <span className="text-[8px] text-orange-400 font-mono uppercase truncate w-full pl-3">- {unit.state}</span>
              )}`;

code = code.replace(originalButtonContent, newButtonContent);

fs.writeFileSync('src/components/BottomConsole.tsx', code);

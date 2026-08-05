import express from "express";
import http from "http";
import https from "https";
import path from "path";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GameState, Incident, Unit, Location, UnitType, IncidentType } from "./src/types";
import { loadGame, saveGame } from "./db";
import { policeStations, hospitals, fireStations, incidentTypes } from "./server/data";

const PORT = Number(process.env.PORT) || 3002;

// Bucharest boundaries
const BOUNDS = {
  minLat: 44.39,
  maxLat: 44.49,
  minLng: 26.0,
  maxLng: 26.15,
};

const getRandomLocation = (): Location => {
  return {
    lat: Math.random() * (BOUNDS.maxLat - BOUNDS.minLat) + BOUNDS.minLat,
    lng: Math.random() * (BOUNDS.maxLng - BOUNDS.minLng) + BOUNDS.minLng,
  };
};

const UNIT_SPEED = 0.0002; // Roughly map units per tick

const savedGame = loadGame();

const gameState: GameState = savedGame ? savedGame.state : {
  units: {},
  incidents: {},
  budget: 150000,
  reputation: 100,
  gameTime: new Date().setHours(8, 0, 0, 0), // Start at 08:00 AM
  weather: 'clear',
  logs: [],
  operators: [],
  rentedOperators: [],
  stations: policeStations,
  hospitals: hospitals,
  fireStations: fireStations,
  resolvedCountTotal: 0,
  resolvedCountPerOperator: {},
  incidentRate: 1,
};

// Stations/hospitals/fireStations lists are static config, always refresh them
// even when restoring a save, in case they change between deployments.
gameState.stations = policeStations;
gameState.hospitals = hospitals;
gameState.fireStations = fireStations;

let incidentIdCounter = savedGame ? savedGame.incidentIdCounter : 1;
let unitIdCounter = savedGame ? savedGame.unitIdCounter : 1;

const getRoute = async (start: Location, end: Location): Promise<Location[]> => {
  return new Promise((resolve) => {
    https.get(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.routes && json.routes.length > 0) {
            const coords = json.routes[0].geometry.coordinates;
            resolve(coords.map((c: any) => ({ lng: c[0], lat: c[1] })));
          } else {
            resolve([start, end]);
          }
        } catch (e) {
          resolve([start, end]);
        }
      });
    }).on('error', () => resolve([start, end]));
  });
};

const getAddress = async (lat: number, lng: number): Promise<string> => {
  return new Promise((resolve) => {
    https.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: { 'User-Agent': '112-Operator-Web-Game' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const road = json.address?.road || json.address?.pedestrian || json.address?.path || 'Stradă necunoscută';
          const houseNumber = json.address?.house_number || '';
          resolve(`${road}${houseNumber ? ` nr. ${houseNumber}` : ''}`);
        } catch {
          resolve('Locație necunoscută');
        }
      });
    }).on('error', () => resolve('Locație necunoscută'));
  });
};

// Spawn police units near stations (only for a fresh game; restored saves already have units)
if (!savedGame) {
policeStations.forEach((station, i) => {
  const loc = { lat: station.location.lat + (Math.random() - 0.5) * 0.005, lng: station.location.lng + (Math.random() - 0.5) * 0.005 };
  gameState.units[`u${unitIdCounter++}`] = {
    id: `u${unitIdCounter - 1}`,
    name: `P-0${i + 1} (${station.name.toUpperCase()})`,
    type: 'police',
    state: 'idle',
    location: loc,
    targetIncidentId: null,
    fuel: 100,
  };
});

// Other units
for (let i = 0; i < 8; i++) {
  gameState.units[`u${unitIdCounter++}`] = {
    id: `u${unitIdCounter - 1}`,
    name: `F-${i + 1 < 10 ? '0' : ''}${i + 1} (ISU)`,
    type: 'fire',
    state: 'idle',
    location: fireStations[i % fireStations.length].location,
    targetIncidentId: null,
    fuel: 100,
  };
}
for (let i = 0; i < 10; i++) {
  gameState.units[`u${unitIdCounter++}`] = {
    id: `u${unitIdCounter - 1}`,
    name: `M-${i + 1 < 10 ? '0' : ''}${i + 1} (SMURD / AMB)`,
    type: 'ambulance',
    state: 'idle',
    location: hospitals[i % hospitals.length].location,
    targetIncidentId: null,
    fuel: 100,
  };
}
for (let i = 0; i < 5; i++) {
  gameState.units[`u${unitIdCounter++}`] = {
    id: `u${unitIdCounter - 1}`,
    name: `J-0${i + 1} (JANDARMERIA)`,
    type: 'gendarmerie',
    state: 'idle',
    location: getRandomLocation(),
    targetIncidentId: null,
    fuel: 100,
  };
}
for (let i = 0; i < 3; i++) {
  gameState.units[`u${unitIdCounter++}`] = {
    id: `u${unitIdCounter - 1}`,
    name: `S-0${i + 1} (SIAS)`,
    type: 'swat',
    state: 'idle',
    location: getRandomLocation(),
    targetIncidentId: null,
    fuel: 100,
  };
}
for (let i = 0; i < 2; i++) {
  gameState.units[`u${unitIdCounter++}`] = {
    id: `u${unitIdCounter - 1}`,
    name: `H-0${i + 1} (IGAV)`,
    type: 'helicopter',
    state: 'idle',
    location: hospitals[0].location, // Heliport
    targetIncidentId: null,
    fuel: 100,
  };
}
}

const spawnIncident = () => {
  const template = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
  const id = `i${incidentIdCounter++}`;
  const location = getRandomLocation();
  
  gameState.incidents[id] = {
    id,
    name: template.name,
    type: template.type,
    location,
    address: 'Se localizează...',
    description: template.desc,
    imageUrl: template.img,
    resolved: false,
    isMoving: template.isMoving,
    movingTarget: template.isMoving ? getRandomLocation() : null,
    isResolving: false,
    resolutionProgress: 0,
    activities: ['Se așteaptă unitățile la fața locului.'],
    requiredUnits: [...template.req],
    assignedUnits: [],
    createdAt: Date.now(),
    reward: template.reward,
    severity: template.severity,
  };

  addLog(`Incident Nou (Cod ${template.severity}): ${template.name}`, 'warning');

  getAddress(location.lat, location.lng).then(address => {
    if (gameState.incidents[id]) {
      gameState.incidents[id].address = address;
    }
  });

  return gameState.incidents[id];
};

const addLog = (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
  const newLog = {
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: gameState.gameTime,
    message,
    type,
  };
  gameState.logs.unshift(newLog);
  if (gameState.logs.length > 50) {
    gameState.logs.pop();
  }
};

// Spawn some initial incidents (only for a fresh game)
if (!savedGame) {
  spawnIncident();
  spawnIncident();
}

const moveLocationTowards = (loc: Location, target: Location, speed: number) => {
  const dx = target.lng - loc.lng;
  const dy = target.lat - loc.lat;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < speed) {
    loc.lng = target.lng;
    loc.lat = target.lat;
    return true; // Reached
  }
  
  const vx = (dx / dist) * speed;
  const vy = (dy / dist) * speed;
  
  loc.lng += vx;
  loc.lat += vy;
  return false;
};

const moveUnitTowards = (unit: Unit, target: Location) => {
  // adjust speed based on weather
  let speedMult = 1;
  if (gameState.weather === 'rain') speedMult = 0.8;
  if (gameState.weather === 'snow') speedMult = 0.6;
  if (gameState.weather === 'storm') speedMult = 0.5;

  if (unit.fuel <= 0) speedMult *= 0.2; // very slow if out of fuel

  const speed = (unit.type === 'helicopter' ? UNIT_SPEED * 3 : UNIT_SPEED) * speedMult;
  return moveLocationTowards(unit.location, target, speed);
};

const updateWeather = () => {
  const rand = Math.random();
  let newWeather: 'clear' | 'rain' | 'storm' | 'snow' = 'clear';
  if (rand < 0.1) newWeather = 'rain';
  else if (rand < 0.15) newWeather = 'storm';
  else if (rand < 0.2) newWeather = 'snow';

  if (newWeather !== gameState.weather) {
    gameState.weather = newWeather;
    let msg = 'Vremea a devenit senină.';
    if (newWeather === 'rain') msg = 'A început ploaia. Unitățile se deplasează mai greu.';
    if (newWeather === 'storm') msg = 'Furtună severă! Vizibilitate și viteză reduse.';
    if (newWeather === 'snow') msg = 'A început să ningă. Trafic îngreunat.';
    addLog(msg, 'info');
    return true;
  }
  return false;
};

const tick = (io: Server) => {
  let stateChanged = false;

  // Time progresses: 1 tick = 6000ms in-game = 6 seconds in-game per tick (1 minute every 1 real second)
  gameState.gameTime += 6000;
  stateChanged = true;

  if (Math.random() < 0.005) { // chance to change weather
    if (updateWeather()) stateChanged = true;
  }

  // Move units
  Object.values(gameState.units).forEach((unit) => {
    // Fuel logic
    if (unit.state === 'idle') {
      if (unit.fuel < 100) {
        // Refuel faster when idle at base
        unit.fuel = Math.min(100, unit.fuel + 0.5);
        stateChanged = true;
      }
    } else if (unit.state === 'on_scene') {
      if (unit.fuel > 0) {
        unit.fuel = Math.max(0, unit.fuel - 0.002);
        stateChanged = true;
      }
    } else {
      if (unit.fuel > 0) {
        unit.fuel = Math.max(0, unit.fuel - 0.01);
        stateChanged = true;
      }
      if (unit.fuel <= 0 && unit.state === 'patrolling') {
        unit.state = 'idle';
        unit.patrolTarget = null;
        addLog(`Unitatea ${unit.name} a rămas fără combustibil în timpul patrulării.`, 'warning');
      }
    }

    // Patrolling logic
    if (unit.state === 'idle') {
      if (Math.random() < 0.005) { // Small chance to start patrolling
        unit.state = 'patrolling';
        unit.patrolTarget = getRandomLocation();
        let activities: string[] = [];
        if (unit.type === 'police' || unit.type === 'swat' || unit.type === 'gendarmerie') {
          activities = ['Patrulează în zonă', 'Legitimează o persoană', 'Verifică un vehicul suspect', 'Supraveghează traficul', 'Monitorizează zona'];
        } else if (unit.type === 'fire') {
          activities = ['Verifică un hidrant', 'Patrulare preventivă', 'Exercițiu tactic', 'Recunoaștere în teren'];
        } else if (unit.type === 'ambulance') {
          activities = ['Așteaptă apel de urgență', 'Verificare stocuri medicale', 'În așteptare pe traseu'];
        } else if (unit.type === 'helicopter') {
          activities = ['Survolare zonă', 'Monitorizare aeriană trafic', 'Patrulă aeriană'];
        }
        unit.activity = activities.length > 0 ? activities[Math.floor(Math.random() * activities.length)] : undefined;
        stateChanged = true;
      } else {
        unit.activity = undefined;
      }
    } else if (unit.state === 'patrolling' && unit.patrolTarget) {
      if (unit.route && unit.route.length > 0) {
        const target = unit.route[0];
        const reached = moveUnitTowards(unit, target);
        if (reached) {
          unit.route.shift();
          if (unit.route.length === 0) {
            unit.state = 'idle';
            unit.patrolTarget = null;
            unit.activity = undefined;
          }
        }
      } else {
        const reached = moveLocationTowards(unit.location, unit.patrolTarget, UNIT_SPEED * 0.5);
        if (reached) {
          unit.state = 'idle';
          unit.patrolTarget = null;
          unit.activity = undefined;
        }
      }
      stateChanged = true;
    } else if (unit.state === 'transporting' && unit.targetStationId) {
      if (unit.route && unit.route.length > 0) {
        const target = unit.route[0];
        const reached = moveUnitTowards(unit, target);
        if (reached) {
          unit.route.shift();
          if (unit.route.length === 0) {
             unit.state = 'idle';
             unit.targetStationId = null;
             unit.fuel = 100;
          }
        }
        stateChanged = true;
      } else {
        const allBases = [...gameState.stations, ...gameState.hospitals, ...gameState.fireStations];
        const station = allBases.find(s => s.id === unit.targetStationId);
        if (station) {
          const reached = moveUnitTowards(unit, station.location);
          if (reached) {
            unit.state = 'idle';
            unit.targetStationId = null;
            unit.fuel = 100;
          }
          stateChanged = true;
        }
      }
    } else if (unit.state === 'moving' && unit.targetIncidentId) {
      if (unit.route && unit.route.length > 0) {
        const target = unit.route[0];
        const reached = moveUnitTowards(unit, target);
        if (reached) {
          unit.route.shift(); // Remove reached waypoint
          if (unit.route.length === 0) {
             unit.state = 'on_scene';
          }
        }
        stateChanged = true;
      } else {
        // Fallback to straight line if no route
        const incident = gameState.incidents[unit.targetIncidentId];
        if (incident) {
          const reached = moveUnitTowards(unit, incident.location);
          if (reached) {
            if (incident.isMoving) {
              incident.isMoving = false; // Stopped the suspect!
              incident.activities = ['Suspect blocat în trafic. Se intervine pentru reținere.'];
            }
            unit.state = 'on_scene';
          }
          stateChanged = true;
        } else {
          unit.state = 'idle';
          unit.targetIncidentId = null;
          stateChanged = true;
        }
      }
    }
  });

  // Check moving incidents
  Object.values(gameState.incidents).forEach(incident => {
    if (incident.isMoving && !incident.resolved && !incident.isResolving && incident.movingTarget) {
      const reached = moveLocationTowards(incident.location, incident.movingTarget, UNIT_SPEED * 0.8);
      if (reached) {
        incident.movingTarget = getRandomLocation();
      }
      stateChanged = true;
    }
  });

  // Check incidents for resolution
  Object.values(gameState.incidents).forEach((incident) => {
    if (!incident.resolved) {
      if (Date.now() - incident.createdAt > 180000 && !incident.isResolving) { // 3 minutes to resolve
        // Expired
        gameState.reputation = Math.max(0, gameState.reputation - 5);
        incident.activities = ['Incidentul a expirat, apelanții nu au primit ajutor la timp!'];
        incident.resolved = true;
        addLog(`Incident Expirat: ${incident.name} (Reputație -5)`, 'error');
        
        // Release assigned units
        incident.assignedUnits.forEach(uid => {
          const unit = gameState.units[uid];
          if (unit) {
            unit.state = 'idle';
            unit.targetIncidentId = null;
          }
        });
        
        setTimeout(() => {
          delete gameState.incidents[incident.id];
        }, 5000);
        stateChanged = true;
        return;
      }
      
      // Check if all required units are on scene
      const onSceneTypes = incident.assignedUnits.map(uid => gameState.units[uid]).filter(u => u && u.state === 'on_scene').map(u => u.type);
      
      let allReqMet = true;
      const typesCount: Record<string, number> = {};
      onSceneTypes.forEach(t => typesCount[t] = (typesCount[t] || 0) + 1);
      
      const reqCount: Record<string, number> = {};
      incident.requiredUnits.forEach(t => reqCount[t] = (reqCount[t] || 0) + 1);
      
      for (const [t, count] of Object.entries(reqCount)) {
        if ((typesCount[t] || 0) < count) {
          allReqMet = false;
          break;
        }
      }

      if (allReqMet) {
        if (!incident.isResolving) {
          incident.isResolving = true;
          incident.resolutionProgress = 0;
          
          const newActivities = [];
          if (typesCount['police'] > 0) newActivities.push('Poliția securizează perimetrul și legitimează persoanele.');
          if (typesCount['swat'] > 0) newActivities.push('SIAS a pătruns în forță și neutralizează amenințarea.');
          if (typesCount['gendarmerie'] > 0) newActivities.push('Jandarmeria restabilește ordinea publică.');
          if (typesCount['fire'] > 0) newActivities.push('Pompierii au desfășurat furtunurile și intervin pentru stingere.');
          if (typesCount['ambulance'] > 0) newActivities.push('Echipajul medical acordă primul ajutor victimelor.');
          
          incident.activities = newActivities;
          stateChanged = true;
        } else {
          if (incident.complication && !incident.complication.resolved) {
            // Blocked by complication
          } else {
            incident.resolutionProgress! += 2; // +2% per tick (10 ticks/sec => 5 seconds to resolve)
            stateChanged = true;
            
            // Random chance for complication
            if (incident.resolutionProgress! > 40 && incident.resolutionProgress! < 60 && !incident.escalated && Math.random() < 0.25) {
               incident.escalated = true;
               const randChoice = Math.random();
               if (randChoice < 0.33) {
                 const possibleBackup: UnitType[] = ['police', 'ambulance', 'fire'];
                 const extraType = possibleBackup[Math.floor(Math.random() * possibleBackup.length)];
                 incident.requiredUnits.push(extraType);
                 incident.complication = {
                   message: `Situația a escaladat! Avem nevoie urgent de un echipaj suplimentar de ${extraType.toUpperCase()}.`,
                   actionLabel: 'Confirmă',
                   resolved: true 
                 };
                 incident.isResolving = false;
                 incident.activities!.unshift(`Situația a escaladat! Mai e nevoie de 1 x ${extraType.toUpperCase()}.`);
                 addLog(`Escaladare la ${incident.name}: E nevoie de 1x ${extraType.toUpperCase()}`, 'warning');
               } else if (randChoice < 0.66) {
                 incident.complication = {
                   message: 'Este necesară autorizarea dispeceratului pentru proceduri speciale.',
                   actionLabel: 'Aprobă Procedura (€1000)',
                   resolved: false
                 };
                 incident.activities!.unshift('Se așteaptă decizia dispeceratului...');
                 addLog(`Atenție! Este necesară decizia ta la ${incident.name}`, 'warning');
               } else {
                 incident.complication = {
                   message: 'Decizie tactică necesară de la dispecerat. Ce ordin dăm unităților?',
                   resolved: false,
                   options: [
                     { id: 'opt1', label: 'Abordare Precaută (-€500)', cost: 500, resultMsg: 'S-a adoptat o poziție defensivă. Victimele sunt în siguranță.', repImpact: 1 },
                     { id: 'opt2', label: 'Asalt în Forță (+€2000, Risc)', cost: 0, resultMsg: 'Intervenție brutală. Am recuperat bunuri, dar opinia publică e critică.', repImpact: -3 }
                   ]
                 };
                 incident.activities!.unshift('Așteptăm ordin tactic...');
                 addLog(`Atenție! Decizie tactică necesară la ${incident.name}`, 'warning');
               }
            }

            if (incident.resolutionProgress! >= 100) {
            incident.resolved = true;
            incident.activities = ['Incidentul a fost soluționat. Unitățile se retrag.'];
            
            gameState.resolvedCountTotal++;
            gameState.budget += incident.reward;
            gameState.reputation = Math.min(100, gameState.reputation + 2); // gain 2 rep
            addLog(`Incident Soluționat: ${incident.name} (+${incident.reward} RON, +2 Reputație)`, 'success');
            if (incident.primaryOperator) {
              gameState.resolvedCountPerOperator[incident.primaryOperator] = (gameState.resolvedCountPerOperator[incident.primaryOperator] || 0) + 1;
            }
            
            // Transport suspects/patients and return to base
            incident.assignedUnits.forEach(uid => {
              const unit = gameState.units[uid];
              if (unit) {
                unit.state = 'transporting';
                unit.targetIncidentId = null;

                let targetBase = { id: '', location: { lat: 0, lng: 0 } };
                if (unit.type === 'ambulance') {
                   let nearest = hospitals[0];
                   let minDist = Infinity;
                   for (const st of hospitals) {
                      const d = Math.pow(st.location.lat - unit.location.lat, 2) + Math.pow(st.location.lng - unit.location.lng, 2);
                      if (d < minDist) { minDist = d; nearest = st; }
                   }
                   targetBase = nearest;
                } else if (unit.type === 'fire') {
                   let nearest = fireStations[0];
                   let minDist = Infinity;
                   for (const st of fireStations) {
                      const d = Math.pow(st.location.lat - unit.location.lat, 2) + Math.pow(st.location.lng - unit.location.lng, 2);
                      if (d < minDist) { minDist = d; nearest = st; }
                   }
                   targetBase = nearest;
                } else {
                   let nearest = policeStations[0];
                   let minDist = Infinity;
                   for (const st of policeStations) {
                      const d = Math.pow(st.location.lat - unit.location.lat, 2) + Math.pow(st.location.lng - unit.location.lng, 2);
                      if (d < minDist) { minDist = d; nearest = st; }
                   }
                   targetBase = nearest;
                }

                unit.targetStationId = targetBase.id;
                
                // Find route to station in background (or fallback to straight line in next tick)
                if (unit.type === 'helicopter') {
                   unit.route = [];
                } else {
                   getRoute(unit.location, targetBase.location).then(route => {
                     if (unit.state === 'transporting' && unit.targetStationId === targetBase.id) {
                       unit.route = route;
                     }
                   });
                }
              }
            });
            
            // Remove incident after 3 seconds
            setTimeout(() => {
              const reward = incidentTypes.find(t => t.type === incident.type && t.name === incident.name)?.reward || 1000;
              gameState.budget += reward;
              delete gameState.incidents[incident.id];
            }, 3000);
          }
        }
        }
      } else {
        if (incident.isResolving) {
          incident.isResolving = false;
          incident.activities = ['Unitățile necesare au părăsit zona, se așteaptă întăriri!'];
          stateChanged = true;
        }
      }
    }
  });

  // Randomly spawn new incidents (rate based on multiplier)
  if (Math.random() < 0.002 * gameState.incidentRate && Object.keys(gameState.incidents).length < 15) {
    spawnIncident();
    stateChanged = true;
  }

  // Handle rented operators expiration and AI dispatch
  const now = gameState.gameTime;
  const initialLen = gameState.rentedOperators.length;
  gameState.rentedOperators = gameState.rentedOperators.filter(op => op.expiresAt > now);
  if (gameState.rentedOperators.length < initialLen) {
    addLog('Un operator închiriat a expirat.', 'info');
    stateChanged = true;
  }

  if (gameState.rentedOperators.length > 0) {
    const aiOp = gameState.rentedOperators[0];
    const timeSinceLastAction = Date.now() - (aiOp.lastActionTime || 0);

    if (timeSinceLastAction > 3000) {
      // AI Dispatching logic
      let dispatchedThisTick = false;
      for (const incident of Object.values(gameState.incidents)) {
        if (dispatchedThisTick) break;
        if (incident.resolved || incident.isResolving) continue;
        
        const neededUnits = [...incident.requiredUnits];
        incident.assignedUnits.forEach(uid => {
          const u = gameState.units[uid];
          if (u) {
            const idx = neededUnits.indexOf(u.type);
            if (idx !== -1) neededUnits.splice(idx, 1);
          }
        });
        
        if (neededUnits.length > 0) {
          // Try to find the closest available unit
          for (const unitType of neededUnits) {
            const idleUnits = Object.values(gameState.units).filter(u => u.type === unitType && (u.state === 'idle' || u.state === 'patrolling') && u.fuel > 20);
            if (idleUnits.length > 0) {
              // Sort by distance to incident
              idleUnits.sort((a, b) => {
                const distA = Math.pow(a.location.lng - incident.location.lng, 2) + Math.pow(a.location.lat - incident.location.lat, 2);
                const distB = Math.pow(b.location.lng - incident.location.lng, 2) + Math.pow(b.location.lat - incident.location.lat, 2);
                return distA - distB;
              });
              const idleUnit = idleUnits[0];
              idleUnit.state = 'routing';
              idleUnit.targetIncidentId = incident.id;
              idleUnit.patrolTarget = null;
              incident.assignedUnits.push(idleUnit.id);
              if (!incident.primaryOperator) {
                 incident.primaryOperator = 'AI_Operator';
              }
              if (idleUnit.type === 'helicopter' || incident.isMoving) {
                idleUnit.route = [];
                idleUnit.state = 'moving';
              } else {
                getRoute(idleUnit.location, incident.location).then(route => {
                   if (idleUnit.targetIncidentId === incident.id && idleUnit.state === 'routing') {
                     idleUnit.route = route;
                     idleUnit.state = 'moving';
                   }
                });
              }
              addLog(`Operatorul AI a alocat ${idleUnit.name} la incidentul ${incident.name}`, 'info');
              gameState.aiStatus = `A alocat ${idleUnit.name} la ${incident.name}`;
              stateChanged = true;
              dispatchedThisTick = true;
              aiOp.lastActionTime = Date.now();
              break; // dispatch one per tick to look natural
            }
          }
        }
      }
    }
  }

  if (stateChanged) {
    io.emit('stateUpdate', gameState);
  }
};

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  const connectedOperators = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // Send initial state
    socket.emit("stateUpdate", gameState);

    socket.on("join", ({ name }) => {
      connectedOperators.set(socket.id, name);
      gameState.operators = Array.from(connectedOperators.values());
      io.emit("stateUpdate", gameState);
    });

    socket.on("dispatchUnit", async ({ unitId, incidentId, operator }) => {
      const unit = gameState.units[unitId];
      const incident = gameState.incidents[incidentId];
      
      if (unit && incident && (unit.state === 'idle' || unit.state === 'patrolling' || unit.state === 'moving' || unit.state === 'routing' || unit.state === 'transporting')) {
        if (!incident.primaryOperator) {
          incident.primaryOperator = operator;
        }

        // Unassign from previous incident if any
        if (unit.targetIncidentId && unit.targetIncidentId !== incidentId) {
           const prevIncident = gameState.incidents[unit.targetIncidentId];
           if (prevIncident) {
              prevIncident.assignedUnits = prevIncident.assignedUnits.filter(uid => uid !== unitId);
           }
        }
        
        unit.state = 'routing';
        unit.patrolTarget = null;
        unit.targetStationId = null;
        unit.activity = undefined;
        unit.targetIncidentId = incidentId;
        
        if (!incident.assignedUnits.includes(unitId)) {
          incident.assignedUnits.push(unitId);
        }
        
        console.log(`Operator ${operator} dispatching unit ${unitId} to incident ${incidentId}`);
        io.emit("stateUpdate", gameState);

        if (unit.type === 'helicopter' || incident.isMoving) {
          unit.route = [];
          unit.state = 'moving';
          io.emit("stateUpdate", gameState);
        } else {
          const route = await getRoute(unit.location, incident.location);
          
          // After fetching route, check if unit wasn't reassigned or incident resolved
          if (unit.targetIncidentId === incidentId && unit.state === 'routing') {
             unit.route = route;
             unit.state = 'moving';
             io.emit("stateUpdate", gameState);
          }
        }
      }
    });

    socket.on("manualMoveUnit", async ({ unitId, targetLoc }) => {
      const unit = gameState.units[unitId];
      if (unit && (unit.state === 'idle' || unit.state === 'patrolling' || unit.state === 'moving' || unit.state === 'routing' || unit.state === 'transporting')) {
        // If it was assigned to an incident, unassign it
        if (unit.targetIncidentId) {
           const incident = gameState.incidents[unit.targetIncidentId];
           if (incident) {
              incident.assignedUnits = incident.assignedUnits.filter(uid => uid !== unitId);
           }
        }
        
        unit.state = 'routing';
        unit.targetIncidentId = null;
        unit.targetStationId = null;
        unit.patrolTarget = targetLoc;
        unit.activity = 'Se deplasează către locația indicată manual.';
        io.emit("stateUpdate", gameState);
        
        if (unit.type === 'helicopter') {
          unit.route = [];
          unit.state = 'patrolling'; // using patrolling state for manual moving so it stops when reaching
          io.emit("stateUpdate", gameState);
        } else {
          const route = await getRoute(unit.location, targetLoc);
          if (unit.state === 'routing' && unit.patrolTarget === targetLoc) {
            unit.route = route;
            unit.state = 'patrolling'; // It will move towards patrolTarget
            io.emit("stateUpdate", gameState);
          }
        }
      }
    });

    socket.on("rentOperator", () => {
      const COST = 15000;
      if (gameState.budget >= COST && gameState.rentedOperators.length === 0) {
        gameState.budget -= COST;
        // 4 in-game hours duration (4 * 60 * 60 * 1000 ms)
        const expiresAt = gameState.gameTime + (4 * 60 * 60 * 1000);
        gameState.rentedOperators.push({ id: `op_${Date.now()}`, expiresAt, lastActionTime: 0 });
        addLog('Ai închiriat un Operator AI pentru 4 ore (timp joc).', 'success');
        io.emit("stateUpdate", gameState);
      } else if (gameState.rentedOperators.length > 0) {
        addLog('Ai deja un Operator AI activ.', 'warning');
        io.emit("stateUpdate", gameState);
      }
    });

    socket.on("fireOperator", () => {
       if (gameState.rentedOperators.length > 0) {
         gameState.rentedOperators = [];
         addLog('Ai concediat Operatorul AI.', 'info');
         io.emit("stateUpdate", gameState);
       }
    });

    socket.on("refuelUnit", ({ unitId }) => {
      const COST = 1000;
      const unit = gameState.units[unitId];
      if (unit && gameState.budget >= COST && unit.fuel < 100) {
        gameState.budget -= COST;
        unit.fuel = 100;
        addLog(`Unitatea ${unit.name} a fost realimentată în teren.`, 'info');
        io.emit("stateUpdate", gameState);
      }
    });

    socket.on("resolveComplication", ({ incidentId, optionId }) => {
      const incident = gameState.incidents[incidentId];
      if (incident && incident.complication && !incident.complication.resolved) {
        if (optionId && incident.complication.options) {
          const opt = incident.complication.options.find(o => o.id === optionId);
          if (opt) {
            if (gameState.budget >= opt.cost) {
               gameState.budget -= opt.cost;
               incident.complication.resolved = true;
               incident.activities!.unshift(opt.resultMsg);
               if (opt.repImpact) gameState.reputation = Math.max(0, Math.min(100, gameState.reputation + opt.repImpact));
               if (opt.id === 'opt2') gameState.budget += 2000;
               addLog(`Ordin tactic confirmat: ${opt.label}`, 'info');
               io.emit("stateUpdate", gameState);
            } else {
               addLog(`Fonduri insuficiente pentru tactica: ${opt.label}!`, 'error');
               io.emit("stateUpdate", gameState);
            }
          }
        } else {
          // Standard cost
          if (gameState.budget >= 1000) {
             gameState.budget -= 1000;
             incident.complication.resolved = true;
             incident.activities!.unshift('Procedura a fost aprobată. Situația este sub control.');
             addLog(`Procedură aprobată pentru ${incident.name}.`, 'info');
             io.emit("stateUpdate", gameState);
          } else {
             addLog(`Fonduri insuficiente pentru a aproba procedura la ${incident.name}!`, 'error');
             io.emit("stateUpdate", gameState);
          }
        }
      }
    });

    socket.on("refuelAll", () => {
      const COST = 500;
      let costTotal = 0;
      let count = 0;
      Object.values(gameState.units).forEach(unit => {
        if (unit.fuel < 100 && unit.state !== 'idle') {
          if (gameState.budget >= costTotal + COST) {
            costTotal += COST;
            unit.fuel = 100;
            count++;
          }
        }
      });
      if (count > 0) {
         gameState.budget -= costTotal;
         addLog(`${count} unități au fost realimentate în teren (Cost: €${costTotal.toLocaleString()}).`, 'info');
         io.emit("stateUpdate", gameState);
      }
    });

    socket.on("setIncidentRate", ({ rate }) => {
      gameState.incidentRate = rate;
      io.emit("stateUpdate", gameState);
    });

    socket.on("returnToBase", ({ unitId }) => {
      const unit = gameState.units[unitId];
      if (unit && (unit.state === 'idle' || unit.state === 'patrolling' || unit.state === 'moving')) {
        // Unassign if needed
        if (unit.targetIncidentId) {
           const incident = gameState.incidents[unit.targetIncidentId];
           if (incident) {
              incident.assignedUnits = incident.assignedUnits.filter(uid => uid !== unitId);
           }
        }
        
        let targetBase = { id: '', location: { lat: 0, lng: 0 } };
        if (unit.type === 'ambulance') {
           targetBase = hospitals[0];
        } else if (unit.type === 'fire') {
           targetBase = fireStations[0];
        } else {
           targetBase = policeStations[0];
        }

        unit.state = 'transporting'; // Use transporting state as returning state
        unit.targetIncidentId = null;
        unit.patrolTarget = null;
        unit.targetStationId = targetBase.id;
        unit.activity = 'Se întoarce la bază.';
        
        if (unit.type === 'helicopter') {
          unit.route = [];
        } else {
          getRoute(unit.location, targetBase.location).then(route => {
             if (unit.state === 'transporting' && unit.targetStationId === targetBase.id) {
               unit.route = route;
             }
          });
        }
        io.emit("stateUpdate", gameState);
      }
    });

    const prices: Record<UnitType, number> = {
      police: 15000,
      ambulance: 25000,
      fire: 40000,
      gendarmerie: 20000,
      swat: 35000,
      helicopter: 100000,
    };
    
    const names: Record<UnitType, string> = {
      police: 'P',
      ambulance: 'M',
      fire: 'F',
      gendarmerie: 'J',
      swat: 'S',
      helicopter: 'H',
    };

    socket.on("purchaseUnit", ({ type }: { type: UnitType }) => {
      if (prices[type] && gameState.budget >= prices[type]) {
        gameState.budget -= prices[type];
        const id = `u${unitIdCounter++}`;
        gameState.units[id] = {
          id: id,
          name: `${names[type]}-${Math.floor(Math.random() * 90 + 10)} (NOU)`,
          type: type as UnitType,
          state: 'idle',
          location: getRandomLocation(),
          targetIncidentId: null,
          fuel: 100,
        };
        io.emit("stateUpdate", gameState);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      connectedOperators.delete(socket.id);
      gameState.operators = Array.from(connectedOperators.values());
      io.emit("stateUpdate", gameState);
    });
  });

  // Game loop (10 times per second)
  setInterval(() => tick(io), 100);

  // Persist game progress periodically so it survives restarts
  setInterval(() => {
    saveGame(gameState, incidentIdCounter, unitIdCounter);
  }, 5000);

  const persistAndExit = () => {
    saveGame(gameState, incidentIdCounter, unitIdCounter);
    process.exit(0);
  };
  process.on('SIGINT', persistAndExit);
  process.on('SIGTERM', persistAndExit);

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

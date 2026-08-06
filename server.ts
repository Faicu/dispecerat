import express from "express";
import http from "http";
import https from "https";
import path from "path";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GameState, Incident, Unit, Location, UnitType, IncidentType, OperatorRole, Operator, WeatherType } from "./src/types";
import { loadGame, saveGame } from "./db";
import { policeStations, hospitals, fireStations, incidentTypes } from "./server/data";
import { getRandomVehicleSpec } from "./server/unitTypes";

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
  gameTime: Date.now(),
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
  incidentMultiplier: 1,
  wavePhase: 'calm',
  waveTimer: Date.now(),
  suggestions: [],
};

// Stations/hospitals/fireStations lists are static config, always refresh them
// even when restoring a save, in case they change between deployments.
gameState.stations = policeStations;
gameState.hospitals = hospitals;
gameState.fireStations = fireStations;

// Clear any stale game-over state from previous sessions
gameState.isGameOver = false;
gameState.gameOverReason = undefined;
gameState.operators = [];
if (gameState.reputation <= 0) gameState.reputation = 100;
if (!gameState.wavePhase) gameState.wavePhase = 'calm';
if (!gameState.waveTimer) gameState.waveTimer = Date.now();
if (!gameState.incidentMultiplier) gameState.incidentMultiplier = 1;

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

const createInitialUnits = () => {
  const units: Record<string, any> = {};
  let uCounter = 1;

  const mkUnit = (name: string, type: string, location: Location, stationId: string) => {
    const spec = getRandomVehicleSpec(type);
    return {
      id: `u${uCounter}`,
      name,
      type,
      state: 'idle',
      location,
      targetIncidentId: null,
      fuel: 100,
      targetStationId: stationId,
      vehicleModel: spec.model,
      speedMultiplier: spec.speedMultiplier,
      fuelMultiplier: spec.fuelMultiplier,
      resolutionBonus: spec.resolutionBonus,
    };
  };

  // 28 Police - 1 for each police station
  policeStations.forEach((station, i) => {
    units[`u${uCounter}`] = mkUnit(
      `POL-${i + 1}`, 'police',
      { lat: station.location.lat + (Math.random() - 0.5) * 0.003, lng: station.location.lng + (Math.random() - 0.5) * 0.003 },
      station.id,
    );
    uCounter++;
  });

  // 10 Fire trucks
  for (let i = 0; i < 10; i++) {
    const st = fireStations[i % fireStations.length];
    units[`u${uCounter}`] = mkUnit(`ISU-${i + 1}`, 'fire', { ...st.location }, st.id);
    uCounter++;
  }

  // 14 Ambulances
  for (let i = 0; i < 14; i++) {
    const st = hospitals[i % hospitals.length];
    units[`u${uCounter}`] = mkUnit(`AMB-${i + 1}`, 'ambulance', { ...st.location }, st.id);
    uCounter++;
  }

  // 8 Gendarmerie
  for (let i = 0; i < 8; i++) {
    const st = policeStations[(i * 3) % policeStations.length];
    units[`u${uCounter}`] = mkUnit(`JAN-${i + 1}`, 'gendarmerie', { ...st.location }, st.id);
    uCounter++;
  }

  // 6 SAS / Mascați
  for (let i = 0; i < 6; i++) {
    const st = policeStations[(i * 4 + 2) % policeStations.length];
    units[`u${uCounter}`] = mkUnit(`SAS-${i + 1}`, 'swat', { ...st.location }, st.id);
    uCounter++;
  }

  // 4 Helicopters (AVI)
  for (let i = 0; i < 4; i++) {
    const st = hospitals[i % hospitals.length];
    units[`u${uCounter}`] = mkUnit(`AVI-${i + 1}`, 'helicopter', { ...st.location }, st.id);
    uCounter++;
  }

  return { units, uCounter };
};

// Spawn initial default units if no saved game
if (!savedGame) {
  const { units, uCounter } = createInitialUnits();
  gameState.units = units;
  unitIdCounter = uCounter;
}

let lastPhoneCallTime = 0;
let lastDisasterTime = Date.now() - 4 * 60 * 1000;
let lastShiftTime = Date.now();
const SHIFT_INTERVAL = 5 * 60 * 1000; // schimb de tură la fiecare 5 minute reale
const SHIFT_BREAK_DURATION = 60 * 1000; // 1 minut pauză

const RADIO_MESSAGES: Record<string, string[]> = {
  police: ['Zona securizată. Menținem perimetrul.', 'Subiect identificat. Continuăm intervenția.', 'Avem martori la fața locului.', 'Solicit backup imediat!'],
  fire: ['Furtunurile sunt în funcțiune.', 'Avem victime. Solicităm ambulanța.', 'Focul este sub control.', 'Clădirea a fost evacuată cu succes.'],
  ambulance: ['Pacient stabilizat. Ne deplasăm la spital.', 'Victimă în stare critică!', 'Acordăm primul ajutor la fața locului.', 'Solicităm SMURD aerian!'],
  gendarmerie: ['Ordinea publică restabilită.', 'Evacuăm zona conform protocolului.', 'Mulțimea dispersată fără incidente.'],
  swat: ['Zonă securizată. Niciun suspect activ.', 'Intrăm în clădire — asigurați accesul!', 'Suspect imobilizat.'],
  helicopter: ['Supraveghere aeriană activă.', 'Confirmăm vizual de la altitudine.', 'Urmărim vehiculul suspect pe direcția nord.'],
};

const getRandomIncidentTemplate = () => {
  const weights = incidentTypes.map(t => {
    if (t.severity >= 5) return 0.25; // Cod 5 - Foarte rar (~2%)
    if (t.severity === 4) return 1.0;  // Cod 4 - Rar (~8%)
    if (t.severity === 3) return 3.5;  // Cod 3 - Mediu (~28%)
    if (t.severity === 2) return 5.0;  // Cod 2 - Frecvent (~35%)
    return 6.0;                        // Cod 1 - Foarte frecvent (~27%)
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < incidentTypes.length; i++) {
    if (rand < weights[i]) return incidentTypes[i];
    rand -= weights[i];
  }
  return incidentTypes[0];
};

const spawnIncident = () => {
  const template = getRandomIncidentTemplate();
  const id = `i${incidentIdCounter++}`;
  const location = getRandomLocation();
  
  const activePhoneCallsCount = Object.values(gameState.incidents || {}).filter(i => i.isPhoneCall && (i.callStatus === 'ringing' || i.callStatus === 'answered')).length;
  const now = Date.now();
  const isPhoneCall = activePhoneCallsCount === 0 && (now - lastPhoneCallTime > 30000) && (Math.random() < 0.25);
  if (isPhoneCall) {
    lastPhoneCallTime = now;
  }
  
  let callerDialogue: { text: string; options: { text: string; nextStep: number | 'dispatch' }[] }[] | undefined = undefined;
  let callStatus: 'ringing' | 'answered' | 'completed' | undefined = undefined;
  let currentDialogueStep = undefined;

  if (isPhoneCall) {
    callStatus = 'ringing';
    currentDialogueStep = 0;
    callerDialogue = template.dialogue && template.dialogue.length > 0
      ? template.dialogue
      : [
          {
            text: `Alo, 112! ${template.desc} Vă rog să veniți repede!`,
            options: [
              { text: 'Liniștiți-vă, spuneți-mi adresa exactă.', nextStep: 1 },
              { text: 'Trimitem echipaje imediat.', nextStep: 'dispatch' as const }
            ]
          },
          {
            text: 'Sunt undeva pe strada... ah, e multă panică! Vă rog grăbiți-vă!',
            options: [
              { text: 'Am localizat apelul. Rămâneți la telefon până ajung colegii mei.', nextStep: 'dispatch' as const },
            ]
          }
        ];
  }

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
    primaryAgency: template.primaryAgency,
    isPhoneCall,
    callStatus,
    callerDialogue,
    currentDialogueStep
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
  
  if (gameState.weather !== 'clear' && unit.state === 'moving' && Math.random() < 0.0001) {
     const id = `inc-${Date.now()}`;
     gameState.incidents[id] = {
        id,
        name: `Accident Rutier (Unitate ${unit.name})`,
        type: 'medical',
        location: { ...unit.location },
        description: `Unitatea ${unit.name} a fost implicată într-un accident rutier din cauza condițiilor meteo nefavorabile!`,
        imageUrl: 'https://images.unsplash.com/photo-1542282811-943ef1a647a5?auto=format&fit=crop&w=300&q=80',
        resolved: false,
        isResolving: false,
        resolutionProgress: 0,
        activities: ['Echipajul raportează un accident. Este necesară intervenția.'],
        requiredUnits: ['ambulance', 'police'],
        assignedUnits: [],
        createdAt: Date.now(),
        reward: 5000,
        severity: 4
     };
     addLog(`🚨 ACCIDENT! Unitatea ${unit.name} a suferit un accident din cauza vremii!`, 'error');
     unit.state = 'idle';
     unit.route = [];
     unit.targetIncidentId = null;
  }

  if (unit.fuel <= 0) speedMult *= 0.2; // very slow if out of fuel

  const baseSpeed = unit.type === 'helicopter' ? UNIT_SPEED * 3 : UNIT_SPEED;
  const speed = baseSpeed * speedMult * (unit.speedMultiplier ?? 1);
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
  const occupiedRoles = new Set(gameState.operators.filter(o => !o.isOnBreak).flatMap(o => o.roles));
  const getRoleForUnit = (type: string) => {
    if (type === 'police' || type === 'swat' || type === 'helicopter') return 'police';
    if (type === 'fire') return 'fire';
    if (type === 'ambulance') return 'ambulance';
    if (type === 'gendarmerie') return 'gendarmerie';
    return null;
  };

  let stateChanged = false;

  if (gameState.reputation <= 0) {
    gameState.reputation = 0;
  }
  
  // Wave-based incident rate
  const elapsed = Date.now() - gameState.waveTimer;
  const WAVE_DURATIONS: Record<string, number> = { calm: 60000, building: 30000, wave: 60000, decay: 20000 };
  if (elapsed > WAVE_DURATIONS[gameState.wavePhase]) {
    const transitions: Record<string, GameState['wavePhase']> = { calm: 'building', building: 'wave', wave: 'decay', decay: 'calm' };
    gameState.wavePhase = transitions[gameState.wavePhase];
    gameState.waveTimer = Date.now();
    if (gameState.wavePhase === 'wave') addLog('⚡ Val de incidente — activitate ridicată!', 'warning');
    if (gameState.wavePhase === 'calm') addLog('✅ Perioadă liniștită — situație sub control.', 'success');
    stateChanged = true;
  }
  const WAVE_RATES: Record<string, number> = { calm: 0.0012, building: 0.0035, wave: 0.008, decay: 0.0025 };
  gameState.incidentRate = WAVE_RATES[gameState.wavePhase];
  

  // Time progresses: 1 tick = 6000ms in-game = 6 seconds in-game per tick (1 minute every 1 real second)
  gameState.gameTime = Date.now();
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
    } else if (unit.state === 'on_break') {
      if (unit.fuel < 100) {
        unit.fuel = Math.min(100, unit.fuel + 0.3);
        stateChanged = true;
      }
      if (unit.shiftReturnAt && Date.now() >= unit.shiftReturnAt) {
        unit.state = 'idle';
        unit.shiftReturnAt = undefined;
        stateChanged = true;
      }
      return; // nu proceseaza mișcare pentru on_break
    } else if (unit.state === 'on_scene') {
      if (unit.fuel > 0) {
        unit.fuel = Math.max(0, unit.fuel - 0.002 * (unit.fuelMultiplier ?? 1));
        stateChanged = true;
      }
    } else {
      if (unit.fuel > 0) {
        unit.fuel = Math.max(0, unit.fuel - 0.01 * (unit.fuelMultiplier ?? 1));
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
      } else if (unit.type === 'helicopter') {
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
      } else if (unit.type === 'helicopter') {
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
          if (unit.type === 'helicopter') {
            const reached = moveUnitTowards(unit, incident.location);
            if (reached) {
              if (incident.isMoving) {
                incident.isMoving = false; // Stopped the suspect!
                incident.activities = ['Suspect blocat în trafic. Se intervine pentru reținere.'];
              }
              unit.state = 'on_scene';
            }
            stateChanged = true;
          } else if (incident.isMoving) {
             // For ground units chasing moving incident, if route empty, recalculate
             if (!unit.recalculatingRoute) {
                unit.recalculatingRoute = true;
                getRoute(unit.location, incident.location).then(route => {
                   if (unit.state === 'moving' && unit.targetIncidentId === incident.id) {
                      unit.route = route;
                   }
                   unit.recalculatingRoute = false;
                }).catch(() => { unit.recalculatingRoute = false; });
             }
          }
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
      const isAssigned = incident.assignedUnits && incident.assignedUnits.length > 0;
      const timeLimit = isAssigned ? 300000 : 60000;
      if (Date.now() - incident.createdAt > timeLimit && !incident.isResolving) { // 3 minutes to resolve
        // Expired
        gameState.reputation = Math.max(0, gameState.reputation - 5);
        incident.activities = ['Incidentul a expirat, apelanții nu au primit ajutor la timp!'];
        incident.resolved = true;
        incident.resolvedAt = Date.now();
        addLog(`Incident Expirat: ${incident.name} (Reputație -5)`, 'error');
        
        // Release assigned units
        incident.assignedUnits.forEach(uid => {
          const unit = gameState.units[uid];
          if (unit) {
            unit.state = 'idle';
            unit.targetIncidentId = null;
          }
        });
        
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
            // Check if any human operator is responsible for this incident
            const involvedRoles = new Set(incident.assignedUnits.map(uid => getRoleForUnit(gameState.units[uid]?.type)));
            let hasHumanOperator = false;
            for (const role of involvedRoles) {
              if (role && occupiedRoles.has(role)) {
                hasHumanOperator = true;
                break;
              }
            }

            if (!hasHumanOperator) {
              if (incident.complication.options) {
                const affordableOptions = incident.complication.options.filter(o => gameState.budget >= o.cost).sort((a, b) => (b.repImpact || 0) - (a.repImpact || 0));
                if (affordableOptions.length > 0) {
                  const opt = affordableOptions[0];
                  gameState.budget -= opt.cost;
                  incident.complication.resolved = true;
                  incident.activities!.unshift(opt.resultMsg);
                  if (opt.repImpact) gameState.reputation = Math.max(0, Math.min(100, gameState.reputation + opt.repImpact));
                  if (opt.id === 'opt2') gameState.budget += 2000;
                  addLog(`AI-ul a decis: ${opt.label} (${incident.name})`, 'info');
                }
              } else {
                 if (gameState.budget >= 2500) {
                    gameState.budget -= 2500;
                    incident.complication.resolved = true;
                    incident.activities!.unshift('AI-ul a aprobat procedura. Situația este sub control.');
                    addLog(`AI-ul a aprobat procedura pentru ${incident.name}.`, 'info');
                 }
              }
            }
            
            if (!incident.complication.resolved) {
              incident.resolutionProgress! += 0.25;
              stateChanged = true;
            }
          } else {
            const unitBonus = incident.assignedUnits.reduce((sum, uid) => {
              return sum + (gameState.units[uid]?.resolutionBonus ?? 0);
            }, 0);
            incident.resolutionProgress! += 2 + unitBonus;
            stateChanged = true;

            // Random chance for complication
            if (incident.resolutionProgress! > 40 && incident.resolutionProgress! < 60 && !incident.escalated && Math.random() < 0.6) {
               incident.escalated = true;

               const randChoice = Math.random();
               if (randChoice < 0.125) {
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
               } else if (randChoice < 0.25) {
                 incident.complication = {
                   message: 'Este necesară autorizarea dispeceratului pentru proceduri speciale (negociatori / echipamente speciale).',
                   actionLabel: 'Aprobă Procedura (€2500)',
                   resolved: false
                 };
                 incident.activities!.unshift('Se așteaptă decizia dispeceratului...');
                 addLog(`⚠️ Decizie manuală necesară la ${incident.name}`, 'warning');
               } else if (randChoice < 0.375) {
                 incident.complication = {
                   message: 'Decizie tactică: Suspecții încearcă să fugă. Solicităm ordin.',
                   resolved: false,
                   options: [
                     { id: 'opt1', label: 'Urmărire cu orice preț (-€1500 daune)', cost: 1500, resultMsg: 'Suspecți prinși. Daune colaterale minore.', repImpact: 3 },
                     { id: 'opt2', label: 'Securizare perimetru (risc 0)', cost: 0, resultMsg: 'Un suspect a scăpat, dar nu sunt răniți.', repImpact: -2 }
                   ]
                 };
                 incident.activities!.unshift('Așteptăm ordin tactic...');
                 addLog(`⚠️ Decizie tactică necesară la ${incident.name}`, 'warning');
               } else if (randChoice < 0.5) {
                 incident.complication = {
                   message: 'Mass-media a ajuns la fața locului. Cum gestionăm comunicarea?',
                   resolved: false,
                   options: [
                     { id: 'opt1', label: 'Purtător de cuvânt oficial (-€500)', cost: 500, resultMsg: 'Comunicare profesionistă. Reputație crescută.', repImpact: 5 },
                     { id: 'opt2', label: 'Blochează accesul presei', cost: 0, resultMsg: 'Jurnaliștii au speculat negativ. Reputație scăzută.', repImpact: -5 }
                   ]
                 };
                 incident.activities!.unshift('Presa solicită declarații...');
                 addLog(`⚠️ Mass-media prezentă la ${incident.name}`, 'warning');
               } else if (randChoice < 0.625) {
                 incident.complication = {
                   message: 'Un echipaj raportează răniri în rândurile forțelor noastre! Cum procedăm?',
                   resolved: false,
                   options: [
                     { id: 'opt1', label: 'Evacuare echipaj rănit (-€800)', cost: 800, resultMsg: 'Echipajul rănit a fost evacuat în siguranță.', repImpact: 4 },
                     { id: 'opt2', label: 'Continuă misiunea (risc)', cost: 0, resultMsg: 'Misiunea continuă dar echipajul a suferit consecințe.', repImpact: -3 }
                   ]
                 };
                 incident.activities!.unshift('Echipaj rănit la fața locului!');
                 addLog(`⚠️ Echipaj rănit la ${incident.name}!`, 'error');
               } else if (randChoice < 0.75) {
                 incident.complication = {
                   message: 'Dispozitiv suspect identificat la fața locului. Potențial explozibil. Evacuare sau neutralizare?',
                   resolved: false,
                   options: [
                     { id: 'opt1', label: 'Evacuare și geniu militar (-€3000)', cost: 3000, resultMsg: 'Zona evacuată. Genistul a neutralizat dispozitivul.', repImpact: 6 },
                     { id: 'opt2', label: 'Continuă fără evacuare (periculos)', cost: 0, resultMsg: 'Echipajele au riscat. Dispozitivul era fals, dar publicul e nervos.', repImpact: -4 }
                   ]
                 };
                 incident.activities!.unshift('Dispozitiv suspect identificat!');
                 addLog(`🚨 Dispozitiv suspect la ${incident.name}!`, 'error');
               } else if (randChoice < 0.875) {
                 incident.complication = {
                   message: 'Civili refuză să evacueze zona de pericol. Intervenim forțat sau negociem?',
                   resolved: false,
                   options: [
                     { id: 'opt1', label: 'Evacuare forțată (-€1000 + risc PR)', cost: 1000, resultMsg: 'Civilii au fost evacuați forțat. Situație rezolvată dar nemulțumiri.', repImpact: -2 },
                     { id: 'opt2', label: 'Negociator pe teren (-€500)', cost: 500, resultMsg: 'Negociatorul a convins civilii să plece voluntar.', repImpact: 3 }
                   ]
                 };
                 incident.activities!.unshift('Civili refuză evacuarea...');
                 addLog(`⚠️ Civili necooperanți la ${incident.name}`, 'warning');
               } else {
                 incident.complication = {
                   message: 'Echipamentul tehnic defectează la fața locului. Solicităm logistică suplimentară?',
                   resolved: false,
                   options: [
                     { id: 'opt1', label: 'Logistică de urgență (-€2000)', cost: 2000, resultMsg: 'Echipamentul de rezervă a sosit. Misiunea continuă.', repImpact: 1 },
                     { id: 'opt2', label: 'Improvizează cu ce există', cost: 0, resultMsg: 'Echipajul a improvizat. Rezolvarea e mai lentă.', repImpact: -1 }
                   ]
                 };
                 incident.activities!.unshift('Defecțiune echipament tehnic!');
                 addLog(`⚠️ Defecțiune echipament la ${incident.name}`, 'warning');
               }
            }

            if (incident.resolutionProgress! >= 100) {
              incident.resolved = true;
              incident.resolvedAt = Date.now();
              if (incident.complication && !incident.complication.resolved) {
                gameState.reputation = Math.max(0, gameState.reputation - 5);
                addLog(`Incidentul ${incident.name} a fost soluționat, dar o decizie tactică a fost ignorată. -5 Reputație`, 'error');
              } else {
                gameState.reputation = Math.min(100, gameState.reputation + 2);
                addLog(`Incident Soluționat: ${incident.name} (+${incident.reward} RON, +2 Reputație)`, 'success');
                gameState.budget += incident.reward;
              }
              incident.activities = ['Incidentul a fost soluționat. Unitățile se retrag.'];
              gameState.resolvedCountTotal++;
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
                  
                  // Find route to station in background
                  unit.route = [];
                  if (unit.type !== 'helicopter') {
                     getRoute(unit.location, targetBase.location).then(route => {
                        if (unit.state === 'transporting' && unit.targetStationId === targetBase.id) {
                          unit.route = route;
                        }
                     });
                  }
                }
              });
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

  // Cleanup resolved incidents after 3 seconds (or 5 seconds for expired)
  Object.values(gameState.incidents).forEach((incident) => {
    if (incident.resolved) {
      const resolvedTime = incident.resolvedAt || incident.createdAt;
      const isExpired = incident.activities && incident.activities[0]?.includes('expirat');
      const displayDuration = isExpired ? 5000 : 3000;
      if (Date.now() - resolvedTime >= displayDuration) {
        delete gameState.incidents[incident.id];
        stateChanged = true;
      }
    }
  });

  // Check for ringing calls timeout (18 seconds)
  Object.values(gameState.incidents).forEach(inc => {
    if (inc.isPhoneCall && inc.callStatus === 'ringing' && Date.now() - inc.createdAt > 18000) {
      inc.callStatus = 'completed';
      addLog(`Apel 112 nepreluat la timp pentru ${inc.name} (Linia s-a închis)`, 'warning');
      stateChanged = true;
    }
  });

  // ── Schimb de tură la fiecare SHIFT_INTERVAL ──────────────────────────────
  const nowTs = Date.now();
  if (nowTs - lastShiftTime > SHIFT_INTERVAL) {
    lastShiftTime = nowTs;
    const eligible = Object.values(gameState.units).filter(u =>
      (u.state === 'idle' || u.state === 'patrolling') && !u.targetIncidentId
    );
    const breakCount = Math.floor(eligible.length * 0.75);
    const toBreak = eligible.sort(() => Math.random() - 0.5).slice(0, breakCount);
    toBreak.forEach(u => {
      u.state = 'on_break';
      u.shiftReturnAt = nowTs + SHIFT_BREAK_DURATION;
      u.patrolTarget = null;
      u.route = [];
    });
    if (toBreak.length > 0) {
      addLog(`🔄 Schimb de tură — ${toBreak.length} echipaje se retrag la sediu (1 minut).`, 'info');
      stateChanged = true;
    }
  }

  // ── Auto-dispecerizare unități în apropiere (raza ~250m) ─────────────────
  const AUTO_DISPATCH_RADIUS = 0.0025;
  Object.values(gameState.units).forEach(unit => {
    if (unit.state !== 'idle' && unit.state !== 'patrolling') return;
    if (unit.targetIncidentId) return;
    for (const incident of Object.values(gameState.incidents)) {
      if (incident.resolved || incident.isPhoneCall) continue;
      if (!incident.requiredUnits.includes(unit.type as UnitType)) continue;
      const assignedOfType = incident.assignedUnits.filter(uid => gameState.units[uid]?.type === unit.type).length;
      const requiredOfType = incident.requiredUnits.filter(t => t === unit.type).length;
      if (assignedOfType >= requiredOfType) continue;
      const dist = Math.sqrt(
        Math.pow(unit.location.lat - incident.location.lat, 2) +
        Math.pow(unit.location.lng - incident.location.lng, 2)
      );
      if (dist < AUTO_DISPATCH_RADIUS) {
        unit.targetIncidentId = incident.id;
        incident.assignedUnits.push(unit.id);
        unit.state = 'moving';
        unit.patrolTarget = null;
        addLog(`📍 Auto-disp.: ${unit.name} → ${incident.name} (în apropiere)`, 'info');
        stateChanged = true;
        break;
      }
    }
  });

  // ── Escaladare incidente nerezolvate (crime/robbery → incident nou în zonă) ─
  Object.values(gameState.incidents).forEach(incident => {
    if (incident.resolved || incident.escalationSpawned) return;
    if (!['crime', 'robbery'].includes(incident.type)) return;
    const timeAlive = Date.now() - incident.createdAt;
    if (timeAlive > 90000 && Math.random() < 0.0008) {
      incident.escalationSpawned = true;
      const escalTemplates = incidentTypes.filter(t =>
        ['crime', 'robbery'].includes(t.type) && t.severity <= Math.min(3, incident.severity)
      );
      if (escalTemplates.length > 0) {
        const tmpl = escalTemplates[Math.floor(Math.random() * escalTemplates.length)];
        const eid = `i${incidentIdCounter++}`;
        const nearbyLoc = {
          lat: incident.location.lat + (Math.random() - 0.5) * 0.018,
          lng: incident.location.lng + (Math.random() - 0.5) * 0.018,
        };
        gameState.incidents[eid] = {
          id: eid,
          name: `[ESCALADAT] ${tmpl.name}`,
          type: tmpl.type,
          location: nearbyLoc,
          address: 'Se localizează...',
          description: `Incident escaladat din zona ${incident.name}: ${tmpl.desc}`,
          imageUrl: tmpl.img,
          resolved: false,
          isResolving: false,
          resolutionProgress: 0,
          activities: [`⚡ Escaladat din ${incident.name}! Intervenție imediată necesară!`],
          requiredUnits: [...tmpl.req],
          assignedUnits: [],
          createdAt: Date.now(),
          reward: tmpl.reward,
          severity: Math.min(5, tmpl.severity),
          primaryAgency: tmpl.primaryAgency,
        };
        getAddress(nearbyLoc.lat, nearbyLoc.lng).then(addr => {
          if (gameState.incidents[eid]) gameState.incidents[eid].address = addr;
        });
        addLog(`⚡ Escaladat: ${incident.name} → incident nou ${tmpl.name}!`, 'warning');
        stateChanged = true;
      }
    }
  });

  // Randomly spawn new incidents based on wave rate
  const activeIncidents = Object.values(gameState.incidents).filter(i => !i.resolved).length;
  // Adaptează rata de incidente în funcție de numărul incidentelor active
  let incidentScale = Math.max(0.1, 1.2 - (activeIncidents / 8));
  if (activeIncidents === 0) incidentScale = 2.5;
  const effectiveRate = gameState.incidentRate * (gameState.incidentMultiplier ?? 1) * incidentScale;
  if (Math.random() < effectiveRate && activeIncidents < 15) {
    spawnIncident();
    stateChanged = true;
  }

  // Natural disaster event — rare, spawns 3-5 high-severity incidents
  const DISASTER_COOLDOWN = 5 * 60 * 1000;
  if (Date.now() - lastDisasterTime > DISASTER_COOLDOWN && Math.random() < 0.0003 && activeIncidents < 10) {
    lastDisasterTime = Date.now();
    const disasterTemplates = incidentTypes.filter(t => ['explosion', 'rescue', 'accident', 'fire'].includes(t.type) && t.severity >= 3);
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const template = disasterTemplates[Math.floor(Math.random() * disasterTemplates.length)];
      const id = `i${incidentIdCounter++}`;
      gameState.incidents[id] = {
        id,
        name: `[DEZASTRU] ${template.name}`,
        type: template.type,
        location: getRandomLocation(),
        address: 'Se localizează...',
        description: template.desc,
        imageUrl: template.img,
        resolved: false,
        isMoving: false,
        isResolving: false,
        resolutionProgress: 0,
        activities: ['URGENȚĂ! Parte a unui dezastru natural. Intervenție imediată necesară!'],
        requiredUnits: [...template.req],
        assignedUnits: [],
        createdAt: Date.now(),
        reward: template.reward * 2,
        severity: Math.min(5, template.severity + 1),
      };
      getAddress(gameState.incidents[id].location.lat, gameState.incidents[id].location.lng).then(addr => {
        if (gameState.incidents[id]) gameState.incidents[id].address = addr;
      });
    }
    addLog(`🔴 DEZASTRU NATURAL! ${count} incidente critice raportate simultan în tot Bucureștiul!`, 'error');
    stateChanged = true;
  }

  // Radio chat — units on scene occasionally send realistic radio messages
  if (Math.random() < 0.008) {
    const onSceneUnits = Object.values(gameState.units).filter(u => u.state === 'on_scene');
    if (onSceneUnits.length > 0) {
      const unit = onSceneUnits[Math.floor(Math.random() * onSceneUnits.length)];
      const messages = RADIO_MESSAGES[unit.type];
      if (messages) {
        addLog(`📻 ${unit.name}: "${messages[Math.floor(Math.random() * messages.length)]}"`, 'info');
        stateChanged = true;
      }
    }
  }

  // Handle rented operators expiration and AI dispatch
  const now = gameState.gameTime;
  // AI Dispatching logic for unassigned roles
  
  
  if (!gameState.lastAiTime) gameState.lastAiTime = Date.now();
  if (Date.now() - gameState.lastAiTime > 3000) {
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
        for (const unitType of neededUnits) {
          const role = getRoleForUnit(unitType);
          if (role && !occupiedRoles.has(role)) {
            // AI handles this unit type
            const idleUnits = Object.values(gameState.units).filter(u => u.type === unitType && (u.state === 'idle' || u.state === 'patrolling') && u.fuel > 20);
            if (idleUnits.length > 0) {
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
                }).catch(err => console.error("Route error:", err));
              }
              addLog(`Operatorul AI a alocat ${idleUnit.name} (Rol neocupat) la incidentul ${incident.name}`, 'info');
              dispatchedThisTick = true;
              gameState.lastAiTime = Date.now();
              stateChanged = true;
              break;
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

  const connectedOperators = new Map<string, Operator>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // Send initial state
    socket.emit("stateUpdate", gameState);

    socket.on("restartGame", () => {
      gameState.isGameOver = false;
      gameState.gameOverReason = undefined;
      gameState.reputation = 100;
      gameState.budget = 150000;
      gameState.resolvedCountTotal = 0;
      gameState.resolvedCountPerOperator = {};
      gameState.incidents = {};
      gameState.logs = [];
      gameState.incidentRate = 0.003;
      gameState.incidentMultiplier = 1;
      gameState.wavePhase = 'calm';
      gameState.waveTimer = Date.now();
      
      const { units, uCounter } = createInitialUnits();
      gameState.units = units;
      unitIdCounter = uCounter;
      incidentIdCounter = 1;

      // Respawn 2 default incidents
      spawnIncident();
      spawnIncident();
      
      saveGame(gameState, incidentIdCounter, unitIdCounter);
      io.emit("stateUpdate", gameState);
    });
    socket.on("toggleBreak", () => {
      const op = connectedOperators.get(socket.id);
      if (op) {
        op.isOnBreak = !op.isOnBreak;
        gameState.operators = Array.from(connectedOperators.values());
        io.emit("stateUpdate", gameState);
      }
    });
    socket.on("join", ({ name, roles }) => {
      connectedOperators.set(socket.id, { name, roles: roles || [] });
      gameState.operators = Array.from(connectedOperators.values());
      io.emit("stateUpdate", gameState);
    });


    socket.on("answerCall", ({ incidentId, operator }) => {
      const inc = gameState.incidents[incidentId];
      if (inc && inc.isPhoneCall && inc.callStatus === 'ringing') {
        inc.callStatus = 'answered';
        inc.primaryOperator = operator;
      }
    });

    socket.on("progressCall", ({ incidentId, nextStep }) => {
      const inc = gameState.incidents[incidentId];
      if (inc && inc.isPhoneCall && inc.callStatus === 'answered') {
        if (nextStep === 'dispatch') {
          inc.callStatus = 'completed';
        } else {
          inc.currentDialogueStep = nextStep;
        }
      }
    });

    socket.on("dispatchUnit", async ({ unitId, incidentId, operator }) => {
      const unit = gameState.units[unitId];
      const incident = gameState.incidents[incidentId];
      
      if (unit && incident && (unit.state === 'idle' || unit.state === 'patrolling' || unit.state === 'moving' || unit.state === 'routing' || unit.state === 'transporting')) {
        if (!incident.primaryOperator) {
          incident.primaryOperator = operator;
        }
        if (!incident.firstResponseAt) {
          incident.firstResponseAt = Date.now();
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

        if (unit.type === 'helicopter') {
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
          if (gameState.budget >= 2500) {
                    gameState.budget -= 2500;
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

    socket.on("setIncidentMultiplier", ({ multiplier }) => {
      gameState.incidentMultiplier = multiplier;
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

        const nearestOf = (list: { id: string; location: { lat: number; lng: number } }[]) => {
          let best = list[0];
          let minD = Infinity;
          for (const s of list) {
            const d = Math.pow(s.location.lat - unit.location.lat, 2) + Math.pow(s.location.lng - unit.location.lng, 2);
            if (d < minD) { minD = d; best = s; }
          }
          return best;
        };

        let targetBase = { id: '', location: { lat: 0, lng: 0 } };
        if (unit.type === 'ambulance') {
           targetBase = nearestOf(hospitals);
        } else if (unit.type === 'fire') {
           targetBase = nearestOf(fireStations);
        } else {
           targetBase = nearestOf(policeStations);
        }

        unit.state = 'transporting'; // Use transporting state as returning state
        unit.targetIncidentId = null;
        unit.patrolTarget = null;
        unit.targetStationId = targetBase.id;
        unit.activity = 'Se întoarce la bază.';
        
        unit.route = [];
        if (unit.type !== 'helicopter') {
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
      police: 'POL',
      ambulance: 'AMB',
      fire: 'ISU',
      gendarmerie: 'JAN',
      swat: 'SAS',
      helicopter: 'AVI',
    };

    socket.on("purchaseUnit", ({ type }: { type: UnitType }) => {
      if (prices[type] && gameState.budget >= prices[type]) {
        gameState.budget -= prices[type];
        const id = `u${unitIdCounter++}`;
        
        let maxNum = 0;
        for (const u of Object.values(gameState.units)) {
          if (u.type === type) {
            const match = u.name.match(new RegExp(`^${names[type]}-(\\d+)`));
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        }
        const nextNum = maxNum + 1;

        let spawnLoc = policeStations[0].location;
        if (type === 'ambulance' || type === 'helicopter') spawnLoc = hospitals[0].location;
        if (type === 'fire') spawnLoc = fireStations[0].location;

        const spec = getRandomVehicleSpec(type);
        gameState.units[id] = {
          id: id,
          name: `${names[type]}-${nextNum}`,
          type: type as UnitType,
          state: 'idle',
          location: { ...spawnLoc },
          targetIncidentId: null,
          fuel: 100,
          vehicleModel: spec.model,
          speedMultiplier: spec.speedMultiplier,
          fuelMultiplier: spec.fuelMultiplier,
          resolutionBonus: spec.resolutionBonus,
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

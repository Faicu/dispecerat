import { GameState, Location, Unit } from './types';
import { UNIT_SPEED, TICKS_PER_SECOND, WEATHER_SPEED_MULTIPLIERS } from './constants';

export const formatGameTime = (timestamp: number): string => {
  if (!timestamp) return '08:00';
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const formatReward = (reward: number): string => {
  return `${(reward / 1000).toFixed(1).replace('.0', '')}k`;
};

const distance = (a: Location, b: Location): number => {
  return Math.sqrt(Math.pow(a.lng - b.lng, 2) + Math.pow(a.lat - b.lat, 2));
};

// Client-side ETA estimate. Mirrors the server's movement math (server.ts
// `moveUnitTowards`) so the console shows a number close to the real arrival —
// the server tick loop remains the authoritative source of truth.
export const calculateETA = (unit: Unit, targetLoc: Location, gameState: GameState): number => {
  let dist = 0;
  let prev = unit.location;
  if (unit.route && unit.route.length > 0) {
    for (const pt of unit.route) {
      dist += distance(prev, pt);
      prev = pt;
    }
  }
  dist += distance(prev, targetLoc);

  let speedMult = WEATHER_SPEED_MULTIPLIERS[gameState.weather] ?? 1;
  if (unit.fuel <= 0) speedMult *= 0.2;

  const speedPerSec = (unit.type === 'helicopter' ? UNIT_SPEED * 3 : UNIT_SPEED) * TICKS_PER_SECOND * speedMult;
  return Math.ceil(dist / speedPerSec);
};

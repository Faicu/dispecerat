export type UnitType = 'police' | 'fire' | 'ambulance' | 'gendarmerie' | 'swat' | 'helicopter';
export type IncidentType = 'crime' | 'fire' | 'medical' | 'accident' | 'robbery' | 'explosion' | 'rescue';
export type UnitState = 'idle' | 'moving' | 'on_scene' | 'routing' | 'transporting' | 'patrolling';
export type WeatherType = 'clear' | 'rain' | 'storm' | 'snow';

export interface Location {
  lat: number;
  lng: number;
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  state: UnitState;
  location: Location;
  targetIncidentId: string | null;
  targetStationId?: string | null;
  route?: Location[];
  patrolTarget?: Location | null;
  activity?: string;
  fuel: number; // 0-100
}

export interface PoliceStation {
  id: string;
  name: string;
  location: Location;
}

export interface Hospital {
  id: string;
  name: string;
  location: Location;
}

export interface FireStation {
  id: string;
  name: string;
  location: Location;
}

export interface Incident {
  id: string;
  name: string;
  type: IncidentType;
  location: Location;
  address?: string;
  description: string;
  imageUrl: string;
  resolved: boolean;
  isMoving?: boolean;
  movingTarget?: Location | null;
  isResolving?: boolean;
  resolutionProgress?: number;
  activities?: string[];
  requiredUnits: UnitType[];
  assignedUnits: string[]; // unit IDs
  createdAt: number;
  firstResponseAt?: number;
  primaryOperator?: string;
  reward: number;
  severity: 1 | 2 | 3;
  escalated?: boolean;
  complication?: {
    message: string;
    actionLabel?: string;
    resolved: boolean;
    options?: { id: string; label: string; cost: number; resultMsg: string; repImpact?: number; }[];
  };
}

export interface GameLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export type OperatorRole = 'police' | 'fire' | 'ambulance' | 'gendarmerie';

export interface Operator {
  isOnBreak?: boolean;
  name: string;
  roles: OperatorRole[];
}

export interface GameState {
  isGameOver?: boolean;
  gameOverReason?: string;
  units: Record<string, Unit>;
  incidents: Record<string, Incident>;
  budget: number;
  reputation: number;
  gameTime: number; // Unix timestamp for in-game time
  weather: WeatherType;
  logs: GameLog[];
  operators: Operator[];
  lastAiTime?: number;
  rentedOperators: { id: string, expiresAt: number, lastActionTime?: number, lastChargeTime?: number }[];
  stations: PoliceStation[];
  hospitals: Hospital[];
  fireStations: FireStation[];
  resolvedCountTotal: number;
  resolvedCountPerOperator: Record<string, number>;
  aiStatus?: string;
  incidentRate: number;
  incidentMultiplier: number;
  wavePhase: 'calm' | 'building' | 'wave' | 'decay';
  waveTimer: number;
  suggestions: string[];
}

export interface Player {
  id: string;
  name: string;
}

import type { IncidentType, UnitType } from './types';

// Single source of truth for per-type styling, used by MapView, LeftSidebar,
// RightSidebar and BottomConsole instead of four separate copies.
export interface UnitTheme {
  hex: string;
  bg: string;
  border: string;
  title: string;
  badge: string;
  bar: string;
  dot: string;
  label: string;
  // Pre-composed hover: classes — Tailwind's static scanner needs the full
  // literal token (e.g. "hover:bg-blue-900/20"), it cannot resolve
  // `hover:${dynamic}` string interpolation at build time.
  hoverClasses: string;
}

export const UNIT_THEME: Record<UnitType, UnitTheme> = {
  police: { hex: '#2563eb', bg: 'bg-blue-900/20', border: 'border-blue-800/40', title: 'text-blue-400', badge: 'bg-blue-600 text-white', bar: 'bg-blue-500', dot: 'bg-blue-500', label: 'Poliție', hoverClasses: 'hover:bg-blue-900/40 hover:border-blue-700' },
  fire: { hex: '#dc2626', bg: 'bg-red-900/20', border: 'border-red-800/40', title: 'text-red-400', badge: 'bg-red-600 text-white', bar: 'bg-red-500', dot: 'bg-red-500', label: 'Pompieri (ISU)', hoverClasses: 'hover:bg-red-900/40 hover:border-red-700' },
  ambulance: { hex: '#10b981', bg: 'bg-emerald-900/20', border: 'border-emerald-800/40', title: 'text-emerald-400', badge: 'bg-emerald-600 text-white', bar: 'bg-emerald-500', dot: 'bg-emerald-500', label: 'Ambulanță (SMURD)', hoverClasses: 'hover:bg-emerald-900/40 hover:border-emerald-700' },
  gendarmerie: { hex: '#4f46e5', bg: 'bg-indigo-900/20', border: 'border-indigo-800/40', title: 'text-indigo-400', badge: 'bg-indigo-600 text-white', bar: 'bg-indigo-500', dot: 'bg-indigo-500', label: 'Jandarmerie', hoverClasses: 'hover:bg-indigo-900/40 hover:border-indigo-700' },
  swat: { hex: '#334155', bg: 'bg-slate-900/80', border: 'border-slate-600', title: 'text-slate-300', badge: 'bg-slate-800 text-white', bar: 'bg-slate-500', dot: 'bg-slate-500', label: 'SIAS / Mascați', hoverClasses: 'hover:bg-slate-700 hover:border-slate-500' },
  helicopter: { hex: '#0ea5e9', bg: 'bg-sky-900/20', border: 'border-sky-800/40', title: 'text-sky-400', badge: 'bg-sky-600 text-white', bar: 'bg-sky-500', dot: 'bg-sky-500', label: 'Elicopter Aviație', hoverClasses: 'hover:bg-sky-900/40 hover:border-sky-700' },
};

export const UNIT_ORDER: UnitType[] = ['police', 'gendarmerie', 'swat', 'helicopter', 'ambulance', 'fire'];

export interface IncidentTheme {
  hex: string;
  border: string;
  bg: string;
  text: string;
  selectedBorder: string;
  selectedBg: string;
  selectedText: string;
}

export const INCIDENT_THEME: Record<IncidentType, IncidentTheme> = {
  crime: { hex: '#2563eb', border: 'border-blue-800/50', bg: 'bg-blue-900/20', text: 'text-blue-400', selectedBorder: 'border-blue-500', selectedBg: 'bg-blue-900/20', selectedText: 'text-blue-300' },
  fire: { hex: '#dc2626', border: 'border-red-800/50', bg: 'bg-red-900/20', text: 'text-red-400', selectedBorder: 'border-red-500', selectedBg: 'bg-red-900/20', selectedText: 'text-red-300' },
  medical: { hex: '#f97316', border: 'border-orange-800/50', bg: 'bg-orange-900/20', text: 'text-orange-400', selectedBorder: 'border-orange-500', selectedBg: 'bg-orange-900/20', selectedText: 'text-orange-300' },
};

// Unit purchase prices — mirrors the `prices` map in server.ts (server is the
// source of truth for the actual transaction; this drives the UI display and
// the client-side "insufficient funds" check).
export const UNIT_PRICES: Record<UnitType, number> = {
  police: 15000,
  ambulance: 25000,
  fire: 40000,
  gendarmerie: 20000,
  swat: 35000,
  helicopter: 100000,
};

export const REFUEL_COST = 1000;
export const REFUEL_ALL_COST_PER_UNIT = 500;
export const RENT_OPERATOR_COST = 15000;

// Simulation constants mirrored from server.ts, used only for client-side ETA
// estimates — the server remains authoritative for actual unit movement.
export const UNIT_SPEED = 0.0002;
export const TICKS_PER_SECOND = 10;
export const INCIDENT_COUNTDOWN_MS = 180000;

export const WEATHER_SPEED_MULTIPLIERS: Record<string, number> = {
  clear: 1,
  rain: 0.8,
  snow: 0.6,
  storm: 0.5,
};

export const WEATHER_LABELS: Record<string, string> = {
  clear: 'Senin',
  rain: 'Ploaie',
  snow: 'Ninsoare',
  storm: 'Furtună',
};

// SVG path markup (lucide-icons style) used for map DivIcon markers — kept as
// raw strings since Leaflet DivIcon renders plain HTML, not React.
export const UNIT_ICON_SVG: Record<UnitType, string> = {
  police: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  fire: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  ambulance: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>',
  gendarmerie: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  swat: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  helicopter: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-3"/><path d="M10 22h4"/><path d="M2 6h20"/><path d="M12 6V3"/><path d="M10 6v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6"/><path d="M12 12v6"/><path d="M6 12a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H6z"/></svg>',
};

export const INCIDENT_ICON_SVG = {
  default: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  resolved: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
  crime: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  fire: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  medical: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
};

export const SEVERITY_COLORS: Record<1 | 2 | 3, { hex: string; shadow: string }> = {
  1: { hex: '#3b82f6', shadow: '0 0 10px rgba(59,130,246,0.6)' },
  2: { hex: '#eab308', shadow: '0 0 15px rgba(234,179,8,0.8)' },
  3: { hex: '#dc2626', shadow: '0 0 20px rgba(220,38,38,1)' },
};

export const RESOLVED_COLOR = { hex: '#10b981', shadow: '0 0 20px rgba(16,185,129,0.8)' };

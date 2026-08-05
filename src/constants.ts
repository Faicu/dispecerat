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
  crime:     { hex: '#2563eb', border: 'border-blue-800/50',   bg: 'bg-blue-900/20',   text: 'text-blue-400',   selectedBorder: 'border-blue-500',   selectedBg: 'bg-blue-900/20',   selectedText: 'text-blue-300' },
  fire:      { hex: '#dc2626', border: 'border-red-800/50',    bg: 'bg-red-900/20',    text: 'text-red-400',    selectedBorder: 'border-red-500',    selectedBg: 'bg-red-900/20',    selectedText: 'text-red-300' },
  medical:   { hex: '#f97316', border: 'border-orange-800/50', bg: 'bg-orange-900/20', text: 'text-orange-400', selectedBorder: 'border-orange-500', selectedBg: 'bg-orange-900/20', selectedText: 'text-orange-300' },
  accident:  { hex: '#eab308', border: 'border-yellow-800/50', bg: 'bg-yellow-900/20', text: 'text-yellow-400', selectedBorder: 'border-yellow-500', selectedBg: 'bg-yellow-900/20', selectedText: 'text-yellow-300' },
  robbery:   { hex: '#7c3aed', border: 'border-violet-800/50', bg: 'bg-violet-900/20', text: 'text-violet-400', selectedBorder: 'border-violet-500', selectedBg: 'bg-violet-900/20', selectedText: 'text-violet-300' },
  explosion: { hex: '#ea580c', border: 'border-orange-700/50', bg: 'bg-orange-900/30', text: 'text-orange-300', selectedBorder: 'border-orange-400', selectedBg: 'bg-orange-900/30', selectedText: 'text-orange-200' },
  rescue:    { hex: '#0891b2', border: 'border-cyan-800/50',   bg: 'bg-cyan-900/20',   text: 'text-cyan-400',   selectedBorder: 'border-cyan-500',   selectedBg: 'bg-cyan-900/20',   selectedText: 'text-cyan-300' },
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

// Unit icons — realistic and distinct per type, used as raw HTML in Leaflet DivIcon
export const UNIT_ICON_SVG: Record<UnitType, string> = {
  // Police: shield with badge
  police: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 1L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5L12 1zm0 4l1.5 3h3l-2.5 1.8.9 3.2L12 11.3l-2.9 1.7.9-3.2L7.5 8H10.5L12 5z"/></svg>',
  // Fire truck: flame
  fire: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32C8.99 6.38 8.1 9.54 9.1 12.38c.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a4.17 4.17 0 0 1-1.05-1.2c-.43-.75-.64-1.6-.61-2.45C5.62 9.8 5.09 10.36 4.7 11 3.8 12.47 3.5 14.26 3.73 16.06c.25 2.08 1.37 3.96 2.93 5.2 1.84 1.44 4.39 2.03 6.67 1.27 2.43-.82 4.19-2.96 4.64-5.44.27-1.44.12-2.92-.31-4.09z"/></svg>',
  // Ambulance: medical cross
  ambulance: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>',
  // Gendarmerie: star (military)
  gendarmerie: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>',
  // SWAT: crosshair/target
  swat: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>',
  // Helicopter: rotor blades
  helicopter: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2 6h20v2H2zM11 2h2v4h-2zM9 8h6l1 5H8zM11 13h2v3h-2zM9 16h6v2H9zM10 18h4v2h-4z"/></svg>',
};

export const INCIDENT_ICON_SVG: Record<string, string> = {
  // Generic warning
  default:   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M1 21L12 2l11 19H1zm11-3v-2h-2v2h2zm0-4V10h-2v4h2z"/></svg>',
  // Checkmark
  resolved:  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z"/></svg>',
  // Crime: handcuffs symbol (person)
  crime:     '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>',
  // Fire: flame
  fire:      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32C8.99 6.38 8.1 9.54 9.1 12.38c.08.33-.15.42-.35.5-.23.1-.47.04-.66-.12a4.17 4.17 0 0 1-1.05-1.2c-.43-.75-.64-1.6-.61-2.45C5.62 9.8 5.09 10.36 4.7 11 3.8 12.47 3.5 14.26 3.73 16.06c.25 2.08 1.37 3.96 2.93 5.2 1.84 1.44 4.39 2.03 6.67 1.27 2.43-.82 4.19-2.96 4.64-5.44.27-1.44.12-2.92-.31-4.09z"/></svg>',
  // Medical: heart pulse
  medical:   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  // Accident: car crash
  accident:  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',
  // Robbery: money bag / alert
  robbery:   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h2V17h-2v-5.01zm0-4h2v2h-2V8z"/></svg>',
  // Explosion: starburst
  explosion: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 2l2.3 5.5L2 9.3l5.5 2.3L5.3 17l4.5-3.3L12 21l2.2-7.3 4.5 3.3-2.2-5.4L22 9.3l-7.3-1.8L17 2l-5 3.5L7 2z"/></svg>',
  // Rescue: lifebuoy
  rescue:    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.88-11.71L14 10.16V8h-4v2.16l-1.88-1.88-1.41 1.41L8.58 12l-1.88 1.88 1.41 1.41L10 13.42V16h4v-2.58l1.88 1.88 1.41-1.41L15.42 12l1.87-1.87-1.41-1.42z"/></svg>',
};

export const SEVERITY_COLORS: Record<1 | 2 | 3, { hex: string; shadow: string }> = {
  1: { hex: '#3b82f6', shadow: '0 0 10px rgba(59,130,246,0.6)' },
  2: { hex: '#eab308', shadow: '0 0 15px rgba(234,179,8,0.8)' },
  3: { hex: '#dc2626', shadow: '0 0 20px rgba(220,38,38,1)' },
};

export const RESOLVED_COLOR = { hex: '#10b981', shadow: '0 0 20px rgba(16,185,129,0.8)' };

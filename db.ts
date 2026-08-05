import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { GameState } from './src/types';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'dispecerat.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS game_save (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state TEXT NOT NULL,
    incident_id_counter INTEGER NOT NULL,
    unit_id_counter INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

export interface SavedGame {
  state: GameState;
  incidentIdCounter: number;
  unitIdCounter: number;
}

export function loadGame(): SavedGame | null {
  const row = db.prepare('SELECT * FROM game_save WHERE id = 1').get() as any;
  if (!row) return null;
  try {
    return {
      state: JSON.parse(row.state),
      incidentIdCounter: row.incident_id_counter,
      unitIdCounter: row.unit_id_counter,
    };
  } catch {
    return null;
  }
}

export function saveGame(state: GameState, incidentIdCounter: number, unitIdCounter: number) {
  db.prepare(`
    INSERT INTO game_save (id, state, incident_id_counter, unit_id_counter, updated_at)
    VALUES (1, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      state = excluded.state,
      incident_id_counter = excluded.incident_id_counter,
      unit_id_counter = excluded.unit_id_counter,
      updated_at = excluded.updated_at
  `).run(JSON.stringify(state), incidentIdCounter, unitIdCounter, Date.now());
}

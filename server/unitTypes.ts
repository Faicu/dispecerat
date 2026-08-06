/**
 * Specificații vehicule per agenție.
 * Modifică doar acest fișier pentru a adăuga/schimba tipuri de vehicule.
 */

export interface VehicleSpec {
  model: string;
  speedMultiplier: number;     // 1.0 = viteză normală
  fuelMultiplier: number;      // 1.0 = consum normal
  resolutionBonus: number;     // % rezolvare extra per tick (adăugat la baza de 2%)
  allowedIncidentTypes?: string[]; // dacă e setat, se dispecerizează DOAR la aceste tipuri
}

export const UNIT_VEHICLE_SPECS: Record<string, VehicleSpec[]> = {
  // ── POLIȚIE ────────────────────────────────────────────────────────────────
  police: [
    {
      model: 'Dacia Logan',
      speedMultiplier: 0.85,
      fuelMultiplier: 0.60,
      resolutionBonus: 0,
    },
    {
      model: 'VW Polo',
      speedMultiplier: 0.95,
      fuelMultiplier: 0.85,
      resolutionBonus: 0,
    },
    {
      model: 'Dacia Duster',
      speedMultiplier: 1.05,
      fuelMultiplier: 1.10,
      resolutionBonus: 1.2,
    },
    {
      model: 'BMW 320d',
      speedMultiplier: 1.45,
      fuelMultiplier: 1.40,
      resolutionBonus: 0,
    },
    {
      model: 'Motocicletă Rutieră',
      speedMultiplier: 1.90,
      fuelMultiplier: 0.45,
      resolutionBonus: 0,
      allowedIncidentTypes: ['accident', 'robbery', 'crime'],
    },
  ],

  // ── SMURD / AMBULANȚĂ ──────────────────────────────────────────────────────
  ambulance: [
    {
      model: 'Ambulanță Tip B (Mercedes Sprinter)',
      speedMultiplier: 0.90,
      fuelMultiplier: 1.00,
      resolutionBonus: 0,
    },
    {
      model: 'SMURD B2 (Dacia Duster)',
      speedMultiplier: 1.10,
      fuelMultiplier: 1.05,
      resolutionBonus: 0.5,
    },
    {
      model: 'SMURD C — UTI Mobilă',
      speedMultiplier: 0.80,
      fuelMultiplier: 1.30,
      resolutionBonus: 2.0,
    },
    {
      model: 'Motocicletă SMURD',
      speedMultiplier: 1.85,
      fuelMultiplier: 0.40,
      resolutionBonus: 0.3,
    },
  ],

  // ── POMPIERI ISU ───────────────────────────────────────────────────────────
  fire: [
    {
      model: 'Autospecială Stingere (Scania P 360)',
      speedMultiplier: 0.85,
      fuelMultiplier: 1.55,
      resolutionBonus: 0.8,
    },
    {
      model: 'Autospecială Salvare (Mercedes Sprinter)',
      speedMultiplier: 1.00,
      fuelMultiplier: 1.10,
      resolutionBonus: 0.3,
    },
    {
      model: 'Autoscară (Volvo FL)',
      speedMultiplier: 0.70,
      fuelMultiplier: 1.65,
      resolutionBonus: 1.5,
    },
    {
      model: 'Autospecială Hazmat',
      speedMultiplier: 0.75,
      fuelMultiplier: 1.40,
      resolutionBonus: 2.5,
    },
    {
      model: 'GIFF — Primă Intervenție (Dacia Duster)',
      speedMultiplier: 1.20,
      fuelMultiplier: 0.80,
      resolutionBonus: 0.2,
    },
  ],

  // ── JANDARMERIE ───────────────────────────────────────────────────────────
  gendarmerie: [
    {
      model: 'Dacia Duster Jandarmi',
      speedMultiplier: 1.05,
      fuelMultiplier: 1.10,
      resolutionBonus: 0.5,
    },
    {
      model: 'Dacia Logan Jandarmi',
      speedMultiplier: 0.90,
      fuelMultiplier: 0.65,
      resolutionBonus: 0,
    },
    {
      model: 'ARO 4x4',
      speedMultiplier: 0.95,
      fuelMultiplier: 1.30,
      resolutionBonus: 0.3,
    },
    {
      model: 'Autobuz Intervenție Jandarmi',
      speedMultiplier: 0.70,
      fuelMultiplier: 1.70,
      resolutionBonus: 2.0,
    },
  ],

  // ── SAS — MASCAȚI ─────────────────────────────────────────────────────────
  swat: [
    {
      model: 'Land Rover Defender SAS',
      speedMultiplier: 1.00,
      fuelMultiplier: 1.20,
      resolutionBonus: 2.0,
    },
    {
      model: 'Dacia Duster SAS',
      speedMultiplier: 1.10,
      fuelMultiplier: 1.00,
      resolutionBonus: 1.0,
    },
    {
      model: 'Transportor Blindat (BTR)',
      speedMultiplier: 0.70,
      fuelMultiplier: 1.90,
      resolutionBonus: 3.5,
    },
  ],

  // ── AVIAȚIE POLIȚIE (AVI) ─────────────────────────────────────────────────
  helicopter: [
    {
      model: 'Airbus H135 SMURD',
      speedMultiplier: 1.00,
      fuelMultiplier: 1.00,
      resolutionBonus: 1.5,
    },
    {
      model: 'IAR 330 Jandarmi',
      speedMultiplier: 0.95,
      fuelMultiplier: 1.10,
      resolutionBonus: 0.8,
    },
    {
      model: 'EC-145 Aviație Poliție',
      speedMultiplier: 1.10,
      fuelMultiplier: 1.05,
      resolutionBonus: 0.5,
    },
  ],
};

export function getRandomVehicleSpec(unitType: string): VehicleSpec {
  const specs = UNIT_VEHICLE_SPECS[unitType];
  if (!specs || specs.length === 0) {
    return { model: unitType, speedMultiplier: 1.0, fuelMultiplier: 1.0, resolutionBonus: 0 };
  }
  return specs[Math.floor(Math.random() * specs.length)];
}

import { IncidentType, UnitType } from '../../src/types';
import { incidentePolitie } from './politie';
import { incidenteAmbulanta } from './ambulanta';
import { incidentePompieri } from './pompieri';
import { incidenteJandarmi } from './jandarmi';

export type PrimaryAgency = 'police' | 'fire' | 'ambulance' | 'gendarmerie';

type DialogueOption = { text: string; nextStep: number | 'dispatch' };
type DialogueStep = { text: string; options: DialogueOption[] };
export type Dialogue = DialogueStep;

export interface IncidentCode {
  type: IncidentType;
  name: string;
  desc: string;
  primaryAgency: PrimaryAgency;
  cod: number;
  req: UnitType[];
  img: string;
  reward: number;
  severity: number;
  isMoving?: boolean;
  dialogue: Dialogue[];
}

export interface IncidentTemplate {
  type: IncidentType;
  name: string;
  desc: string;
  req: UnitType[];
  img: string;
  reward: number;
  isMoving?: boolean;
  severity: number;
  primaryAgency: PrimaryAgency;
  dialogue: Dialogue[];
}

export const ALL_INCIDENT_CODES: IncidentCode[] = [
  ...incidentePolitie,
  ...incidenteAmbulanta,
  ...incidentePompieri,
  ...incidenteJandarmi,
];

export const incidentTypes: IncidentTemplate[] = ALL_INCIDENT_CODES.map(ic => ({
  type: ic.type,
  name: ic.name,
  desc: ic.desc,
  req: ic.req,
  img: ic.img,
  reward: ic.reward,
  severity: ic.severity,
  isMoving: ic.isMoving,
  primaryAgency: ic.primaryAgency,
  dialogue: ic.dialogue,
}));

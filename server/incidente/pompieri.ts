import { IncidentCode } from './index';

export const incidentePompieri: IncidentCode[] = [
  // ── Cod 1 ──────────────────────────────────────────────────
  {
    type: 'fire', name: 'Incendiu Vegetație', primaryAgency: 'fire', cod: 1,
    desc: 'Foc deschis pe un teren viran. Risc de propagare la clădirile din jur.',
    req: ['fire'],
    img: 'https://images.unsplash.com/photo-1600868285514-6ec177b960b7?auto=format&fit=crop&w=300&q=80',
    reward: 1000, severity: 2,
    dialogue: [
      { text: 'Alo! Arde terenul viran de lângă bloc! Fumul intră prin ferestre!', options: [
        { text: 'Închidem ferestrele și chemăm pompierii. Există persoane în pericol direct?', nextStep: 1 },
        { text: 'Pompierii pleacă. Închideți ferestrele și îndepărtați-vă de fum.', nextStep: 'dispatch' },
      ]},
      { text: 'Nu, oamenii sunt în bloc. Dar focul se apropie de garduri!', options: [
        { text: 'Echipajul este în drum. Evacuați persoanele de la etajele inferioare dacă fumul e dens.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'rescue', name: 'Persoană Blocată în Lift', primaryAgency: 'fire', cod: 1,
    desc: 'Lift blocat între etaje cu pasageri înăuntru. Una din persoane acuză probleme cardiace.',
    req: ['fire', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80',
    reward: 1500, severity: 3,
    dialogue: [
      { text: 'Sunt blocat în lift de 20 de minute! Liftul nu merge! Cu mine e un bărbat care spune că îl doare inima!', options: [
        { text: 'Rămâneți calm. Este el conștient și respiră normal?', nextStep: 1 },
        { text: 'Pompierii și ambulanța vin imediat. Nu apăsați butoane în exces.', nextStep: 'dispatch' },
      ]},
      { text: 'Da, e conștient dar e palid și transpirat... mi-e frică!', options: [
        { text: 'Pompierii extrag liftul, ambulanța e pregătită. Spuneți-i să respire rar și adânc.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 2 ──────────────────────────────────────────────────
  {
    type: 'fire', name: 'Incendiu Apartament', primaryAgency: 'fire', cod: 2,
    desc: 'Foc izbucnit la bucătăria unui apartament de la etajul 4. Fumul s-a răspândit pe casa scărilor.',
    req: ['fire', 'fire', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1599723049282-59543e3a479a?auto=format&fit=crop&w=300&q=80',
    reward: 4000, severity: 3,
    dialogue: [
      { text: 'Arde apartamentul de deasupra! Iese fum pe ușă și pe fereastră! Oamenii de pe scări nu pot coborî!', options: [
        { text: 'Câte persoane sunt blocate pe casa scărilor? Rămâneți în apartamentele voastre cu ușile închise!', nextStep: 1 },
        { text: 'Pompierii și ambulanța pleacă. Rămâneți cu ușile etanșate.', nextStep: 'dispatch' },
      ]},
      { text: 'Nu știu exact, cel puțin 5-6 persoane... există și copii! Fumul e tot mai gros!', options: [
        { text: 'Echipele de intervenție cu aparate de respirat sosesc imediat. Rămâneți jos, aerul e mai curat.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'fire', name: 'Scurgere și Explozie de Gaze', primaryAgency: 'fire', cod: 2,
    desc: 'Miros puternic de gaz, risc iminent de explozie. Bloc parțial evacuat.',
    req: ['fire', 'fire', 'police'],
    img: 'https://images.unsplash.com/photo-1580974868218-c579c3dcb6b0?auto=format&fit=crop&w=300&q=80',
    reward: 5000, severity: 4,
    dialogue: [
      { text: 'Miros puternic de gaz în tot blocul! Vecinii sunt panicați! Am sunat și la gaz dar nu vin!', options: [
        { text: 'Nu aprindeți nimic, nu folosiți întrerupătoarele! Ieșiți toți din clădire imediat!', nextStep: 1 },
        { text: 'Pompierii și poliția vin pentru evacuare. Ieșiți toți din bloc acum!', nextStep: 'dispatch' },
      ]},
      { text: 'Ieșim! Dar un vecin de la etaj 5 nu răspunde la ușă!', options: [
        { text: 'Nu bateți ușa — percuțiile pot declanșa scântei. Pompierii vor intra echipați. Ieșiți!', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 3 ──────────────────────────────────────────────────
  {
    type: 'fire', name: 'Incendiu Clădire', primaryAgency: 'fire', cod: 3,
    desc: 'Incendiu extins la o clădire de birouri pe 6 etaje. Angajați blocați la etajele superioare.',
    req: ['fire', 'fire', 'fire', 'ambulance', 'police'],
    img: 'https://images.unsplash.com/photo-1599723049282-59543e3a479a?auto=format&fit=crop&w=300&q=80',
    reward: 12000, severity: 5,
    dialogue: [
      { text: 'Arde clădirea de birouri! Suntem blocați la etajul 5, scările sunt pline de fum!', options: [
        { text: 'Mergeți la acoperiș dacă e posibil sau la o fereastră vizibilă din stradă. Nu sărîți!', nextStep: 1 },
        { text: 'Trei echipaje de pompieri și ambulanțe pleacă imediat. Semnalizați-vă de la fereastră.', nextStep: 'dispatch' },
      ]},
      { text: 'Suntem vreo 12 persoane! Fumul vine de la etajul 3! Nu putem urca pe acoperiș!', options: [
        { text: 'Pompierii cu autoscara și aparate de respirat sosesc. Blocați spațiile de sub uși cu haine umede.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 4 ──────────────────────────────────────────────────
  {
    type: 'explosion', name: 'Explozie Conductă Gaz', primaryAgency: 'fire', cod: 4,
    desc: 'Explozie subterană a unei conducte de gaz. Cratere în stradă, risc de incendiu secundar.',
    req: ['fire', 'fire', 'fire', 'fire', 'ambulance', 'ambulance', 'police'],
    img: 'https://images.unsplash.com/photo-1580974868218-c579c3dcb6b0?auto=format&fit=crop&w=300&q=80',
    reward: 25000, severity: 5,
    dialogue: [
      { text: 'A explodat ceva în stradă! Un crater uriaș! Mașini răsturnate, oameni la pământ!', options: [
        { text: 'Evacuați imediat zona! Pot fi conducte neexplodate. Câte victime vedeți aproximativ?', nextStep: 1 },
        { text: 'Toate echipajele de urgență sunt alertate pentru calamitate. Îndepărtați-vă!', nextStep: 'dispatch' },
      ]},
      { text: 'Cel puțin 5-6 răniți pe stradă... mai explodează ceva ici-colo!', options: [
        { text: 'Echipele ISU cu costum de protecție, SMURD și poliție sosesc. Mențineți 200m distanță.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 5 ──────────────────────────────────────────────────
  {
    type: 'explosion', name: 'Explozie Depozit Industrial', primaryAgency: 'fire', cod: 5,
    desc: 'Explozie masivă la un depozit cu materiale chimice periculoase. Nori toxici.',
    req: ['fire', 'fire', 'fire', 'fire', 'fire', 'ambulance', 'ambulance', 'ambulance', 'police', 'helicopter'],
    img: 'https://images.unsplash.com/photo-1580974868218-c579c3dcb6b0?auto=format&fit=crop&w=300&q=80',
    reward: 50000, severity: 5,
    dialogue: [
      { text: 'Explozie la depozit! Nor galben în aer! Oamenii tușesc și leșină! E ceva toxic!', options: [
        { text: 'IEȘIȚI IMEDIAT! Acoperiți gura și nasul. Este nor toxic, evacuare urgentă!', nextStep: 1 },
        { text: 'Activăm protocolul CBRN. Echipele cu costum de hazmat sunt alertate urgent.', nextStep: 'dispatch' },
      ]},
      { text: 'Oamenii fug dar unii nu mai pot merge! Ard ochii!', options: [
        { text: 'Elicopterul cu antidot și echipele CBRN sosesc. Dirijați victimele spre vânt — nu lângă nor.', nextStep: 'dispatch' },
      ]},
    ],
  },
];

import { IncidentCode } from './index';

export const incidenteAmbulanta: IncidentCode[] = [
  // ── Cod 1 ──────────────────────────────────────────────────
  {
    type: 'medical', name: 'Infarct Miocardic', primaryAgency: 'ambulance', cod: 1,
    desc: 'Bărbat 58 ani acuză dureri puternice în piept și dificultăți de respirație.',
    req: ['ambulance'],
    img: 'https://images.unsplash.com/photo-1587311100595-6bc910a2eb75?auto=format&fit=crop&w=300&q=80',
    reward: 2000, severity: 4,
    dialogue: [
      { text: 'Alo, 112! Soțul meu e pe podea, ține mâna la piept și nu poate respira bine! E galben la față!', options: [
        { text: 'Înțeleg. Este conștient și respiră? Spuneți-mi vârsta lui.', nextStep: 1 },
        { text: 'Ambulanța pleacă imediat. Lăsați-l întins, nu-l ridicați.', nextStep: 'dispatch' },
      ]},
      { text: 'Da, respiră, dar greu... are 58 de ani... spune că îl doare teribil!', options: [
        { text: 'Dacă aveți aspirină fără strat enteric, dați-i una să o mestece. Ambulanța sosește.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'medical', name: 'Cădere la Domiciliu', primaryAgency: 'ambulance', cod: 1,
    desc: 'Persoană vârstnică a căzut și nu se mai poate ridica. Posibile fracturi.',
    req: ['ambulance'],
    img: 'https://images.unsplash.com/photo-1587311100595-6bc910a2eb75?auto=format&fit=crop&w=300&q=80',
    reward: 1200, severity: 2,
    dialogue: [
      { text: 'Bună ziua, sunați de la 112? Mama mea de 80 de ani a căzut în bucătărie și plânge că o doare piciorul!', options: [
        { text: 'Este conștientă și vorbește? Nu o mișcați până nu vine echipajul.', nextStep: 1 },
        { text: 'Ambulanța vine imediat. Nu o ridicați, ea să rămână nemișcată.', nextStep: 'dispatch' },
      ]},
      { text: 'Da, vorbește, e conștientă, dar nu o poate mișca pe picior... e umflat deja...', options: [
        { text: 'Semn că e posibil fracturat. Puneți o pernă sub cap și așteptați. Ambulanța sosește.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'medical', name: 'Reacție Alergică Severă', primaryAgency: 'ambulance', cod: 1,
    desc: 'Persoană cu reacție anafilactică după înțepătură de insectă. Stare critică.',
    req: ['ambulance'],
    img: 'https://images.unsplash.com/photo-1587311100595-6bc910a2eb75?auto=format&fit=crop&w=300&q=80',
    reward: 1800, severity: 4,
    dialogue: [
      { text: 'Alo 112! Prietenul meu a fost înțepat de o viespe și i s-a umflat gâtul! Respiră cu greu!', options: [
        { text: 'Critica! Puneți-l așezat puțin ridicat. Are Epipen sau antihistaminice la el?', nextStep: 1 },
        { text: 'Ambulanța pleacă imediat. Gâtul umflat indică anafilaxie — critică!', nextStep: 'dispatch' },
      ]},
      { text: 'Nu! Nu are nimic! Buzele i s-au albastrit! Vă rog repede!!!', options: [
        { text: 'Ambulanța cu medic UPU pleacă acum. Rămâneți cu el, dacă leșină întoarceți-l pe o parte.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 2 ──────────────────────────────────────────────────
  {
    type: 'accident', name: 'Accident Rutier cu Victime', primaryAgency: 'ambulance', cod: 2,
    desc: 'Coliziune la intersecție, două persoane rănite, una posibil încarcerată.',
    req: ['ambulance', 'ambulance', 'police'],
    img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&w=300&q=80',
    reward: 5000, severity: 4,
    dialogue: [
      { text: 'Accident grav la intersecție! Două mașini ciocnite! Văd sânge! Un șofer nu se mișcă!', options: [
        { text: 'Nu mișcați răniții dacă nu e pericol imediat! Câte persoane rănite vedeți?', nextStep: 1 },
        { text: 'Ambulanțele și poliția pleacă imediat. Asigurați-vă că nu mai circulă alte mașini.', nextStep: 'dispatch' },
      ]},
      { text: 'Cel puțin două persoane. Unul e prins în mașina zdrobită, nu pot deschide ușa!', options: [
        { text: 'Nu forțați eliberarea persoanei încarceraăte — echipa ISU și ambulanța sosesc cu echipament.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'medical', name: 'Naștere Prematură', primaryAgency: 'ambulance', cod: 2,
    desc: 'Femeie gravidă (32 săptămâni) cu dureri de naștere. Naștere iminentă.',
    req: ['ambulance', 'ambulance', 'police'],
    img: 'https://images.unsplash.com/photo-1587311100595-6bc910a2eb75?auto=format&fit=crop&w=300&q=80',
    reward: 4500, severity: 4,
    dialogue: [
      { text: 'Soția mea este gravidă în luna 7 și are dureri la 5 minute! Spune că simte să nască acum!', options: [
        { text: 'Câte minute sunt contracțiile între ele? Este apa spartă?', nextStep: 1 },
        { text: 'Două ambulanțe pleacă. Pregătiți un pat curat. Nu lăsați-o să împingă până nu sosim.', nextStep: 'dispatch' },
      ]},
      { text: 'La 4-5 minute... apa nu s-a spart... dar ea spune că simte capul bebelușului!', options: [
        { text: 'Urgent! Ambulanța cu moașă pleacă imediat. Culcați-o pe spate, cu picioarele îndoite. Suntem în drum!', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 3 ──────────────────────────────────────────────────
  {
    type: 'accident', name: 'Carambol — Victime Multiple', primaryAgency: 'ambulance', cod: 3,
    desc: 'Accident cu 4 vehicule implicate, cel puțin 5 victime, unele în stare gravă.',
    req: ['ambulance', 'ambulance', 'ambulance', 'fire', 'police'],
    img: 'https://images.unsplash.com/photo-1603202662706-c3df8d98c1a6?auto=format&fit=crop&w=300&q=80',
    reward: 12000, severity: 5,
    dialogue: [
      { text: 'Accident uriaș pe DN1! Patru mașini! Un TIR a intrat peste ele! Sunt oameni pe jos! Ajutor!', options: [
        { text: 'Am înregistrat. Câte victime vedeți aproximativ și sunt inconștiente?', nextStep: 1 },
        { text: 'Toate echipajele disponibile pleacă. Activați semnalizarea de avertizare dacă aveți.', nextStep: 'dispatch' },
      ]},
      { text: 'Cel puțin cinci... doi sunt pe asfalt și nu mișcă... TIR-ul e pe o parte!', options: [
        { text: 'Echipaje multiple, pompieri și poliție sunt în drum. Nu mișcați victimele, posibile leziuni spinale.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 4 ──────────────────────────────────────────────────
  {
    type: 'accident', name: 'Prăbușire Schele', primaryAgency: 'ambulance', cod: 4,
    desc: 'Schele ale unui șantier s-au prăbușit. Muncitori prinși sub dărâmături.',
    req: ['ambulance', 'ambulance', 'ambulance', 'ambulance', 'fire', 'fire', 'police'],
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80',
    reward: 22000, severity: 5,
    dialogue: [
      { text: 'La șantier s-a prăbușit tot! Oameni prinși sub fier și beton! Mulți răniți! Ajutoooor!', options: [
        { text: 'Am alertat toate echipajele. Câți muncitori estimați că sunt sub dărâmături?', nextStep: 1 },
        { text: 'Toate serviciile de urgență sunt activate. Nu mișcați nimic fără echipament specializat.', nextStep: 'dispatch' },
      ]},
      { text: 'Nu știu... poate 8-10 oameni... aud gemete de sub moloz! Vă rog repede!', options: [
        { text: 'Echipele SMURD și pompierii cu utilaje de extragere sunt pe drum. Ghidați-i la sosire.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 5 ──────────────────────────────────────────────────
  {
    type: 'accident', name: 'Accident Aviatic', primaryAgency: 'ambulance', cod: 5,
    desc: 'Avion de mici dimensiuni s-a prăbușit în apropierea orașului. Situație critică.',
    req: ['ambulance', 'ambulance', 'ambulance', 'ambulance', 'ambulance', 'fire', 'fire', 'fire', 'police', 'helicopter'],
    img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=300&q=80',
    reward: 40000, severity: 5,
    dialogue: [
      { text: 'Am văzut un avion mic cum a coborât foarte repede și a dispărut după dealuri! A explodat ceva!', options: [
        { text: 'Localizăm zona. Vedeți fum sau flăcări? Există case sau persoane în zona impactului?', nextStep: 1 },
        { text: 'Toate echipajele de urgență sunt alertate. Dați coordonatele exacte.', nextStep: 'dispatch' },
      ]},
      { text: 'Da, fum negru gros! E undeva spre câmpul de la marginea orașului! Nu văd case aproape!', options: [
        { text: 'Elicopterul medical, SMURD și pompierii pleacă imediat. Rămâneți pe fir pentru ghidaj.', nextStep: 'dispatch' },
      ]},
    ],
  },
];

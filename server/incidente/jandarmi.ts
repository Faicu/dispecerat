import { IncidentCode } from './index';

export const incidenteJandarmi: IncidentCode[] = [
  // ── Cod 1 ──────────────────────────────────────────────────
  {
    type: 'riot', name: 'Cerșetor Agresiv', primaryAgency: 'gendarmerie', cod: 1,
    desc: 'Persoană agresivă solicită bani cu forța și amenință trecătorii.',
    req: ['gendarmerie'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 500, severity: 1,
    dialogue: [
      { text: 'Alo, 112! Un om agresiv urlă la mine și cere bani! Mă înjură și a ridicat mâna!', options: [
        { text: 'Rămâneți calm și îndepărtați-vă discret. Jandarmeria intervine.', nextStep: 1 },
        { text: 'Un echipaj de jandarmi sosește. Mergeți într-un loc aglomerat și așteptați.', nextStep: 'dispatch' },
      ]},
      { text: 'M-am mutat la câțiva metri... el continuă să strige la alți trecători!', options: [
        { text: 'Jandarmii sunt în drum. Rămâneți în vedere dar la distanță sigură.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'riot', name: 'Tulburarea Ordinii Publice', primaryAgency: 'gendarmerie', cod: 1,
    desc: 'Grup de persoane în stare de ebrietate face scandal pe domeniu public.',
    req: ['gendarmerie', 'police'],
    img: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=300&q=80',
    reward: 1000, severity: 2,
    dialogue: [
      { text: 'Sunt un grup de 5-6 persoane care fac scandal în fața restaurantului, sparg sticle și urlă!', options: [
        { text: 'Ieșiți din calea lor. Jandarmeria și poliția intervin.', nextStep: 1 },
        { text: 'Echipaj de jandarmi și poliție în drum. Nu încercați să-i calmați singuri.', nextStep: 'dispatch' },
      ]},
      { text: 'Au spart geamul de la mașina unui om! Vine lumea să se bată cu ei!', options: [
        { text: 'Echipajele sosesc imediat. Împiedicați altercații suplimentare dacă puteți din siguranță.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 2 ──────────────────────────────────────────────────
  {
    type: 'riot', name: 'Incident la Meci de Fotbal', primaryAgency: 'gendarmerie', cod: 2,
    desc: 'Conflict între suporterii celor două echipe în exteriorul stadionului. Escaladare rapidă.',
    req: ['gendarmerie', 'gendarmerie', 'police', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 5000, severity: 3,
    dialogue: [
      { text: 'Bătaie în masă lângă stadion! Sute de suporteri se bat! Sunt răniți pe jos!', options: [
        { text: 'Câte persoane rănite vedeți? Există arme sau obiecte contondente?', nextStep: 1 },
        { text: 'Jandarmeria mobilizată în forță. Îndepărtați-vă de zona conflictului.', nextStep: 'dispatch' },
      ]},
      { text: 'Scaune smulse, torțe... cel puțin 3-4 persoane pe jos! Vine ambulanța?', options: [
        { text: 'Ambulanța și jandarmii cu echipament anti-revoltă sosesc. Eliberați calea de acces.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'riot', name: 'Protest Spontan', primaryAgency: 'gendarmerie', cod: 2,
    desc: 'Aproximativ 200 de persoane s-au adunat spontan, fără autorizație. Situație tensionată.',
    req: ['gendarmerie', 'gendarmerie', 'police'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 4000, severity: 2,
    dialogue: [
      { text: 'Sunt un funcționar al primăriei. S-au adunat câteva sute de persoane în piață fără nicio autorizație!', options: [
        { text: 'Au manifestanții lideri de dialog? Există semne de violență sau distrugeri?', nextStep: 1 },
        { text: 'Jandarmeria în drum pentru asigurarea ordinii. Evitați confruntarea directă.', nextStep: 'dispatch' },
      ]},
      { text: 'Deocamdată pașnic, dar unii au petarde și fumigene. Poate escalada!', options: [
        { text: 'Echipajele de jandarmi sosesc pentru prezență preventivă și dialog. Monitorizați situația.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'riot', name: 'Conflict Inter-Comunitar', primaryAgency: 'gendarmerie', cod: 2,
    desc: 'Tensiuni escaladând între două comunități din cartier. Risc de violențe de masă.',
    req: ['gendarmerie', 'gendarmerie', 'police', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 5500, severity: 3,
    dialogue: [
      { text: 'Alo, 112! Două grupuri de oameni din cartier se confruntă! Zeci de persoane! Pietre și bâte!', options: [
        { text: 'Există răniți deja? Aproximați câte persoane sunt implicate per grup.', nextStep: 1 },
        { text: 'Jandarmeria în forță și poliție mobilizate. Retrageți-vă în siguranță.', nextStep: 'dispatch' },
      ]},
      { text: 'Câte 30-40 de persoane din fiecare parte! Văd sânge! Unii sunt loviți!', options: [
        { text: 'Echipaje multiple sosesc. Ambulanța e alertată. Nu interveniți singur în conflict.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 3 ──────────────────────────────────────────────────
  {
    type: 'riot', name: 'Protest Neautorizat (Mare)', primaryAgency: 'gendarmerie', cod: 3,
    desc: 'Protest neautorizat cu 1.000+ persoane blochează o arteră majoră. Primele semne de violență.',
    req: ['gendarmerie', 'gendarmerie', 'gendarmerie', 'police', 'police', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 9000, severity: 3,
    dialogue: [
      { text: 'Suntem comercianți de pe Calea Victoriei. E blocată toată strada de manifestanți! Unii sparg vitrine!', options: [
        { text: 'Câte vitrine au fost sparte? Există răniți? Jandarmeria mobilizată.', nextStep: 1 },
        { text: 'Echipaje de jandarmi, poliție și ambulanță sosesc. Rămâneți înăuntru.', nextStep: 'dispatch' },
      ]},
      { text: 'Două vitrine... și văd o persoană cu capul spart pe trotuar!', options: [
        { text: 'Ambulanța și jandarmii cu echipament complet sunt în drum. Asigurați-vă că răniții nu sunt călcați.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'riot', name: 'Operațiune de Evacuare Forțată', primaryAgency: 'gendarmerie', cod: 3,
    desc: 'Ocupanți ilegali refuză să evacueze un imobil. Executori judecătorești solicitați.',
    req: ['gendarmerie', 'gendarmerie', 'gendarmerie', 'police'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 7000, severity: 3,
    dialogue: [
      { text: 'Sunt executor judecătoresc. Locatarii refuză să iasă și ne amenință! Suntem blocați la intrare!', options: [
        { text: 'Există risc fizic imediat? Câte persoane sunt înăuntru și există copii?', nextStep: 1 },
        { text: 'Jandarmeria sosește pentru asigurarea executării mandatului. Rămâneți în afara imobilului.', nextStep: 'dispatch' },
      ]},
      { text: 'Nu știu exact câți sunt, dar au scos o bâtă! Cu noi sunt și doi copii!', options: [
        { text: 'Echipajele sosesc prioritar. Retrageți-vă imediat, nu forțați intrarea până nu sosesc jandarmii.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'riot', name: 'Festival Neautorizat — Degenerare', primaryAgency: 'gendarmerie', cod: 3,
    desc: 'Eveniment privat transformat în festival ilegal. Mii de persoane, droguri, violențe.',
    req: ['gendarmerie', 'gendarmerie', 'gendarmerie', 'police', 'ambulance', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 11000, severity: 4,
    dialogue: [
      { text: 'Suntem organizatorii, ne-a scăpat situația de sub control! Au venit de 10 ori mai mulți! Se bat și sunt oameni rău!', options: [
        { text: 'Câte persoane estimați la fața locului? Au fost chemați deja alt serviciu de urgență?', nextStep: 1 },
        { text: 'Jandarmeria în forță și ambulanțele sunt alertate. Opriți muzica imediat.', nextStep: 'dispatch' },
      ]},
      { text: 'Poate 2000 de oameni! Am oprit muzica dar urlă cu toții! Unii au început să se bată și pun foc la decoruri!', options: [
        { text: 'Echipajele multiple sosesc urgent. Deschideți toate ieșirile de urgență pentru evacuare ordonată.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 4 ──────────────────────────────────────────────────
  {
    type: 'riot', name: 'Revoltă Stradală', primaryAgency: 'gendarmerie', cod: 4,
    desc: 'Violențe grave în stradă. Mașini incendiate, vitrine sparte, zeci de răniți.',
    req: ['gendarmerie', 'gendarmerie', 'gendarmerie', 'gendarmerie', 'police', 'police', 'ambulance', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 20000, severity: 4,
    dialogue: [
      { text: 'E haos total în zona centrală! Ard mașini! Se aruncă cu pietre în tot! Poliția a fost respinsă!', options: [
        { text: 'Câte blocuri/străzi sunt afectate? Există victime grave sau luate ostatice?', nextStep: 1 },
        { text: 'Mobilizare generală jandarmerie. Toate echipajele disponibile sunt alertate.', nextStep: 'dispatch' },
      ]},
      { text: 'Cel puțin 3 străzi paralele! Văd oameni loviți pe trotuar! Pompierii pentru mașini?', options: [
        { text: 'Pompierii, SMURD și toți jandarmii disponibili sunt în drum. Efectivele sosesc în valuri.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Percheziție Masivă', primaryAgency: 'gendarmerie', cod: 4,
    desc: 'Operațiune de percheziție la un depozit controlat de grup infracțional organizat.',
    req: ['gendarmerie', 'gendarmerie', 'gendarmerie', 'gendarmerie', 'police', 'swat'],
    img: 'https://images.unsplash.com/photo-1596765793043-42e1cc714fb0?auto=format&fit=crop&w=300&q=80',
    reward: 22000, severity: 4,
    dialogue: [
      { text: 'Procuratură, solicitare urgentă de executare mandat percheziție. Obiectiv cu potențial risc armat.', options: [
        { text: 'Confirmat. Câte persoane estimate în obiectiv și există informații despre armament?', nextStep: 1 },
        { text: 'Echipele SWAT și jandarmii sunt mobilizați. Așteptați confirmarea dispozitivului.', nextStep: 'dispatch' },
      ]},
      { text: 'Se estimează 8-12 persoane, cel puțin 3 cunoscute ca periculoase și înarmate.', options: [
        { text: 'Dispozitivul complet cu SWAT și jandarmi e activat. Nu intrați fără acoperire.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 5 ──────────────────────────────────────────────────
  {
    type: 'riot', name: 'Revoltă în Masă', primaryAgency: 'gendarmerie', cod: 5,
    desc: 'Revoltă populară de amploare. Clădiri oficiale atacate, forțe de ordine copleșite.',
    req: ['gendarmerie', 'gendarmerie', 'gendarmerie', 'gendarmerie', 'gendarmerie', 'police', 'police', 'police', 'ambulance', 'ambulance', 'helicopter'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 45000, severity: 5,
    dialogue: [
      { text: 'Prefectură! Suntem asediați! Mii de persoane atacă clădirea! Geamuri sparte, focuri la intrare!', options: [
        { text: 'Activăm planul de mobilizare în forță! Câte persoane sunt în clădire și există ieșiri de urgență?', nextStep: 1 },
        { text: 'Toate forțele disponibile mobilizate. Blocați ușile și așteptați extracția.', nextStep: 'dispatch' },
      ]},
      { text: 'Suntem 40 de angajați, avem ieșire pe spate! Dar la spate au ajuns și manifestanți!', options: [
        { text: 'Elicopterul de extracție și toate echipajele sosesc urgent. Rămâneți pe acoperiș dacă e posibil.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'riot', name: 'Blocaj Autostradă (Protest Fermieri)', primaryAgency: 'gendarmerie', cod: 5,
    desc: 'Sute de tractoare blochează autostrada. Confruntări cu forțele de ordine.',
    req: ['gendarmerie', 'gendarmerie', 'gendarmerie', 'gendarmerie', 'gendarmerie', 'police', 'police', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 35000, severity: 4,
    dialogue: [
      { text: 'DRDP București! Autostrada A1 e blocată total de tractoare! Sunt sute! Traficul în ambele sensuri e oprit!', options: [
        { text: 'Există violențe sau doar blocaj pasiv? Câte persoane aproximativ și pe ce sector?', nextStep: 1 },
        { text: 'Jandarmeria mobilizată la maxim pentru negociere și deblocare. Alertăm și CNAIR.', nextStep: 'dispatch' },
      ]},
      { text: 'Sectorul km 15-30! Deocamdată pașnic dar unii taie cauciucuri la mașini blocate! Tensiune maximă!', options: [
        { text: 'Echipajele masive de jandarmi sosesc cu vehicule speciale. Activăm negociatorul de criză.', nextStep: 'dispatch' },
      ]},
    ],
  },
];

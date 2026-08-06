import { IncidentCode } from './index';

export const incidentePolitie: IncidentCode[] = [
  // ── Cod 1 ──────────────────────────────────────────────────
  {
    type: 'crime', name: 'Alarmă Falsă (Efracție)', primaryAgency: 'police', cod: 1,
    desc: 'Sistem de securitate declanșat la o locuință fără semne evidente de spargere.',
    req: ['police'],
    img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80',
    reward: 400, severity: 1,
    dialogue: [
      { text: 'Alo, 112! Am auzit alarma de la vecini și nu răspunde nimeni la ușă! E ceva suspect!', options: [
        { text: 'Înțeleg. Ați văzut persoane necunoscute în zonă?', nextStep: 1 },
        { text: 'Trimitem un echipaj imediat să verifice.', nextStep: 'dispatch' },
      ]},
      { text: 'Nu, dar alarma sună de 10 minute! Poate e un jaf!', options: [
        { text: 'Rămâneți la distanță. Echipajul nostru va fi acolo în câteva minute.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Scandalagiu Agresiv', primaryAgency: 'police', cod: 1,
    desc: 'Persoană în stare de ebrietate creează scandal și deranjează locatarii.',
    req: ['police'],
    img: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=300&q=80',
    reward: 600, severity: 2,
    dialogue: [
      { text: 'Bună ziua, 112! Un om beat urlă în fața blocului și a spart un geam! Vă rog veniți!', options: [
        { text: 'Înțeleg. Este înarmat sau a agresat pe cineva?', nextStep: 1 },
        { text: 'Trimitem un echipaj de poliție. Evitați să-l provocați.', nextStep: 'dispatch' },
      ]},
      { text: 'Nu cred că e înarmat, dar nimeni nu îndrăznește să iasă din casă!', options: [
        { text: 'Am localizat apelul. Echipajul nostru sosește curând.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Violență Domestică', primaryAgency: 'police', cod: 1,
    desc: 'Apel de urgență — țipete și sunete de violență dintr-un apartament.',
    req: ['police'],
    img: 'https://images.unsplash.com/photo-1582216664920-1a6c026858e9?auto=format&fit=crop&w=300&q=80',
    reward: 1200, severity: 2,
    dialogue: [
      { text: 'Alo! Aud cum se bat la etajul de deasupra! Sunt țipete și ceva s-a spart!', options: [
        { text: 'Știți câte persoane sunt implicate?', nextStep: 1 },
        { text: 'Trimitem imediat un echipaj. Nu interveniți singur.', nextStep: 'dispatch' },
      ]},
      { text: 'O femeie și un bărbat, cred. Țipetele s-au oprit dar... e liniște suspectă acum.', options: [
        { text: 'Liniștea poate însemna că persoana nu mai poate să țipe. Echipajul pleacă imediat.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 2 ──────────────────────────────────────────────────
  {
    type: 'robbery', name: 'Tâlhărie Stradală', primaryAgency: 'police', cod: 2,
    desc: 'Victimă jefuită în parc. Agresorii au fugit pe jos în direcție necunoscută.',
    req: ['police', 'police'],
    img: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=300&q=80',
    reward: 2000, severity: 3,
    dialogue: [
      { text: 'Ajutor! M-au jefuit! Mi-au luat geanta și telefonul! Doi bărbați cu glugă, au fugit spre parc!', options: [
        { text: 'Ești în siguranță acum? Ești rănit?', nextStep: 1 },
        { text: 'Rămâi pe loc. Trimitem imediat echipaje.', nextStep: 'dispatch' },
      ]},
      { text: 'Sunt bine, nu m-au lovit, dar am tot ce aveam în geantă! Acte, bani, tot!', options: [
        { text: 'Rămâi exact unde ești. Echipajele noastre au plecat deja în urmărire.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Spargere Locuință', primaryAgency: 'police', cod: 2,
    desc: 'Proprietar a surprins hoți în propria locuință. Suspecții sunt încă pe proprietate.',
    req: ['police', 'police'],
    img: 'https://images.unsplash.com/photo-1533031065113-75217aa76878?auto=format&fit=crop&w=300&q=80',
    reward: 2500, severity: 3,
    dialogue: [
      { text: 'Alo, 112! Sunt acasă și am găsit ușa forțată! Cred că cineva e în interior, aud zgomote!', options: [
        { text: 'Ieșiți imediat din casă! Nu confruntați intruii!', nextStep: 1 },
        { text: 'Echipajele noastre sosesc. Ieșiți acum din imobil.', nextStep: 'dispatch' },
      ]},
      { text: 'Am ieșit! Sunt în stradă. Se vede lumina de la lanternă prin geam!', options: [
        { text: 'Bine. Așteptați la distanță sigură. Echipajele sunt pe drum.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 3 ──────────────────────────────────────────────────
  {
    type: 'crime', name: 'Urmărire în Trafic', primaryAgency: 'police', cod: 3,
    desc: 'Autoturism suspect refuză să oprească la semnalele poliției. Șofer periculos în trafic.',
    req: ['police', 'police', 'police', 'helicopter'],
    img: 'https://images.unsplash.com/photo-1549315629-15d2a933d062?auto=format&fit=crop&w=300&q=80',
    reward: 6000, severity: 3, isMoving: true,
    dialogue: [
      { text: 'Martor la urmărire! Un BMW negru circulă cu viteză pe Bulevardul Unirii, evitând mașinile de poliție!', options: [
        { text: 'Vă mulțumim. Înregistrați numărul de înmatriculare dacă e posibil.', nextStep: 1 },
        { text: 'Am primit informația. Retrageți-vă din calea vehiculelor.', nextStep: 'dispatch' },
      ]},
      { text: 'B-37-XYZ mi se pare... rula deja spre Piața Unirii! E periculos!', options: [
        { text: 'Informația a fost transmisă echipajelor. Nu urmăriți vehiculul.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'robbery', name: 'Jaf Armat (Bancă)', primaryAgency: 'police', cod: 3,
    desc: 'Suspecți înarmați au pătruns într-o sucursală bancară. Ostatici posibili.',
    req: ['police', 'police', 'police', 'swat'],
    img: 'https://images.unsplash.com/photo-1533031065113-75217aa76878?auto=format&fit=crop&w=300&q=80',
    reward: 12000, severity: 4,
    dialogue: [
      { text: 'Sunt angajat la bancă... [șoaptă] ...sunt oameni cu arme! Doi mascați! Toți suntem pe jos!', options: [
        { text: 'Rămâneți calm. Nu faceți mișcări bruște. Câți sunt și sunt îmbrăcați în ce culoare?', nextStep: 1 },
        { text: 'Înțeleg situația. Echipele speciale sunt alertate. Nu faceți nimic eroic.', nextStep: 'dispatch' },
      ]},
      { text: 'Doi... toți în negru... au luat telefoanele de la toți... v-am sunat de la cel ascuns...', options: [
        { text: 'Ați procedat corect. Puneți telefonul în buzunar fără să închideți. Echipele ajung în câteva minute.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Detentor Înarmat — Locuință', primaryAgency: 'police', cod: 3,
    desc: 'Persoană înarmată se baricadează în locuință proprie cu risc pentru familie.',
    req: ['police', 'police', 'swat', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1596765793043-42e1cc714fb0?auto=format&fit=crop&w=300&q=80',
    reward: 12000, severity: 4,
    dialogue: [
      { text: 'Vecina mea țipă de zece minute și am auzit o împușcătură! Soțul ei tot amenința că o să facă ceva...', options: [
        { text: 'Rămâneți în casă, nu interveniți. Ne ocupăm noi.', nextStep: 1 },
        { text: 'Echipele SAS sunt alertate. Localizăm adresa.', nextStep: 'dispatch' },
      ]},
      { text: 'Mai aud voci... ea plânge... el urlă ceva. E cu o pușcă, am văzut dimineața!', options: [
        { text: 'Perfect, nu vă expuneți. Echipele ajung în câteva minute. Monitorizați de la fereastră.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'rescue', name: 'Căutare Aeriană — Persoană Dispărută', primaryAgency: 'police', cod: 2,
    desc: 'Copil dispărut în zona forestieră. Căutare terestră fără rezultat. Necesită recunoaștere aeriană.',
    req: ['helicopter', 'police', 'police'],
    img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=300&q=80',
    reward: 9000, severity: 3, isMoving: true,
    dialogue: [
      { text: 'Copilul meu de 7 ani a plecat să culeagă ciuperci și nu s-a mai întors! Sunt în Pădurea Băneasa, au trecut 4 ore!', options: [
        { text: 'Cum era îmbrăcat? În ce direcție a plecat?', nextStep: 1 },
        { text: 'Mobilizăm elicopterul și echipele terestre imediat.', nextStep: 'dispatch' },
      ]},
      { text: 'Tricou roșu, pantaloni albaștri... A zis că merge pe potecă spre lac. Vă rog găsiți-l!', options: [
        { text: 'Elicopterul decolează. Rămâneți la punctul de întâlnire cu echipele noastre.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Supraveghere Aeriană Traficant', primaryAgency: 'police', cod: 3,
    desc: 'Vehicul suspect urmărit de poliție se deplasează prin zone greu accesibile. Necesară urmărire aeriană.',
    req: ['helicopter', 'police', 'police', 'police'],
    img: 'https://images.unsplash.com/photo-1549315629-15d2a933d062?auto=format&fit=crop&w=300&q=80',
    reward: 15000, severity: 3, isMoving: true,
    dialogue: [
      { text: 'Martor la o tranzacție de droguri! Un BMW negru fără numere a fugit prin parcul Herăstrău!', options: [
        { text: 'BMW negru, fără numere. Câte persoane?', nextStep: 1 },
        { text: 'Alertăm echipajele și elicopterul de urmărire.', nextStep: 'dispatch' },
      ]},
      { text: 'Doi bărbați. Unul a aruncat un rucsac înainte să fugă!', options: [
        { text: 'Elicopterul va localiza vehiculul. Nu îi urmăriți singuri.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 4 ──────────────────────────────────────────────────
  {
    type: 'crime', name: 'Evadat Periculos', primaryAgency: 'police', cod: 4,
    desc: 'Deținut condamnat pentru infracțiuni grave a evadat. Este considerat periculos.',
    req: ['police', 'police', 'police', 'police', 'swat', 'helicopter'],
    img: 'https://images.unsplash.com/photo-1596765793043-42e1cc714fb0?auto=format&fit=crop&w=300&q=80',
    reward: 15000, severity: 4, isMoving: true,
    dialogue: [
      { text: 'Alo, poliție?! Am văzut un bărbat care seamănă cu fotografia de pe știri! E la colțul străzii mele!', options: [
        { text: 'Rămâneți în casă și blocați ușile. Nu îl confruntați. Descrieți-l pe scurt.', nextStep: 1 },
        { text: 'Am primit semnalarea. Nu ieșiți și nu interacționați cu el sub nicio formă.', nextStep: 'dispatch' },
      ]},
      { text: 'Haină neagră, bocanci maro... a dispărut pe alee! Vă rog repede!', options: [
        { text: 'Echipajele și elicopterul sunt în drum. Rămâneți înăuntru cu ușile blocate.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Escortă VIP', primaryAgency: 'police', cod: 4,
    desc: 'Demnitar de rang înalt necesită escortă urgentă. Amenințări la adresa integrității fizice.',
    req: ['police', 'police', 'police', 'police', 'swat'],
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80',
    reward: 18000, severity: 4, isMoving: true,
    dialogue: [
      { text: 'Biroul de protocol, solicitare urgentă de escortă. Avem informații despre o amenințare directă la adresa demnitarului.', options: [
        { text: 'Confirmat. Precizați locația actuală și destinația.', nextStep: 1 },
        { text: 'Mobilizăm echipajele imediat. Dați coordonatele.', nextStep: 'dispatch' },
      ]},
      { text: 'Locație: Hotel Intercontinental. Destinație: Aeroport Otopeni. Plecare în 15 minute.', options: [
        { text: 'Echipajele de escortă sunt activate. Nu plecați până la confirmarea dispozitivului.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Operațiune Sub Acoperire SAS', primaryAgency: 'police', cod: 4,
    desc: 'Rețea de traficanți identificată. Operațiune de capturare necesită echipe specializate.',
    req: ['swat', 'swat', 'police', 'police', 'police'],
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80',
    reward: 22000, severity: 4,
    dialogue: [
      { text: 'Am informații sigure — șase persoane armate se află în depozitul de pe Strada Industriei. Acționați acum sau scapă!', options: [
        { text: 'Sursa e verificată? Avem nevoie de confirmare înainte de asalt.', nextStep: 1 },
        { text: 'Alertăm SAS imediat. Mențineți supravegherea.', nextStep: 'dispatch' },
      ]},
      { text: 'Da, agent sub acoperire confirmă. Sunt înarmați cu pistoale automate. Urgență maximă!', options: [
        { text: 'SAS mobilizat. Blocăm toate ieșirile. Nu acționați înainte de ordinul nostru.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'medical', name: 'Transport Aerian Medical Urgent', primaryAgency: 'police', cod: 2,
    desc: 'Pacient critic necesită transport rapid la spital. Condiții de trafic blochează ambulanța.',
    req: ['helicopter', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1587311100595-6bc910a2eb75?auto=format&fit=crop&w=300&q=80',
    reward: 8000, severity: 4,
    dialogue: [
      { text: 'Soțul meu a suferit un infarct masiv! Suntem blocați în trafic pe Șoseaua Colentina, ambulanța nu poate ajunge!', options: [
        { text: 'Înțeleg situația. Este conștient și respiră?', nextStep: 1 },
        { text: 'Trimitem elicopterul imediat. Dați-mi locația exactă.', nextStep: 'dispatch' },
      ]},
      { text: 'Respiră greu... buzele îi sunt vineții... nu poate vorbi! Vă rog repede!', options: [
        { text: 'Elicopterul SMURD decolează acum. Faceți spațiu în jur pentru aterizare de urgență.', nextStep: 'dispatch' },
      ]},
    ],
  },
  // ── Cod 5 ──────────────────────────────────────────────────
  {
    type: 'crime', name: 'Luare de Ostatici', primaryAgency: 'police', cod: 5,
    desc: 'Individ înarmat baricadat cu ostatici într-un centru comercial. Negociatori necesari.',
    req: ['police', 'police', 'police', 'police', 'police', 'swat', 'swat', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1596765793043-42e1cc714fb0?auto=format&fit=crop&w=300&q=80',
    reward: 40000, severity: 5,
    dialogue: [
      { text: 'Sunt blocat în magazin! Un om cu pistol a oprit pe toată lumea! Țipă că dacă cineva mișcă trage!', options: [
        { text: 'Rămâneți complet nemișcat și în tăcere. Câte persoane sunt și unde exact vă aflați?', nextStep: 1 },
        { text: 'Echipele speciale sunt alertate imediat. Rămâneți jos și nu vă mișcați.', nextStep: 'dispatch' },
      ]},
      { text: 'Suntem vreo 20 de persoane la parter. El e lângă casă... are pistolul ridicat...', options: [
        { text: 'SWAT și negociatorii sunt în drum. Nu faceți nimic care ar putea escalada situația.', nextStep: 'dispatch' },
      ]},
    ],
  },
  {
    type: 'crime', name: 'Operațiune Antiteroristă', primaryAgency: 'police', cod: 5,
    desc: 'Informații privind un atac iminent. Dispozitiv suspect identificat în zonă aglomerată.',
    req: ['police', 'police', 'police', 'police', 'police', 'swat', 'swat', 'helicopter', 'ambulance'],
    img: 'https://images.unsplash.com/photo-1580974868218-c579c3dcb6b0?auto=format&fit=crop&w=300&q=80',
    reward: 50000, severity: 5,
    dialogue: [
      { text: 'Am găsit un colet suspect abandonat lângă stația de metrou! E un geamantan negru fără proprietar de 30 de minute!', options: [
        { text: 'Nu îl atingeți și nu lăsați pe nimeni să se apropie. Evacuați imediat zona în raza de 200m.', nextStep: 1 },
        { text: 'Echipele antiteroriste sunt alertate. Începeți evacuarea imediat.', nextStep: 'dispatch' },
      ]},
      { text: 'Încep să strig la oameni să plece... sunt mulți... se înghesuie!', options: [
        { text: 'Echipele noastre sosesc pentru evacuare organizată. Continuați dar mențineți-vă la distanță sigură.', nextStep: 'dispatch' },
      ]},
    ],
  },
];

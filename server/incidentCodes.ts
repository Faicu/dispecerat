/**
 * Sistem de Coduri de Intervenție per Agenție
 *
 * Cod N = N unități din agenția primară + unități de suport din alte agenții.
 * Fiecare incident are dialogul propriu pentru apelurile 112.
 */

import { IncidentType, UnitType } from '../src/types';

export type PrimaryAgency = 'police' | 'fire' | 'ambulance' | 'gendarmerie';

type Dialogue = { text: string; options: { text: string; nextStep: number | 'dispatch' }[] };

export interface IncidentCode {
  type: IncidentType;
  name: string;
  desc: string;
  primaryAgency: PrimaryAgency;
  cod: number;
  req: UnitType[];       // primaryUnits + supporting, computed below
  img: string;
  reward: number;
  severity: number;
  isMoving?: boolean;
  dialogue: Dialogue[];
}

// ────────────────────────────────────────────────────────────
// POLIȚIE — Cod 1-5
// ────────────────────────────────────────────────────────────
const policeIncidents: IncidentCode[] = [
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
      { text: 'Sunt bine, nu m-au lovit, dar... am tot ce aveam în geantă! Acte, bani, tot!', options: [
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
      { text: 'Biroul de protocol, solicitare urgentă de escortă. Avem informații despre o amenințare directă la adresa demnitarului nostru.', options: [
        { text: 'Confirmat. Precizați locația actuală și destinația.', nextStep: 1 },
        { text: 'Mobilizăm echipajele imediat. Dați coordonatele.', nextStep: 'dispatch' },
      ]},
      { text: 'Locație: Hotel Intercontinental. Destinație: Aeroport Otopeni. Plecare în 15 minute.', options: [
        { text: 'Echipajele de escortă sunt activate. Nu plecați până la confirmarea dispozitivului.', nextStep: 'dispatch' },
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
  // ── SAS-specific ───────────────────────────────────────────────────────────
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
  // ── AVI-specific ───────────────────────────────────────────────────────────
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
  {
    type: 'crime', name: 'Supraveghere Aeriană Traficant', primaryAgency: 'police', cod: 3,
    desc: 'Vehicul suspect urmărit de poliție se deplasează prin zone greu accesibile. Necesară urmărire aeriană.',
    req: ['helicopter', 'police', 'police', 'police'],
    img: 'https://images.unsplash.com/photo-1549315629-15d2a933d062?auto=format&fit=crop&w=300&q=80',
    reward: 15000, severity: 3, isMoving: true,
    dialogue: [
      { text: 'Martor la o tranzacție de droguri! Un BMW negru fără numere a fugit prin parcul Herăstrău acum 2 minute spre lacuri!', options: [
        { text: 'BMW negru, fără numere. Câte persoane?', nextStep: 1 },
        { text: 'Alertăm echipajele și elicopterul de urmărire.', nextStep: 'dispatch' },
      ]},
      { text: 'Doi bărbați. Unul a aruncat un rucsac înainte să fugă!', options: [
        { text: 'Elicopterul va localiza vehiculul. Nu îi urmăriți singuri — aceasta este treaba noastră.', nextStep: 'dispatch' },
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

// ────────────────────────────────────────────────────────────
// AMBULANȚĂ — Cod 1-5
// ────────────────────────────────────────────────────────────
const ambulanceIncidents: IncidentCode[] = [
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

// ────────────────────────────────────────────────────────────
// POMPIERI — Cod 1-5
// ────────────────────────────────────────────────────────────
const fireIncidents: IncidentCode[] = [
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

// ────────────────────────────────────────────────────────────
// JANDARMI — Cod 1-5 (majoritate Cod 2+)
// ────────────────────────────────────────────────────────────
const gendarmerieIncidents: IncidentCode[] = [
  // ── Cod 1 ──────────────────────────────────────────────────
  {
    type: 'riot', name: 'Cerșetor Agresiv', primaryAgency: 'gendarmerie', cod: 1,
    desc: 'Persoană agresivă solicită bani cu forța și amenință trecătorii.',
    req: ['gendarmerie'],
    img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80',
    reward: 500, severity: 1,
    dialogue: [
      { text: 'Alo, 112! Un om agresiv urlă la mine și cere bani! Mă înjură și a ridicat mâna!', options: [
        { text: 'Rămâneți calm și îndepărtați-vă discret. Jandarmeriem intervine.', nextStep: 1 },
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
        { text: 'Ieșiți din calea lor. Jandarmeriem și poliția intervin.', nextStep: 1 },
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
        { text: 'Jandarmeriem mobilizată în forță. Îndepărtați-vă de zona conflictului.', nextStep: 'dispatch' },
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
        { text: 'Jandarmeriem în drum pentru asigurarea ordinii. Evitați confruntarea directă.', nextStep: 'dispatch' },
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
        { text: 'Jandarmeriem în forță și poliție mobilizate. Retrageți-vă în siguranță.', nextStep: 'dispatch' },
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
      { text: 'Suntem comercianți de pe Calea Victoriei. E blocată toată strada de manifestanți! Nu putem lucra și unii sparg vitrine!', options: [
        { text: 'Câte vitrine au fost sparte? Există răniți? Jandarmeriem mobilizată.', nextStep: 1 },
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
        { text: 'Jandarmeriem sosește pentru asigurarea executării mandatului. Rămâneți în afara imobilului.', nextStep: 'dispatch' },
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
        { text: 'Jandarmeriem în forță și ambulanțele sunt alertate. Opriți muzica imediat.', nextStep: 'dispatch' },
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
        { text: 'Mobilizare generală jandarmeriem. Toate echipajele disponibile sunt alertate.', nextStep: 'dispatch' },
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
      { text: 'Procuratură, solicitare urgentă de executare mandat percheziție. Obiectiv cu potențial risc armat.',options: [
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
        { text: 'Jandarmeriem mobilizată la maxim pentru negociere și deblocare. Alertăm și CNAIR.', nextStep: 'dispatch' },
      ]},
      { text: 'Sectorul km 15-30! Deocamdată pașnic dar unii taie cauciucuri la mașini blocate! Tensiune maximă!', options: [
        { text: 'Echipajele masive de jandarmi sosesc cu vehicule speciale. Activăm negociatorul de criză.', nextStep: 'dispatch' },
      ]},
    ],
  },
];

// ────────────────────────────────────────────────────────────
// Export — formatul compatibil cu IncidentTemplate existent
// ────────────────────────────────────────────────────────────
export const ALL_INCIDENT_CODES: IncidentCode[] = [
  ...policeIncidents,
  ...ambulanceIncidents,
  ...fireIncidents,
  ...gendarmerieIncidents,
];

// Re-export in the shape that server.ts / data.ts expect
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

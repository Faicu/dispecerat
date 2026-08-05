# Dispecerat 112

Simulator web de dispecerat de urgență (112), inspirat de jocul **Operator 112** (Steam). Jucătorul preia rolul unui operator de dispecerat pentru orașul București: primește apeluri de urgență, alocă unități de poliție/pompieri/ambulanță/jandarmerie/SIAS/elicopter pe hartă în timp real și gestionează bugetul, reputația și incidentele care escaladează.

Construit inițial cu **Google AI Studio (Build Apps)** și dezvoltat/menținut manual pe server.

![status](https://img.shields.io/badge/status-live-brightgreen) ![stack](https://img.shields.io/badge/stack-React%2019%20%2B%20Express%20%2B%20Socket.IO-blue)

---

## Cuprins

- [Funcționalități](#funcționalități)
- [Arhitectură & Stack tehnic](#arhitectură--stack-tehnic)
- [Structura proiectului](#structura-proiectului)
- [Instalare locală](#instalare-locală)
- [Scripturi disponibile](#scripturi-disponibile)
- [Variabile de mediu](#variabile-de-mediu)
- [Persistență & bază de date](#persistență--bază-de-date)
- [Model de date (GameState)](#model-de-date-gamestate)
- [Comunicare în timp real (Socket.IO)](#comunicare-în-timp-real-socketio)
- [Deploy pe server (Ubuntu + systemd)](#deploy-pe-server-ubuntu--systemd)
- [Expunere publică (Cloudflare Tunnel)](#expunere-publică-cloudflare-tunnel)
- [Dezvoltare & convenții de cod](#dezvoltare--convenții-de-cod)
- [Roadmap / idei viitoare](#roadmap--idei-viitoare)
- [Licență](#licență)

---

## Funcționalități

- **Hartă live (Leaflet)** a Bucureștiului cu poziții în timp real ale unităților, incidentelor, secțiilor de poliție, spitalelor și stațiilor ISU.
- **6 tipuri de unități**: Poliție, Pompieri (ISU), Ambulanță (SMURD), Jandarmerie, SIAS/Mascați, Elicopter — fiecare cu combustibil, stare (`idle`, `moving`, `on_scene`, `routing`, `transporting`, `patrolling`) și rută calculată real prin OSRM.
- **Incidente dinamice**: peste 20 de tipuri (jafuri, incendii, accidente, urgențe medicale, luări de ostatici etc.), cu grad de severitate (COD 1-3), unități necesare, recompense și — pentru unele — țintă mobilă (ex. urmărire în trafic).
- **Complicații & decizii tactice**: incidentele pot escalada în timpul soluționării, cerând dispecerului să aprobe proceduri, să trimită întăriri sau să aleagă o abordare tactică, cu impact asupra reputației și bugetului.
- **Vreme dinamică** (senin/ploaie/ninsoare/furtună) care influențează viteza unităților și poate declanșa accidente rutiere aleatorii.
- **Ciclu zi/noapte** cu suprapunere vizuală pe hartă.
- **Operator AI închiriabil** — dispecerizează automat unități pe incidente, cu cost recurent pe minut de joc.
- **Multiplayer cooperativ** — mai mulți operatori se pot conecta simultan pe aceeași sesiune de joc (state partajat prin Socket.IO).
- **Economie**: buget, achiziție de unități noi, realimentare (individuală sau în masă), reputație afectată de incidente expirate/rezolvate.
- **Feedback audio-vizual**: sinteză audio (Web Audio API, fără fișiere externe) pentru dispecerizare/sirenă/succes/eroare + sinteză vocală (`SpeechSynthesisUtterance`, voce română) pentru anunțuri de incidente, cu buton mute/unmute.
- **Persistență completă** — progresul (unități, incidente, buget, reputație, jurnal) supraviețuiește restart-urilor de server.

## Arhitectură & Stack tehnic

| Strat | Tehnologie |
|---|---|
| Frontend | React 19 + TypeScript, Vite 6, TailwindCSS v4 (CSS-first config) |
| Hartă | Leaflet + react-leaflet, tile-uri CARTO dark, rutare prin [OSRM](https://project-osrm.org/) public API |
| Backend | Node.js + Express + Socket.IO (server autoritativ, tick loop la 10Hz) |
| Persistență | SQLite via `better-sqlite3` (state serializat ca JSON, autosave periodic) |
| Animații | `motion` (Framer Motion) |
| Iconițe | `lucide-react` |
| Build | Vite (client) + esbuild (server, bundle CJS pentru producție) |
| Deploy | systemd service pe Ubuntu, expus public prin Cloudflare Tunnel |

Serverul este **sursa unică de adevăr** pentru toată simularea (poziții, fizică de mișcare, rezolvare incidente, economie). Clientul React primește starea completă a jocului prin evenimentul `stateUpdate` și doar afișează + trimite intenții (dispatch, achiziții, mutări manuale) — nu există logică de joc client-authoritative.

## Structura proiectului

```
.
├── server.ts                # Entry point server: Express + Socket.IO + game loop (tick)
├── db.ts                    # Persistență SQLite (load/save GameState)
├── server/
│   └── data.ts               # Date statice: secții poliție, spitale, stații ISU, șabloane de incidente
├── src/
│   ├── main.tsx               # Entry point React
│   ├── App.tsx                 # Componenta rădăcină, conexiune Socket.IO, layout
│   ├── types.ts                # Tipuri TypeScript partajate (GameState, Unit, Incident, ...)
│   ├── constants.ts            # Teme/culori per tip unitate & incident, prețuri, constante simulare
│   ├── utils.ts                 # Helpers partajate (formatare timp/recompensă, calcul ETA client)
│   ├── audio.ts                  # Sintetizator audio + sinteză vocală
│   ├── index.css                  # Tailwind + design tokens (@theme) + efecte CRT
│   └── components/
│       ├── TopNav.tsx              # Bară superioară: status, vreme, buget, reputație, ceas
│       ├── LeftSidebar.tsx          # Listă unități (pe categorii), jurnal, magazin, operator AI
│       ├── RightSidebar.tsx          # Listă incidente active, countdown, complicații
│       ├── BottomConsole.tsx          # Detalii incident/unitate selectată + consolă de dispatch
│       └── MapView.tsx                # Harta Leaflet cu toate marker-ele și rutele
├── data/                      # (generat la runtime, ignorat de git) baza de date SQLite
├── dist/                      # (generat la build, ignorat de git) build de producție
└── vite.config.ts / tsconfig.json / package.json
```

## Instalare locală

Cerințe: **Node.js 20+** și `npm` (proiectul include și `bun.lock`, deci merge și cu Bun).

```bash
git clone https://github.com/Faicu/dispecerat.git
cd dispecerat
npm install
npm run dev        # pornește server.ts direct cu tsx, Vite în modul middleware (HMR activ)
```

Aplicația pornește implicit pe portul **3002** (configurabil, vezi [Variabile de mediu](#variabile-de-mediu)) — `http://localhost:3002`.

Pentru a rula ca în producție (build + server compilat):

```bash
npm run build
npm start
```

## Scripturi disponibile

| Script | Descriere |
|---|---|
| `npm run dev` | Server de dezvoltare (`tsx server.ts`), Vite în middleware mode cu HMR |
| `npm run build` | Build client (Vite → `dist/`) + bundle server (esbuild → `dist/server.cjs`) |
| `npm start` | Rulează build-ul de producție (`node dist/server.cjs`) |
| `npm run lint` | Verificare de tipuri TypeScript (`tsc --noEmit`, strict mode) |
| `npm run clean` | Șterge `dist/` |

## Variabile de mediu

| Variabilă | Implicit | Descriere |
|---|---|---|
| `PORT` | `3002` | Portul pe care ascultă serverul Express/Socket.IO |
| `NODE_ENV` | — | Setează `production` pentru a servi build-ul static din `dist/` în loc de Vite middleware |
| `GEMINI_API_KEY` | — | Prezent în `.env.example` (moștenit din template-ul AI Studio); **nu este folosit momentan** în codul jocului |
| `APP_URL` | — | Idem, injectat automat de AI Studio/Cloud Run; neutilizat local |

Copiază `.env.example` în `.env` dacă vrei să păstrezi convenția, dar pentru rularea jocului propriu-zis nu e necesară nicio cheie.

## Persistență & bază de date

Progresul jocului este salvat automat în **SQLite** (`better-sqlite3`), într-o singură tabelă (`game_save`) care stochează întreaga stare a jocului (`GameState`) serializată ca JSON, plus contoarele interne de ID-uri:

```sql
CREATE TABLE IF NOT EXISTS game_save (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  state TEXT NOT NULL,
  incident_id_counter INTEGER NOT NULL,
  unit_id_counter INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

- Fișierul bazei de date se creează la `./data/dispecerat.db` (relativ la directorul de lucru al procesului), în mod `WAL`.
- **Autosave**: starea jocului este scrisă la fiecare **5 secunde**.
- **Salvare la oprire**: `SIGINT`/`SIGTERM` (ex. `systemctl restart`) declanșează o salvare finală înainte ca procesul să iasă — nu se pierde progres la un restart normal de serviciu.
- **La pornire**: dacă există un save valid, jocul continuă exact de unde a rămas (unități, incidente, buget, reputație, jurnal) — altfel se generează o lume nouă (unități la sediile lor, 2 incidente inițiale).
- Directorul `data/` este exclus din git (`.gitignore`) — baza de date **nu** este versionată, e specifică fiecărui mediu de rulare.

## Model de date (GameState)

Toată starea jocului trăiește într-un singur obiect `GameState` (`src/types.ts`), transmis integral clientului la fiecare tick în care ceva s-a schimbat:

```ts
interface GameState {
  units: Record<string, Unit>;
  incidents: Record<string, Incident>;
  budget: number;
  reputation: number;
  gameTime: number;
  weather: 'clear' | 'rain' | 'storm' | 'snow';
  logs: GameLog[];
  operators: string[];
  rentedOperators: { id: string; expiresAt: number; lastActionTime?: number; lastChargeTime?: number }[];
  stations: PoliceStation[];
  hospitals: Hospital[];
  fireStations: FireStation[];
  resolvedCountTotal: number;
  resolvedCountPerOperator: Record<string, number>;
  incidentRate: number;
  suggestions: string[];
}
```

## Comunicare în timp real (Socket.IO)

**Client → Server:**

| Eveniment | Payload | Descriere |
|---|---|---|
| `join` | `{ name }` | Intrare în sesiune ca operator |
| `dispatchUnit` | `{ unitId, incidentId, operator }` | Trimite o unitate la un incident |
| `manualMoveUnit` | `{ unitId, targetLoc }` | Deplasare manuală (click pe hartă) |
| `purchaseUnit` | `{ type }` | Achiziționează o unitate nouă |
| `refuelUnit` / `refuelAll` | `{ unitId }` / — | Realimentare individuală / în masă |
| `returnToBase` | `{ unitId }` | Retrage o unitate la bază |
| `rentOperator` / `fireOperator` | — | Activează/dezactivează Operatorul AI |
| `setIncidentRate` | `{ rate }` | Ajustează frecvența de apariție a incidentelor |
| `resolveComplication` | `{ incidentId, optionId? }` | Răspunde la o complicație/decizie tactică |

**Server → Client:**

| Eveniment | Descriere |
|---|---|
| `stateUpdate` | Emite `GameState` complet ori de câte ori ceva se schimbă (throttled la tick-ul de 100ms) |

## Deploy pe server (Ubuntu + systemd)

Instanța de producție rulează ca serviciu systemd numit **`dispecerat`**, pe portul **3002**.

```bash
cd /opt/dispecerat
git pull origin main
npm install
npm run build
sudo systemctl restart dispecerat
```

Fișierul de serviciu (`/etc/systemd/system/dispecerat.service`):

```ini
[Unit]
Description=Dispecerat 112 - Web Game Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/dispecerat
Environment=NODE_ENV=production
Environment=PORT=3002
ExecStart=/usr/bin/node dist/server.cjs
Restart=on-failure
RestartSec=5
User=root
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Comenzi utile:

```bash
sudo systemctl status dispecerat      # stare curentă
sudo systemctl restart dispecerat     # aplică un build nou (salvează progresul înainte de oprire)
journalctl -u dispecerat -f           # urmărește log-urile live
```

## Expunere publică (Cloudflare Tunnel)

Serviciul local (`localhost:3002`) este expus public la **https://dispecerat.faicu.ro/** printr-un Cloudflare Tunnel configurat separat pe server (în afara acestui repo). Orice deploy nou pe portul 3002 devine disponibil automat prin tunel, fără configurare suplimentară.

## Dezvoltare & convenții de cod

- **TypeScript strict mode** activat (`tsconfig.json`) — rulează `npm run lint` înainte de a trimite modificări.
- **Sursă unică de adevăr pentru culori/prețuri/constante**: `src/constants.ts` (client) — evită duplicarea culorilor/prețurilor unităților în mai multe componente.
- **Server-ul este autoritativ**: orice calcul de fizică/economie relevant pentru rezultatul jocului trebuie să existe pe server (`server.ts`); clientul poate replica estimări (ex. ETA) doar pentru afișaj, niciodată ca sursă de adevăr.
- Acest proiect a fost inițiat prin **Google AI Studio (Build Apps)** — modificările pot proveni fie din acel mediu (push direct pe `main`), fie din dezvoltare manuală pe server. La sincronizare, verifică mereu `npm run lint` + `npm run build` înainte de a reporni serviciul de producție.

## Roadmap / idei viitoare

- Modularizare completă a `server.ts` (în prezent parțial extras în `server/data.ts`; logica de tick/socket rămâne într-un singur fișier din cauza cuplării strânse prin closures).
- Autentificare operatori / leaderboard persistent.
- Code-splitting pe bundle-ul client (în prezent >500kB, avertizat de Vite la build).
- Tipuri suplimentare de incidente și hărți pentru alte orașe.

## Licență

Proiect personal / educațional, inspirat de jocul comercial *Operator 112*. Fără licență open-source explicită — toate drepturile rezervate autorului repository-ului.

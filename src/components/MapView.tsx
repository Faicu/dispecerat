import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GameState, UnitType, IncidentType } from '../types';
import { useMemo, useState, useEffect, useRef } from 'react';
import { UNIT_THEME, UNIT_ICON_SVG, INCIDENT_ICON_SVG, SEVERITY_COLORS, RESOLVED_COLOR } from '../constants';

// Fix Leaflet icons issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons — built from the shared UNIT_THEME/UNIT_ICON_SVG tables so
// colors stay in sync with the sidebars instead of being redefined here.
const getUnitIcon = (type: UnitType, id: string, state: string, isSelected: boolean) => {
  const color = UNIT_THEME[type]?.hex ?? '#334155';
  const iconSvg = UNIT_ICON_SVG[type] ?? UNIT_ICON_SVG.swat;
  const isMoving = state === 'moving' || state === 'routing' || state === 'transporting';

  return new L.DivIcon({
    className: 'custom-icon',
    html: `
      <div class="flex flex-col items-center relative drop-shadow-md cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : ''}">
        <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white ${isSelected ? 'ring-4 ring-yellow-400' : ''}" style="background-color: ${color}; box-shadow: 0 0 10px ${color}80;">
          ${iconSvg}
        </div>
        <div class="mt-1 text-[9px] bg-black/80 px-1.5 py-0.5 rounded text-white font-mono shadow-sm whitespace-nowrap">${id.toUpperCase()}</div>
        ${isMoving ? `
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            <div class="w-1.5 h-1.5 rounded-full bg-red-500 animate-[ping_0.3s_infinite]"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[ping_0.3s_infinite_0.15s]"></div>
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [32, 48],
    iconAnchor: [16, 24],
  });
};

const getIncidentIcon = (type: IncidentType, isSelected: boolean, severity: number = 1, resolved: boolean = false) => {
  const { hex: color, shadow } = resolved ? RESOLVED_COLOR : SEVERITY_COLORS[severity];

  const size = isSelected ? 48 : (32 + severity * 4);
  const pulse = (isSelected || severity >= 4 || resolved) ? 'animate-ping' : '';

  const iconSvg = resolved ? INCIDENT_ICON_SVG.resolved : (INCIDENT_ICON_SVG[type] ?? INCIDENT_ICON_SVG.default);

  const sqSize = size * 0.7;
  return new L.DivIcon({
    className: 'custom-icon',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer ${isSelected ? 'scale-110 z-40' : ''}" style="width:${size}px;height:${size}px;">
        ${(isSelected || severity >= 4) && !resolved ? `<div class="absolute inset-0 ${pulse}" style="background-color:${color};opacity:0.2;transform:rotate(45deg);border-radius:2px;"></div>` : ''}
        <div class="flex items-center justify-center text-white border-2 border-white" style="width:${sqSize}px;height:${sqSize}px;background-color:${color};box-shadow:${shadow};transform:rotate(45deg);border-radius:2px;">
          <div style="transform:rotate(-45deg)">${iconSvg}</div>
        </div>
        ${(severity >= 4 && !resolved) ? `<div class="absolute -top-1 -right-1 w-3 h-3 ${severity === 5 ? 'bg-purple-500' : 'bg-red-500'} rounded-full animate-pulse border border-white" style="border-width:1px"></div>` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

interface MapViewProps {
  gameState: GameState;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  selectedUnitId: string | null;
  onSelectUnit: (id: string | null) => void;
  onMapClick: (lat: number, lng: number) => void;
  playerRoles: import('../types').OperatorRole[];
}

function MapClickHandler({ onMapClick, addRipple }: { onMapClick: (lat: number, lng: number) => void, addRipple: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
      addRipple(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Memoized per-marker wrappers so the (relatively expensive) DivIcon HTML
// strings are only rebuilt when this specific unit/incident actually changes,
// instead of on every state tick for every marker on the map.
function IncidentMarker({ incident, isSelected, onSelect }: {
  incident: GameState['incidents'][string];
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const icon = useMemo(
    () => getIncidentIcon(incident.type, isSelected, incident.severity, incident.resolved),
    [incident.type, isSelected, incident.severity, incident.resolved]
  );

  return (
    <Marker
      position={[incident.location.lat, incident.location.lng]}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          onSelect(isSelected ? null : incident.id);
        },
      }}
    />
  );
}

function UnitMarker({ unit, isSelected, onSelect, gameState }: {
  unit: GameState['units'][string];
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  gameState: GameState;
}) {
  const icon = useMemo(
    () => getUnitIcon(unit.type, unit.name.split(' ')[0], unit.state, isSelected),
    [unit.type, unit.name, unit.state, isSelected]
  );
  const lineColor = UNIT_THEME[unit.type]?.hex ?? '#818cf8';

  return (
    <Marker
      position={[unit.location.lat, unit.location.lng]}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          onSelect(isSelected ? null : unit.id);
        },
      }}
    >
      {unit.route && unit.route.length > 0 && (
        <Polyline
          positions={[[unit.location.lat, unit.location.lng], ...unit.route.map(r => [r.lat, r.lng] as [number, number])]}
          color={lineColor}
          weight={unit.type === 'helicopter' ? 2 : 4}
          dashArray={unit.type === 'helicopter' ? "4 8" : ""}
          opacity={0.6}
        />
      )}
      {unit.targetIncidentId && (!unit.route || unit.route.length === 0) && (
        <Polyline
          positions={[
            [unit.location.lat, unit.location.lng],
            [gameState.incidents[unit.targetIncidentId]?.location.lat || unit.location.lat,
             gameState.incidents[unit.targetIncidentId]?.location.lng || unit.location.lng]
          ]}
          color={lineColor}
          dashArray="4 8"
          weight={2}
          opacity={0.6}
        />
      )}
      {unit.targetStationId && (!unit.route || unit.route.length === 0) && (
        (() => {
          const allBases = [...gameState.stations, ...gameState.hospitals, ...gameState.fireStations];
          const targetBase = allBases.find(s => s.id === unit.targetStationId);
          return (
            <Polyline
              positions={[
                [unit.location.lat, unit.location.lng],
                [targetBase?.location.lat || unit.location.lat,
                 targetBase?.location.lng || unit.location.lng]
              ]}
              color={lineColor}
              dashArray="4 8"
              weight={2}
              opacity={0.6}
            />
          );
        })()
      )}
    </Marker>
  );
}

const BOUNDS = { minLat: 44.39, maxLat: 44.49, minLng: 26.0, maxLng: 26.15 };

function MiniMap({ gameState }: { gameState: GameState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    const toX = (lng: number) => ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
    const toY = (lat: number) => (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Incidents
    Object.values(gameState.incidents).forEach(inc => {
      if (inc.resolved) return;
      ctx.beginPath();
      ctx.arc(toX(inc.location.lng), toY(inc.location.lat), 3, 0, Math.PI * 2);
      ctx.fillStyle = inc.severity === 5 ? '#a855f7' : inc.severity === 4 ? '#ef4444' : inc.severity === 3 ? '#f97316' : inc.severity === 2 ? '#eab308' : '#3b82f6';
      ctx.fill();
    });

    // Units
    Object.values(gameState.units).forEach(unit => {
      const color = (UNIT_THEME as any)[unit.type]?.hex ?? '#64748b';
      ctx.beginPath();
      ctx.arc(toX(unit.location.lng), toY(unit.location.lat), 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }, [gameState]);

  return (
    <div className="hidden sm:block absolute bottom-4 left-4 z-20 rounded border border-slate-700 overflow-hidden shadow-xl" style={{ width: 140, height: 90 }}>
      <canvas ref={canvasRef} width={140} height={90} className="block" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 flex justify-between">
        <span className="text-[8px] text-slate-400 uppercase tracking-wider">Overview</span>
        <span className="text-[8px] text-slate-500">{Object.keys(gameState.units).length}u · {Object.values(gameState.incidents).filter(i => !(i.isPhoneCall && i.callStatus !== 'completed')).filter(i => !(i.isPhoneCall && i.callStatus !== 'completed')).filter(i => !i.resolved).length}i</span>
      </div>
    </div>
  );
}

const ROLE_FOR_UNIT: Record<string, string> = {
  police: 'police', swat: 'police', helicopter: 'police',
  fire: 'fire', ambulance: 'ambulance', gendarmerie: 'gendarmerie',
};

export default function MapView({ gameState, selectedIncidentId, onSelectIncident, selectedUnitId, onSelectUnit, onMapClick, playerRoles }: MapViewProps) {
  // Center of Bucharest
  const center = { lat: 44.44, lng: 26.09 };
  const [ripples, setRipples] = useState<{lat: number, lng: number, id: number}[]>([]);
  const [hideOtherIncidents, setHideOtherIncidents] = useState(false);
  const [hideOtherUnits, setHideOtherUnits] = useState(false);

  const isMyIncident = (incident: GameState['incidents'][string]) =>
    incident.requiredUnits.some(u => playerRoles.includes(ROLE_FOR_UNIT[u] as any));

  const isMyUnit = (unit: GameState['units'][string]) =>
    playerRoles.includes(ROLE_FOR_UNIT[unit.type] as any);

  const addRipple = (lat: number, lng: number) => {
    const id = Date.now() + Math.random();
    setRipples(r => [...r, { lat, lng, id }]);
    setTimeout(() => {
      setRipples(r => r.filter(x => x.id !== id));
    }, 1000);
  };

  return (
    <>
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', background: '#0f172a', cursor: selectedUnitId ? 'crosshair' : 'grab' }}
      zoomControl={false}
      attributionControl={false}
    >
      <MapClickHandler onMapClick={onMapClick} addRipple={addRipple} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {ripples.map(r => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={new L.DivIcon({
            className: 'custom-icon',
            html: `<div class="w-16 h-16 -ml-8 -mt-8 rounded-full border border-sky-400 animate-ping opacity-70"></div>`,
            iconSize: [0, 0]
          })}
        />
      ))}

      {gameState.stations?.map((station) => (
        <Marker
          key={station.id}
          position={[station.location.lat, station.location.lng]}
          icon={new L.DivIcon({
            className: 'custom-icon',
            html: `
              <div class="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                <div class="w-5 h-5 bg-blue-950 border border-blue-500 rounded flex items-center justify-center text-blue-400 font-bold text-[8px] shadow-sm">POL</div>
                <div class="mt-1 text-[7px] bg-black/50 px-1 rounded text-slate-300 whitespace-nowrap">${station.name}</div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        />
      ))}

      {gameState.hospitals?.map((hospital) => (
        <Marker
          key={hospital.id}
          position={[hospital.location.lat, hospital.location.lng]}
          icon={new L.DivIcon({
            className: 'custom-icon',
            html: `
              <div class="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                <div class="w-5 h-5 bg-emerald-950 border border-emerald-500 rounded flex items-center justify-center text-emerald-400 font-bold text-[12px] shadow-sm">+</div>
                <div class="mt-1 text-[7px] bg-black/50 px-1 rounded text-slate-300 whitespace-nowrap">${hospital.name}</div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        />
      ))}

      {gameState.fireStations?.map((station) => (
        <Marker
          key={station.id}
          position={[station.location.lat, station.location.lng]}
          icon={new L.DivIcon({
            className: 'custom-icon',
            html: `
              <div class="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                <div class="w-5 h-5 bg-red-950 border border-red-500 rounded flex items-center justify-center text-red-400 font-bold text-[8px] shadow-sm">ISU</div>
                <div class="mt-1 text-[7px] bg-black/50 px-1 rounded text-slate-300 whitespace-nowrap">${station.name}</div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        />
      ))}

      {Object.values(gameState.incidents)
        .filter(i => hideOtherIncidents ? isMyIncident(i) : true)
        .map((incident) => (
          <IncidentMarker
            key={incident.id}
            incident={incident}
            isSelected={selectedIncidentId === incident.id}
            onSelect={onSelectIncident}
          />
        ))}

      {Object.values(gameState.units)
        .filter(u => hideOtherUnits ? isMyUnit(u) : true)
        .map((unit) => (
          <UnitMarker
            key={unit.id}
            unit={unit}
            isSelected={selectedUnitId === unit.id}
            onSelect={onSelectUnit}
            gameState={gameState}
          />
        ))}
    </MapContainer>

    {/* Map filter controls — z-[1000] to sit above Leaflet's internal panes (max ~700) */}
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      <button
        onClick={() => setHideOtherIncidents(v => !v)}
        title={hideOtherIncidents ? 'Arată toate incidentele' : 'Ascunde incidentele care nu mă privesc'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm transition-colors ${hideOtherIncidents ? 'bg-sky-900/80 border-sky-600 text-sky-300' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
      >
        <span className="w-2.5 h-2.5 inline-block border border-current" style={{ transform: 'rotate(45deg)' }} />
        {hideOtherIncidents ? 'Inc. mele' : 'Toate inc.'}
      </button>
      <button
        onClick={() => setHideOtherUnits(v => !v)}
        title={hideOtherUnits ? 'Arată toate unitățile' : 'Ascunde unitățile pe care nu le operez'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm transition-colors ${hideOtherUnits ? 'bg-sky-900/80 border-sky-600 text-sky-300' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
      >
        <span className="w-2.5 h-2.5 inline-block rounded-full border border-current" />
        {hideOtherUnits ? 'Unit. mele' : 'Toate unit.'}
      </button>
    </div>

    <MiniMap gameState={gameState} />
    </>
  );
}

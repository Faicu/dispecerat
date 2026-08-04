import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GameState } from '../types';
import { useEffect } from 'react';

// Fix Leaflet icons issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const getUnitIcon = (type: string, id: string, state: string, isSelected: boolean) => {
  let color = '#334155'; // default/swat
  let iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  
  if (type === 'police') { color = '#2563eb'; iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'; }
  else if (type === 'fire') { color = '#dc2626'; iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'; }
  else if (type === 'ambulance') { color = '#10b981'; iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>'; }
  else if (type === 'gendarmerie') { color = '#4f46e5'; iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'; }
  else if (type === 'helicopter') { color = '#0ea5e9'; iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-3"/><path d="M10 22h4"/><path d="M2 6h20"/><path d="M12 6V3"/><path d="M10 6v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6"/><path d="M12 12v6"/><path d="M6 12a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H6z"/></svg>'; }
  
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

const getIncidentIcon = (type: string, isSelected: boolean, severity: number = 1) => {
  const baseColor = type === 'crime' ? '#2563eb' : type === 'fire' ? '#dc2626' : '#f97316';
  let color = baseColor;
  let shadow = `0 0 15px rgba(220,38,38,0.8)`;
  
  if (severity === 1) { color = '#3b82f6'; shadow = '0 0 10px rgba(59,130,246,0.6)'; }
  else if (severity === 2) { color = '#eab308'; shadow = '0 0 15px rgba(234,179,8,0.8)'; }
  else if (severity === 3) { color = '#dc2626'; shadow = '0 0 20px rgba(220,38,38,1)'; }

  const size = isSelected ? 48 : (32 + severity * 4);
  const pulse = (isSelected || severity === 3) ? 'animate-ping' : '';
  
  let iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  if (type === 'crime') iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
  if (type === 'fire') iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
  if (type === 'medical') iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';

  return new L.DivIcon({
    className: 'custom-icon',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform ${isSelected ? 'scale-110 z-40' : ''}" style="width: ${size}px; height: ${size}px;">
        <div class="absolute inset-0 rounded-full ${pulse}" style="background-color: ${color}; opacity: ${isSelected ? '0.3' : '0.15'};"></div>
        <div class="rounded-full border-2 border-white flex items-center justify-center text-white" style="width: ${size*0.75}px; height: ${size*0.75}px; background-color: ${color}; box-shadow: ${shadow}">
          ${iconSvg}
        </div>
        ${severity === 3 ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>` : ''}
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
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function MapView({ gameState, selectedIncidentId, onSelectIncident, selectedUnitId, onSelectUnit, onMapClick }: MapViewProps) {
  // Center of Bucharest
  const center = { lat: 44.44, lng: 26.09 };

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', background: '#0f172a', cursor: selectedUnitId ? 'crosshair' : 'grab' }}
      zoomControl={false}
      attributionControl={false}
    >
      <MapClickHandler onMapClick={onMapClick} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

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

      {Object.values(gameState.incidents).map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.location.lat, incident.location.lng]}
          icon={getIncidentIcon(incident.type, selectedIncidentId === incident.id, incident.severity)}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              onSelectIncident(incident.id === selectedIncidentId ? null : incident.id);
            },
          }}
        >
        </Marker>
      ))}

      {Object.values(gameState.units).map((unit) => (
        <Marker
          key={unit.id}
          position={[unit.location.lat, unit.location.lng]}
          icon={getUnitIcon(unit.type, unit.name.split(' ')[0], unit.state, selectedUnitId === unit.id)}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              onSelectUnit(unit.id === selectedUnitId ? null : unit.id);
            },
          }}
        >
          {unit.route && unit.route.length > 0 && (
            <Polyline
              positions={[[unit.location.lat, unit.location.lng], ...unit.route.map(r => [r.lat, r.lng] as [number, number])]}
              color={unit.type === 'police' ? '#3b82f6' : unit.type === 'fire' ? '#ef4444' : unit.type === 'ambulance' ? '#10b981' : unit.type === 'helicopter' ? '#38bdf8' : '#818cf8'}
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
              color={unit.type === 'police' ? '#3b82f6' : unit.type === 'fire' ? '#ef4444' : unit.type === 'helicopter' ? '#38bdf8' : '#10b981'}
              dashArray="4 8"
              weight={2}
              opacity={0.6}
            />
          )}
          {unit.targetStationId && (!unit.route || unit.route.length === 0) && (
            <Polyline
              positions={[
                [unit.location.lat, unit.location.lng],
                [gameState.stations.find(s => s.id === unit.targetStationId)?.location.lat || unit.location.lat, 
                 gameState.stations.find(s => s.id === unit.targetStationId)?.location.lng || unit.location.lng]
              ]}
              color={unit.type === 'police' ? '#3b82f6' : unit.type === 'fire' ? '#ef4444' : unit.type === 'helicopter' ? '#38bdf8' : '#10b981'}
              dashArray="4 8"
              weight={2}
              opacity={0.6}
            />
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}

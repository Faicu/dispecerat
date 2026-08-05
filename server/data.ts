import { IncidentType, UnitType } from "../src/types";

export const policeStations = [
  { id: 's1', name: 'Secția 1 (Sector 1)', location: { lat: 44.4443, lng: 26.0954 } },
  { id: 's2', name: 'Secția 2 (Sector 1)', location: { lat: 44.4608, lng: 26.0827 } },
  { id: 's3', name: 'Secția 3 (Sector 1)', location: { lat: 44.4475, lng: 26.0718 } },
  { id: 's4', name: 'Secția 4 (Sector 1)', location: { lat: 44.4616, lng: 26.0645 } },
  { id: 's5', name: 'Secția 5 (Sector 1)', location: { lat: 44.4674, lng: 26.0469 } },
  { id: 's6', name: 'Secția 6 (Sector 2)', location: { lat: 44.4448, lng: 26.1130 } },
  { id: 's7', name: 'Secția 7 (Sector 2)', location: { lat: 44.4539, lng: 26.1368 } },
  { id: 's8', name: 'Secția 8 (Sector 2)', location: { lat: 44.4442, lng: 26.1492 } },
  { id: 's9', name: 'Secția 9 (Sector 2)', location: { lat: 44.4369, lng: 26.1557 } },
  { id: 's10', name: 'Secția 10 (Sector 3)', location: { lat: 44.4300, lng: 26.1082 } },
  { id: 's11', name: 'Secția 11 (Sector 3)', location: { lat: 44.4239, lng: 26.1264 } },
  { id: 's12', name: 'Secția 12 (Sector 3)', location: { lat: 44.4093, lng: 26.1415 } },
  { id: 's13', name: 'Secția 13 (Sector 3)', location: { lat: 44.4042, lng: 26.1165 } },
  { id: 's14', name: 'Secția 14 (Sector 4)', location: { lat: 44.4308, lng: 26.1032 } }, // Centrul Vechi - desi e in sect. 3 de obicei sau 4
  { id: 's15', name: 'Secția 15 (Sector 4)', location: { lat: 44.4095, lng: 26.0881 } },
  { id: 's16', name: 'Secția 16 (Sector 4)', location: { lat: 44.3855, lng: 26.0965 } },
  { id: 's17', name: 'Secția 17 (Sector 5)', location: { lat: 44.4172, lng: 26.0754 } },
  { id: 's18', name: 'Secția 18 (Sector 5)', location: { lat: 44.4143, lng: 26.0722 } },
  { id: 's19', name: 'Secția 19 (Sector 5)', location: { lat: 44.4046, lng: 26.0655 } },
  { id: 's20', name: 'Secția 20 (Sector 6)', location: { lat: 44.4373, lng: 26.0465 } },
  { id: 's21', name: 'Secția 21 (Sector 6)', location: { lat: 44.4361, lng: 26.0315 } },
  { id: 's22', name: 'Secția 22 (Sector 6)', location: { lat: 44.4232, lng: 26.0335 } },
  { id: 's23', name: 'Secția 23 (Sector 3)', location: { lat: 44.4258, lng: 26.1824 } },
  { id: 's24', name: 'Secția 24 (Sector 5)', location: { lat: 44.3985, lng: 26.0844 } },
  { id: 's25', name: 'Secția 25 (Sector 6)', location: { lat: 44.4215, lng: 26.0242 } },
  { id: 's26', name: 'Secția 26 (Sector 4)', location: { lat: 44.4360, lng: 26.0818 } },
  { id: 's27', name: 'Secția 27 (Sector 6)', location: { lat: 44.4328, lng: 26.0460 } },
  { id: 's28', name: 'Secția 28 (Sector 2)', location: { lat: 44.4550, lng: 26.1300 } },
];

export const hospitals = [
  { id: 'h1', name: 'Spitalul Floreasca', location: { lat: 44.4532, lng: 26.1001 } },
  { id: 'h2', name: 'Spitalul Universitar', location: { lat: 44.4354, lng: 26.0725 } },
  { id: 'h3', name: 'Spitalul Elias', location: { lat: 44.4631, lng: 26.0784 } },
  { id: 'h4', name: 'Spitalul Sf. Pantelimon', location: { lat: 44.4412, lng: 26.1834 } },
  { id: 'h5', name: 'Spitalul Sf. Ioan', location: { lat: 44.3985, lng: 26.1362 } },
  { id: 'h6', name: 'Spitalul Bagdasar-Arseni', location: { lat: 44.3857, lng: 26.1158 } },
];

export const fireStations = [
  { id: 'f1', name: 'ISU Dealul Spirii', location: { lat: 44.4261, lng: 26.0825 } },
  { id: 'f2', name: 'ISU Grozăvești', location: { lat: 44.4435, lng: 26.0601 } },
  { id: 'f3', name: 'ISU Vitan', location: { lat: 44.4152, lng: 26.1284 } },
  { id: 'f4', name: 'ISU Băneasa', location: { lat: 44.4921, lng: 26.0754 } },
  { id: 'f5', name: 'ISU Pantelimon', location: { lat: 44.4451, lng: 26.1602 } },
];

export interface IncidentTemplate {
  type: IncidentType;
  name: string;
  desc: string;
  req: UnitType[];
  img: string;
  reward: number;
  isMoving?: boolean;
  severity: number;
}

export const incidentTypes: IncidentTemplate[] = [
  { type: 'crime', name: 'Jaf Armat', desc: 'Suspecți înarmați la o bancă din centrul orașului. Necesită intervenție specială.', req: ['police', 'swat'], img: 'https://images.unsplash.com/photo-1533031065113-75217aa76878?auto=format&fit=crop&w=300&q=80', reward: 4000, severity: 3 },
  { type: 'crime', name: 'Tulburarea Liniștii Publice', desc: 'Grup de persoane recalcitrante în fața unui magazin.', req: ['police', 'gendarmerie'], img: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=300&q=80', reward: 1500, severity: 3 },
  { type: 'crime', name: 'Urmărire în Trafic', desc: 'Autoturism suspect care refuză să oprească la semnalele poliției.', req: ['police', 'police', 'helicopter'], img: 'https://images.unsplash.com/photo-1549315629-15d2a933d062?auto=format&fit=crop&w=300&q=80', reward: 6000, isMoving: true, severity: 3 },
  { type: 'crime', name: 'Violență Domestică', desc: 'Apel de urgență - țipete dintr-un apartament.', req: ['police'], img: 'https://images.unsplash.com/photo-1582216664920-1a6c026858e9?auto=format&fit=crop&w=300&q=80', reward: 1200, severity: 3 },
  { type: 'crime', name: 'Evadat', desc: 'Deținut periculos semnalat în zonă. Este necesară prinderea acestuia.', req: ['swat', 'helicopter', 'police'], img: 'https://images.unsplash.com/photo-1596765793043-42e1cc714fb0?auto=format&fit=crop&w=300&q=80', reward: 8000, isMoving: true, severity: 4 },
  { type: 'crime', name: 'Alarmă Falsă (Efracție)', desc: 'Sistem de securitate declanșat la o locuință.', req: ['police'], img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80', reward: 200, severity: 1 },
  { type: 'fire', name: 'Incendiu Clădire Rezidențială', desc: 'Fum dens observat la etajul 3 al unui bloc.', req: ['fire', 'ambulance'], img: 'https://images.unsplash.com/photo-1599723049282-59543e3a479a?auto=format&fit=crop&w=300&q=80', reward: 2500, severity: 3 },
  { type: 'fire', name: 'Incendiu Vegetație', desc: 'Foc deschis pe un teren viran la marginea orașului.', req: ['fire'], img: 'https://images.unsplash.com/photo-1600868285514-6ec177b960b7?auto=format&fit=crop&w=300&q=80', reward: 1000, severity: 3 },
  { type: 'fire', name: 'Scăpare de Gaze', desc: 'Miros puternic de gaz raportat de locatari.', req: ['fire', 'police'], img: 'https://images.unsplash.com/photo-1580974868218-c579c3dcb6b0?auto=format&fit=crop&w=300&q=80', reward: 2000, severity: 3 },
  { type: 'fire', name: 'Accident Aviatic', desc: 'Un avion de mici dimensiuni s-a prăbușit. Situație critică!', req: ['fire', 'fire', 'ambulance', 'ambulance', 'police', 'helicopter'], img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=300&q=80', reward: 25000, severity: 5 },
  { type: 'medical', name: 'Infarct Miocardic', desc: 'Bărbat 55 ani acuză dureri puternice în piept.', req: ['ambulance'], img: 'https://images.unsplash.com/photo-1587311100595-6bc910a2eb75?auto=format&fit=crop&w=300&q=80', reward: 1500, severity: 4 },
  { type: 'medical', name: 'Accident Rutier Grav', desc: 'Coliziune între două autoturisme, posibile victime încarcerate.', req: ['police', 'fire', 'ambulance'], img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&w=300&q=80', reward: 3000, severity: 4 },
  { type: 'medical', name: 'Pieton Lovit', desc: 'O persoană a fost lovită pe trecerea de pietoni.', req: ['police', 'ambulance'], img: 'https://images.unsplash.com/photo-1534069818815-546452296163?auto=format&fit=crop&w=300&q=80', reward: 1500, severity: 3 },
  { type: 'medical', name: 'Apel Abuziv', desc: 'Persoană care sună în mod repetat fără un motiv clar.', req: ['police'], img: 'https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?auto=format&fit=crop&w=300&q=80', reward: -500, severity: 1 },
  { type: 'crime', name: 'Escortă VIP', desc: 'Demnitar ce necesită escortă către aeroport.', req: ['police', 'police', 'swat'], img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80', reward: 10000, isMoving: true, severity: 3 },
  { type: 'crime', name: 'Protest Neautorizat', desc: 'Grup mare de protestatari care blochează o intersecție majoră.', req: ['police', 'gendarmerie', 'gendarmerie'], img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80', reward: 8000, severity: 3 },
  { type: 'fire', name: 'Incendiu Parc Auto', desc: 'Mai multe autovehicule au luat foc într-o parcare subterană.', req: ['fire', 'fire', 'police', 'ambulance'], img: 'https://images.unsplash.com/photo-1600868285514-6ec177b960b7?auto=format&fit=crop&w=300&q=80', reward: 12000, severity: 4 },
  { type: 'medical', name: 'Naștere în Stradă', desc: 'O femeie a intrat în travaliu pe trotuar.', req: ['ambulance', 'police'], img: 'https://images.unsplash.com/photo-1587311100595-6bc910a2eb75?auto=format&fit=crop&w=300&q=80', reward: 4000, severity: 3 },
  { type: 'crime', name: 'Luare de Ostatici', desc: 'Individ înarmat baricadat cu ostatici într-o clădire comercială.', req: ['police', 'swat', 'swat', 'ambulance', 'helicopter'], img: 'https://images.unsplash.com/photo-1596765793043-42e1cc714fb0?auto=format&fit=crop&w=300&q=80', reward: 35000, severity: 5 },
  { type: 'fire', name: 'Pisică în Copac', desc: 'Un animal de companie a rămas blocat la înălțime.', req: ['fire'], img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80', reward: 500, severity: 1 },
  // Accident types
  { type: 'accident', name: 'Tamponare pe Autostradă', desc: 'Carambol cu 4 vehicule pe A1. Trafic blocat, victime posibile.', req: ['police', 'ambulance', 'fire'], img: 'https://images.unsplash.com/photo-1603202662706-c3df8d98c1a6?auto=format&fit=crop&w=300&q=80', reward: 3500, severity: 3 },
  { type: 'accident', name: 'Accident de Motocicletă', desc: 'Motociclist căzut. Stare gravă raportată de martori.', req: ['ambulance', 'police'], img: 'https://images.unsplash.com/photo-1534069818815-546452296163?auto=format&fit=crop&w=300&q=80', reward: 2000, severity: 3 },
  { type: 'accident', name: 'Prăbușire Schele', desc: 'Schele unui șantier s-au prăbușit, posibile victime prinse sub dărâmături.', req: ['fire', 'fire', 'ambulance', 'ambulance', 'police'], img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80', reward: 18000, severity: 5 },
  { type: 'accident', name: 'Om Căzut în Canal', desc: 'Persoană căzută accidental în canal deschis. Risc de înec.', req: ['fire', 'ambulance'], img: 'https://images.unsplash.com/photo-1580974868218-c579c3dcb6b0?auto=format&fit=crop&w=300&q=80', reward: 2800, severity: 3 },
  // Robbery types
  { type: 'robbery', name: 'Tâlhărie Stradală', desc: 'Victimă jefuită în parc. Agresorii au fugit pe jos.', req: ['police'], img: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=300&q=80', reward: 1200, severity: 3 },
  { type: 'robbery', name: 'Spargere Bijuterie', desc: 'Bijuterie spartă. Alarmă activă. Suspecții ar putea fi încă în interior.', req: ['police', 'swat'], img: 'https://images.unsplash.com/photo-1533031065113-75217aa76878?auto=format&fit=crop&w=300&q=80', reward: 5000, severity: 3 },
  { type: 'robbery', name: 'Furt Vehicul în Mers', desc: 'Carjacking raportat. Victima a reușit să sune de pe stradă.', req: ['police', 'police', 'helicopter'], img: 'https://images.unsplash.com/photo-1549315629-15d2a933d062?auto=format&fit=crop&w=300&q=80', reward: 6500, isMoving: true, severity: 4 },
  // Explosion types
  { type: 'explosion', name: 'Explozie Conductă Gaz', desc: 'Explozie subterană a unei conducte. Risc de incendiu secundar.', req: ['fire', 'fire', 'ambulance', 'police'], img: 'https://images.unsplash.com/photo-1580974868218-c579c3dcb6b0?auto=format&fit=crop&w=300&q=80', reward: 20000, severity: 5 },
  { type: 'explosion', name: 'Explozie Artificii', desc: 'Artificii depozitate necorespunzător s-au aprins. Zona trebuie evacuată.', req: ['fire', 'police', 'ambulance'], img: 'https://images.unsplash.com/photo-1600868285514-6ec177b960b7?auto=format&fit=crop&w=300&q=80', reward: 8000, severity: 3 },
  // Rescue types
  { type: 'rescue', name: 'Persoană Dispărută', desc: 'Bătrân cu demență semnalat dispărut de 3 ore.', req: ['police', 'helicopter'], img: 'https://images.unsplash.com/photo-1596765793043-42e1cc714fb0?auto=format&fit=crop&w=300&q=80', reward: 3000, isMoving: true, severity: 3 },
  { type: 'rescue', name: 'Salvare Montană', desc: 'Drumeț rănit pe un traseu greu accesibil. Necesită elicoper de salvare.', req: ['helicopter', 'ambulance'], img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=300&q=80', reward: 9000, severity: 3 },
  { type: 'rescue', name: 'Persoană Blocată în Lift', desc: 'Lift oprit între etaje. Pasageri cu probleme medicale.', req: ['fire', 'ambulance'], img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80', reward: 1500, severity: 3 },
  { type: 'rescue', name: 'Inundație Subterană', desc: 'Subsol inundat cu persoane blocate. Intervenție urgentă necesară.', req: ['fire', 'fire', 'ambulance', 'police'], img: 'https://images.unsplash.com/photo-1580974868218-c579c3dcb6b0?auto=format&fit=crop&w=300&q=80', reward: 15000, severity: 4 },
];

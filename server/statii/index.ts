export interface ServiceStation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
}

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
  { id: 's14', name: 'Secția 14 (Sector 4)', location: { lat: 44.4308, lng: 26.1032 } },
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

export const serviceStations: ServiceStation[] = [
  { id: 'srv1', name: 'Service Tehnic Nord (Pipera)', location: { lat: 44.4880, lng: 26.0985 } },
  { id: 'srv2', name: 'Service Tehnic Centru (Timpuri Noi)', location: { lat: 44.4150, lng: 26.1040 } },
  { id: 'srv3', name: 'Service Tehnic Vest (Militari)', location: { lat: 44.4420, lng: 26.0120 } },
];

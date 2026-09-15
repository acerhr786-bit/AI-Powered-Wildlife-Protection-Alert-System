export type DetectedCategory = 'wild_animal' | 'human' | 'none' | 'wild_animal_human_conflict';
export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';

export interface CameraNode {
  id: string;
  name: string;
  location: string;
  sector: string;
  coordinates: [number, number]; // [lat, lng]
  status: 'ONLINE' | 'STANDBY' | 'CALIBRATING';
  batteryPercent: number;
  solarStatus: 'SOLAR_ACTIVE' | 'BATTERY_NIGHT' | 'HYBRID_GRID';
  lowLightMode: 'IR_NIGHT_VISION' | 'STARVIS_LOW_LIGHT' | 'THERMAL_IR' | 'DAYLIGHT_RGB';
  currentLux: number; // e.g. 0.02 lux for night
  isPersonalCamera: boolean;
  fovAngle: number;
  lastPing: string;
  riskZone: 'HIGH_CONFLICT' | 'CORRIDOR' | 'HABITATION_FRINGE' | 'BUFFER_ZONE';
  installedYear: number;
}

export interface DetectionEvent {
  id: string;
  cameraId: string;
  cameraName: string;
  location: string;
  sector: string;
  coordinates: [number, number];
  timestamp: string;
  detectedType: DetectedCategory;
  species: string | null;
  confidence: number;
  isLowLight: boolean;
  luxLevel: number;
  threatLevel: ThreatLevel;
  forestDeptAlertRequired: boolean; // TRUE for wild animals, FALSE for humans
  alertStatus: 'NOT_REQUIRED' | 'DISPATCHED' | 'ACKNOWLEDGED' | 'TEAM_MOBILIZED' | 'RESOLVED';
  dispatchTicketId?: string;
  snapshotUrl?: string;
  details: string;
  suggestedAction?: string;
  source: 'my_camera' | 'cctv_network';
}

export interface ForestDeptAlert {
  ticketId: string;
  division: string;
  rangeOffice: string;
  rrtUnit: string;
  eventId: string;
  cameraId: string;
  cameraName: string;
  species: string;
  threatLevel: ThreatLevel;
  exactCoordinates: string;
  location: string;
  timestamp: string;
  urgency: 'IMMEDIATE' | 'PRIORITY' | 'ROUTINE';
  assignedRFO: string;
  contactHotline: string;
  status: 'DISPATCHED' | 'ACKNOWLEDGED' | 'PATROL_EN_ROUTE' | 'ON_SITE_VERIFIED';
  suggestedAction: string;
  smsDispatchLog: string;
  dispatchTime: string;
}

export interface ConflictIncidentRecord {
  id: string;
  date: string;
  year: number;
  sector: string;
  victimProfile: string;
  animalInvolved: string;
  timeOfDay: string;
  lowLightFactor: boolean;
  circumstance: string;
  mitigationImpact: string;
  coordinates: [number, number];
}

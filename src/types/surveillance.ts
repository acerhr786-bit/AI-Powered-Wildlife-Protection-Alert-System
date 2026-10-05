export type DetectedCategory = 'wild_animal' | 'human' | 'none' | 'wild_animal_human_conflict' | 'vehicle';
export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE' | 'LOW';

export type WildlifeSpecies =
  | 'Elephant'
  | 'Leopard'
  | 'Tiger'
  | 'Wild boar'
  | 'Deer'
  | 'Bear'
  | 'Gaur'
  | 'Human'
  | 'Vehicle'
  | 'Other';

export type UserRole =
  | 'ADMIN'
  | 'FOREST_OFFICER'
  | 'CONTROL_ROOM_OPERATOR'
  | 'RESEARCHER'
  | 'VIEWER';

export interface BoundingBox {
  x: number; // percentage (0-100) or pixels
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color?: string;
}

export interface RiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0 - 100
  reason: string;
  factors: {
    speciesRisk: string;
    humanPresenceRisk: string;
    settlementProximityRisk: string;
    roadProximityRisk: string;
    timeOfDayRisk: string;
    historicalIncidentsRisk: string;
    locationZoneRisk: string;
    animalCountRisk: string;
  };
  distanceFromSettlementMeters: number;
  distanceFromRoadMeters: number;
  isNightTime: boolean;
  humanNearby: boolean;
  animalCount: number;
}

export interface CameraNode {
  id: string;
  name: string;
  location: string;
  sector: string;
  coordinates: [number, number]; // [lat, lng]
  status: 'ONLINE' | 'STANDBY' | 'CALIBRATING' | 'OFFLINE';
  batteryPercent: number;
  solarStatus: 'SOLAR_ACTIVE' | 'BATTERY_NIGHT' | 'HYBRID_GRID' | 'OFFLINE';
  lowLightMode: 'IR_NIGHT_VISION' | 'STARVIS_LOW_LIGHT' | 'THERMAL_IR' | 'DAYLIGHT_RGB';
  currentLux: number; // e.g. 0.02 lux for night
  isPersonalCamera: boolean;
  fovAngle: number;
  lastPing: string;
  lastHeartbeat?: string;
  riskZone: 'HIGH_CONFLICT' | 'CORRIDOR' | 'HABITATION_FRINGE' | 'BUFFER_ZONE';
  installedYear: number;
  streamType?: 'WEBCAM' | 'UPLOAD_VIDEO' | 'IP_CAMERA' | 'CCTV_RTSP' | 'DEMO_STREAM';
  rtspUrl?: string;
  resolution?: string;
  fps?: number;
  detectionStatus?: 'CLEAR' | 'ANIMAL_DETECTED' | 'HUMAN_DETECTED' | 'INVESTIGATING';
  isDemo?: boolean;
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
  alertStatus: 'NOT_REQUIRED' | 'DISPATCHED' | 'ACKNOWLEDGED' | 'TEAM_MOBILIZED' | 'RESOLVED' | 'NEW' | 'INVESTIGATING' | 'FALSE_POSITIVE';
  dispatchTicketId?: string;
  snapshotUrl?: string;
  videoClipUrl?: string;
  details: string;
  suggestedAction?: string;
  source: 'my_camera' | 'cctv_network' | 'uploaded_video' | 'demo_simulation';
  // Upgrades
  boundingBoxes?: BoundingBox[];
  animalCount?: number;
  humanPresence?: boolean;
  vehiclePresence?: boolean;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskAssessment?: RiskAssessment;
  isDemoData?: boolean;
}

export type SmartAlertStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'FALSE_POSITIVE'
  | 'DISPATCHED'
  | 'PATROL_EN_ROUTE'
  | 'ON_SITE_VERIFIED';

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
  status: SmartAlertStatus;
  suggestedAction: string;
  smsDispatchLog: string;
  dispatchTime: string;
  // Upgrades
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence?: number;
  evidenceUrl?: string;
  humanPresence?: boolean;
  animalCount?: number;
  riskExplanation?: string;
  riskAssessment?: RiskAssessment;
  resolutionNotes?: string;
  isDemoData?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface IncidentRecord {
  id: string;
  alertId?: string;
  dateTime: string;
  location: string;
  sector: string;
  coordinates: [number, number];
  animal: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  evidenceUrl?: string;
  cameraId: string;
  assignedUser: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'MITIGATED' | 'CLOSED';
  resolutionNotes?: string;
  isDemoData?: boolean;
}

export interface WildlifeSightingTrack {
  id: string;
  species: string;
  location: string;
  sector: string;
  coordinates: [number, number];
  timestamp: string;
  cameraId: string;
  cameraName: string;
  confidence: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  direction?: string; // e.g. "North-East towards Mudumalai Buffer"
  headingDegrees?: number;
  sequenceOrder: number;
  isDemoData: boolean;
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

export interface NotificationIntegration {
  id: 'email' | 'sms' | 'whatsapp' | 'browser';
  name: string;
  configured: boolean;
  details: string;
  statusLabel: 'CONFIGURED' | 'READY_FOR_SETUP' | 'DEMO_SIMULATION';
}

export interface SystemServiceHealth {
  name: string;
  serviceKey: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  latencyMs?: number;
  details: string;
  lastChecked: string;
}

export interface SettlementGeo {
  name: string;
  type: 'VILLAGE' | 'TEA_ESTATE_QUARTERS' | 'TRIBAL_HABITATION' | 'TOWN';
  coordinates: [number, number];
  populationEstimate: number;
  riskZone: 'HIGH_CONFLICT' | 'BUFFER' | 'SAFE';
}

export interface RoadTransitGeo {
  name: string;
  type: 'NATIONAL_HIGHWAY' | 'STATE_HIGHWAY' | 'ESTATE_ROAD';
  coordinates: [number, number][];
}

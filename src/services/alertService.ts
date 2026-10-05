import { ForestDeptAlert, SmartAlertStatus, NotificationIntegration, RiskAssessment } from '../types/surveillance';

export class AlertService {
  private integrations: NotificationIntegration[] = [
    {
      id: 'sms',
      name: 'Tamil Nadu Forest Dept SMS Gateway (CDAC / NIC)',
      configured: false, // NOT configured by default without real telecom gateway credentials
      details: 'Dispatches emergency SMS to RFO Gudalur & Beat Guards. [Active in Demo Simulator]',
      statusLabel: 'DEMO_SIMULATION',
    },
    {
      id: 'whatsapp',
      name: 'Forest Control Room WhatsApp API (Meta Cloud API)',
      configured: false,
      details: 'Broadcasts geo-tagged alert cards to Rapid Response Team phone group. [Demo Mode]',
      statusLabel: 'READY_FOR_SETUP',
    },
    {
      id: 'email',
      name: 'DFO Office SMTP Mail Dispatcher',
      configured: false,
      details: 'Dispatches formal incident notification with GPS coordinates to District Forest Officer.',
      statusLabel: 'READY_FOR_SETUP',
    },
    {
      id: 'browser',
      name: 'Browser Web Push & Tactical Audio Siren',
      configured: true, // Native browser AudioContext and Web Notifications API
      details: 'Synthesized dual-tone siren and high-priority browser audio alerts.',
      statusLabel: 'CONFIGURED',
    },
  ];

  public getIntegrations(): NotificationIntegration[] {
    return this.integrations;
  }

  public setIntegrationStatus(id: string, configured: boolean) {
    const item = this.integrations.find((i) => i.id === id);
    if (item) {
      item.configured = configured;
      item.statusLabel = configured ? 'CONFIGURED' : 'READY_FOR_SETUP';
    }
  }

  /**
   * Create a standardized smart alert from a detection event
   */
  public createAlert(params: {
    eventId: string;
    cameraId: string;
    cameraName: string;
    location: string;
    coordinates: [number, number];
    species: string;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    riskAssessment?: RiskAssessment;
    humanPresence?: boolean;
    animalCount?: number;
    isDemoData?: boolean;
  }): ForestDeptAlert {
    const ticketNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TN-FD-GDL-2026-${ticketNum}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
      ticketId,
      division: 'Nilgiris South & Gudalur Forest Division',
      rangeOffice: 'Gudalur Range Office / O-Valley Beat',
      rrtUnit: 'Rapid Response Team Alpha (RRT-01)',
      eventId: params.eventId,
      cameraId: params.cameraId,
      cameraName: params.cameraName,
      species: params.species,
      threatLevel: params.threatLevel,
      exactCoordinates: `${params.coordinates[0].toFixed(4)}° N, ${params.coordinates[1].toFixed(4)}° E`,
      location: params.location,
      timestamp: timeStr,
      urgency: params.threatLevel === 'CRITICAL' ? 'IMMEDIATE' : 'PRIORITY',
      assignedRFO: 'RFO Gudalur Division & RRT Duty Officer',
      contactHotline: '04262-261262 / TN Forest Toll-Free 1800-425-4545',
      status: 'NEW',
      suggestedAction: params.threatLevel === 'CRITICAL'
        ? 'IMMEDIATE DISPATCH: Mobilize RRT-01 vehicle patrol with acoustic deterrents and spotlight unit.'
        : 'Priority patrol checkup recommended. Monitor adjacent camera nodes.',
      smsDispatchLog: `[DEMO-DISPATCH] Ticket #${ticketId}: ${params.species} at ${params.location}. Risk: ${params.threatLevel}.`,
      dispatchTime: timeStr,
      riskLevel: params.threatLevel,
      confidence: params.confidence,
      humanPresence: params.humanPresence,
      animalCount: params.animalCount || 1,
      riskExplanation: params.riskAssessment?.reason || `Threat level evaluated as ${params.threatLevel}.`,
      riskAssessment: params.riskAssessment,
      isDemoData: params.isDemoData ?? true,
    };
  }

  /**
   * Transition alert status
   */
  public updateStatus(
    alert: ForestDeptAlert,
    newStatus: SmartAlertStatus,
    notes?: string,
    user?: string
  ): ForestDeptAlert {
    return {
      ...alert,
      status: newStatus,
      resolutionNotes: notes ? `${alert.resolutionNotes ? alert.resolutionNotes + ' | ' : ''}${notes}` : alert.resolutionNotes,
      acknowledgedBy: user || alert.acknowledgedBy,
      acknowledgedAt: newStatus === 'ACKNOWLEDGED' ? new Date().toLocaleTimeString() : alert.acknowledgedAt,
    };
  }
}

export const alertService = new AlertService();

import { describe, it, expect } from 'vitest';
import { alertService } from '../services/alertService';
import { calculateWildlifeRisk } from '../services/riskEngine';

describe('Centralized Alert Service (alertService)', () => {
  it('creates a standardized Forest Dept smart alert with correct initial status', () => {
    const risk = calculateWildlifeRisk({
      species: 'Indian Leopard',
      animalCount: 1,
      humanNearby: false,
      distanceFromSettlementMeters: 60,
      luxLevel: 0.02,
    });

    const alert = alertService.createAlert({
      eventId: 'evt-test-101',
      cameraId: 'cam-gdl-03',
      cameraName: 'CCTV-03 [Pandalur]',
      location: 'Pandalur Estate Fringe',
      coordinates: [11.4889, 76.3312],
      species: 'Indian Leopard',
      threatLevel: risk.level,
      confidence: 94,
      riskAssessment: risk,
      humanPresence: false,
      animalCount: 1,
    });

    expect(alert.ticketId).toMatch(/^TN-FD-GDL-2026-\d{4}$/);
    expect(alert.status).toBe('NEW');
    expect(alert.urgency).toBeDefined();
    expect(alert.contactHotline).toBeDefined();
    expect(alert.riskExplanation).toBeDefined();
  });

  it('updates alert status through acknowledgment, investigation, and resolution lifecycle', () => {
    const alert = alertService.createAlert({
      eventId: 'evt-lifecycle-1',
      cameraId: 'cam-gdl-01',
      cameraName: 'CCTV-01 [O-Valley]',
      location: 'O-Valley',
      coordinates: [11.4872, 76.541],
      species: 'Asian Elephant',
      threatLevel: 'CRITICAL',
      confidence: 98,
    });

    // 1. Acknowledge
    const acked = alertService.updateStatus(alert, 'ACKNOWLEDGED', undefined, 'FOREST_OFFICER');
    expect(acked.status).toBe('ACKNOWLEDGED');
    expect(acked.acknowledgedBy).toBe('FOREST_OFFICER');
    expect(acked.acknowledgedAt).toBeDefined();

    // 2. Investigate
    const investigating = alertService.updateStatus(acked, 'INVESTIGATING', 'RRT team mobilized to sector');
    expect(investigating.status).toBe('INVESTIGATING');
    expect(investigating.resolutionNotes).toContain('RRT team mobilized');

    // 3. Resolve
    const resolved = alertService.updateStatus(investigating, 'RESOLVED', 'Animal returned to core reserve');
    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolutionNotes).toContain('Animal returned');
  });

  it('correctly tracks notification dispatch integrations status', () => {
    const integrations = alertService.getIntegrations();

    expect(integrations.length).toBeGreaterThanOrEqual(4);
    const browserInt = integrations.find((i) => i.id === 'browser');
    expect(browserInt).toBeDefined();
    expect(browserInt!.configured).toBe(true); // Browser native audio/notifications configured

    const smsInt = integrations.find((i) => i.id === 'sms');
    expect(smsInt).toBeDefined();
    expect(smsInt!.statusLabel).toBe('DEMO_SIMULATION'); // Clearly marked as demo simulation
  });
});

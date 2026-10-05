import { describe, it, expect } from 'vitest';
import { detectionService } from '../services/detectionService';
import { DEFAULT_CAMERAS } from '../data/gudalurData';

describe('Wildlife Detection Service (detectionService)', () => {
  const testCamera = DEFAULT_CAMERAS[0];

  it('generates simulated Asian Elephant detection with valid bounding boxes and risk calculation', () => {
    const event = detectionService.generateSimulatedInference(testCamera, 'demo-elephant-night');

    expect(event.detectedType).toBe('wild_animal');
    expect(event.species).toContain('Asian Elephant');
    expect(event.confidence).toBeGreaterThanOrEqual(90);
    expect(event.forestDeptAlertRequired).toBe(true);
    expect(event.isDemoData).toBe(true);
    expect(event.boundingBoxes).toBeDefined();
    expect(event.boundingBoxes!.length).toBeGreaterThan(0);
    expect(event.riskAssessment).toBeDefined();
    expect(event.riskAssessment!.level).toBe('CRITICAL');
  });

  it('generates simulated Human worker detection with Forest Dept alert suppressed', () => {
    const event = detectionService.generateSimulatedInference(testCamera, 'demo-human-worker');

    expect(event.detectedType).toBe('human');
    expect(event.species).toContain('Human');
    expect(event.threatLevel).toBe('SAFE');
    expect(event.forestDeptAlertRequired).toBe(false); // MUST BE SUPPRESSED
    expect(event.humanPresence).toBe(true);
    expect(event.boundingBoxes![0].label).toContain('Human');
  });

  it('generates simulated Vehicle detection without triggering false wildlife alerts', () => {
    const event = detectionService.generateSimulatedInference(testCamera, 'vehicle');

    expect(event.detectedType).toBe('vehicle');
    expect(event.threatLevel).toBe('SAFE');
    expect(event.forestDeptAlertRequired).toBe(false);
    expect(event.vehiclePresence).toBe(true);
  });

  it('falls back to client heuristic simulation when API request fails', async () => {
    // Calling analyzeFrame with invalid image should gracefully catch error and fallback
    const fallbackEvent = await detectionService.analyzeFrame('invalid-base-64-mock', testCamera);

    expect(fallbackEvent).toBeDefined();
    expect(fallbackEvent.cameraId).toBe(testCamera.id);
    expect(fallbackEvent.timestamp).toBeDefined();
  });
});

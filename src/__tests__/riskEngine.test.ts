import { describe, it, expect } from 'vitest';
import { calculateWildlifeRisk } from '../services/riskEngine';

describe('AI Wildlife Risk Engine (calculateWildlifeRisk)', () => {
  it('evaluates solitary Asian Elephant at night near human settlement with human presence as CRITICAL', () => {
    const assessment = calculateWildlifeRisk({
      species: 'Asian Elephant',
      animalCount: 1,
      humanNearby: true,
      distanceFromSettlementMeters: 35,
      distanceFromRoadMeters: 20,
      isNightTime: true,
      luxLevel: 0.01,
      sector: 'O-Valley Sector 4 Corridor',
      historicalIncidentsInSector: 14,
      riskZone: 'HIGH_CONFLICT',
    });

    expect(assessment.level).toBe('CRITICAL');
    expect(assessment.score).toBeGreaterThanOrEqual(80);
    expect(assessment.humanNearby).toBe(true);
    expect(assessment.factors.humanPresenceRisk).toContain('ACTIVE HUMAN PRESENCE');
    expect(assessment.factors.speciesRisk).toContain('Asian Elephant');
    expect(assessment.reason).toContain('CRITICAL RISK EVALUATION');
  });

  it('evaluates authorized human worker movement as SAFE with suppressed risk score', () => {
    const assessment = calculateWildlifeRisk({
      species: 'Human',
      animalCount: 0,
      humanNearby: true,
      distanceFromSettlementMeters: 10,
      distanceFromRoadMeters: 5,
      isNightTime: false,
      luxLevel: 250,
      sector: 'Gudalur West Estate',
      riskZone: 'HABITATION_FRINGE',
    });

    expect(assessment.level).toBe('LOW');
    expect(assessment.score).toBe(0);
    expect(assessment.reason).toContain('dispatch is suppressed');
  });

  it('handles empty or unrecognized wildlife input gracefully with fallback scoring', () => {
    const assessment = calculateWildlifeRisk({
      species: '',
      animalCount: 1,
      humanNearby: false,
      distanceFromSettlementMeters: 300,
      distanceFromRoadMeters: 100,
      isNightTime: false,
      luxLevel: 100,
      sector: 'Mudumalai Buffer',
      riskZone: 'BUFFER_ZONE',
    });

    expect(assessment).toBeDefined();
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(assessment.level);
    expect(assessment.score).toBeGreaterThanOrEqual(0);
    expect(assessment.score).toBeLessThanOrEqual(100);
  });

  it('increases risk score when animal count is high (herd / sounder)', () => {
    const singleBoar = calculateWildlifeRisk({
      species: 'Wild boar',
      animalCount: 1,
      humanNearby: false,
      distanceFromSettlementMeters: 120,
      distanceFromRoadMeters: 60,
      isNightTime: true,
      luxLevel: 0.03,
    });

    const herdBoar = calculateWildlifeRisk({
      species: 'Wild boar',
      animalCount: 6,
      humanNearby: false,
      distanceFromSettlementMeters: 120,
      distanceFromRoadMeters: 60,
      isNightTime: true,
      luxLevel: 0.03,
    });

    expect(herdBoar.score).toBeGreaterThan(singleBoar.score);
    expect(herdBoar.factors.animalCountRisk).toContain('GROUP DYNAMICS');
  });

  it('factors in distance from road collisions (<30m)', () => {
    const nearRoad = calculateWildlifeRisk({
      species: 'Indian Gaur',
      animalCount: 1,
      humanNearby: false,
      distanceFromRoadMeters: 15,
      distanceFromSettlementMeters: 200,
      isNightTime: true,
      luxLevel: 0.02,
    });

    expect(nearRoad.factors.roadProximityRisk).toContain('HIGH COLLISION RISK');
  });
});

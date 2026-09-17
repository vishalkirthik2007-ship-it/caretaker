import { describe, it, expect } from 'vitest';
import { checkEmergencyTriage, generateStructuredNavigationResponse } from '../lib/ai/safety';

describe('AI Safety & Clinical Triage Layer', () => {
  it('should flag acute chest pain as an emergency medical escalation', () => {
    const result = checkEmergencyTriage('I have severe crushing chest pain and feel dizzy');
    expect(result.isEmergency).toBe(true);
    expect(result.flaggedKeywords).toContain('chest pain');
    expect(result.recommendedAction).toContain('112');
  });

  it('should flag stroke symptoms (slurred speech, facial droop) as an emergency', () => {
    const result = checkEmergencyTriage('My mother has slurred speech and sudden arm weakness');
    expect(result.isEmergency).toBe(true);
    expect(result.flaggedKeywords).toContain('slurred speech');
  });

  it('should not flag routine non-emergency healthcare inquiries as emergency', () => {
    const result = checkEmergencyTriage('I want to schedule an annual health checkup with a family doctor');
    expect(result.isEmergency).toBe(false);
    expect(result.flaggedKeywords.length).toBe(0);
  });

  it('should produce structured non-diagnostic navigation response', () => {
    const response = generateStructuredNavigationResponse('Where can I see a doctor for skin rash?');
    expect(response).toBeDefined();
    expect(response.understanding).toBeDefined();
    expect(response.possibleServiceCategory).toBeDefined();
    expect(response.why).toBeDefined();
    expect(response.nextSteps.length).toBeGreaterThanOrEqual(3);
    expect(response.importantSafetyMessage).toContain('CarePath AI provides navigation information only');
    expect(response.isEmergency).toBe(false);
  });

  it('should produce high-priority emergency guidance for acute queries', () => {
    const response = generateStructuredNavigationResponse('I am coughing up blood and have severe shortness of breath');
    expect(response.isEmergency).toBe(true);
    expect(response.emergencyHotline).toBeDefined();
    expect(response.importantSafetyMessage).toContain('CRITICAL');
  });
});

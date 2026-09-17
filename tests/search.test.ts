import { describe, it, expect } from 'vitest';
import { mapQueryToCategory } from '../lib/ai/safety';

describe('Natural Language Healthcare Category Search Mapping', () => {
  it('maps skin and dermatological queries to specialists', () => {
    const res = mapQueryToCategory('I have a red skin rash on my forearm');
    expect(res.categoryId).toBe('specialists');
    expect(res.categoryName).toContain('Dermatology');
  });

  it('maps dental queries to dental care', () => {
    const res = mapQueryToCategory('Need a root canal and teeth cleaning');
    expect(res.categoryId).toBe('dental_care');
  });

  it('maps blood tests and scans to diagnostics', () => {
    const res = mapQueryToCategory('Looking for MRI scan and blood test center');
    expect(res.categoryId).toBe('diagnostics');
  });

  it('maps sudden minor sprains and cuts to urgent care', () => {
    const res = mapQueryToCategory('Walk in clinic for sprained wrist today');
    expect(res.categoryId).toBe('urgent_care');
  });

  it('maps severe emergency indications to hospitals', () => {
    const res = mapQueryToCategory('Severe ambulance trauma emergency hospital');
    expect(res.categoryId).toBe('hospitals');
    expect(res.urgency).toBe('emergency');
  });
});

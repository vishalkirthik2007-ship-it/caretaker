import { describe, it, expect } from 'vitest';
import { validateFileUpload, checkRateLimit, sanitizeInput } from '../lib/security';

describe('Security Layer, Rate Limiting & File Validation', () => {
  it('approves valid PDF and image documents under 10MB', () => {
    const validPdf = { name: 'blood_report.pdf', size: 1024 * 500, type: 'application/pdf' };
    const validJpg = { name: 'xray.jpg', size: 1024 * 1024, type: 'image/jpeg' };

    expect(validateFileUpload(validPdf).valid).toBe(true);
    expect(validateFileUpload(validJpg).valid).toBe(true);
  });

  it('rejects files exceeding 10MB limit', () => {
    const hugeFile = { name: 'scan.pdf', size: 15 * 1024 * 1024, type: 'application/pdf' };
    const result = validateFileUpload(hugeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });

  it('strictly blocks executable or dangerous script extensions', () => {
    const exeFile = { name: 'malicious.exe', size: 1024, type: 'application/octet-stream' };
    const shFile = { name: 'payload.sh', size: 500, type: 'application/x-sh' };

    expect(validateFileUpload(exeFile).valid).toBe(false);
    expect(validateFileUpload(shFile).valid).toBe(false);
  });

  it('enforces rate limits on consecutive requests', () => {
    const clientKey = `test_client_${Date.now()}`;
    const limit = 3;

    // First 3 should be allowed
    expect(checkRateLimit(clientKey, limit, 10000).allowed).toBe(true);
    expect(checkRateLimit(clientKey, limit, 10000).allowed).toBe(true);
    expect(checkRateLimit(clientKey, limit, 10000).allowed).toBe(true);

    // 4th request must be blocked
    expect(checkRateLimit(clientKey, limit, 10000).allowed).toBe(false);
  });

  it('sanitizes input strings from XSS characters', () => {
    const dirty = '<script>alert("hack")</script>';
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
  });
});

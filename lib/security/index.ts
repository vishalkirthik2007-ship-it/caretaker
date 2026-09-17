import { AuditLogEntry } from '@/types';

// In-memory rate limiter cache for edge/node endpoints
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks rate limits for incoming requests
 * Default: 30 requests per 60-second window
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = rateLimitMap.get(identifier);

  if (!existing || now > existing.resetAt) {
    const newRecord: RateLimitRecord = { count: 1, resetAt: now + windowMs };
    rateLimitMap.set(identifier, newRecord);
    return { allowed: true, remaining: limit - 1, resetAt: newRecord.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/**
 * Security: Validates uploaded files to protect document vault
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds maximum allowed size of 10MB.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF and image files (PNG, JPG, WebP) are allowed.',
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  const dangerousExtensions = ['exe', 'bat', 'sh', 'js', 'html', 'php', 'vbs', 'ps1', 'cmd'];
  if (extension && dangerousExtensions.includes(extension)) {
    return { valid: false, error: 'Security violation: Executable or script files are forbidden.' };
  }

  return { valid: true };
}

// In-memory audit log repository (mirrors public.audit_logs in PostgreSQL)
const auditLogs: AuditLogEntry[] = [];

export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): AuditLogEntry {
  const record: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  auditLogs.unshift(record);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }
  return record;
}

export function getAuditLogs(userId?: string): AuditLogEntry[] {
  if (userId) {
    return auditLogs.filter((log) => log.userId === userId);
  }
  return auditLogs;
}

/**
 * Sanitizes input string against simple XSS injections
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

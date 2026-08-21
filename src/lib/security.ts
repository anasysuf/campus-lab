/**
 * Security & Validation Helper Utilities
 * Includes Rate Limiting, Input Sanitization, and Data Validation.
 */

// In-memory sliding-window rate limiter for serverless / edge runtime
interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.expiresAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Rate Limiter
 * @param key Unique key (e.g. IP address + route name)
 * @param limit Maximum allowed requests within window
 * @param windowMs Time window in milliseconds (e.g. 60000 = 1 minute)
 * @returns { success: boolean, remaining: number, reset: number }
 */
export function checkRateLimit(key: string, limit: number = 20, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.expiresAt < now) {
    rateLimitMap.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1, reset: windowMs };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: Math.max(0, record.expiresAt - now),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    reset: Math.max(0, record.expiresAt - now),
  };
}

/**
 * Extract Client IP from Request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Sanitize string against XSS, script injection, and excessive whitespace
 */
export function sanitizeString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Strip < and >
    .replace(/javascript:/gi, '') // Strip javascript: URIs
    .replace(/data:text\/html/gi, '') // Strip data HTML
    .replace(/vbscript:/gi, '') // Strip vbscript
    .replace(/onload|onerror|onclick|onmouseover/gi, ''); // Strip common event handlers

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  // Standard RFC 5322 regex subset
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate URL (HTTP/HTTPS only or valid image data URL)
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Allow safe external HTTPS/HTTP image URLs
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    try {
      const parsed = new URL(trimmed);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  // Allow standard base64 image data URLs
  if (trimmed.startsWith('data:image/')) {
    return /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(trimmed);
  }

  return false;
}

/**
 * Whitelist User Roles
 */
export const ALLOWED_ROLES = ['ADMIN', 'STUDENT'] as const;
export type UserRole = (typeof ALLOWED_ROLES)[number];

export function isValidRole(role: string): role is UserRole {
  return ALLOWED_ROLES.includes(role as UserRole);
}

/**
 * Whitelist Equipment Conditions
 */
export const ALLOWED_CONDITIONS = ['GOOD', 'FAIR', 'MAINTENANCE', 'DAMAGED'] as const;
export type EquipmentCondition = (typeof ALLOWED_CONDITIONS)[number];

export function isValidCondition(condition: string): condition is EquipmentCondition {
  return ALLOWED_CONDITIONS.includes(condition as EquipmentCondition);
}

/**
 * Whitelist Loan & Booking Statuses
 */
export const ALLOWED_LOAN_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'] as const;
export const ALLOWED_BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] as const;

/**
 * Security Middleware Collection
 * Rate Limiting, CSRF Protection, XSS Protection
 */

import { createClient } from '../supabase/client';

const supabase = createClient();

// ============================================
// Rate Limiting Service
// ============================================

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

class RateLimitService {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Check if request is allowed
   */
  async checkLimit(
    identifier: string,
    config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // New window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      };
    }

    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    record.count++;

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Cleanup expired records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

export const rateLimitService = new RateLimitService();

// Cleanup every 5 minutes
setInterval(() => rateLimitService.cleanup(), 300000);

// ============================================
// CSRF Token Service
// ============================================

class CSRFService {
  private tokens: Map<string, { token: string; expires: number }> = new Map();

  /**
   * Generate CSRF token for session
   */
  generateToken(sessionId: string): string {
    const token = this.randomString(32);
    const expires = Date.now() + 3600000; // 1 hour

    this.tokens.set(sessionId, { token, expires });

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateToken(sessionId: string, token: string): boolean {
    const record = this.tokens.get(sessionId);

    if (!record) return false;
    if (Date.now() > record.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    return record.token === token;
  }

  /**
   * Invalidate token
   */
  invalidateToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }

  private randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    return result;
  }
}

export const csrfService = new CSRFService();

// ============================================
// XSS Protection Service
// ============================================

class XSSProtectionService {
  /**
   * Sanitize HTML input
   */
  sanitizeHTML(html: string): string {
    // Remove script tags
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: protocols (can be used for XSS)
    sanitized = sanitized.replace(/data:text\/html/gi, '');

    return sanitized;
  }

  /**
   * Escape HTML entities
   */
  escapeHTML(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return text.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    // Remove potential SQL injection patterns
    let sanitized = input.replace(/['";\\]/g, '');

    // Remove potential command injection
    sanitized = sanitized.replace(/[`$(){}[\]]/g, '');

    return sanitized.trim();
  }

  /**
   * Validate and sanitize URL
   */
  sanitizeURL(url: string): string | null {
    try {
      const parsed = new URL(url);

      // Only allow http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }

      // Remove any javascript: or data: in query params
      if (parsed.href.includes('javascript:') || parsed.href.includes('data:')) {
        return null;
      }

      return parsed.href;
    } catch {
      return null;
    }
  }

  /**
   * Content Security Policy headers
   */
  getCSPHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co"
      ].join('; ')
    };
  }
}

export const xssProtectionService = new XSSProtectionService();

// ============================================
// SQL Injection Prevention
// ============================================

class SQLInjectionProtection {
  /**
   * Validate and sanitize SQL parameter
   */
  sanitizeParameter(param: string | number): string | number {
    if (typeof param === 'number') return param;

    // Remove SQL keywords and special chars
    const dangerous = ['--', ';', '/*', '*/', 'xp_', 'sp_', 'DROP', 'DELETE', 'INSERT', 'UPDATE'];

    let sanitized = param;
    dangerous.forEach((pattern) => {
      sanitized = sanitized.replace(new RegExp(pattern, 'gi'), '');
    });

    return sanitized;
  }

  /**
   * Validate table/column name
   */
  validateIdentifier(identifier: string): boolean {
    // Only allow alphanumeric and underscore
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
  }

  /**
   * Parameterized query builder helper
   */
  buildParameterizedQuery(
    table: string,
    conditions: Record<string, unknown>
  ): { query: string; params: unknown[] } {
    if (!this.validateIdentifier(table)) {
      throw new Error('Invalid table name');
    }

    const keys = Object.keys(conditions);
    const params = Object.values(conditions);

    const whereClauses = keys
      .map((key, index) => {
        if (!this.validateIdentifier(key)) {
          throw new Error(`Invalid column name: ${key}`);
        }
        return `${key} = $${index + 1}`;
      })
      .join(' AND ');

    return {
      query: `SELECT * FROM ${table} WHERE ${whereClauses}`,
      params
    };
  }
}

export const sqlInjectionProtection = new SQLInjectionProtection();

// ============================================
// Security Audit Logger
// ============================================

class SecurityAuditLogger {
  async logSecurityEvent(
    type: 'rate_limit' | 'csrf_fail' | 'xss_attempt' | 'sql_injection' | 'unauthorized',
    userId: string | null,
    details: Record<string, unknown>
  ): Promise<void> {
    await supabase.from('security_audit_log').insert({
      type,
      user_id: userId,
      details,
      timestamp: new Date().toISOString(),
      ip_address: details.ip || 'unknown'
    });
  }

  async getSecurityEvents(
    limit = 100
  ): Promise<Array<{ type: string; timestamp: string; details: Record<string, unknown> }>> {
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

export const securityAuditLogger = new SecurityAuditLogger();

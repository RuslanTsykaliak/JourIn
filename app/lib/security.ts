import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/lib/auth';

// Simple in-memory rate limiter (for production, use Redis or database)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window
const AUTH_RATE_LIMIT_MAX = 5; // stricter limit for auth endpoints

export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

export function rateLimitMiddleware(request: NextRequest, isAuthEndpoint = false) {
  const ip = getClientIP(request);
  
  const now = Date.now();
  const maxRequests = isAuthEndpoint ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX_REQUESTS;
  
  // Clean up expired entries
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
  
  // Check current IP
  const current = rateLimit.get(ip);
  
  if (!current) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return null; // Allow request
  }
  
  if (now > current.resetTime) {
    // Reset window
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return null; // Allow request
  }
  
  if (current.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  
  // Increment counter
  current.count++;
  return null; // Allow request
}

export function securityHeadersMiddleware(response: NextResponse) {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'"
  );
  
  return response;
}

export function logSecurityEvent(event: string, details: Record<string, unknown>, request: NextRequest) {
  const ip = getClientIP(request);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip,
    userAgent: request.headers.get('user-agent'),
    ...details
  };
  
  console.warn('SECURITY EVENT:', JSON.stringify(logEntry));
}

export async function validateSession(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', { path: request.nextUrl.pathname }, request);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return session;
}

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware, securityHeadersMiddleware, validateSession } from './security';

export function withAuth(handler: (req: NextRequest, session: unknown) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return securityHeadersMiddleware(rateLimitResponse);
    }

    // Validate session
    const session = await validateSession(request);
    if (session instanceof NextResponse) {
      return securityHeadersMiddleware(session);
    }

    // Execute the handler
    const response = await handler(request, session);
    return securityHeadersMiddleware(response);
  };
}

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>, isAuthEndpoint = false) {
  return async (request: NextRequest) => {
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(request, isAuthEndpoint);
    if (rateLimitResponse) {
      return securityHeadersMiddleware(rateLimitResponse);
    }

    // Execute the handler
    const response = await handler(request);
    return securityHeadersMiddleware(response);
  };
}

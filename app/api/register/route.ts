
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";
import { rateLimitMiddleware, securityHeadersMiddleware, logSecurityEvent } from "../../lib/security";
import { validateJSONInput } from "../../lib/input-validation";

export async function POST(req: Request) {
  // Convert Request to NextRequest for security middleware
  const nextReq = req as NextRequest;
  
  try {
    
    // Apply rate limiting (stricter for registration)
    const rateLimitResponse = rateLimitMiddleware(nextReq, true);
    if (rateLimitResponse) {
      return securityHeadersMiddleware(rateLimitResponse);
    }

    const requestData = await req.json();

    // Validate input data
    const validation = validateJSONInput(requestData);
    if (!validation.valid) {
      logSecurityEvent('INVALID_REGISTRATION_DATA', { 
        error: validation.error,
        dataSize: JSON.stringify(requestData).length 
      }, nextReq);
      
      const errorResponse = NextResponse.json({ message: validation.error }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    const { name, email, password } = requestData;

    // Enhanced validation
    if (!name || !email || !password) {
      const errorResponse = NextResponse.json({ message: "Missing fields" }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    // Validate name length and content
    if (name.length < 2 || name.length > 50) {
      const errorResponse = NextResponse.json({ message: "Name must be between 2 and 50 characters" }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorResponse = NextResponse.json({ message: "Invalid email format" }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    // Validate password strength
    const passwordRequirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "Contain at least one number" },
      { regex: /[A-Z]/, text: "Contain at least one uppercase letter" },
      { regex: /[a-z]/, text: "Contain at least one lowercase letter" },
      { regex: /[^A-Za-z0-9]/, text: "Contain at least one special character" },
    ];

    const failedRequirements = passwordRequirements.filter(req => !req.regex.test(password));
    if (failedRequirements.length > 0) {
      const errorResponse = NextResponse.json({ 
        message: `Password requirements not met: ${failedRequirements.map(req => req.text).join(', ')}` 
      }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    // Check for existing user
    const exist = await prisma.user.findUnique({
      where: { email },
    });

    if (exist) {
      logSecurityEvent('DUPLICATE_REGISTRATION_ATTEMPT', { email }, nextReq);
      const errorResponse = NextResponse.json({ message: "Email already exists" }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    // Hash password with stronger salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        username: email.split('@')[0].toLowerCase(),
      },
    });

    // Log successful registration
    logSecurityEvent('SUCCESSFUL_REGISTRATION', { 
      userId: user.id, 
      email: user.email 
    }, nextReq);

    // Remove password from response
    const { password: _userPassword, ...userWithoutPassword } = user;

    const successResponse = NextResponse.json(userWithoutPassword);
    return securityHeadersMiddleware(successResponse);

  } catch (error: unknown) {
    console.error('Registration error:', error);
    logSecurityEvent('REGISTRATION_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, nextReq);
    
    const errorResponse = NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    return securityHeadersMiddleware(errorResponse);
  }
}

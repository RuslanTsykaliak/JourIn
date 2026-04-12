// Never use type any or unknown in this file

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { JsonObject } from "@prisma/client/runtime/library";
import { rateLimitMiddleware, securityHeadersMiddleware, logSecurityEvent, validateSession } from "@/app/lib/security";
import { validateJSONInput } from "@/app/lib/input-validation";

export async function GET(request: NextRequest) {
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

  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const response = NextResponse.json(journalEntries);
  return securityHeadersMiddleware(response);
}

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(req);
  if (rateLimitResponse) {
    return securityHeadersMiddleware(rateLimitResponse);
  }

  // Validate session
  const session = await validateSession(req);
  if (session instanceof NextResponse) {
    return securityHeadersMiddleware(session);
  }

  const requestData = await req.json();

  // Validate input data
  const validation = validateJSONInput(requestData);
  if (!validation.valid) {
    logSecurityEvent('INVALID_JOURNAL_DATA', { 
      error: validation.error,
      dataSize: JSON.stringify(requestData).length 
    }, req);
    
    const errorResponse = NextResponse.json({ error: validation.error }, { status: 400 });
    return securityHeadersMiddleware(errorResponse);
  }

  const { whatWentWell, whatILearned, whatWouldDoDifferently, nextStep, customTitles } = requestData;

  // Process the customTitles to include any custom field titles from the top level
  const processedCustomTitles: Record<string, unknown> = { ...(customTitles || {}) };
  const dynamicFields: Record<string, unknown> = {};

  // Look for custom field titles and values in the request data
  Object.keys(requestData).forEach(key => {
    if (key.startsWith('customField_')) {
      if (key.endsWith('_title')) {
        processedCustomTitles[key] = requestData[key];
      } else {
        dynamicFields[key] = requestData[key];
      }
    }
  });

  const newEntry = await prisma.journalEntry.create({
    data: {
      whatWentWell,
      whatILearned,
      whatWouldDoDifferently,
      nextStep,
      customTitles: processedCustomTitles as JsonObject,
      dynamicFields: dynamicFields as JsonObject,
      userId: session.user.id,
    },
  });

  const response = NextResponse.json(newEntry, { status: 201 });
  return securityHeadersMiddleware(response);
}

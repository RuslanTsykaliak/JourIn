// Never use type any or unknown in this file

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { JsonObject } from "@prisma/client/runtime/library";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(journalEntries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestData = await req.json();
  console.log('API received data:', requestData);

  const { whatWentWell, whatILearned, whatWouldDoDifferently, nextStep, customTitles } = requestData;

  // Process the customTitles to include any custom field titles from the top level
  const processedCustomTitles: Record<string, unknown> = { ...(customTitles || {}) };
  const dynamicFields: Record<string, unknown> = {};

  // Look for custom field titles and values in the request data
  Object.keys(requestData).forEach(key => {
    if (key.startsWith('customField_')) {
      if (key.endsWith('_title')) {
        processedCustomTitles[key] = requestData[key];
        console.log(`Adding ${key}: ${requestData[key]} to customTitles`);
      } else {
        dynamicFields[key] = requestData[key];
        console.log(`Adding ${key}: ${requestData[key]} to dynamicFields`);
      }
    }
  });

  console.log('Processed customTitles:', processedCustomTitles);
  console.log('Processed dynamicFields:', dynamicFields);

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

  console.log('Created entry in DB:', newEntry);
  return NextResponse.json(newEntry, { status: 201 });
}

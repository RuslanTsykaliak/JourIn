import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
  const processedCustomTitles = { ...customTitles };

  // Look for custom field titles in the request data and add them to customTitles
  Object.keys(requestData).forEach(key => {
    if (key.endsWith('_title') && key.startsWith('customField_')) {
      processedCustomTitles[key] = requestData[key];
      console.log(`Adding ${key}: ${requestData[key]} to customTitles`);
    }
  });

  console.log('Processed customTitles:', processedCustomTitles);

  const newEntry = await prisma.journalEntry.create({
    data: {
      whatWentWell,
      whatILearned,
      whatWouldDoDifferently,
      nextStep,
      customTitles: processedCustomTitles,
      userId: session.user.id,
    },
  });

  console.log('Created entry in DB:', newEntry);
  return NextResponse.json(newEntry, { status: 201 });
}

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

  const { whatWentWell, whatILearned, whatWouldDoDifferently, nextStep, customTitles } = await req.json();

  const newEntry = await prisma.journalEntry.create({
    data: {
      whatWentWell,
      whatILearned,
      whatWouldDoDifferently,
      nextStep,
      customTitles,
      userId: session.user.id,
    },
  });

  return NextResponse.json(newEntry, { status: 201 });
}

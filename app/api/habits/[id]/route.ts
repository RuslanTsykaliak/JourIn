import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/lib/auth';
import prisma from '@/app/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { data, comments } = body;

  try {
    // First, verify the entry belongs to the user
    const entry = await prisma.habitEntry.findUnique({
      where: { id },
    });

    if (!entry || entry.userId !== userId) {
      return NextResponse.json({ error: 'Not Found or Not Owned by User' }, { status: 404 });
    }

    // Now, update the entry
    const updatedEntry = await prisma.habitEntry.update({
      where: { id },
      data: {
        data: data,
        comments: comments,
      },
    });

    return NextResponse.json(updatedEntry, { status: 200 });
  } catch (error) {
    console.error(`Error updating entry ${id}:`, error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const weekStartParam = searchParams.get('weekStart');

  if (!weekStartParam) {
    return NextResponse.json({ error: 'weekStart parameter is required' }, { status: 400 });
  }

  try {
    const weekStartDate = new Date(weekStartParam);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 7);

    const habitEntries = await prisma.habitEntry.findMany({
      where: {
        userId: userId,
        date: {
          gte: weekStartDate,
          lt: weekEndDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const formattedData: Record<string, unknown[]> = {};
    habitEntries.forEach(entry => {
      const dateString = entry.date.toISOString().split('T')[0];
      formattedData[dateString] = [entry.data];
    });

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/lib/auth';
import prisma from '@/app/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { content } = await req.json();

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        content,
        userId: session?.user?.id,
      },
    });
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}


// app/api/generate/db/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { generatePromptTextDB } from '@/app/utils/generatePromptTextDB';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/lib/auth';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userGoal, promptTemplate } = body;

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!journalEntries || journalEntries.length === 0) {
      return NextResponse.json({ error: 'No journal entries found' }, { status: 400 });
    }

    // We need to adapt the data for generatePromptTextDB
    // It expects a single object with dynamicFields, not an array of entries.
    // Let's combine the dynamic fields from all entries.
    const combinedDynamicFields = journalEntries.reduce((acc, entry) => {
      if (entry.dynamicFields) {
        Object.assign(acc, entry.dynamicFields);
      }
      return acc;
    }, {});

    const customTitles = journalEntries.reduce((acc, entry) => {
        if (entry.customTitles) {
            Object.assign(acc, entry.customTitles);
        }
        return acc;
    }, {});

    const prompt = generatePromptTextDB(
      { dynamicFields: combinedDynamicFields, userGoal },
      customTitles,
      promptTemplate
    );

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-8b-8192',
    });

    const generatedPost = chatCompletion.choices[0]?.message?.content || '';

    return NextResponse.json({ post: generatedPost });

  } catch (error) {
    console.error('Error generating post:', error);
    return NextResponse.json({ error: 'Failed to generate post' }, { status: 500 });
  }
}

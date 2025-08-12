// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { generatePromptText } from '@/app/utils/generatePromptText';
import { JournalEntries } from '@/app/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const journalEntries: JournalEntries = body.journalEntries;

    if (!journalEntries) {
      return NextResponse.json({ error: 'Journal entries are required' }, { status: 400 });
    }

    const prompt = generatePromptText(journalEntries);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-8b-8192', // Or 'mixtral-8x7b-32768'
    });

    const generatedPost = chatCompletion.choices[0]?.message?.content || '';

    return NextResponse.json({ post: generatedPost });

  } catch (error) {
    console.error('Error generating post:', error);
    return NextResponse.json({ error: 'Failed to generate post' }, { status: 500 });
  }
}
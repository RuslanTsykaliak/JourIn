import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/lib/auth';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId, userId },
      include: {
        analytics: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let prompt = `Analyze the following LinkedIn post and its performance over time. Provide suggestions for improvement.\n\nPost Content:\n\"${post.content}\"\n\nPerformance History:\n`;

    if (post.analytics && post.analytics.length > 0) {
      post.analytics.forEach(analytic => {
        prompt += `- On ${analytic.createdAt.toLocaleDateString()}: ${analytic.likes} likes, ${analytic.comments} comments, ${analytic.reposts} reposts, ${analytic.impressions} impressions.\n`;
      });
    } else {
      prompt += `- No analytics data available.\n`;
    }

    prompt += `
Based on the content and performance, what are the strengths and weaknesses of this post?
What specific suggestions do you have to improve future posts? Consider content, style, and timing.
Provide a revised version of the post that incorporates your suggestions.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });

    const analysis = chatCompletion.choices[0]?.message?.content || 'No analysis generated.';

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing post:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze post', details: errorMessage }, { status: 500 });
  }
}

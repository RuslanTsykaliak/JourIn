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

    const [targetPost, allPosts] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId, userId },
        include: {
          analytics: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      }),
      prisma.post.findMany({
        where: { userId },
        include: {
          analytics: true,
        },
      }),
    ]);

    if (!targetPost) {
      return NextResponse.json({ error: 'Target post not found' }, { status: 404 });
    }

    let totalLikes = 0;
    let totalComments = 0;
    let totalReposts = 0;
    let totalImpressions = 0;
    let analyticsCount = 0;
    let bestPost = null;
    let maxLikes = -1;

    for (const post of allPosts) {
      for (const analytic of post.analytics) {
        totalLikes += analytic.likes || 0;
        totalComments += analytic.comments || 0;
        totalReposts += analytic.reposts || 0;
        totalImpressions += analytic.impressions || 0;
        analyticsCount++;

        if ((analytic.likes || 0) > maxLikes) {
          maxLikes = analytic.likes || 0;
          bestPost = post;
        }
      }
    }

    const avgLikes = analyticsCount > 0 ? totalLikes / analyticsCount : 0;
    const avgComments = analyticsCount > 0 ? totalComments / analyticsCount : 0;
    const avgReposts = analyticsCount > 0 ? totalReposts / analyticsCount : 0;
    const avgImpressions = analyticsCount > 0 ? totalImpressions / analyticsCount : 0;

    let prompt = `You are an expert LinkedIn content strategist. Analyze the following LinkedIn post and its performance in the context of the user's overall post history.

Target Post to Analyze:
Content:
"${targetPost.content}"

Performance History of Target Post:
`;

    if (targetPost.analytics && targetPost.analytics.length > 0) {
      targetPost.analytics.forEach(analytic => {
        prompt += `- On ${analytic.createdAt.toLocaleDateString()}: ${analytic.likes} likes, ${analytic.comments} comments, ${analytic.reposts} reposts, ${analytic.impressions} impressions.\n`;
      });
    } else {
      prompt += `- No analytics data available for this post.\n`;
    }

    prompt += `
    User's Overall Performance Context:
- Average Likes per post analytic: ${avgLikes.toFixed(1)}
- Average Comments per post analytic: ${avgComments.toFixed(1)}
- Average Reposts per post analytic: ${avgReposts.toFixed(1)}
- Average Impressions per post analytic: ${avgImpressions.toFixed(1)}
`;

    if (bestPost) {
      prompt += `- Their best performing post (by likes) is: "${bestPost.content}" which had ${maxLikes} likes.\n`;
    }

    prompt += `
Your Task:
1.  Compare: How does the target post's performance compare to the user's average? Is it above or below average?
2.  Strengths & Weaknesses: What are the strengths and weaknesses of the target post's content and performance trajectory?
3.  Learnings from History: What patterns can be identified from the user's overall history and their best post? What seems to work well for their audience?
4.  Actionable Suggestions: Provide specific, actionable suggestions for the user to improve their next post.
5.  Revised Post: Provide a revised version of the target post that incorporates your suggestions.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });

    const analysis = chatCompletion.choices[0]?.message?.content || 'No analysis generated.';

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Error analyzing post history:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze post history', details: errorMessage }, { status: 500 });
  }
}

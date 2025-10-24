// app/api/coach/posts/route.ts

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all posts for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      analytics: true, // Include the related analytics data
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(posts);
}

// POST a new post with its analytics
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, platform, impressions, likes, comments, reposts } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const newPost = await prisma.post.create({
    data: {
      content,
      platform,
      user: {
        connect: { id: session.user.id },
      },
      analytics: {
        create: {
          impressions,
          likes,
          comments,
          reposts,
        },
      },
    },
    include: {
      analytics: true,
    },
  });

  return NextResponse.json(newPost, { status: 201 });
}
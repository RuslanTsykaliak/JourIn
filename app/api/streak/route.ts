
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        streakCount: true,
        lastCheckIn: true,
      },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Basic streak logic for GET request
    let currentStreak = user.streakCount || 0;
    if (user.lastCheckIn) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastCheckInDate = new Date(user.lastCheckIn);
      lastCheckInDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastCheckInDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays > 1) {
        currentStreak = 0;
      }
    }

    return NextResponse.json({ streak: currentStreak });
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = user.streakCount || 0;
    let newLastCheckIn = user.lastCheckIn;

    if (user.lastCheckIn) {
      const lastCheckInDate = new Date(user.lastCheckIn);
      lastCheckInDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastCheckInDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        newStreak++;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // if diffDays is 0, do nothing
    } else {
      newStreak = 1;
    }

    newLastCheckIn = new Date();

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        streakCount: newStreak,
        lastCheckIn: newLastCheckIn,
      },
    });

    return NextResponse.json({ streak: updatedUser.streakCount });
  } catch (error) {
    console.error("Error updating streak data:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { CustomTitles } from "@/app/types";
import prisma from "@/app/lib/prisma";

export async function GET() {
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        customTitles: true,
        additionalFields: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      customTitles: user.customTitles || null,
      additionalFields: user.additionalFields || []
    });
  } catch (error) {
    console.error("Error fetching custom titles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { customTitles, additionalFields } = await req.json();

    if (!customTitles || typeof customTitles !== 'object') {
      return NextResponse.json({ error: "Invalid custom titles data" }, { status: 400 });
    }

    const updateData: {
      customTitles: CustomTitles;
      additionalFields?: string[];
    } = {
      customTitles: customTitles as CustomTitles,
    };

    if (additionalFields && Array.isArray(additionalFields)) {
      updateData.additionalFields = additionalFields;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: updateData,
      select: {
        id: true,
        customTitles: true,
        additionalFields: true,
      },
    });

    return NextResponse.json({ 
      message: "Custom titles saved successfully",
      customTitles: updatedUser.customTitles,
      additionalFields: updatedUser.additionalFields
    });
  } catch (error: unknown) {
    console.error("Error saving custom titles:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

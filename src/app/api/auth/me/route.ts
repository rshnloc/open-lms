import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, getMockPersonas, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const personas = await getMockPersonas();

    return NextResponse.json({
      user,
      personas,
    });
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User persona not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, targetUser.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: targetUser,
    });
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Failed to switch persona" }, { status: 500 });
  }
}


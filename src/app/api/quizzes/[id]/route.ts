import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: {
              select: {
                id: true,
                text: true,
                // do not leak isCorrect for active quizzes
              },
            },
          },
        },
        attempts: user
          ? {
              where: { userId: user.id },
              orderBy: { attemptedAt: "desc" },
              take: 3,
            }
          : false,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Quiz GET error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}


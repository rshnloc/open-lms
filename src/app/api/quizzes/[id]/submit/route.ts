import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body; // Map of questionId -> selectedOptionId

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers object is required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const review: any[] = [];

    for (const q of quiz.questions) {
      const selectedOptionId = answers[q.id];
      const correctOption = q.options.find((opt) => opt.isCorrect);
      const isQuestionCorrect = correctOption?.id === selectedOptionId;

      if (isQuestionCorrect) {
        correctCount += 1;
      }

      review.push({
        questionId: q.id,
        questionText: q.text,
        selectedOptionId,
        correctOptionId: correctOption?.id,
        isCorrect: isQuestionCorrect,
        explanation: q.explanation,
      });
    }

    const scorePercentage =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercentage >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quiz.id,
        score: scorePercentage,
        passed,
      },
    });

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      passed,
      passingScore: quiz.passingScore,
      correctCount,
      totalQuestions,
      attemptId: attempt.id,
      review,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Failed to grade quiz" }, { status: 500 });
  }
}


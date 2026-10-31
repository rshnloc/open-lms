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

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const courseId = lesson.module.courseId;

    // Toggle or set completed
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lesson.id,
        },
      },
    });

    const isCompleted = existingProgress ? !existingProgress.isCompleted : true;

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lesson.id,
        },
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // Count all lessons in course
    const totalLessons = await prisma.lesson.count({
      where: {
        module: {
          courseId,
        },
      },
    });

    // Count completed lessons by this user in this course
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        isCompleted: true,
        lesson: {
          module: {
            courseId,
          },
        },
      },
    });

    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const isFullyCompleted = progressPercent >= 100;

    // Update enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      update: {
        progressPercent,
        status: isFullyCompleted ? "COMPLETED" : "IN_PROGRESS",
        completedAt: isFullyCompleted ? new Date() : null,
      },
      create: {
        userId: user.id,
        courseId,
        progressPercent,
        status: isFullyCompleted ? "COMPLETED" : "IN_PROGRESS",
        completedAt: isFullyCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      isCompleted,
      progressPercent,
      enrollment,
    });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}


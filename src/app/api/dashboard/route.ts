import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Common Student Data
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: {
              select: { name: true },
            },
            modules: {
              include: {
                lessons: {
                  select: { id: true, title: true, slug: true, durationMinutes: true },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const completedLessonsCount = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        isCompleted: true,
      },
    });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        quiz: {
          select: { title: true },
        },
      },
      orderBy: { attemptedAt: "desc" },
    });

    // Instructor Data
    let createdCourses: any[] = [];
    if (user.role === "INSTRUCTOR" || user.role === "ADMIN") {
      createdCourses = await prisma.course.findMany({
        where: user.role === "ADMIN" ? {} : { instructorId: user.id },
        include: {
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Platform aggregate stats for Admin
    let platformStats = null;
    if (user.role === "ADMIN") {
      const [totalUsers, totalCourses, totalEnrollments, totalAttempts] =
        await Promise.all([
          prisma.user.count(),
          prisma.course.count(),
          prisma.enrollment.count(),
          prisma.quizAttempt.count(),
        ]);

      platformStats = {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalAttempts,
      };
    }

    return NextResponse.json({
      user,
      enrollments,
      completedLessonsCount,
      quizAttempts,
      createdCourses,
      platformStats,
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}


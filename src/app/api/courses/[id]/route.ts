import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            bio: true,
            avatar: true,
          },
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                quizzes: {
                  select: {
                    id: true,
                    title: true,
                    passingScore: true,
                  },
                },
              },
            },
          },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
        enrollments: currentUser
          ? {
              where: { userId: currentUser.id },
            }
          : false,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get completed lessons for this user
    let completedLessonIds: string[] = [];
    if (currentUser) {
      const progress = await prisma.lessonProgress.findMany({
        where: {
          userId: currentUser.id,
          isCompleted: true,
          lesson: {
            module: {
              courseId: course.id,
            },
          },
        },
        select: {
          lessonId: true,
        },
      });
      completedLessonIds = progress.map((p) => p.lessonId);
    }

    return NextResponse.json({
      course,
      enrollment: course.enrollments?.[0] || null,
      completedLessonIds,
    });
  } catch (error) {
    console.error("Course GET error:", error);
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 });
  }
}


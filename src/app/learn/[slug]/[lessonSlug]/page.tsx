import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import LessonPlayerView from "./LessonPlayerView";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const user = await getCurrentUser();

  const course = await prisma.course.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              quizzes: {
                select: { id: true, title: true, passingScore: true },
              },
            },
          },
        },
      },
      enrollments: user
        ? {
            where: { userId: user.id },
          }
        : false,
    },
  });

  if (!course) {
    notFound();
  }

  // Find the requested lesson
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLessonFull = await prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      module: {
        courseId: course.id,
      },
    },
    include: {
      quizzes: {
        select: { id: true, title: true, passingScore: true },
      },
    },
  });

  if (!currentLessonFull) {
    notFound();
  }

  // Get completed lessons by user
  let completedLessonIds: string[] = [];
  if (user) {
    const progressList = await prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
        lesson: {
          module: { courseId: course.id },
        },
      },
      select: { lessonId: true },
    });
    completedLessonIds = progressList.map((p) => p.lessonId);
  }

  const enrollment = course.enrollments?.[0];
  const progressPercent = enrollment ? Math.round(enrollment.progressPercent) : 0;

  return (
    <LessonPlayerView
      course={course}
      currentLesson={currentLessonFull}
      initialCompletedIds={completedLessonIds}
      initialProgressPercent={progressPercent}
    />
  );
}


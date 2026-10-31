import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  PlayCircle,
  FileText,
  Lock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import EnrollButton from "./EnrollButton";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  const course = await prisma.course.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
          title: true,
          bio: true,
        },
      },
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
      quizzes: {
        select: { id: true, title: true, passingScore: true },
      },
      enrollments: currentUser
        ? {
            where: { userId: currentUser.id },
          }
        : false,
    },
  });

  if (!course) {
    notFound();
  }

  // Fetch completed lessons for current user
  let completedLessonIds: string[] = [];
  if (currentUser) {
    const completedProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: currentUser.id,
        isCompleted: true,
        lesson: {
          module: { courseId: course.id },
        },
      },
      select: { lessonId: true },
    });
    completedLessonIds = completedProgress.map((p) => p.lessonId);
  }

  const enrollment = course.enrollments?.[0] || null;
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalDuration = allLessons.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const firstLesson = allLessons[0];

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
            Courses
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">{course.title}</span>
        </div>

        {/* Hero Banner Card */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 shadow-sm mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {course.category}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {course.level} Level
                </span>
                {enrollment && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Enrolled ({Math.round(enrollment.progressPercent)}% Done)
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {course.title}
              </h1>

              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {course.description}
              </p>

              {/* Stats Bar */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>{course.modules.length} Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span>{allLessons.length} Detailed Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>{totalDuration} mins runtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Quizzes & Progress Tracking</span>
                </div>
              </div>
            </div>

            {/* Action Box */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Tuition & Access
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Free & Open
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Full access to all course materials, code examples, and assessments.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {firstLesson && (
                  <EnrollButton
                    courseId={course.id}
                    courseSlug={course.slug}
                    firstLessonSlug={firstLesson.slug}
                    isEnrolled={!!enrollment}
                  />
                )}

                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    No credit card or real credentials required. You are exploring with mock persona{" "}
                    <strong>{currentUser?.name || "Student Sam"}</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout: Curriculum + Instructor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Syllabus / Modules */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Curriculum & Learning Path
            </h2>

            <div className="space-y-4">
              {course.modules.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
                >
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      Module {modIdx + 1}: {mod.title}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {mod.lessons.length} Lessons
                    </div>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {mod.lessons.map((lesson) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const hasQuiz = lesson.quizzes && lesson.quizzes.length > 0;

                      return (
                        <div
                          key={lesson.id}
                          className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/80 dark:hover:bg-zinc-850 transition"
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {lesson.title}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                                <span>{lesson.durationMinutes} mins</span>
                                {lesson.isFree && (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    Free Preview
                                  </span>
                                )}
                                {hasQuiz && (
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    Includes Assessment
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/learn/${course.slug}/${lesson.slug}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
                          >
                            Open Lesson
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                Instructor Profile
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                  {course.instructor.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {course.instructor.name}
                  </div>
                  <div className="text-xs text-zinc-500">{course.instructor.title}</div>
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {course.instructor.bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


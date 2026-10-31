import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  BookOpen,
  Clock,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: {
        select: {
          name: true,
          title: true,
        },
      },
      modules: {
        include: {
          lessons: {
            select: { id: true, durationMinutes: true },
          },
        },
      },
      enrollments: currentUser
        ? {
            where: { userId: currentUser.id },
            select: { progressPercent: true, status: true },
          }
        : false,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-blue-50/60 via-white to-transparent dark:from-zinc-900/60 dark:via-zinc-950 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Full-Stack TypeScript LMS Architecture
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl mx-auto">
            Master Modern Engineering with Structured Learning
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Production-grade, end-to-end type safety, interactive assessments, modular lesson progression, and zero-PII mock persona testing.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-xs text-zinc-500 font-medium mt-0.5">Active Courses</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">
                {courses.reduce((acc, c) => acc + c.modules.flatMap((m) => m.lessons).length, 0)}
              </div>
              <div className="text-xs text-zinc-500 font-medium mt-0.5">Curated Lessons</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">100%</div>
              <div className="text-xs text-zinc-500 font-medium mt-0.5">Type-Safe ORM</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">Zero</div>
              <div className="text-xs text-zinc-500 font-medium mt-0.5">External Credentials</div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Featured Course Catalog
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Explore hands-on curriculum with interactive quizzes and progress tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Active Persona: <strong className="text-zinc-900 dark:text-zinc-100">{currentUser?.name || "Student Sam"}</strong></span>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const lessons = course.modules.flatMap((m) => m.lessons);
            const totalDuration = lessons.reduce((acc, curr) => acc + curr.durationMinutes, 0);
            const enrollment = course.enrollments?.[0];
            const isEnrolled = !!enrollment;

            const levelBadgeColor =
              course.level === "BEGINNER"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                : course.level === "INTERMEDIATE"
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800";

            return (
              <div
                key={course.id}
                className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition group"
              >
                {/* Course Header Banner */}
                <div className="h-40 bg-gradient-to-tr from-zinc-900 via-blue-950 to-indigo-900 p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between z-10">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${levelBadgeColor}`}>
                      {course.level}
                    </span>
                    <span className="text-[11px] font-medium text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                      {course.category}
                    </span>
                  </div>

                  <div className="z-10 text-white font-mono text-xs opacity-75">
                    {course.modules.length} Modules • {lessons.length} Lessons
                  </div>

                  {/* Decorative background glow */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition">
                      <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                    </h3>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {course.subtitle || course.description}
                    </p>
                  </div>

                  {/* Details & Enrollment progress */}
                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{totalDuration} mins total</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        <span>{course.instructor.name}</span>
                      </div>
                    </div>

                    {isEnrolled && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                          <span className="text-zinc-600 dark:text-zinc-400">Course Progress</span>
                          <span className="text-blue-600 dark:text-blue-400">
                            {Math.round(enrollment.progressPercent)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/courses/${course.slug}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition shadow-sm"
                    >
                      {isEnrolled ? "Continue Learning" : "View Curriculum & Enroll"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

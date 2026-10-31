import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CourseCreator from "./CourseCreator";
import {
  Layers,
  Users,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

export default async function StudioPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR")) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex p-4 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Instructor / Administrator Access Required
        </h1>
        <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto">
          Please use the <strong>Mock Persona Switcher</strong> in the top navigation bar to switch your active profile to <strong>Instructor Alex</strong> or <strong>System Administrator</strong>.
        </p>
      </div>
    );
  }

  const courses = await prisma.course.findMany({
    where: user.role === "ADMIN" ? {} : { instructorId: user.id },
    include: {
      instructor: {
        select: { name: true, email: true },
      },
      modules: {
        include: {
          lessons: { select: { id: true } },
        },
      },
      _count: {
        select: {
          enrollments: true,
          quizzes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEnrollments = courses.reduce((acc, c) => acc + c._count.enrollments, 0);
  const totalLessons = courses.reduce(
    (acc, c) => acc + c.modules.flatMap((m) => m.lessons).length,
    0
  );

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Studio Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
              <span>Curriculum Management Studio</span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
              Course Authoring & Analytics
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Author modules, manage assessments, and inspect learner metrics as {user.name} ({user.role}).
            </p>
          </div>

          <CourseCreator />
        </div>

        {/* Studio KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Courses Authored</span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {courses.length}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Published to platform catalog</div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Active Learners</span>
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalEnrollments}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Enrolled across your courses</div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Lessons Authored</span>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalLessons}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Curated units across modules</div>
          </div>
        </div>

        {/* Course List Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Active Course Catalog
          </h2>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                <tr>
                  <th className="px-6 py-3">Course Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Modules / Lessons</th>
                  <th className="px-6 py-3">Enrolled Learners</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {courses.map((course) => {
                  const lessonCount = course.modules.flatMap((m) => m.lessons).length;

                  return (
                    <tr key={course.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {course.title}
                        </div>
                        <div className="text-[11px] text-zinc-400">{course.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {course.category}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {course.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {course.modules.length} Modules • {lessonCount} Lessons
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
                        {course._count.enrollments} Learners
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/courses/${course.slug}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


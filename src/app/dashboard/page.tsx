import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  BookOpen,
  CheckCircle2,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Play,
  RotateCcw,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Please select a persona in the top bar to view your dashboard.</h1>
      </div>
    );
  }

  // Fetch enrollments with full progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          modules: {
            include: {
              lessons: { select: { id: true, slug: true } },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId: user.id, isCompleted: true },
    select: { lessonId: true },
  });

  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id },
    include: {
      quiz: {
        select: {
          title: true,
          passingScore: true,
          course: { select: { slug: true } },
        },
      },
    },
    orderBy: { attemptedAt: "desc" },
  });

  const passedQuizzesCount = quizAttempts.filter((a) => a.passed).length;
  const avgScore =
    quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / quizAttempts.length)
      : 0;

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Header */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {user.name}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{user.email} • {user.title || "Learner Profile"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>Fictitious sandbox identity. No real user data or credentials stored.</span>
          </div>
        </div>

        {/* Learning Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Courses</span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {enrollments.length}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Active curriculum paths</div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Completed Lessons</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {completedLessons.length}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Milestones reached</div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Passed Quizzes</span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {passedQuizzesCount}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Evaluations certified</div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {avgScore}%
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Across all quiz attempts</div>
          </div>
        </div>

        {/* In-Progress Courses */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              My Courses
            </h2>
            <Link
              href="/"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Browse catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <BookOpen className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                You haven't enrolled in any courses yet.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
              >
                Browse Featured Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enr) => {
                const firstLesson = enr.course.modules[0]?.lessons[0];
                const isCompleted = enr.progressPercent >= 100;

                return (
                  <div
                    key={enr.id}
                    className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {enr.course.category}
                        </span>
                        {isCompleted ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Completed ✓
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Instructor: {enr.course.instructor.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {enr.course.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                        {enr.course.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                        <span className="text-zinc-500">Progress</span>
                        <span className="text-blue-600 font-semibold">
                          {Math.round(enr.progressPercent)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${enr.progressPercent}%` }}
                        ></div>
                      </div>

                      {firstLesson && (
                        <Link
                          href={`/learn/${enr.course.slug}/${firstLesson.slug}`}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>{isCompleted ? "Review Lessons" : "Continue Learning"}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Assessment Attempts History */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Assessment Record & Scores
          </h2>

          {quizAttempts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-500">
              No quiz attempts logged yet. Complete course lessons to unlock and test your knowledge.
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                  <tr>
                    <th className="px-6 py-3">Assessment Title</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Result</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {quizAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {att.quiz.title}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {att.score}%
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            att.passed
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {att.passed ? "PASSED" : "NEEDS RETAKE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(att.attemptedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


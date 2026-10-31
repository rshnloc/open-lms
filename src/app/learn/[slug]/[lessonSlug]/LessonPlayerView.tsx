"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import QuizPlayer from "@/components/QuizPlayer";

type LessonItem = {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  order: number;
  isFree: boolean;
  quizzes?: { id: string; title: string; passingScore: number }[];
};

type ModuleItem = {
  id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
};

type CourseData = {
  id: string;
  title: string;
  slug: string;
  modules: ModuleItem[];
};

export default function LessonPlayerView({
  course,
  currentLesson,
  initialCompletedIds,
  initialProgressPercent,
}: {
  course: CourseData;
  currentLesson: LessonItem & { content: string };
  initialCompletedIds: string[];
  initialProgressPercent: number;
}) {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [progressPercent, setProgressPercent] = useState<number>(initialProgressPercent);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Flatten all lessons in order
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCurrentCompleted = completedIds.includes(currentLesson.id);
  const hasQuiz = currentLesson.quizzes && currentLesson.quizzes.length > 0;
  const quiz = hasQuiz ? currentLesson.quizzes![0] : null;

  async function handleToggleProgress() {
    setIsUpdatingProgress(true);
    try {
      const res = await fetch(`/api/lessons/${currentLesson.id}/progress`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isCompleted) {
          setCompletedIds((prev) => [...prev, currentLesson.id]);
        } else {
          setCompletedIds((prev) => prev.filter((id) => id !== currentLesson.id));
        }
        setProgressPercent(data.progressPercent);
        router.refresh();
      }
    } catch (err) {
      console.error("Progress update failed:", err);
    } finally {
      setIsUpdatingProgress(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Left Sidebar: Course Curriculum Outline */}
      <aside className="w-full lg:w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col flex-shrink-0">
        {/* Header / Back Link */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Course Overview
          </Link>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {course.title}
          </h2>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 mb-1">
              <span>Overall Progress</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {progressPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Modules & Lessons List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 p-2">
          {course.modules.map((mod, modIdx) => (
            <div key={mod.id} className="py-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Module {modIdx + 1}: {mod.title}
              </div>
              <div className="mt-1 space-y-0.5">
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLesson.id;
                  const isDone = completedIds.includes(lesson.id);

                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${course.slug}/${lesson.slug}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                        isActive
                          ? "bg-blue-50 text-blue-900 dark:bg-blue-950/70 dark:text-blue-200 font-semibold"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-300 dark:text-zinc-700 flex-shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 flex-shrink-0 ml-2">
                        {lesson.durationMinutes}m
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Reading & Learning Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/40 p-6 sm:p-10 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Bar with Status and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                Lesson Content
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {currentLesson.title}
              </h1>
              <div className="text-xs text-zinc-500 mt-1">
                Estimated reading time: {currentLesson.durationMinutes} minutes
              </div>
            </div>

            <div className="flex items-center gap-3">
              {quiz && (
                <button
                  onClick={() => setShowQuiz(!showQuiz)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                    showQuiz
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span>{showQuiz ? "Back to Notes" : "Take Assessment"}</span>
                </button>
              )}

              <button
                onClick={handleToggleProgress}
                disabled={isUpdatingProgress}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
                  isCurrentCompleted
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800"
                }`}
              >
                {isUpdatingProgress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrentCompleted ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Completed</span>
                  </>
                ) : (
                  <span>Mark as Completed</span>
                )}
              </button>
            </div>
          </div>

          {/* Conditional: Quiz or Lesson Notes */}
          {showQuiz && quiz ? (
            <div>
              <QuizPlayer
                quizId={quiz.id}
                onComplete={(passed) => {
                  if (passed && !isCurrentCompleted) {
                    handleToggleProgress();
                  }
                }}
              />
            </div>
          ) : (
            <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 shadow-sm space-y-6">
              <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {currentLesson.content}
              </div>

              {/* Quiz Callout if lesson has a quiz */}
              {quiz && (
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-blue-900 dark:text-blue-200">
                      Lesson Knowledge Check Ready
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Verify your mastery of this topic with 3 fast interactive questions. Passing score: {quiz.passingScore}%.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                  >
                    <Award className="h-4 w-4" />
                    Start Assessment
                  </button>
                </div>
              )}
            </article>
          )}

          {/* Bottom Navigation: Previous / Next Lesson */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
            {prevLesson ? (
              <Link
                href={`/learn/${course.slug}/${prevLesson.slug}`}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous: {prevLesson.title}</span>
              </Link>
            ) : (
              <div></div>
            )}

            {nextLesson ? (
              <Link
                href={`/learn/${course.slug}/${nextLesson.slug}`}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 transition"
              >
                <span>Next: {nextLesson.title}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>Go to My Dashboard</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Award, HelpCircle, ArrowRight, RotateCcw } from "lucide-react";

type QuestionOption = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  text: string;
  options: QuestionOption[];
};

type QuizData = {
  id: string;
  title: string;
  description?: string | null;
  passingScore: number;
  questions: Question[];
};

type QuizResult = {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  review: {
    questionId: string;
    questionText: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
};

export default function QuizPlayer({
  quizId,
  onComplete,
}: {
  quizId: string;
  onComplete?: (passed: boolean) => void;
}) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  async function fetchQuiz() {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data.quiz);
      }
    } catch (err) {
      console.error("Failed to load quiz:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(questionId: string, optionId: string) {
    if (result) return; // locked after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }

  async function handleSubmit() {
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (onComplete) {
          onComplete(data.passed);
        }
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetake() {
    setSelectedAnswers({});
    setResult(null);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-zinc-500 animate-pulse">
        Loading assessment questions...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-6 text-center text-sm text-red-500">
        Assessment could not be loaded.
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === quiz.questions.length;

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Award className="h-4 w-4" />
          Interactive Assessment
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
          {quiz.title}
        </h2>
        {quiz.description && (
          <p className="text-xs text-zinc-500 mt-1">{quiz.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
          <span>{quiz.questions.length} Questions</span>
          <span>Passing Score: {quiz.passingScore}%</span>
        </div>
      </div>

      {/* Result Banner if submitted */}
      {result && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-4 ${
            result.passed
              ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {result.passed ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {result.passed ? "Assessment Passed!" : "Assessment Needs Review"}
              </div>
              <div className="text-xs opacity-90">
                You scored {result.score}% ({result.correctCount} of {result.totalQuestions} correct). Required: {result.passingScore}%.
              </div>
            </div>
          </div>
          <button
            onClick={handleRetake}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 border border-current shadow-sm hover:opacity-80 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => {
          const reviewItem = result?.review.find((r) => r.questionId === q.id);

          return (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50"
            >
              <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-3 flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-semibold">
                  {qIndex + 1}
                </span>
                <span>{q.text}</span>
              </div>

              <div className="space-y-2 pl-7">
                {q.options.map((opt) => {
                  const isSelected = selectedAnswers[q.id] === opt.id;
                  let optionStyle =
                    "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300 dark:hover:border-blue-700";

                  if (result && reviewItem) {
                    if (opt.id === reviewItem.correctOptionId) {
                      optionStyle =
                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-medium";
                    } else if (isSelected && !reviewItem.isCorrect) {
                      optionStyle =
                        "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100";
                    }
                  } else if (isSelected) {
                    optionStyle =
                      "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-medium ring-1 ring-blue-600";
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(q.id, opt.id)}
                      disabled={!!result}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{opt.text}</span>
                      {isSelected && !result && (
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                      {result && opt.id === reviewItem?.correctOptionId && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      )}
                      {result && isSelected && !reviewItem?.isCorrect && (
                        <XCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanations shown after grading */}
              {result && reviewItem?.explanation && (
                <div className="mt-3 ml-7 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-800 dark:text-blue-300">
                      Rationale:{" "}
                    </span>
                    {reviewItem.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!result && (
        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="text-xs text-zinc-500">
            {answeredCount} of {quiz.questions.length} answered
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isAllAnswered || isSubmitting}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition ${
              isAllAnswered && !isSubmitting
                ? "bg-blue-600 hover:bg-blue-700 shadow-sm"
                : "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Grading..." : "Submit Answers"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, PlayCircle } from "lucide-react";

export default function EnrollButton({
  courseId,
  courseSlug,
  firstLessonSlug,
  isEnrolled,
}: {
  courseId: string;
  courseSlug: string;
  firstLessonSlug: string;
  isEnrolled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnrollOrStart() {
    if (isEnrolled) {
      router.push(`/learn/${courseSlug}/${firstLessonSlug}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      if (res.ok) {
        router.push(`/learn/${courseSlug}/${firstLessonSlug}`);
        router.refresh();
      } else {
        alert("Failed to enroll. Please try again.");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("An error occurred during enrollment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleEnrollOrStart}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition active:scale-[0.99] disabled:opacity-75"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Setting up Course Space...</span>
        </>
      ) : isEnrolled ? (
        <>
          <PlayCircle className="h-4 w-4" />
          <span>Resume Learning</span>
        </>
      ) : (
        <>
          <span>Enroll Now — Free</span>
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}


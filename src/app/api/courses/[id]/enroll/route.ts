import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required to enroll" }, { status: 401 });
    }

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Upsert enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      update: {
        status: "ACTIVE",
      },
      create: {
        userId: user.id,
        courseId: course.id,
        status: "ACTIVE",
        progressPercent: 0.0,
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Failed to process enrollment" }, { status: 500 });
  }
}


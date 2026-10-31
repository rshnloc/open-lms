import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const query = searchParams.get("q");

    const currentUser = await getCurrentUser();

    const where: any = {
      isPublished: true,
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (level && level !== "ALL") {
      where.level = level;
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            title: true,
            avatar: true,
          },
        },
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                durationMinutes: true,
                isFree: true,
              },
            },
          },
        },
        enrollments: currentUser
          ? {
              where: {
                userId: currentUser.id,
              },
              select: {
                id: true,
                status: true,
                progressPercent: true,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const enriched = courses.map((course) => {
      const allLessons = course.modules.flatMap((m) => m.lessons);
      const totalLessons = allLessons.length;
      const totalDuration = allLessons.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const userEnrollment = course.enrollments?.[0] || null;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        subtitle: course.subtitle,
        description: course.description,
        thumbnail: course.thumbnail,
        level: course.level,
        category: course.category,
        featured: course.featured,
        instructor: course.instructor,
        totalModules: course.modules.length,
        totalLessons,
        totalDurationMinutes: totalDuration,
        enrollment: userEnrollment,
        createdAt: course.createdAt,
      };
    });

    return NextResponse.json({ courses: enriched });
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR")) {
      return NextResponse.json(
        { error: "Unauthorized. Instructor or Admin role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, subtitle, description, level, category, thumbnail } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newCourse = await prisma.course.create({
      data: {
        title,
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
        subtitle: subtitle || null,
        description,
        level: level || "BEGINNER",
        category: category || "Development",
        thumbnail: thumbnail || null,
        instructorId: user.id,
        isPublished: true,
        modules: {
          create: [
            {
              title: "Getting Started",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Course Introduction & Setup",
                    slug: "intro-and-setup",
                    content: "Welcome to this course! In this lesson, we will cover the foundational topics and project structure.",
                    durationMinutes: 10,
                    order: 1,
                    isFree: true,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error) {
    console.error("Courses POST error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}


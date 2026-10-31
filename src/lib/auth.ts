import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "lms_session_user_id";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  title?: string | null;
  avatar?: string | null;
};

// Gets the current active user from cookie, defaulting to the mock student if not set
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        avatar: true,
      },
    });
    if (user) {
      return user as SessionUser;
    }
  }

  // Fallback to default demo student account if cookie is unset
  const defaultStudent = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      avatar: true,
    },
  });

  return (defaultStudent as SessionUser) ?? null;
}

// Retrieves all available synthetic mock personas for quick persona switching
export async function getMockPersonas() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
    },
    orderBy: {
      role: "asc",
    },
  });
}


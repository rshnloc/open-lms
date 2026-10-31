import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding synthetic LMS data (no PII, no real credentials)...");

  // Clean existing data for clean seed
  await prisma.quizAttempt.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("demo12345", 10);

  // 1. Create Mock Synthetic Users
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@example.com",
      password: defaultPassword,
      role: "ADMIN",
      title: "Platform Administrator",
      bio: "Fictitious system administrator account for managing platform settings and courses.",
    },
  });

  const instructor = await prisma.user.create({
    data: {
      name: "Instructor Alex",
      email: "instructor@example.com",
      password: defaultPassword,
      role: "INSTRUCTOR",
      title: "Senior Software Architect & Educator",
      bio: "Fictitious curriculum designer focusing on modern TypeScript and distributed systems architecture.",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Student Sam",
      email: "student@example.com",
      password: defaultPassword,
      role: "STUDENT",
      title: "Apprentice Developer",
      bio: "Fictitious student profile tracking learning milestones and technical certifications.",
    },
  });

  // 2. Create Course 1: TypeScript
  const tsCourse = await prisma.course.create({
    data: {
      title: "Mastering TypeScript: From Zero to Production",
      slug: "mastering-typescript-production",
      subtitle: "Master static types, generics, conditional types, and high-performance patterns in TypeScript.",
      description: "A comprehensive, hands-on curriculum exploring TypeScript from standard type narrowing to advanced type-level programming, strict compiler flags, and production best practices.",
      thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc13c74410c?auto=format&fit=crop&w=800&q=80",
      level: "INTERMEDIATE",
      category: "TypeScript & Web",
      featured: true,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: "Module 1: The Core Type System",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Primitives, Unions, and Type Narrowing",
                  slug: "primitives-unions-type-narrowing",
                  durationMinutes: 15,
                  order: 1,
                  isFree: true,
                  content: `### Understanding Type Narrowing in TypeScript

TypeScript is a structural type system. One of its most powerful capabilities is **control flow analysis**, where the compiler narrows down types as code branches.

#### 1. Discriminated Unions
A discriminated union uses a shared literal property across multiple types to allow safe branching:

\`\`\`typescript
type NetworkSuccess = {
  status: "success";
  payload: { data: string[] };
};

type NetworkError = {
  status: "error";
  error: { message: string; code: number };
};

type NetworkState = NetworkSuccess | NetworkError;

function handleState(state: NetworkState) {
  if (state.status === "success") {
    // TypeScript knows this is NetworkSuccess
    console.log(state.payload.data);
  } else {
    // TypeScript knows this is NetworkError
    console.error(state.error.message);
  }
}
\`\`\`

#### Key Takeaway
Always prefer discriminated unions with explicit status tags when modeling domain workflows, async states, or polymorphic entities.`,
                },
                {
                  title: "Generics, Utility Types, and Type Constraints",
                  slug: "generics-utility-types-constraints",
                  durationMinutes: 20,
                  order: 2,
                  isFree: false,
                  content: `### Generics and Type Constraints

Generics allow you to write reusable functions and data structures without losing type safety.

\`\`\`typescript
interface HasId {
  id: string;
}

// Constraining T to objects having an id property
function findEntityById<T extends HasId>(list: T[], targetId: string): T | undefined {
  return list.find((item) => item.id === targetId);
}
\`\`\`

#### Built-in Utility Types
TypeScript provides indispensable utility types:
- \`Partial<T>\`: Makes all properties optional.
- \`Required<T>\`: Makes all properties required.
- \`Readonly<T>\`: Makes all properties immutable.
- \`Pick<T, K>\`: Selects a subset of keys.
- \`Omit<T, K>\`: Omits specified keys.
- \`Record<K, V>\`: Constructs an object type with keys K and values V.`,
                },
              ],
            },
          },
          {
            title: "Module 2: Advanced Type-Level Engineering",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Conditional Types and the 'infer' Keyword",
                  slug: "conditional-types-infer-keyword",
                  durationMinutes: 25,
                  order: 1,
                  isFree: false,
                  content: `### Deep Dive: Conditional Types & \`infer\`

Conditional types allow types to be decided dynamically based on condition expressions:

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>;       // false
\`\`\`

#### Unpacking with \`infer\`
You can unpack promise types, return types, and array elements:

\`\`\`typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Fetched = UnwrapPromise<Promise<{ id: number; name: string }>>;
// Fetched is { id: number; name: string }
\`\`\`

Conditional types unlock powerful schema validations, query builders, and type-safe routing.`,
                },
                {
                  title: "Template Literal Types & Type-Safe Routing",
                  slug: "template-literal-types-safe-routing",
                  durationMinutes: 20,
                  order: 2,
                  isFree: false,
                  content: `### Template Literal Types

Template literal types allow TypeScript to model string patterns with precision:

\`\`\`typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint = \`/api/\${string}\`;
type ApiRoute = \`\${HttpMethod} \${Endpoint}\`;

const validRoute: ApiRoute = "POST /api/courses"; // Valid
\`\`\`

This pattern enables compile-time verification of URLs, event keys, and CSS classes without runtime performance cost.`,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  // 3. Create Course 2: Modern Full-Stack Web Architecture
  const archCourse = await prisma.course.create({
    data: {
      title: "Modern Full-Stack Web Architecture",
      slug: "modern-full-stack-web-architecture",
      subtitle: "Design scalable, resilient web applications with modern micro-patterns and edge rendering.",
      description: "Learn how to build resilient full-stack applications with clean architectural separation, transactional integrity, caching strategies, and robust data persistence.",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      level: "ADVANCED",
      category: "System Design",
      featured: true,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: "Architectural Foundations",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Decoupled Data Layers & Repository Patterns",
                  slug: "decoupled-data-layers-repository-pattern",
                  durationMinutes: 18,
                  order: 1,
                  isFree: true,
                  content: `### Repository Pattern in Modern TypeScript

Separating domain logic from database drivers ensures that applications remain testable and database-agnostic.

#### Advantages:
1. Unit tests can run against an in-memory repository without spawning a live database.
2. Migrating database technologies becomes a local driver swap rather than a full codebase refactor.
3. Centralized query caching and auditing can be inserted seamlessly.`,
                },
                {
                  title: "Stateless Authentication & Session Security",
                  slug: "stateless-auth-session-security",
                  durationMinutes: 22,
                  order: 2,
                  isFree: false,
                  content: `### Secure Token Handling

When designing auth systems:
- Never expose sensitive tokens in local storage if XSS is a concern; prefer \`httpOnly\`, \`SameSite=Strict\` cookies.
- Rotate refresh tokens and maintain strict revocation lists when users revoke sessions.
- Always hash passwords with adaptive algorithms like bcrypt or argon2.`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 4. Create Course 3: Clean Code & Data Structures
  await prisma.course.create({
    data: {
      title: "Clean Code & Data Structures in Practice",
      slug: "clean-code-data-structures-practice",
      subtitle: "Master test-driven refactoring and fundamental algorithmic efficiency.",
      description: "A practical guide to writing clean, maintainable, self-documenting code paired with core computational complexity and traversal patterns.",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      level: "BEGINNER",
      category: "Software Engineering",
      featured: false,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: "Clean Code Principles",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Refactoring for Readability and Testability",
                  slug: "refactoring-readability-testability",
                  durationMinutes: 14,
                  order: 1,
                  isFree: true,
                  content: `### Clean Code Principles

- **Single Responsibility Principle**: A function or class should have one, and only one, reason to change.
- **Self-Documenting Identifiers**: Choose descriptive names over cryptic abbreviations.
- **Fail Fast & Guard Clauses**: Validate inputs at the boundary to eliminate deep nested \`if\` statements.`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 5. Add Quizzes for TypeScript Course
  const firstLesson = tsCourse.modules[0].lessons[0];
  const quiz = await prisma.quiz.create({
    data: {
      courseId: tsCourse.id,
      lessonId: firstLesson.id,
      title: "Assessment: Type Narrowing & Unions",
      description: "Test your understanding of discriminated unions, type guards, and structural typing.",
      passingScore: 70,
      questions: {
        create: [
          {
            text: "What makes a union type in TypeScript 'discriminated'?",
            explanation: "A discriminated union requires a common literal property present in every member of the union that TypeScript uses to safely branch.",
            order: 1,
            options: {
              create: [
                { text: "A common literal property (tag) shared across all variant types", isCorrect: true },
                { text: "Every member having the exact same function signatures", isCorrect: false },
                { text: "Using the 'any' keyword as a fallback handler", isCorrect: false },
                { text: "Importing a special macro from the TypeScript compiler", isCorrect: false },
              ],
            },
          },
          {
            text: "Which keyword allows TypeScript to infer types within a conditional type expression?",
            explanation: "The 'infer' keyword introduces a type variable to be extracted within conditional types.",
            order: 2,
            options: {
              create: [
                { text: "infer", isCorrect: true },
                { text: "extract", isCorrect: false },
                { text: "resolve", isCorrect: false },
                { text: "unpack", isCorrect: false },
              ],
            },
          },
          {
            text: "What is the return type of Partial<{ title: string; count: number }>?",
            explanation: "Partial<T> makes all properties in T optional ({ title?: string; count?: number }).",
            order: 3,
            options: {
              create: [
                { text: "{ title?: string; count?: number }", isCorrect: true },
                { text: "{ readonly title: string; readonly count: number }", isCorrect: false },
                { text: "never", isCorrect: false },
                { text: "{ title: string | null; count: number | null }", isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  // 6. Enroll Mock Student in the TypeScript course
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: tsCourse.id,
      status: "IN_PROGRESS",
      progressPercent: 50.0,
    },
  });

  // Mark first lesson as completed by student
  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: firstLesson.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // Record a quiz attempt for the student
  await prisma.quizAttempt.create({
    data: {
      userId: student.id,
      quizId: quiz.id,
      score: 100.0,
      passed: true,
    },
  });

  console.log("Database seeded successfully with synthetic data!");
  console.log("Mock Accounts:");
  console.log("  - Admin: admin@example.com (Password: demo12345)");
  console.log("  - Instructor: instructor@example.com (Password: demo12345)");
  console.log("  - Student: student@example.com (Password: demo12345)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


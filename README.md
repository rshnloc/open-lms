# OpenLMS — Full-Stack TypeScript Learning Management System

A production-grade, end-to-end type-safe Learning Management System (LMS) built with **TypeScript**, **Next.js (App Router)**, **Tailwind CSS**, and **Prisma ORM** with local **SQLite**.

---

## 🔒 Data Privacy & Credential Safety Compliance

This repository is strictly designed for safe local execution, demonstration, and automated assessment:
- **Zero Real Credentials**: No live, expired, or rotated API keys, passwords, secret tokens, or private certificates exist in this codebase.
- **Zero PII (Personally Identifiable Information)**: All names, emails, bios, and identifiers are 100% synthetic placeholders (e.g. `student@example.com`, `admin@example.com`, `instructor@example.com`).
- **Zero Third-Party Confidential Data**: No client, proprietary, or confidential enterprise intellectual property is utilized.
- **Strictly Ignored Local State**: All `.env*` files and local SQLite database files (`dev.db`, `*.db`) are ignored in `.gitignore` to prevent any unintended data leaks.

---

## 🚀 Key Modules & Architecture

1. **Course Catalog & Search**:
   - Filter courses by category, difficulty level (*Beginner*, *Intermediate*, *Advanced*), or title.
   - Dynamic lesson runtime calculations and module breakdowns.

2. **Learning Room & Lesson Viewer (`/learn/[slug]/[lessonSlug]`)**:
   - Distraction-free two-column layout with curriculum outline and progress checkboxes.
   - Rich technical lesson content with code examples and architectural notes.
   - Real-time progress updates with instant completion toggling.

3. **Interactive Assessment Engine (`/quizzes`)**:
   - Multiple-choice knowledge checks linked to lessons.
   - Real-time grading algorithm that evaluates submitted answers, generates percentage scores, and displays instructional explanations.

4. **Student Dashboard (`/dashboard`)**:
   - Real-time learning KPIs: Enrolled courses, completed lessons, passed assessments, average score.
   - "Continue Learning" shortcuts with active progress indicators.
   - Chronological assessment history log with pass/fail badges.

5. **Course Authoring Studio (`/studio`)**:
   - Dedicated portal for Instructors and Administrators.
   - Author new courses with titles, descriptions, categories, and syllabus structures.
   - Enrollment analytics tracking learner counts.

6. **Interactive Persona Switcher**:
   - Switch between **Student Sam**, **Instructor Alex**, and **System Administrator** instantly with one click in the top navigation bar without entering any passwords.

---

## 🛠️ Tech Stack

- **Language**: TypeScript 5 (Strict Mode enabled)
- **Framework**: Next.js 16 (App Router, Server & Client Components)
- **Database & ORM**: Prisma ORM 7 with SQLite via `@prisma/adapter-better-sqlite3`
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Security / Hashing**: `bcryptjs` for local password verification

---

## 📋 Step-by-Step Guide: How to Run This Project

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy the safe template environment file (contains only local SQLite path, no live keys):
```bash
cp .env.example .env
```

### Step 3: Initialize Database Schema
Sync the Prisma schema to the local SQLite database:
```bash
npx prisma db push
```

### Step 4: Seed Synthetic Mock Curriculum & Users
Populate the database with synthetic courses, modules, lessons, quizzes, and mock accounts:
```bash
npm run seed
```

### Step 5: Start the Full-Stack Server
Launch the unified server (both frontend UI and backend API):
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Mock Demo Accounts (Pre-Seeded)

| Persona / Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` | `demo12345` | Browse courses, complete lessons, take quizzes, view personal dashboard |
| **Instructor** | `instructor@example.com` | `demo12345` | Author new courses, manage modules, inspect student enrollments |
| **Administrator** | `admin@example.com` | `demo12345` | Full platform access, studio analytics, and course oversight |

> *Tip: You can switch between any of these accounts in real time using the **Mock Persona Switcher** dropdown in the top right corner of the navigation bar.*

---

## 📁 Project Structure

```
├── dev.db                      # Local SQLite database (git-ignored)
├── prisma/
│   ├── schema.prisma           # Prisma 7 database schema models
│   └── seed.ts                 # Synthetic data seeding script
├── src/
│   ├── app/
│   │   ├── api/                # Backend REST API route handlers
│   │   │   ├── auth/me/        # Session and persona switching API
│   │   │   ├── courses/        # Course catalog and creation endpoints
│   │   │   ├── dashboard/      # Personalized learner and instructor analytics
│   │   │   ├── lessons/        # Progress tracking and completion endpoints
│   │   │   └── quizzes/        # Assessment delivery and submission grading
│   │   ├── courses/[slug]/     # Course syllabus and enrollment page
│   │   ├── dashboard/          # Learner dashboard with analytics and badges
│   │   ├── learn/[slug]/       # Distraction-free interactive learning room
│   │   ├── studio/             # Instructor course authoring studio
│   │   ├── layout.tsx          # App shell and root layout
│   │   └── page.tsx            # Course catalog and homepage
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation header with Persona Switcher
│   │   └── QuizPlayer.tsx      # Assessment engine with instant scoring
│   ├── generated/prisma/       # Generated type-safe Prisma client
│   └── lib/
│       ├── auth.ts             # Session and role-based access helpers
│       └── prisma.ts           # PrismaClient singleton with SQLite adapter
├── .env.example                # Safe mock environment template
└── package.json                # Project dependencies and run scripts
```

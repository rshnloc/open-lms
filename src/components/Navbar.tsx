"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Layers,
  UserCheck,
  ChevronDown,
  Shield,
  Sparkles,
} from "lucide-react";

type UserPersona = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  title?: string | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserPersona | null>(null);
  const [personas, setPersonas] = useState<UserPersona[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setPersonas(data.personas || []);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  }

  async function handleSwitchPersona(userId: string) {
    setIsSwitching(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsMenuOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch persona:", err);
    } finally {
      setIsSwitching(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Open<span className="text-blue-600">LMS</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              TypeScript
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname === "/"
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Courses
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname.startsWith("/dashboard")
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {(currentUser?.role === "INSTRUCTOR" || currentUser?.role === "ADMIN") && (
            <Link
              href="/studio"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname.startsWith("/studio")
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <Layers className="h-4 w-4" />
              Course Studio
            </Link>
          )}
        </nav>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition shadow-sm"
            title="Switch mock user role"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-bold text-[10px]">
              {currentUser?.role === "ADMIN" ? "A" : currentUser?.role === "INSTRUCTOR" ? "I" : "S"}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold leading-tight">{currentUser?.name || "Student Sam"}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Role: {currentUser?.role || "STUDENT"}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                  Mock Persona Switcher
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Instant zero-credential persona testing (No real PII).
                </p>
              </div>

              <div className="space-y-1">
                {personas.map((persona) => {
                  const isActive = currentUser?.id === persona.id;
                  const roleBadgeColor =
                    persona.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      : persona.role === "INSTRUCTOR"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";

                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleSwitchPersona(persona.id)}
                      disabled={isSwitching}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition ${
                        isActive
                          ? "bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-100 font-semibold"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{persona.name}</div>
                        <div className="text-[10px] text-zinc-400">{persona.email}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${roleBadgeColor}`}>
                        {persona.role}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 px-2 text-[10px] text-zinc-400 flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span>Synthetic dev environment</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "OpenLMS | TypeScript Learning Management System",
  description: "A production-grade, type-safe Learning Management System built with TypeScript, Next.js, Tailwind CSS, and Prisma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              © OpenLMS Platform • Built with TypeScript, Next.js & Prisma
            </p>
            <p className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Zero-PII & Synthetic Data Compliant
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

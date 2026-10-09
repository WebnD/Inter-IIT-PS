import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Public_Sans } from "next/font/google";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const body = Public_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Inter-IIT PS Archive", template: "%s | Inter-IIT PS Archive" },
  description: "Past Inter-IIT Tech Meet problem statements, organized for contingent prep.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
          Skip to content
        </a>
        <header className="border-b border-rule bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
            <Link href="/" className="font-display text-lg font-bold tracking-tight">
              Inter-IIT PS Archive
            </Link>
            <nav aria-label="Main" className="flex gap-5 text-sm font-medium">
              <Link href="/" className="hover:underline underline-offset-4">Overview</Link>
              <Link href="/explore" className="hover:underline underline-offset-4">Browse all</Link>
            </nav>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted sm:px-6">
            Problem statements and PDFs come from{" "}
            <a className="underline underline-offset-2" href="https://github.com/criticic/InterIIT-TechMeet-Problem-Statements" target="_blank" rel="noreferrer">
              criticic/InterIIT-TechMeet-Problem-Statements
            </a>
            . Summaries are condensed; the PDF is the source of truth.
          </div>
        </footer>
      </body>
    </html>
  );
}

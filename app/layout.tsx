import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Public_Sans } from "next/font/google";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const body = Public_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

// ---- Footer content: edit these ----
const TEAM = "WebnD";
const TEAM_URL = "https://github.com/WebnD"; // set to "" to show the name without a link
const TAGLINE = "Past problem statements for Inter-IIT Tech Meet prep. For internal contingent use only.";
const SOURCE_URL = "https://github.com/criticic/InterIIT-TechMeet-Problem-Statements";
// ------------------------------------

export const metadata: Metadata = {
  title: { default: "Inter-IIT PS Archive", template: "%s | Inter-IIT PS Archive" },
  description: "Past Inter-IIT Tech Meet problem statements, organized for contingent prep.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
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

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-10 sm:px-6">
          {children}
        </main>

        <footer className="border-t border-rule bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1fr_auto] sm:px-6">
            <div className="max-w-[52ch]">
              <Link href="/" className="font-display text-lg font-bold tracking-tight">
                Inter-IIT PS Archive
              </Link>
              <p className="mt-2 text-sm text-muted">{TAGLINE}</p>
            </div>

            <nav aria-label="Footer" className="flex gap-10 text-sm">
              <ul className="space-y-2">
                <li><Link href="/" className="hover:underline underline-offset-4">Overview</Link></li>
                <li><Link href="/explore" className="hover:underline underline-offset-4">Browse all</Link></li>
                <li><Link href="/explore?pdf=1" className="hover:underline underline-offset-4">Problems with PDFs</Link></li>
              </ul>
              <ul className="space-y-2">
                <li><Link href="/explore?prep=high" className="hover:underline underline-offset-4">High prep</Link></li>
                <li><Link href="/explore?prep=mid" className="hover:underline underline-offset-4">Mid prep</Link></li>
                <li><Link href="/explore?prep=low" className="hover:underline underline-offset-4">Low prep</Link></li>
              </ul>
            </nav>
          </div>

          <div className="border-t border-rule">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>
                © {year}{" "}
                {TEAM_URL ? (
                  <a href={TEAM_URL} target="_blank" rel="noreferrer" className="font-medium text-ink hover:underline underline-offset-2">
                    {TEAM}
                  </a>
                ) : (
                  <span className="font-medium text-ink">{TEAM}</span>
                )}
              </p>
              <p>
                Problem statements and PDFs from{" "}
                <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
                  criticic/InterIIT-TechMeet-Problem-Statements
                </a>
                . The PDF is the source of truth.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
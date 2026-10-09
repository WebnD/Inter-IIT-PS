import Link from "next/link";
import { notFound } from "next/navigation";
import { editions, getEdition, problemsByYear } from "@/lib/data";
import { PREP_LEVELS, PREP_META } from "@/lib/taxonomy";
import { ProblemList } from "@/components/ProblemList";

export const dynamicParams = false;
export const generateStaticParams = () => editions.map((e) => ({ year: String(e.year) }));

export function generateMetadata({ params }: { params: { year: string } }) {
  const e = getEdition(Number(params.year));
  return e ? { title: `${e.year} (${e.number}), ${e.host}` } : {};
}

export default function YearPage({ params }: { params: { year: string } }) {
  const year = Number(params.year);
  const edition = getEdition(year);
  if (!edition) notFound();
  const items = problemsByYear(year);
  const idx = editions.findIndex((e) => e.year === year);
  const newer = editions[idx - 1];
  const older = editions[idx + 1];

  return (
    <div className="space-y-12">
      <header>
        <p className="text-sm text-muted">Tech Meet {edition.number} at {edition.host}</p>
        <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight tabular-nums">{edition.year}</h1>
        <p className="mt-2 text-lg text-muted">Theme: {edition.theme}</p>
        <nav aria-label="Other editions" className="mt-5 flex gap-6 text-sm font-medium">
          {older && <Link href={`/years/${older.year}`} className="underline underline-offset-4">Previous: {older.year}</Link>}
          {newer && <Link href={`/years/${newer.year}`} className="underline underline-offset-4">Next: {newer.year}</Link>}
        </nav>
      </header>

      {PREP_LEVELS.map((l) => {
        const group = items.filter((p) => p.prepLevel === l);
        if (!group.length) return null;
        return (
          <section key={l} aria-labelledby={`prep-${l}`}>
            <h2 id={`prep-${l}`} className={`font-display text-2xl font-bold tracking-tight ${PREP_META[l].text}`}>
              {PREP_META[l].label} <span className="text-base font-medium text-muted">({group.length})</span>
            </h2>
            <div className="mt-4">
              <ProblemList items={group} showYear={false} showPrep={false} full />
            </div>
          </section>
        );
      })}
    </div>
  );
}

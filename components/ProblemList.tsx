import Link from "next/link";
import { type Problem, displayName, firstSentence, hasPdf } from "@/lib/data";
import { PrepBadge } from "./PrepBadge";
import { DomainLinks } from "./DomainLinks";

type Props = { items: Problem[]; showYear?: boolean; showPrep?: boolean; full?: boolean };

export function ProblemList({ items, showYear = true, showPrep = true, full = false }: Props) {
  if (!items.length) return null;
  return (
    <ol className="divide-y divide-rule border-y border-rule">
      {items.map((p) => (
        <li key={p.slug} className="grid gap-x-6 gap-y-2 py-5 sm:grid-cols-[4.5rem_1fr]">
          {showYear ? (
            <div className="font-display text-xl font-bold tabular-nums text-muted">{p.year}</div>
          ) : (
            <div className="hidden sm:block" />
          )}
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Link href={`/ps/${p.slug}`} className="font-display text-lg font-semibold tracking-tight hover:underline underline-offset-4">
                {displayName(p)}
              </Link>
              {showPrep && <PrepBadge level={p.prepLevel} />}
              {!hasPdf(p) && <span className="text-xs text-muted">No PDF</span>}
            </div>
            <p className={`max-w-[72ch] ${p.summary ? "text-ink/85" : "italic text-muted"}`}>
              {p.summary ? (full ? p.summary : firstSentence(p.summary)) : "No details in the source archive yet."}
            </p>
            <DomainLinks domains={p.domains} small />
          </div>
        </li>
      ))}
    </ol>
  );
}

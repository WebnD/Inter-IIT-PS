import Link from "next/link";
import { editions, problems, recurringSponsors, domainCounts, displayName, yearRange, hasPdf } from "@/lib/data";
import { PREP_LEVELS, PREP_META, DOMAINS } from "@/lib/taxonomy";

export default function HomePage() {
  const { min, max } = yearRange();
  const withPdf = problems.filter(hasPdf).length;
  const recurring = recurringSponsors();
  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const counts = domainCounts();
  const domainIds = Object.keys(DOMAINS).filter((d) => counts[d]).sort((a, b) => counts[b] - counts[a]);
  const cell = (year: number, level: (typeof PREP_LEVELS)[number]) => problems.filter((p) => p.year === year && p.prepLevel === level);

  return (
    <div className="space-y-16 md:space-y-20">
      <section aria-labelledby="matrix-title">
        <h1 id="matrix-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          Every Inter-IIT problem statement, {min}–{max}
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg text-muted">
          {problems.length} problem statements from {editions.length} Tech Meets, {withPdf} with the original PDF, grouped by edition and prep level.
          Open any sponsor to read the full PS.
        </p>

        {/* Phone and small tablet: one expandable block per edition */}
        <div className="mt-8 space-y-3 md:hidden">
          {editions.map((e, i) => {
            const total = problems.filter((p) => p.year === e.year).length;
            return (
              <details key={e.year} open={i === 0} className="group rounded-lg border border-rule bg-surface">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="font-display text-2xl font-bold tabular-nums">{e.year}</span>
                    <span className="block text-sm text-muted">
                      {e.number} at {e.host}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-sm text-muted">
                    <span className="tabular-nums">{total} PS</span>
                    <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>

                <div className="space-y-5 border-t border-rule px-4 pb-4 pt-4">
                  {PREP_LEVELS.map((l) => {
                    const items = cell(e.year, l);
                    if (!items.length) return null;
                    return (
                      <div key={l}>
                        <h3 className={`flex items-center gap-2 text-sm font-semibold ${PREP_META[l].text}`}>
                          <span aria-hidden className={`h-2 w-2 rounded-full ${PREP_META[l].bg}`} />
                          {PREP_META[l].label}
                          <span className="font-normal text-muted">{items.length}</span>
                        </h3>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {items.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={`/ps/${p.slug}`}
                                className={`inline-block rounded border-l-[3px] bg-paper px-3 py-2 text-sm leading-tight active:bg-rule ${PREP_META[l].border} ${
                                  p.status === "incomplete" ? "border-dashed text-muted" : "font-medium"
                                }`}
                              >
                                {displayName(p)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                  <Link href={`/years/${e.year}`} className="inline-block pt-1 text-sm font-medium underline underline-offset-4">
                    Read all {e.year} summaries
                  </Link>
                </div>
              </details>
            );
          })}
          <p className="text-sm text-muted">Dashed entries have no summary or PDF in the source archive.</p>
        </div>

        {/* Tablet landscape and desktop: the full grid */}
        <div className="mt-10 hidden md:block">
          <div className="overflow-x-auto rounded-lg border border-rule bg-surface">
            <table className="w-full min-w-[56rem] border-collapse text-left">
              <caption className="sr-only">Problem statements by edition and prep level</caption>
              <thead>
                <tr className="border-b border-rule align-bottom">
                  <th scope="col" className="w-44 px-4 py-3 text-sm font-semibold">Edition</th>
                  {PREP_LEVELS.map((l) => (
                    <th key={l} scope="col" className={`border-l border-rule px-4 py-3 ${l === "NON_COMPETITIVE" ? "w-40" : ""}`}>
                      <Link href={`/explore?prep=${PREP_META[l].param}`} className={`block text-sm font-semibold hover:underline underline-offset-4 ${PREP_META[l].text}`}>
                        {PREP_META[l].label}
                      </Link>
                      <span className="block text-xs font-normal text-muted">{PREP_META[l].hint}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editions.map((e) => (
                  <tr key={e.year} className="border-b border-rule align-top last:border-b-0">
                    <th scope="row" className="px-4 py-4 font-normal">
                      <Link href={`/years/${e.year}`} className="group block">
                        <span className="font-display text-2xl font-bold tabular-nums group-hover:underline underline-offset-4">{e.year}</span>
                        <span className="mt-0.5 block text-sm text-muted">
                          {e.number} at {e.host}
                        </span>
                      </Link>
                    </th>
                    {PREP_LEVELS.map((l) => {
                      const items = cell(e.year, l);
                      return (
                        <td key={l} className="border-l border-rule px-3 py-3">
                          {items.length === 0 ? (
                            <span className="block px-1 text-sm text-rule" aria-label="None">—</span>
                          ) : (
                            <ul className="space-y-1">
                              {items.map((p) => (
                                <li key={p.slug}>
                                  <Link
                                    href={`/ps/${p.slug}`}
                                    title={p.status === "incomplete" ? "No details in the source archive" : undefined}
                                    className={`block border-l-[3px] px-2 py-1 text-sm leading-snug hover:bg-paper ${PREP_META[l].border} ${
                                      p.status === "incomplete" ? "border-dashed text-muted" : "font-medium"
                                    }`}
                                  >
                                    {displayName(p)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">Dashed entries have no summary or PDF in the source archive.</p>
        </div>
      </section>

      <section aria-labelledby="recurring-title">
        <h2 id="recurring-title" className="font-display text-2xl font-bold tracking-tight">Sponsors that come back</h2>
        <p className="mt-2 max-w-[62ch] text-muted">
          Repeat sponsors tend to build on their previous problem. Read a sponsor&apos;s history before their next PS drops.
        </p>
        <table className="mt-6 w-full border-collapse text-left">
          <caption className="sr-only">Years each recurring sponsor set a problem</caption>
          <thead>
            <tr className="border-b border-rule text-sm text-muted">
              <th scope="col" className="py-2 pr-3 font-medium">Sponsor</th>
              {years.map((y) => (
                <th key={y} scope="col" className="w-8 py-2 text-center font-medium tabular-nums sm:w-16">
                  <span className="sm:hidden" aria-hidden>’{String(y).slice(2)}</span>
                  <span className="sr-only sm:not-sr-only">{y}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recurring.map((s) => (
              <tr key={s.slug} className="border-b border-rule">
                <th scope="row" className="py-2.5 pr-3 font-normal">
                  <Link href={`/sponsors/${s.slug}`} className="font-medium leading-tight hover:underline underline-offset-4">
                    {s.name}
                  </Link>
                  <span className="block text-xs text-muted sm:ml-2 sm:inline sm:text-sm">{s.years.length} editions</span>
                </th>
                {years.map((y) => (
                  <td key={y} className="py-2.5 text-center">
                    {s.years.includes(y) ? (
                      <span className="inline-block h-3 w-3 rounded-sm bg-ink sm:h-3.5 sm:w-3.5" aria-label={`Set a problem in ${y}`} />
                    ) : (
                      <span className="inline-block h-3 w-3 rounded-sm border border-rule sm:h-3.5 sm:w-3.5" aria-label={`None in ${y}`} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="domains-title">
        <h2 id="domains-title" className="font-display text-2xl font-bold tracking-tight">Browse by domain</h2>
        <p className="mt-2 max-w-[62ch] text-muted">A problem can sit in more than one domain, so the counts overlap.</p>
        <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {domainIds.map((d) => (
            <li key={d} className="border-b border-rule">
              <Link href={`/domains/${d}`} className="flex items-baseline justify-between gap-4 py-3 hover:underline underline-offset-4">
                <span>{DOMAINS[d]}</span>
                <span className="tabular-nums text-muted">{counts[d]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
import Link from "next/link";
import { editions, problems, recurringSponsors, domainCounts, displayName, yearRange } from "@/lib/data";
import { PREP_LEVELS, PREP_META, DOMAINS } from "@/lib/taxonomy";

export default function HomePage() {
  const { min, max } = yearRange();
  const withPdf = problems.filter((p) => p.pdfUrl).length;
  const recurring = recurringSponsors();
  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const counts = domainCounts();
  const domainIds = Object.keys(DOMAINS).filter((d) => counts[d]).sort((a, b) => counts[b] - counts[a]);

  return (
    <div className="space-y-20">
      <section aria-labelledby="matrix-title">
        <h1 id="matrix-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          Every Inter-IIT problem statement, {min}–{max}
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg text-muted">
          {problems.length} problem statements from {editions.length} Tech Meets, {withPdf} with the original PDF. Each row is an edition, each
          column a prep level. Open any sponsor to read the full PS.
        </p>

        <div className="mt-10 overflow-x-auto rounded-lg border border-rule bg-surface">
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
                    const cell = problems.filter((p) => p.year === e.year && p.prepLevel === l);
                    return (
                      <td key={l} className="border-l border-rule px-3 py-3">
                        {cell.length === 0 ? (
                          <span className="block px-1 text-sm text-rule" aria-label="None">—</span>
                        ) : (
                          <ul className="space-y-1">
                            {cell.map((p) => (
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
      </section>

      <section aria-labelledby="recurring-title">
        <h2 id="recurring-title" className="font-display text-2xl font-bold tracking-tight">Sponsors that come back</h2>
        <p className="mt-2 max-w-[62ch] text-muted">
          Repeat sponsors tend to build on their previous problem. Read a sponsor&apos;s history before their next PS drops.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <caption className="sr-only">Years each recurring sponsor set a problem</caption>
            <thead>
              <tr className="border-b border-rule text-sm text-muted">
                <th scope="col" className="py-2 pr-4 font-medium">Sponsor</th>
                {years.map((y) => (
                  <th key={y} scope="col" className="w-16 py-2 text-center font-medium tabular-nums">{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recurring.map((s) => (
                <tr key={s.slug} className="border-b border-rule">
                  <th scope="row" className="py-2.5 pr-4 font-normal">
                    <Link href={`/sponsors/${s.slug}`} className="font-medium hover:underline underline-offset-4">{s.name}</Link>
                    <span className="ml-2 text-sm text-muted">{s.years.length} editions</span>
                  </th>
                  {years.map((y) => (
                    <td key={y} className="py-2.5 text-center">
                      {s.years.includes(y) ? (
                        <span className="inline-block h-3.5 w-3.5 rounded-sm bg-ink" aria-label={`Set a problem in ${y}`} />
                      ) : (
                        <span className="inline-block h-3.5 w-3.5 rounded-sm border border-rule" aria-label={`None in ${y}`} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="domains-title">
        <h2 id="domains-title" className="font-display text-2xl font-bold tracking-tight">Browse by domain</h2>
        <p className="mt-2 max-w-[62ch] text-muted">A problem can sit in more than one domain, so the counts overlap.</p>
        <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {domainIds.map((d) => (
            <li key={d} className="border-b border-rule">
              <Link href={`/domains/${d}`} className="flex items-baseline justify-between gap-4 py-2.5 hover:underline underline-offset-4">
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

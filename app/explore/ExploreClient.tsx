"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Problem } from "@/lib/data";
import { DOMAINS, PREP_LEVELS, PREP_META, domainLabel, prepFromParam } from "@/lib/taxonomy";
import { ProblemList } from "@/components/ProblemList";

type Props = {
  problems: Problem[];
  years: number[];
  sponsors: { slug: string; name: string }[];
  domainCounts: Record<string, number>;
};

const csv = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

function haystack(p: Problem) {
  return [p.sponsor, p.track, p.summary, p.year, PREP_META[p.prepLevel].label, ...p.rawDomains, ...p.domains.map(domainLabel)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ExploreClient({ problems, years, sponsors, domainCounts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selYears = csv(params.get("year"));
  const selPrep = csv(params.get("prep"));
  const selDomains = csv(params.get("domain"));
  const selSponsor = params.get("sponsor") ?? "";
  const pdfOnly = params.get("pdf") === "1";
  const qParam = params.get("q") ?? "";

  const [q, setQ] = useState(qParam);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => setQ(qParam), [qParam]);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const toggle = (key: string, current: string[], value: string) => {
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    update(key, [...set].join(",") || null);
  };

  // Debounce search into the URL
  useEffect(() => {
    if (q === qParam) return;
    const t = setTimeout(() => update("q", q.trim() || null), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const index = useMemo(() => new Map(problems.map((p) => [p.slug, haystack(p)])), [problems]);

  const results = useMemo(() => {
    const tokens = qParam.toLowerCase().split(/\s+/).filter(Boolean);
    const prepLevels = selPrep.map(prepFromParam).filter(Boolean);
    return problems.filter((p) => {
      if (selYears.length && !selYears.includes(String(p.year))) return false;
      if (prepLevels.length && !prepLevels.includes(p.prepLevel)) return false;
      if (selDomains.length && !selDomains.some((d) => p.domains.includes(d))) return false;
      if (selSponsor && p.sponsorSlug !== selSponsor) return false;
      if (pdfOnly && !p.pdfLocal && !p.pdfUrl) return false;
      if (tokens.length) {
        const h = index.get(p.slug)!;
        if (!tokens.every((t) => h.includes(t))) return false;
      }
      return true;
    });
  }, [problems, index, qParam, selYears, selPrep, selDomains, selSponsor, pdfOnly]);

  const activeCount = selYears.length + selPrep.length + selDomains.length + (selSponsor ? 1 : 0) + (pdfOnly ? 1 : 0) + (qParam ? 1 : 0);
  const clearAll = () => {
    setQ("");
    router.replace(pathname, { scroll: false });
  };

  const domainIds = Object.keys(DOMAINS).filter((d) => domainCounts[d]).sort((a, b) => domainCounts[b] - domainCounts[a]);

  const chip = (pressed: boolean) =>
    `rounded border px-2.5 py-1 text-sm transition-colors ${
      pressed ? "border-ink bg-ink text-paper" : "border-rule bg-surface text-ink hover:border-ink"
    }`;

  const filters = (
    <div className="space-y-7">
      <div>
        <label htmlFor="search" className="text-sm font-semibold">Search</label>
        <input
          id="search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="RAG, drone, ISRO, backtesting…"
          className="mt-2 w-full rounded-md border border-rule bg-surface px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ink"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Year</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {years.map((y) => (
            <button key={y} type="button" aria-pressed={selYears.includes(String(y))} onClick={() => toggle("year", selYears, String(y))} className={`${chip(selYears.includes(String(y)))} tabular-nums`}>
              {y}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Prep level</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PREP_LEVELS.map((l) => {
            const on = selPrep.includes(PREP_META[l].param);
            return (
              <button key={l} type="button" aria-pressed={on} onClick={() => toggle("prep", selPrep, PREP_META[l].param)} className={chip(on)}>
                <span aria-hidden className={`mr-1.5 inline-block h-2 w-2 rounded-full ${PREP_META[l].bg}`} />
                {PREP_META[l].label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Domain</legend>
        <p className="text-xs text-muted">Matches any selected domain</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {domainIds.map((d) => {
            const on = selDomains.includes(d);
            return (
              <button key={d} type="button" aria-pressed={on} onClick={() => toggle("domain", selDomains, d)} className={chip(on)}>
                {DOMAINS[d]} <span className={on ? "text-paper/70" : "text-muted"}>{domainCounts[d]}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="sponsor" className="text-sm font-semibold">Sponsor</label>
        <select
          id="sponsor"
          value={selSponsor}
          onChange={(e) => update("sponsor", e.target.value || null)}
          className="mt-2 w-full rounded-md border border-rule bg-surface px-3 py-2"
        >
          <option value="">All sponsors</option>
          {sponsors.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name}</option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={pdfOnly} onChange={(e) => update("pdf", e.target.checked ? "1" : null)} className="h-4 w-4 accent-ink" />
        Only show problems with a PDF
      </label>
    </div>
  );

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[18rem_1fr]">
      <aside aria-label="Filters">
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="filter-panel"
          onClick={() => setFiltersOpen((o) => !o)}
          className="w-full rounded-md border border-rule bg-surface px-3 py-2 text-left font-medium lg:hidden"
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
          {activeCount ? ` (${activeCount} active)` : ""}
        </button>
        <div id="filter-panel" className={`${filtersOpen ? "block pt-6" : "hidden"} lg:sticky lg:top-6 lg:block lg:pt-0`}>
          {filters}
        </div>
      </aside>

      <section aria-live="polite" aria-label="Results">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink tabular-nums">{results.length}</span> of {problems.length} problem statements
          </p>
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="text-sm font-medium underline underline-offset-4">
              Clear filters
            </button>
          )}
        </div>
        {results.length ? (
          <ProblemList items={results} />
        ) : (
          <div className="rounded-lg border border-dashed border-rule p-8">
            <p className="font-medium">No problem statements match these filters.</p>
            <p className="mt-1 text-muted">Remove a filter or clear them all to see everything.</p>
            <button type="button" onClick={clearAll} className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper">
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

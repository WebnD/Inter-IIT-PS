import problemsJson from "@/data/problems.json";
import editionsJson from "@/data/editions.json";
import enrichmentJson from "@/data/enrichment.json";
import { PREP_LEVELS, type PrepLevel } from "./taxonomy";

export type Resource = { type: "dataset" | "paper" | "tutorial" | "repo" | "solution" | "other"; title: string; url: string; note?: string };

export type Problem = {
  slug: string;
  year: number;
  sponsor: string;
  sponsorSlug: string;
  sourceName: string;
  track: string | null;
  prepLevel: PrepLevel;
  domains: string[];
  rawDomains: string[];
  summary: string | null;
  pdfUrl: string | null;
  status: "complete" | "incomplete";
  notes?: string;
  resources: Resource[];
};

export type Edition = { year: number; number: string; host: string; theme: string };

type Enrichment = Record<string, { notes?: string; pdfUrl?: string; summary?: string; resources?: Resource[] }>;
const enrichment = enrichmentJson as Enrichment;

const prepRank = (p: PrepLevel) => PREP_LEVELS.indexOf(p);

export const problems: Problem[] = (problemsJson as Omit<Problem, "resources">[])
  .map((p) => {
    const extra = enrichment[p.slug] ?? {};
    const summary = extra.summary ?? p.summary;
    return {
      ...p,
      summary,
      pdfUrl: extra.pdfUrl ?? p.pdfUrl,
      status: summary ? "complete" : "incomplete",
      notes: extra.notes,
      resources: extra.resources ?? [],
    } as Problem;
  })
  .sort((a, b) => b.year - a.year || prepRank(a.prepLevel) - prepRank(b.prepLevel) || a.sponsor.localeCompare(b.sponsor));

export const editions: Edition[] = editionsJson as Edition[];

export const getProblem = (slug: string) => problems.find((p) => p.slug === slug);
export const getEdition = (year: number) => editions.find((e) => e.year === year);
export const problemsByYear = (year: number) => problems.filter((p) => p.year === year);
export const problemsByDomain = (domain: string) => problems.filter((p) => p.domains.includes(domain));
export const problemsBySponsor = (sponsorSlug: string) => problems.filter((p) => p.sponsorSlug === sponsorSlug);

export const displayName = (p: Problem) => (p.track ? `${p.sponsor} (${p.track})` : p.sponsor);

export const firstSentence = (text: string | null, max = 180) => {
  if (!text) return null;
  const s = text.match(/^.*?[.!?](\s|$)/)?.[0]?.trim() ?? text;
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
};

export type SponsorSummary = { name: string; slug: string; years: number[]; count: number };

export const sponsors: SponsorSummary[] = (() => {
  const map = new Map<string, SponsorSummary>();
  for (const p of problems) {
    const s = map.get(p.sponsorSlug) ?? { name: p.sponsor, slug: p.sponsorSlug, years: [], count: 0 };
    s.count += 1;
    if (!s.years.includes(p.year)) s.years.push(p.year);
    map.set(p.sponsorSlug, s);
  }
  return [...map.values()]
    .map((s) => ({ ...s, years: s.years.sort((a, b) => a - b) }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

export const getSponsor = (slug: string) => sponsors.find((s) => s.slug === slug);

/** Competitive sponsors that set problems in more than one edition. */
export const recurringSponsors = () =>
  sponsors
    .filter((s) => s.years.length > 1 && problemsBySponsor(s.slug).some((p) => p.prepLevel !== "NON_COMPETITIVE"))
    .sort((a, b) => b.years.length - a.years.length || Math.max(...b.years) - Math.max(...a.years) || a.name.localeCompare(b.name));

export const domainCounts = () => {
  const counts: Record<string, number> = {};
  for (const p of problems) for (const d of p.domains) counts[d] = (counts[d] ?? 0) + 1;
  return counts;
};

/** Problems sharing the most domain buckets with `p`, excluding same-sponsor entries. */
export const similarProblems = (p: Problem, limit = 5) =>
  problems
    .filter((o) => o.slug !== p.slug && o.sponsorSlug !== p.sponsorSlug && o.status === "complete")
    .map((o) => ({ o, overlap: o.domains.filter((d) => p.domains.includes(d)).length }))
    .filter((x) => x.overlap >= Math.min(2, p.domains.length) && x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.o.year - a.o.year)
    .slice(0, limit)
    .map((x) => x.o);

export const yearRange = () => {
  const ys = editions.map((e) => e.year);
  return { min: Math.min(...ys), max: Math.max(...ys) };
};

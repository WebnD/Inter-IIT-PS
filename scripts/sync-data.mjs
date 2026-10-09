// Pulls the criticic/InterIIT-TechMeet-Problem-Statements README,
// parses it, normalizes it and writes data/problems.json + data/editions.json.
//
// Usage:
//   npm run sync                      fetch the latest README from GitHub
//   npm run sync -- ./README.md       parse a local copy instead
//
// Fields you add by hand (resources, solutions, notes) live in data/enrichment.json
// and are merged in by slug, so re-syncing never wipes them.
import { readFile, writeFile } from "node:fs/promises";
import { DOMAIN_RULES, SPONSOR_ALIASES, TRACKS, NON_COMPETITIVE } from "./taxonomy.mjs";

const RAW_URL = "https://raw.githubusercontent.com/criticic/InterIIT-TechMeet-Problem-Statements/master/README.md";
const PAGES_BASE = "https://criticic.github.io/InterIIT-TechMeet-Problem-Statements/";

const PREP_MAP = { HIGH: "HIGH", MID: "MID", LOW: "LOW", NONE: "NO_PREP", "NO PREP": "NO_PREP", NA: "NON_COMPETITIVE" };
const PREP_SHORT = { HIGH: "high", MID: "mid", LOW: "low", NO_PREP: "noprep", NON_COMPETITIVE: "nc" };

const isNA = (v) => !v || v.trim().toUpperCase() === "NA";
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const clean = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').trim();
const slugify = (s) => s.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function canonicalSponsor(raw) {
  const name = clean(raw);
  return SPONSOR_ALIASES[key(name)] ?? name;
}

function mapDomains(rawTags, unmapped) {
  const buckets = new Set();
  for (const tag of rawTags) {
    const t = tag.toLowerCase();
    let hit = false;
    if (t === "ai") { buckets.add("ai-ml"); hit = true; }
    for (const [bucket, needles] of Object.entries(DOMAIN_RULES)) {
      if (needles.some((n) => t.includes(n))) { buckets.add(bucket); hit = true; }
    }
    if (!hit) unmapped.add(tag);
  }
  return [...buckets];
}

function toPagesUrl(href) {
  // Source links are relative ("InterIIT_Tech_Meet_PDFs/x.pdf") or GitHub blob URLs.
  const rel = href.replace(/^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\//, "");
  return new URL(rel, PAGES_BASE).href;
}

function parse(md) {
  const editions = [];
  const problems = [];
  const unmapped = new Set();
  let edition = null;
  let prepRaw = null;
  let current = null;

  const flush = () => {
    if (!current) return;
    const sourceName = clean(current.name);
    const sponsor = canonicalSponsor(sourceName);
    let prepLevel = PREP_MAP[(current.prep ?? prepRaw ?? "NA").trim().toUpperCase()] ?? "NON_COMPETITIVE";
    if (NON_COMPETITIVE.has(sponsor)) prepLevel = "NON_COMPETITIVE";
    const rawDomains = isNA(current.domain) ? [] : current.domain.split(",").map(clean).filter(Boolean);
    const pdfMatch = current.pdf?.match(/\]\(([^)]+)\)/);
    const summary = isNA(current.summary) ? null : clean(current.summary);
    problems.push({
      slug: "",
      year: edition.year,
      sponsor,
      sponsorSlug: slugify(sponsor),
      sourceName,
      track: TRACKS[sourceName.toLowerCase()] ?? null,
      prepLevel,
      domains: mapDomains(rawDomains, unmapped),
      rawDomains,
      summary,
      pdfUrl: pdfMatch ? toPagesUrl(pdfMatch[1]) : null,
      status: summary ? "complete" : "incomplete",
    });
    current = null;
  };

  for (const line of md.split("\n")) {
    const yearM = line.match(/^#{2,3}\s+(\d{4})\s+\(([\d.]+)\)\s+-\s+(.+?)\s+-\s+(.+)$/);
    if (yearM) {
      flush();
      edition = { year: Number(yearM[1]), number: yearM[2], host: clean(yearM[3]), theme: clean(yearM[4]) };
      editions.push(edition);
      prepRaw = null;
      continue;
    }
    if (!edition) continue;
    const prepM = line.match(/^#{3,4}\s+Prep Level:\s*(.+)$/i);
    if (prepM) { flush(); prepRaw = prepM[1]; continue; }
    const psM = line.match(/^#{4,5}\s+(.+)$/);
    if (psM) { flush(); current = { name: psM[1] }; continue; }
    const fieldM = line.match(/^-\s+\*\*(Prep Level|Summary|Domain|PDF):\*\*\s*(.*)$/);
    if (fieldM && current) {
      const field = { "Prep Level": "prep", Summary: "summary", Domain: "domain", PDF: "pdf" }[fieldM[1]];
      current[field] = fieldM[2];
    }
  }
  flush();

  // Stable unique slugs: year-prep-sponsor(-track)
  const seen = new Map();
  for (const p of problems) {
    const base = [p.year, PREP_SHORT[p.prepLevel], p.sponsorSlug, p.track && slugify(p.track)].filter(Boolean).join("-");
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    p.slug = n === 1 ? base : `${base}-${n}`;
  }
  return { editions, problems, unmapped };
}

const localPath = process.argv[2];
let md;
if (localPath) {
  md = await readFile(localPath, "utf8");
} else {
  const res = await fetch(RAW_URL);
  if (!res.ok) throw new Error(`Fetching README failed: ${res.status} ${res.statusText}`);
  md = await res.text();
}

const { editions, problems, unmapped } = parse(md);
if (!problems.length) throw new Error("Parsed 0 problem statements — the source README format has probably changed.");

editions.sort((a, b) => b.year - a.year);
await writeFile(new URL("../data/editions.json", import.meta.url), JSON.stringify(editions, null, 2) + "\n");
await writeFile(new URL("../data/problems.json", import.meta.url), JSON.stringify(problems, null, 2) + "\n");

const noDomain = problems.filter((p) => p.status === "complete" && p.domains.length === 0);
console.log(`Editions: ${editions.length}`);
console.log(`Problems: ${problems.length} (${problems.filter((p) => p.pdfUrl).length} with PDF, ${problems.filter((p) => p.status === "incomplete").length} incomplete)`);
if (unmapped.size) console.log(`\nUnmapped raw tags (add to scripts/taxonomy.mjs if useful):\n  ${[...unmapped].sort().join("\n  ")}`);
if (noDomain.length) console.log(`\nComplete entries with no domain bucket: ${noDomain.map((p) => p.slug).join(", ")}`);

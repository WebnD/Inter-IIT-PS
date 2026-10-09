// Downloads every PS PDF into public/pdfs/<slug>.pdf so the portal serves them itself.
// Writes data/pdf-manifest.json, which the app reads to know which PDFs are local.
//
// Usage:
//   npm run pdfs              download only the PDFs that are missing
//   npm run pdfs -- --force   re-download everything
//
// Run `npm run sync` first so data/problems.json is current.
import { mkdir, readFile, writeFile, stat, readdir, unlink } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const PDF_DIR = new URL("public/pdfs/", ROOT);
const MANIFEST = new URL("data/pdf-manifest.json", ROOT);
const PAGES_BASE = "https://criticic.github.io/InterIIT-TechMeet-Problem-Statements/";
const RAW_BASE = "https://raw.githubusercontent.com/criticic/InterIIT-TechMeet-Problem-Statements/master/";
const CONCURRENCY = 4;
const TIMEOUT_MS = 120_000; // per file
const force = process.argv.includes("--force");

const problems = JSON.parse(await readFile(new URL("data/problems.json", ROOT), "utf8"));
const enrichment = JSON.parse(await readFile(new URL("data/enrichment.json", ROOT), "utf8").catch(() => "{}"));
await mkdir(PDF_DIR, { recursive: true });

// Source URL per slug; an http(s) pdfUrl in enrichment.json wins over the archive.
const jobs = problems
  .map((p) => {
    const override = enrichment[p.slug]?.pdfUrl;
    const source = override && /^https?:\/\//.test(override) ? override : p.pdfUrl;
    if (!source) return null;
    // Raw GitHub is more reliable for scripted downloads than GitHub Pages.
    // Some Indian ISPs block raw.githubusercontent.com, so GitHub Pages is tried second.
    const urls = source.startsWith(PAGES_BASE) ? [RAW_BASE + source.slice(PAGES_BASE.length), source] : [source];
    return { slug: p.slug, urls, file: new URL(`${p.slug}.pdf`, PDF_DIR) };
  })
  .filter(Boolean);

const exists = (f) => stat(f).then((s) => s.size > 0, () => false);
const manifest = {};
const failed = [];
let downloaded = 0;
let skipped = 0;

async function download(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 5).toString() !== "%PDF-") throw new Error("response is not a PDF");
  return buf;
}

let done = 0;
async function run(job) {
  if (!force && (await exists(job.file))) {
    skipped++;
    done++;
    return;
  }
  let lastError;
  for (const url of job.urls) {
    try {
      const buf = await download(url);
      await writeFile(job.file, buf);
      downloaded++;
      done++;
      console.log(`  [${done}/${jobs.length}] ${job.slug}.pdf  ${(buf.length / 1048576).toFixed(1)} MB  (${new URL(url).host})`);
      return;
    } catch (err) {
      lastError = err.name === "TimeoutError" ? new Error(`timed out after ${TIMEOUT_MS / 1000}s`) : err;
      console.log(`  ${job.slug}.pdf: ${new URL(url).host} failed (${lastError.message})${url !== job.urls.at(-1) ? ", trying next source" : ""}`);
    }
  }
  done++;
  throw lastError;
}

console.log(`Checking ${jobs.length} PDFs in public/pdfs (about 146 MB if none are there yet).`);
console.log("Each line appears when a file finishes, so the first one can take a minute on slow connections.\n");

const queue = [...jobs];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const job = queue.shift();
      try {
        await run(job);
      } catch (err) {
        failed.push(`${job.slug}: ${err.cause?.code ?? err.message}`);
      }
    }
  }),
);

// Manifest = whatever is actually on disk for a current slug.
let totalBytes = 0;
for (const job of jobs) {
  const s = await stat(job.file).catch(() => null);
  if (s?.size) {
    manifest[job.slug] = { path: `/pdfs/${job.slug}.pdf`, bytes: s.size };
    totalBytes += s.size;
  }
}

// Remove PDFs whose slug no longer exists (e.g. after a rename in the source).
const valid = new Set(jobs.map((j) => `${j.slug}.pdf`));
for (const name of await readdir(PDF_DIR)) {
  if (name.endsWith(".pdf") && !valid.has(name)) {
    await unlink(new URL(name, PDF_DIR));
    console.log(`  removed stale ${name}`);
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nDownloaded ${downloaded}, already had ${skipped}, failed ${failed.length}.`);
console.log(`${Object.keys(manifest).length} PDFs on disk, ${(totalBytes / 1048576).toFixed(1)} MB total.`);
if (failed.length) {
  console.log(`\nFailed (the app falls back to the source link for these):\n  ${failed.join("\n  ")}`);
  process.exitCode = 1;
}

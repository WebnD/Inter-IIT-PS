import Link from "next/link";
import { notFound } from "next/navigation";
import { problems, getProblem, getEdition, problemsBySponsor, similarProblems, displayName, hasPdf, formatBytes } from "@/lib/data";
import { PrepBadge } from "@/components/PrepBadge";
import { DomainLinks } from "@/components/DomainLinks";
import { ProblemList } from "@/components/ProblemList";
import { PREP_META } from "@/lib/taxonomy";

export const dynamicParams = false;
export const generateStaticParams = () => problems.map((p) => ({ slug: p.slug }));

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProblem(params.slug);
  return p ? { title: `${displayName(p)} ${p.year}` } : {};
}

const RESOURCE_LABEL = { dataset: "Dataset", paper: "Paper", tutorial: "Tutorial", repo: "Repo", solution: "Past solution", other: "Link" } as const;

export default function ProblemPage({ params }: { params: { slug: string } }) {
  const p = getProblem(params.slug);
  if (!p) notFound();
  const edition = getEdition(p.year);
  const otherYears = problemsBySponsor(p.sponsorSlug).filter((o) => o.slug !== p.slug);
  const similar = similarProblems(p);

  return (
    <article className="space-y-14">
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href={`/years/${p.year}`} className="hover:underline underline-offset-4">
            {p.year}
            {edition ? `, Tech Meet ${edition.number} at ${edition.host}` : ""}
          </Link>
          <span aria-hidden> / </span>
          <Link href={`/explore?prep=${PREP_META[p.prepLevel].param}`} className="hover:underline underline-offset-4">
            {PREP_META[p.prepLevel].label}
          </Link>
        </nav>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{displayName(p)}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <PrepBadge level={p.prepLevel} className="text-sm" />
          <Link href={`/sponsors/${p.sponsorSlug}`} className="text-sm underline underline-offset-4">
            All {p.sponsor} problems
          </Link>
        </div>
      </header>

      <section aria-labelledby="summary-title" className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div>
          <h2 id="summary-title" className="sr-only">Summary</h2>
          {p.summary ? (
            <p className="max-w-[68ch] text-lg leading-relaxed">{p.summary}</p>
          ) : (
            <div className="max-w-[68ch] rounded-lg border border-dashed border-rule p-6">
              <p className="font-medium">The source archive has no details for this problem.</p>
              <p className="mt-1 text-muted">
                If someone in the contingent has the PDF or a write-up, add it under this slug ({p.slug}) in data/enrichment.json.
              </p>
            </div>
          )}
          {p.notes && (
            <div className="mt-8 max-w-[68ch] border-l-4 border-ink pl-4">
              <h3 className="text-sm font-semibold">Contingent notes</h3>
              <p className="mt-1 whitespace-pre-line">{p.notes}</p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {hasPdf(p) ? (
            <div className="space-y-2">
              <Link
                href={`/ps/${p.slug}/pdf`}
                className="block rounded-md bg-ink px-4 py-3 text-center font-medium text-paper hover:bg-ink/90"
              >
                Read the PS PDF
              </Link>
              {p.pdfLocal ? (
                <a href={p.pdfLocal.path} download={`${p.slug}.pdf`} className="block text-center text-sm underline underline-offset-4">
                  Download{formatBytes(p.pdfLocal.bytes) ? ` (${formatBytes(p.pdfLocal.bytes)})` : ""}
                </a>
              ) : (
                <p className="text-center text-xs text-muted">Loads from the source archive until the PDFs are synced.</p>
              )}
            </div>
          ) : (
            <p className="rounded-md border border-rule bg-surface px-4 py-3 text-sm text-muted">No PDF in the source archive.</p>
          )}
          {p.domains.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold">Domains</h2>
              <div className="mt-2">
                <DomainLinks domains={p.domains} />
              </div>
            </div>
          )}
          {p.rawDomains.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold">Original tags</h2>
              <p className="mt-1 text-sm text-muted">{p.rawDomains.join(", ")}</p>
            </div>
          )}
        </aside>
      </section>

      {p.resources.length > 0 && (
        <section aria-labelledby="resources-title">
          <h2 id="resources-title" className="font-display text-2xl font-bold tracking-tight">Resources</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {p.resources.map((r) => (
              <li key={r.url} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                <span className="w-28 shrink-0 text-sm text-muted">{RESOURCE_LABEL[r.type] ?? "Link"}</span>
                <a href={r.url} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
                  {r.title}
                </a>
                {r.note && <span className="text-sm text-muted">{r.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {otherYears.length > 0 && (
        <section aria-labelledby="sponsor-title">
          <h2 id="sponsor-title" className="font-display text-2xl font-bold tracking-tight">{p.sponsor} in other editions</h2>
          <p className="mt-1 text-muted">Useful for spotting what this sponsor tends to ask for.</p>
          <div className="mt-5">
            <ProblemList items={otherYears} />
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section aria-labelledby="similar-title">
          <h2 id="similar-title" className="font-display text-2xl font-bold tracking-tight">Similar problems from other sponsors</h2>
          <p className="mt-1 text-muted">Ranked by how many domains they share with this one.</p>
          <div className="mt-5">
            <ProblemList items={similar} />
          </div>
        </section>
      )}
    </article>
  );
}

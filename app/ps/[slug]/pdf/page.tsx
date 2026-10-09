import Link from "next/link";
import { notFound } from "next/navigation";
import { problems, getProblem, displayName, hasPdf, pdfSrc, formatBytes } from "@/lib/data";
import { PrepBadge } from "@/components/PrepBadge";
import { PdfReader } from "@/components/PdfReader";

export const dynamicParams = false;
export const generateStaticParams = () => problems.filter(hasPdf).map((p) => ({ slug: p.slug }));

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProblem(params.slug);
  return p ? { title: `${displayName(p)} ${p.year} PDF` } : {};
}

export default function PdfViewerPage({ params }: { params: { slug: string } }) {
  const p = getProblem(params.slug);
  if (!p || !hasPdf(p)) notFound();
  const src = pdfSrc(p)!;
  const local = Boolean(p.pdfLocal);
  const size = formatBytes(p.pdfLocal?.bytes);

  return (
    <div className="-mt-4 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <Link href={`/ps/${p.slug}`} className="text-sm text-muted underline-offset-4 hover:underline">
            Back to the PS overview
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
            {displayName(p)} {p.year}
          </h1>
          <PrepBadge level={p.prepLevel} />
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-medium">
          <a href={src} target="_blank" rel="noreferrer" className="rounded-md border border-rule bg-surface px-3 py-2 hover:border-ink">
            Open in a new tab
          </a>
          {local && (
            <a href={src} download={`${p.slug}.pdf`} className="rounded-md bg-ink px-3 py-2 text-paper hover:bg-ink/90">
              Download{size ? ` (${size})` : ""}
            </a>
          )}
        </div>
      </div>

      {!local && (
        <p className="rounded-md border border-prep-mid/40 bg-surface px-4 py-2 text-sm">
          This PDF is loading from the source archive because it hasn&apos;t been copied to the portal yet. Run{" "}
          <code className="rounded bg-paper px-1">npm run pdfs</code> and redeploy to serve it from here.
        </p>
      )}

      <PdfReader src={src} title={`${displayName(p)} ${p.year}`} downloadName={`${p.slug}.pdf`} />
    </div>
  );
}

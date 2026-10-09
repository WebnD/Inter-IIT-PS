import Link from "next/link";
import { notFound } from "next/navigation";
import { DOMAINS } from "@/lib/taxonomy";
import { editions, problemsByDomain } from "@/lib/data";
import { ProblemList } from "@/components/ProblemList";

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(DOMAINS).filter((d) => problemsByDomain(d).length).map((slug) => ({ slug }));

export function generateMetadata({ params }: { params: { slug: string } }) {
  return DOMAINS[params.slug] ? { title: DOMAINS[params.slug] } : {};
}

export default function DomainPage({ params }: { params: { slug: string } }) {
  const label = DOMAINS[params.slug];
  const items = problemsByDomain(params.slug);
  if (!label || !items.length) notFound();

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm text-muted">Domain</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">{label}</h1>
        <p className="mt-3 text-muted">{items.length} problem statements across the archive.</p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {editions.map((e) => {
            const n = items.filter((p) => p.year === e.year).length;
            return (
              <div key={e.year}>
                <dt className="text-sm text-muted tabular-nums">{e.year}</dt>
                <dd className={`font-display text-2xl font-bold tabular-nums ${n ? "" : "text-rule"}`}>{n}</dd>
              </div>
            );
          })}
        </dl>
        <Link href={`/explore?domain=${params.slug}`} className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
          Filter this domain further
        </Link>
      </header>
      <ProblemList items={items} />
    </div>
  );
}

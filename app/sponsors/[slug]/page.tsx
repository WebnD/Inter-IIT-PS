import { notFound } from "next/navigation";
import { sponsors, getSponsor, problemsBySponsor } from "@/lib/data";
import { ProblemList } from "@/components/ProblemList";

export const dynamicParams = false;
export const generateStaticParams = () => sponsors.map((s) => ({ slug: s.slug }));

export function generateMetadata({ params }: { params: { slug: string } }) {
  const s = getSponsor(params.slug);
  return s ? { title: s.name } : {};
}

export default function SponsorPage({ params }: { params: { slug: string } }) {
  const s = getSponsor(params.slug);
  if (!s) notFound();
  const items = problemsBySponsor(s.slug);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm text-muted">Sponsor</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">{s.name}</h1>
        <p className="mt-3 max-w-[62ch] text-muted">
          {items.length === 1
            ? `One problem statement, in ${s.years[0]}.`
            : `${items.length} problem statements across ${s.years.length} ${s.years.length === 1 ? "edition" : "editions"} (${s.years.join(", ")}). Read them oldest to newest to see how the asks have shifted.`}
        </p>
      </header>
      <ProblemList items={[...items].sort((a, b) => a.year - b.year)} full />
    </div>
  );
}

import { Suspense } from "react";
import { problems, editions, sponsors, domainCounts } from "@/lib/data";
import { ExploreClient } from "./ExploreClient";

export const metadata = { title: "Browse all" };

export default function ExplorePage() {
  const counts = domainCounts();
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Browse all problem statements</h1>
      <p className="mt-3 max-w-[62ch] text-muted">Filter by year, prep level, domain or sponsor. The link updates as you filter, so you can share a view with your team.</p>
      <Suspense fallback={<p className="mt-10 text-muted">Loading filters…</p>}>
        <ExploreClient
          problems={problems}
          years={editions.map((e) => e.year)}
          sponsors={sponsors.map((s) => ({ slug: s.slug, name: s.name }))}
          domainCounts={counts}
        />
      </Suspense>
    </div>
  );
}

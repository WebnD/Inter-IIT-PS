import Link from "next/link";
import { domainLabel } from "@/lib/taxonomy";

export function DomainLinks({ domains, small = false }: { domains: string[]; small?: boolean }) {
  if (!domains.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${small ? "text-xs" : "text-sm"}`}>
      {domains.map((d) => (
        <li key={d}>
          <Link
            href={`/domains/${d}`}
            className="inline-block rounded border border-rule bg-surface px-2 py-0.5 text-muted hover:border-ink hover:text-ink"
          >
            {domainLabel(d)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

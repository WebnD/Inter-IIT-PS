import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">This page isn&apos;t in the archive</h1>
      <p className="mt-3 text-muted">The link may be from an older version of the portal, or the problem statement was renamed after a data sync.</p>
      <Link href="/explore" className="mt-6 inline-block rounded-md bg-ink px-4 py-2 font-medium text-paper">
        Browse all problem statements
      </Link>
    </div>
  );
}

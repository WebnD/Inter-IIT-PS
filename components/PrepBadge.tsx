import { PREP_META, type PrepLevel } from "@/lib/taxonomy";

export function PrepBadge({ level, className = "" }: { level: PrepLevel; className?: string }) {
  const m = PREP_META[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${m.text} ${className}`}>
      <span aria-hidden className={`h-2 w-2 rounded-full ${m.bg}`} />
      {m.label}
    </span>
  );
}

import { login } from "./actions";
import { safeNext } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const next = safeNext(searchParams.next);
  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="font-display text-3xl font-bold tracking-tight [font-stretch:115%]">Contingent access</h1>
      <p className="mt-3 text-muted">Enter the password your tech secretary shared with the contingent.</p>
      <form action={login} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            aria-invalid={searchParams.error ? true : undefined}
            aria-describedby={searchParams.error ? "login-error" : undefined}
            className="mt-1 w-full rounded-md border border-rule bg-surface px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ink"
          />
        </label>
        {searchParams.error && (
          <p id="login-error" className="text-sm text-prep-high">
            That password is wrong. Check with your tech secretary for the current one.
          </p>
        )}
        <button type="submit" className="w-full rounded-md bg-ink px-4 py-2 font-medium text-paper hover:bg-ink/90">
          Sign in
        </button>
      </form>
    </div>
  );
}

export const SESSION_COOKIE = "ps_portal_session";

/** Token stored in the cookie: a salted SHA-256 of the shared password. Works in Edge and Node. */
export async function sessionToken(password: string) {
  const bytes = new TextEncoder().encode(`interiit-ps-portal:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Only allow same-site relative redirects after login. */
export const safeNext = (next: string | null | undefined) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";

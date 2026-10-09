"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, safeNext, sessionToken } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = process.env.PORTAL_PASSWORD;
  const next = safeNext(formData.get("next")?.toString());
  if (!password) redirect(next);

  const attempt = formData.get("password")?.toString() ?? "";
  if (attempt !== password) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  cookies().set(SESSION_COOKIE, await sessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next);
}

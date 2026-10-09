import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const password = process.env.PORTAL_PASSWORD;
  if (!password) return NextResponse.next(); // gate disabled

  const { pathname, search } = req.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token && token === (await sessionToken(password))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};

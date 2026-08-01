import { NextResponse, type NextRequest } from "next/server";

export const COOKIE_NAME = "cosfy_uid";

export function middleware(request: NextRequest) {
  const existing = request.cookies.get(COOKIE_NAME)?.value;
  if (existing) {
    return NextResponse.next();
  }

  const uid = crypto.randomUUID();

  // Forward the new cookie on the current request's headers too, so server
  // components rendered during this same request already see it via cookies().
  const requestHeaders = new Headers(request.headers);
  const existingCookieHeader = requestHeaders.get("cookie") ?? "";
  requestHeaders.set(
    "cookie",
    existingCookieHeader ? `${existingCookieHeader}; ${COOKIE_NAME}=${uid}` : `${COOKIE_NAME}=${uid}`
  );

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(COOKIE_NAME, uid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

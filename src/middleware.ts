import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, signSessionUid, verifySessionCookie, sessionCookieOptions } from "@/lib/session-cookie";

export { COOKIE_NAME };

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const proto = request.headers.get("x-forwarded-proto");
    if (proto && proto !== "https") {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      return NextResponse.redirect(url, 308);
    }
  }

  const existing = request.cookies.get(COOKIE_NAME)?.value;
  const verifiedUid = await verifySessionCookie(existing);
  if (verifiedUid) {
    return NextResponse.next();
  }

  const uid = crypto.randomUUID();
  const cookieValue = await signSessionUid(uid);

  // Forward the new cookie on the current request's headers too, so server
  // components rendered during this same request already see it via cookies().
  // Strip any stale/tampered cosfy_uid first so the forwarded header doesn't
  // carry two values for the same cookie name.
  const requestHeaders = new Headers(request.headers);
  const existingCookieHeader = requestHeaders.get("cookie") ?? "";
  const otherCookies = existingCookieHeader
    .split("; ")
    .filter((c) => c && !c.startsWith(`${COOKIE_NAME}=`));
  requestHeaders.set("cookie", [...otherCookies, `${COOKIE_NAME}=${cookieValue}`].join("; "));

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(COOKIE_NAME, cookieValue, sessionCookieOptions());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { buildGmailAuthUrl, signState } from "@/lib/gmail";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    return NextResponse.redirect(`${origin}/profile?gmail=not-configured`);
  }

  const user = await getCurrentUser();
  const redirectUri = `${new URL(req.url).origin}/api/gmail/callback`;
  const state = signState(user.id);

  return NextResponse.redirect(buildGmailAuthUrl(redirectUri, state));
}

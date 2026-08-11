import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exchangeCodeForTokens, fetchGoogleEmail, verifyState } from "@/lib/gmail";
import { encryptToken } from "@/lib/token-crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const redirectHome = (status: "connected" | "error") =>
    NextResponse.redirect(`${url.origin}/profile?gmail=${status}`);

  if (oauthError || !code || !state) {
    return redirectHome("error");
  }

  const verified = verifyState(state);
  if (!verified) {
    return redirectHome("error");
  }

  try {
    const redirectUri = `${url.origin}/api/gmail/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    if (!tokens.refresh_token) {
      return redirectHome("error");
    }

    const email = await fetchGoogleEmail(tokens.access_token);

    await db.user.update({
      where: { id: verified.userId },
      data: {
        gmailConnected: true,
        gmailEmail: email,
        gmailRefreshTokenEnc: encryptToken(tokens.refresh_token),
        gmailLastSyncAt: null,
      },
    });

    return redirectHome("connected");
  } catch {
    return redirectHome("error");
  }
}

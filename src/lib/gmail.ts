import { createHmac, timingSafeEqual } from "node:crypto";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

const STATE_TTL_MS = 10 * 60 * 1000;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}, set it on the server.`);
  return value;
}

function stateSecret(): string {
  return process.env.TOKEN_ENCRYPTION_KEY ?? requireEnv("GOOGLE_OAUTH_CLIENT_SECRET");
}

export function signState(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyState(state: string): { userId: string } | null {
  const [payloadB64, sig] = state.split(".");
  if (!payloadB64 || !sig) return null;
  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedSig = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;

  const [userId, tsRaw] = payload.split(".");
  const ts = Number(tsRaw);
  if (!userId || !ts || Date.now() - ts > STATE_TTL_MS) return null;
  return { userId };
}

export function buildGmailAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${(await res.text()).slice(0, 200)}`);
  const data: TokenResponse = await res.json();
  return data.access_token;
}

export async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.email ?? null;
}

const TRANSACTION_QUERY =
  '(debited OR credited OR "amount spent" OR "transaction alert" OR UPI OR "a/c" OR "acct" OR withdrawn OR "payment of") -category:promotions -category:social -category:forums';

export type GmailMessageRef = { id: string };

export async function listTransactionMessages(accessToken: string, afterUnixSeconds: number): Promise<GmailMessageRef[]> {
  const query = `${TRANSACTION_QUERY} after:${afterUnixSeconds}`;
  const params = new URLSearchParams({ q: query, maxResults: "25" });
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail message list failed: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.messages ?? [];
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf8");
}

function extractPlainText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const p = payload as {
    mimeType?: string;
    body?: { data?: string };
    parts?: unknown[];
  };

  if (p.mimeType === "text/plain" && p.body?.data) {
    return decodeBase64Url(p.body.data);
  }
  if (Array.isArray(p.parts)) {
    for (const part of p.parts) {
      const text = extractPlainText(part);
      if (text) return text;
    }
  }
  if (p.body?.data) {
    return decodeBase64Url(p.body.data).replace(/<[^>]+>/g, " ");
  }
  return "";
}

export async function getMessageText(accessToken: string, messageId: string): Promise<string> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Gmail message fetch failed: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = extractPlainText(data.payload);
  return text || data.snippet || "";
}

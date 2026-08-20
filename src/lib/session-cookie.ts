// Session cookie signing (HMAC-SHA256 via Web Crypto — works in both the Edge
// middleware runtime and Node.js API/server-component runtime, so this is the
// one place both sides share instead of drifting).

export const COOKIE_NAME = "cosfy_uid";
const SIG_HEX_LENGTH = 64; // SHA-256 -> 32 bytes -> 64 hex chars

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET, set it on the server.");
  }
  return secret;
}

function hexToBytes(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return buf;
}

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Cookie value shape: "<uid>.<hmac-hex>" — the uid is a UUID (no dots), so
// splitting on the last dot unambiguously separates the two.
export async function signSessionUid(uid: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(uid));
  return `${uid}.${bytesToHex(sig)}`;
}

export async function verifySessionCookie(value: string | undefined | null): Promise<string | null> {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;
  const uid = value.slice(0, dot);
  const sigHex = value.slice(dot + 1);
  if (sigHex.length !== SIG_HEX_LENGTH) return null;

  const key = await getKey();
  const valid = await crypto.subtle
    .verify("HMAC", key, hexToBytes(sigHex), new TextEncoder().encode(uid))
    .catch(() => false);
  return valid ? uid : null;
}

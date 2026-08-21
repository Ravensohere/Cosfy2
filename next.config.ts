import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Origins the browser itself talks to directly (Firebase Auth popup/SDK).
// Server-side fetches (Gemini, AlphaVantage, Gmail API, etc.) aren't subject
// to CSP, so they don't need to be listed here.
const GOOGLE_AUTH_ORIGINS = "https://apis.google.com https://accounts.google.com https://*.googleapis.com";
// Phone sign-in's invisible reCAPTCHA loads its script/frames from these —
// required per Firebase's own CSP guidance for Firebase Auth phone/reCAPTCHA.
const RECAPTCHA_ORIGINS = "https://www.google.com https://www.gstatic.com https://www.recaptcha.net";
const FIREBASE_FRAME_ORIGINS = "https://*.firebaseapp.com https://accounts.google.com https://www.google.com https://www.recaptcha.net";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${GOOGLE_AUTH_ORIGINS} ${RECAPTCHA_ORIGINS}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${GOOGLE_AUTH_ORIGINS} ${RECAPTCHA_ORIGINS}`,
  `frame-src 'self' ${FIREBASE_FRAME_ORIGINS}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=(), payment=()" },
  // CSP/HSTS only in production: Next's dev server (HMR/Turbopack) relies on
  // patterns a strict CSP would block, and HSTS is meaningless without TLS.
  ...(isProd
    ? [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // firebase-admin's dependency chain (jwks-rsa -> jose) mixes CJS/ESM in a way
  // that breaks when Turbopack tries to bundle it for the serverless function
  // (ERR_REQUIRE_ESM). Leave it unbundled so Node resolves it natively at runtime.
  serverExternalPackages: ["firebase-admin", "pdf-parse"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;

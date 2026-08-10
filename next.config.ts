import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin's dependency chain (jwks-rsa -> jose) mixes CJS/ESM in a way
  // that breaks when Turbopack tries to bundle it for the serverless function
  // (ERR_REQUIRE_ESM). Leave it unbundled so Node resolves it natively at runtime.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;

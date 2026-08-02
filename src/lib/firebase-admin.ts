import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let app: App | undefined;

function getAdminApp(): App | null {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) return null;

  if (!app) {
    const existing = getApps()[0];
    if (existing) {
      app = existing;
    } else {
      const serviceAccount = JSON.parse(rawKey);
      app = initializeApp({ credential: cert(serviceAccount) });
    }
  }
  return app;
}

export function getAdminAuth(): Auth | null {
  const adminApp = getAdminApp();
  return adminApp ? getAuth(adminApp) : null;
}

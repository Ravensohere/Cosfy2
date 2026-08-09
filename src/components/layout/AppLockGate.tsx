import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { UNLOCK_COOKIE_NAME } from "@/lib/app-lock-constants";
import { UnlockScreen } from "@/components/layout/UnlockScreen";

export async function AppLockGate({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user.appLockEnabled || !user.appLockPinHash) {
    return <>{children}</>;
  }

  const cookieStore = await cookies();
  const unlocked = cookieStore.get(UNLOCK_COOKIE_NAME)?.value === "1";

  if (unlocked) {
    return <>{children}</>;
  }

  return <UnlockScreen />;
}

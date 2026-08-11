import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncGmailForUser } from "@/lib/gmail-sync";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    where: { gmailConnected: true },
    select: { id: true },
  });

  let synced = 0;
  let imported = 0;
  for (const { id } of users) {
    const result = await syncGmailForUser(id);
    synced += 1;
    if (result.ok) imported += result.imported;
  }

  return NextResponse.json({ ok: true, usersSynced: synced, transactionsImported: imported });
}

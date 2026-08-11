import { db } from "@/lib/db";
import { parseSms } from "@/lib/sms-parser";
import { decryptToken } from "@/lib/token-crypto";
import { getMessageText, listTransactionMessages, refreshAccessToken } from "@/lib/gmail";

const FIRST_SYNC_LOOKBACK_DAYS = 30;
const OVERLAP_BUFFER_HOURS = 24;

export async function syncGmailForUser(userId: string): Promise<
  { ok: true; imported: number } | { ok: false; error: string; reconnect?: boolean }
> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.gmailConnected || !user.gmailRefreshTokenEnc) {
    return { ok: false, error: "Gmail isn't connected." };
  }

  let accessToken: string;
  try {
    accessToken = await refreshAccessToken(decryptToken(user.gmailRefreshTokenEnc));
  } catch {
    await db.user.update({
      where: { id: userId },
      data: { gmailConnected: false, gmailRefreshTokenEnc: null },
    });
    return { ok: false, error: "Gmail access expired. Reconnect it.", reconnect: true };
  }

  const afterDate = user.gmailLastSyncAt
    ? new Date(user.gmailLastSyncAt.getTime() - OVERLAP_BUFFER_HOURS * 60 * 60 * 1000)
    : new Date(Date.now() - FIRST_SYNC_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const afterUnixSeconds = Math.floor(afterDate.getTime() / 1000);

  const messages = await listTransactionMessages(accessToken, afterUnixSeconds);

  if (messages.length === 0) {
    await db.user.update({ where: { id: userId }, data: { gmailLastSyncAt: new Date() } });
    return { ok: true, imported: 0 };
  }

  const already = await db.gmailImportRecord.findMany({
    where: { userId, messageId: { in: messages.map((m) => m.id) } },
    select: { messageId: true },
  });
  const alreadySeen = new Set(already.map((r) => r.messageId));
  const newMessages = messages.filter((m) => !alreadySeen.has(m.id));

  let imported = 0;
  for (const { id } of newMessages) {
    try {
      const text = await getMessageText(accessToken, id);
      const parsed = parseSms(text);

      if (parsed) {
        const signedAmount = parsed.category === "Income" ? Math.abs(parsed.amount) : -Math.abs(parsed.amount);
        await db.transaction.create({
          data: {
            userId,
            amount: signedAmount,
            description: parsed.merchant,
            category: parsed.category,
            paymentMode: parsed.paymentMode,
            source: "gmail",
          },
        });
        imported += 1;
      }

      await db.gmailImportRecord.create({ data: { userId, messageId: id } });
    } catch {
      // Skip messages that fail to fetch/parse; don't record them so a retry is attempted next sync.
    }
  }

  await db.user.update({ where: { id: userId }, data: { gmailLastSyncAt: new Date() } });
  return { ok: true, imported };
}

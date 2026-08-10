export function inviteLine(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return "";
  return `\n\nSplit & track expenses free, Cosfy: ${url}`;
}

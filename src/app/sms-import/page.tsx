import { redirect } from "next/navigation";

export default async function SmsImportRedirect({
  searchParams,
}: {
  searchParams: Promise<{ text?: string }>;
}) {
  const params = await searchParams;
  redirect(params.text ? `/import?text=${encodeURIComponent(params.text)}` : "/import");
}

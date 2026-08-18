import { Compass } from "lucide-react";
import { DarkButton } from "@/components/ui/DarkButton";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-cosfy-lime flex flex-col items-center justify-center gap-6 px-8 py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-cosfy-ink flex items-center justify-center">
        <Compass size={36} className="text-cosfy-lime" strokeWidth={2.5} />
      </div>
      <div className="space-y-2">
        <h1 className="text-[28px] font-extrabold text-cosfy-ink">Page not found</h1>
        <p className="text-[15px] text-cosfy-lime-ink max-w-[280px]">
          That page doesn&apos;t exist, or may have moved. Let&apos;s get you back on track.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <DarkButton href="/home" className="w-full">
          Back to home
        </DarkButton>
      </div>
    </div>
  );
}

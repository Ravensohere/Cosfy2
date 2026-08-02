import { IndianRupee } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-dvh bg-cosfy-lime flex flex-col items-center justify-center gap-6">
      <div className="w-20 h-20 rounded-3xl bg-cosfy-ink flex items-center justify-center animate-bounce">
        <IndianRupee size={36} className="text-cosfy-lime" strokeWidth={2.5} />
      </div>
      <span className="text-[20px] font-extrabold text-cosfy-lime-ink lowercase tracking-tight">cosfy</span>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cosfy-lime-ink animate-pulse [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-cosfy-lime-ink animate-pulse [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-cosfy-lime-ink animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  );
}

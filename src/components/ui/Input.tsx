import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-input border border-cosfy-border bg-cosfy-card h-[52px] px-4 text-[14px] text-cosfy-ink placeholder:text-cosfy-muted focus:outline-none focus:border-cosfy-lime-deep";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
});

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "h-auto min-h-[90px] py-3", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={cn(fieldBase, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block text-[12px] font-semibold text-cosfy-ink-soft mb-1.5">{children}</label>;
}

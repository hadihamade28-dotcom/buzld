import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function AuthField({
  label,
  className,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className={cn(
          "h-13 w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary",
          className,
        )}
      />
      {hint ? <span className="mt-1.5 block text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function SocialRow() {
  return (
    <div className="mt-8 px-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {["Apple", "Google"].map((p) => (
          <button
            key={p}
            type="button"
            className="rounded-2xl border border-border bg-surface py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

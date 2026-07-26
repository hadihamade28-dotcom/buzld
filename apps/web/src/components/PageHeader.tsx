import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden px-5 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-glow/20 blur-3xl" />
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/80">{eyebrow}</p>
          <h1 className="mt-1.5 font-display text-[1.6rem] font-semibold leading-[1.15] tracking-tight">
            {title}
          </h1>
        </div>
        {action}
      </div>
      {subtitle ? (
        <p className="relative mt-2 max-w-[24rem] text-[13px] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

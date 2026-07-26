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
    <header className="relative px-6 pb-4 pt-[max(1.75rem,env(safe-area-inset-top))]">
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="font-display text-[13px] font-semibold lowercase tracking-[-0.02em] text-ink">
            {eyebrow}
          </p>
          <h1 className="mt-1 font-display text-[1.55rem] font-semibold leading-[1.15] tracking-[-0.03em]">
            {title}
          </h1>
        </div>
        {action}
      </div>
      {subtitle ? (
        <p className="relative mt-1.5 max-w-[24rem] text-[13px] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

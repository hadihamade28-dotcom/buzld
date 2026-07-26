import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  hue: [string, string];
  className?: string;
  /** tailwind text size utility for the initial */
  textClassName?: string;
  ring?: boolean;
};

export function Avatar({ name, hue, className, textClassName, ring }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        ring && "ring-2 ring-background",
        className,
      )}
      style={{ backgroundImage: `linear-gradient(140deg, ${hue[0]}, ${hue[1]})` }}
      aria-hidden="true"
    >
      <span
        className={cn(
          "font-display font-semibold text-primary-foreground/95 drop-shadow-sm",
          textClassName ?? "text-base",
        )}
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
      <span className="pointer-events-none absolute -right-3 -top-4 h-12 w-12 rounded-full bg-primary-foreground/15 blur-md" />
    </div>
  );
}

/** Large "photo card" stand-in: the shape a user's uploaded picture fills. */
export function PhotoPanel({
  name,
  hue,
  caption,
  className,
}: {
  name: string;
  hue: [string, string];
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex items-end overflow-hidden rounded-3xl", className)}
      style={{ backgroundImage: `linear-gradient(150deg, ${hue[0]}, ${hue[1]})` }}
    >
      <span
        className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full opacity-30 blur-2xl"
        style={{ background: "oklch(1 0 0)" }}
      />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,oklch(0.2_0.03_30/55%),transparent_55%)]" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-8xl font-semibold text-primary-foreground/30">
        {name.slice(0, 1).toUpperCase()}
      </span>
      {caption ? (
        <p className="relative z-10 p-4 text-sm font-medium text-primary-foreground/90">{caption}</p>
      ) : null}
    </div>
  );
}

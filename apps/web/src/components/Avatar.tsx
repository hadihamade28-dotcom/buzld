import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  /** Portrait URL. Falls back to initials on a gradient if missing. */
  src?: string;
  hue?: [string, string];
  className?: string;
  /** @deprecated Kept for call-site compatibility; unused when src is set. */
  textClassName?: string;
  ring?: boolean;
};

export function Avatar({ name, src, hue, className, ring }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
        ring && "ring-2 ring-background",
        className,
      )}
      style={
        !src && hue
          ? { backgroundImage: `linear-gradient(140deg, ${hue[0]}, ${hue[1]})` }
          : undefined
      }
      aria-hidden="true"
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <span className="font-display text-base font-semibold text-primary-foreground/95">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

/** Large photo card: the shape a user's uploaded picture fills. */
export function PhotoPanel({
  name,
  src,
  hue,
  caption,
  className,
}: {
  name: string;
  src?: string;
  hue?: [string, string];
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex items-end overflow-hidden rounded-3xl bg-muted", className)}
      style={
        !src && hue
          ? { backgroundImage: `linear-gradient(150deg, ${hue[0]}, ${hue[1]})` }
          : undefined
      }
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-8xl font-semibold text-primary-foreground/30">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
      {caption ? (
        <>
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,oklch(0.15_0.02_255/55%),transparent_50%)]" />
          <p className="relative z-10 p-4 text-sm font-medium text-primary-foreground/95">{caption}</p>
        </>
      ) : null}
    </div>
  );
}

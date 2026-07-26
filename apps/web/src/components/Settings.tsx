export function Toggle({
  label,
  hint,
  value,
  onChange,
  compact,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex w-full items-center gap-3 border border-border/70 bg-surface text-left transition-colors hover:border-foreground/15 ${
        compact ? "rounded-2xl px-3 py-2.5" : "gap-4 rounded-3xl p-4 shadow-soft"
      }`}
      aria-pressed={value}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${compact ? "text-[13px]" : "text-sm"}`}>{label}</p>
        <p
          className={`leading-snug text-muted-foreground ${compact ? "mt-0 text-[11px]" : "mt-0.5 text-xs leading-relaxed"}`}
        >
          {hint}
        </p>
      </div>
      <span
        className={`relative shrink-0 rounded-full transition-colors ${
          value ? "bg-ink" : "bg-muted"
        } ${compact ? "h-6 w-10" : "h-7 w-12"}`}
      >
        <span
          className={`absolute rounded-full bg-surface shadow-soft transition-all ${
            compact ? "top-0.5 h-5 w-5" : "top-1 h-5 w-5"
          } ${value ? (compact ? "left-4" : "left-6") : "left-1"}`}
        />
      </span>
    </button>
  );
}

export function RadiusSlider({
  value,
  onChange,
  compact,
}: {
  value: number;
  onChange: (v: number) => void;
  compact?: boolean;
}) {
  const size = compact ? 88 : 128;
  const fill = compact ? 16 + (value / 200) * 72 : 24 + (value / 200) * 104;

  return (
    <div
      className={`rounded-2xl border border-border/70 bg-surface ${compact ? "p-4" : "p-5 shadow-soft"}`}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">Buzz radius</p>
        <span
          className={`font-display font-semibold text-ink ${compact ? "text-xl" : "text-2xl"}`}
        >
          {value}m
        </span>
      </div>

      <div
        className="relative mx-auto flex items-center justify-center"
        style={{ width: size, height: size, marginTop: compact ? 12 : 20 }}
      >
        <span
          className="absolute rounded-full bg-ink/8 transition-all duration-300"
          style={{ width: fill, height: fill }}
        />
        <span
          className="absolute rounded-full border border-dashed border-border"
          style={{ width: size, height: size }}
        />
        <span className="relative h-2.5 w-2.5 rounded-full bg-ink" />
      </div>

      <input
        type="range"
        min={10}
        max={200}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full accent-[var(--ink)] ${compact ? "mt-3" : "mt-5"}`}
        aria-label="Buzz radius in metres"
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>Same room</span>
        <span>Same street</span>
      </div>
      {compact ? null : (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Smaller radius means fewer buzzes, but the person is genuinely within sight.
        </p>
      )}
    </div>
  );
}

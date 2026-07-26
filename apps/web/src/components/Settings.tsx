export function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center gap-4 rounded-3xl border border-border/70 bg-surface p-4 text-left shadow-soft transition-colors hover:border-primary/30"
      aria-pressed={value}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      </div>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? "gradient-warm" : "bg-muted"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-surface shadow-soft transition-all ${
            value ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export function RadiusSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-soft">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">Buzz radius</p>
        <span className="font-display text-2xl font-semibold text-primary">{value}m</span>
      </div>

      <div className="relative mx-auto mt-5 flex h-32 w-32 items-center justify-center">
        <span
          className="absolute rounded-full bg-primary/12 transition-all duration-300"
          style={{ width: 24 + (value / 200) * 104, height: 24 + (value / 200) * 104 }}
        />
        <span className="absolute h-32 w-32 rounded-full border border-dashed border-border" />
        <span className="relative h-3 w-3 rounded-full gradient-warm" />
      </div>

      <input
        type="range"
        min={10}
        max={200}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-5 w-full accent-[var(--primary)]"
        aria-label="Buzz radius in metres"
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>Same room</span>
        <span>Same street</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Smaller radius means fewer buzzes, but the person is genuinely within sight.
      </p>
    </div>
  );
}

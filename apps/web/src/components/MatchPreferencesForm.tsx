import {
  AGE_CEILING,
  AGE_FLOOR,
  AGE_PRESETS,
  INTENT_OPTIONS,
  LOOKING_FOR_OPTIONS,
  formatAgeRange,
  type Intent,
  type LookingFor,
  type MatchPreferences,
} from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

const AGE_OPTIONS = Array.from({ length: AGE_CEILING - AGE_FLOOR + 1 }, (_, i) => AGE_FLOOR + i);

export function MatchPreferencesForm({
  value,
  onChange,
  compact,
}: {
  value: MatchPreferences;
  onChange: (next: MatchPreferences) => void;
  compact?: boolean;
}) {
  const toggleLooking = (id: LookingFor) => {
    const has = value.lookingFor.includes(id);
    if (has && value.lookingFor.length === 1) return;
    onChange({
      ...value,
      lookingFor: has ? value.lookingFor.filter((x) => x !== id) : [...value.lookingFor, id],
    });
  };

  const toggleIntent = (id: Intent) => {
    const has = value.intents.includes(id);
    if (has && value.intents.length === 1) return;
    onChange({
      ...value,
      intents: has ? value.intents.filter((x) => x !== id) : [...value.intents, id],
    });
  };

  const setAgeMin = (n: number) => {
    const ageMin = Math.min(Math.max(AGE_FLOOR, n), value.ageMax);
    onChange({ ...value, ageMin });
  };

  const setAgeMax = (n: number) => {
    const ageMax = Math.max(Math.min(AGE_CEILING, n), value.ageMin);
    onChange({ ...value, ageMax });
  };

  const activePreset = AGE_PRESETS.find(
    (p) => p.ageMin === value.ageMin && p.ageMax === value.ageMax,
  );

  return (
    <div className={cn("space-y-3", !compact && "space-y-5")}>
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Show me
        </p>
        <div className={cn("mt-2 flex flex-wrap gap-1.5", !compact && "gap-2")}>
          {LOOKING_FOR_OPTIONS.map(({ id, label }) => {
            const active = value.lookingFor.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleLooking(id)}
                className={cn(
                  "rounded-full px-3.5 text-[12px] font-semibold transition-colors",
                  compact ? "h-8" : "h-9",
                  active
                    ? "bg-ink text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-surface p-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Age range
          </p>
          <p className="font-display text-sm font-semibold text-ink">
            {formatAgeRange(value.ageMin, value.ageMax)}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <AgePicker
            label="Min"
            value={value.ageMin}
            min={AGE_FLOOR}
            max={value.ageMax}
            onChange={setAgeMin}
          />
          <AgePicker
            label="Max"
            value={value.ageMax}
            min={value.ageMin}
            max={AGE_CEILING}
            onChange={setAgeMax}
            openEnded={value.ageMax >= AGE_CEILING}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {AGE_PRESETS.map((preset) => {
            const active = activePreset?.label === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onChange({ ...value, ageMin: preset.ageMin, ageMax: preset.ageMax })
                }
                className={cn(
                  "h-7 rounded-full px-2.5 text-[11px] font-semibold transition-colors",
                  active
                    ? "bg-ink text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 space-y-2">
          <label className="block">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Youngest</span>
              <span>{value.ageMin}</span>
            </div>
            <input
              type="range"
              min={AGE_FLOOR}
              max={AGE_CEILING}
              value={value.ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="w-full accent-[var(--ink)]"
              aria-label="Minimum age"
            />
          </label>
          <label className="block">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Oldest</span>
              <span>{value.ageMax >= AGE_CEILING ? "99+" : value.ageMax}</span>
            </div>
            <input
              type="range"
              min={AGE_FLOOR}
              max={AGE_CEILING}
              value={value.ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="w-full accent-[var(--ink)]"
              aria-label="Maximum age"
            />
          </label>
        </div>
      </section>

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Looking for
        </p>
        <div className={cn("mt-2 space-y-1.5", !compact && "space-y-2")}>
          {INTENT_OPTIONS.map(({ id, label, hint }) => {
            const active = value.intents.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleIntent(id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border px-3 text-left transition-colors",
                  compact ? "py-2" : "py-2.5",
                  active
                    ? "border-ink bg-ink text-primary-foreground"
                    : "border-border/70 bg-surface text-foreground hover:border-foreground/20",
                )}
              >
                <span>
                  <span className="block text-[13px] font-semibold">{label}</span>
                  <span
                    className={cn(
                      "block text-[11px]",
                      active ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {hint}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                    active
                      ? "border-primary-foreground/40 bg-primary-foreground text-ink"
                      : "border-border text-transparent",
                  )}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AgePicker({
  label,
  value,
  min,
  max,
  onChange,
  openEnded,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  openEnded?: boolean;
}) {
  const options = AGE_OPTIONS.filter((age) => age >= min && age <= max);

  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink transition-colors hover:bg-muted disabled:opacity-30"
          aria-label={`Decrease ${label.toLowerCase()} age`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-9 min-w-0 flex-1 appearance-none bg-transparent text-center font-display text-lg font-semibold tracking-tight text-ink outline-none"
          aria-label={`${label} age`}
        >
          {options.map((age) => (
            <option key={age} value={age}>
              {openEnded && age >= AGE_CEILING ? "99+" : age}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink transition-colors hover:bg-muted disabled:opacity-30"
          aria-label={`Increase ${label.toLowerCase()} age`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

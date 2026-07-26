import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Check, Clock, Plus, Radar, SlidersHorizontal, Sparkles } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Toggle, RadiusSlider } from "@/components/Settings";
import { PhotoPanel } from "@/components/Avatar";
import { MatchPreferencesForm } from "@/components/MatchPreferencesForm";
import { me } from "@/lib/mock-data";
import {
  defaultPreferences,
  formatPreferencesSummary,
  savePreferences,
  type MatchPreferences,
} from "@/lib/preferences";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up Buzld — photos, preferences & buzz radius" },
      {
        name: "description",
        content:
          "A quick first-time setup: add photos, set who you want to meet, choose your buzz radius, and quiet hours.",
      },
      { property: "og:title", content: "Set up Buzld" },
      {
        property: "og:description",
        content: "Choose your match preferences, buzz radius and first photos before you head out.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["Photos", "Preferences", "Radius", "Quiet hours", "Ready"] as const;
const LAST_STEP = STEPS.length - 1;

const DAYS = [
  { id: "mon", label: "Mo" },
  { id: "tue", label: "Tu" },
  { id: "wed", label: "We" },
  { id: "thu", label: "Th" },
  { id: "fri", label: "Fr" },
  { id: "sat", label: "Sa" },
  { id: "sun", label: "Su" },
] as const;

type DayId = (typeof DAYS)[number]["id"];

const WEEKNIGHTS: DayId[] = ["mon", "tue", "wed", "thu", "fri"];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function quietDuration(from: string, to: string) {
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  let mins = th * 60 + tm - (fh * 60 + fm);
  if (mins <= 0) mins += 24 * 60;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

function formatDays(days: DayId[]) {
  if (days.length === 7) return "Every day";
  if (days.length === 5 && WEEKNIGHTS.every((d) => days.includes(d))) return "Weekdays";
  if (days.length === 2 && days.includes("sat") && days.includes("sun")) return "Weekends";
  const labels: Record<DayId, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  };
  return days.map((d) => labels[d]).join(", ");
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [photos, setPhotos] = useState(1);
  const [prefs, setPrefs] = useState<MatchPreferences>(defaultPreferences);
  const [radius, setRadius] = useState(50);
  const [quiet, setQuiet] = useState(true);
  const [from, setFrom] = useState("22:00");
  const [to, setTo] = useState("07:00");
  const [days, setDays] = useState<DayId[]>([...WEEKNIGHTS]);
  const [weekendSchedule, setWeekendSchedule] = useState(false);
  const [weekendFrom, setWeekendFrom] = useState("00:00");
  const [weekendTo, setWeekendTo] = useState("09:00");

  const finish = () => {
    savePreferences(prefs);
    navigate({ to: "/nearby" });
  };

  const next = () => (step < LAST_STEP ? setStep(step + 1) : finish());

  return (
    <PhoneFrame
      hideNav
      className="flex h-full flex-col overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <header className="shrink-0 px-5 pt-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? navigate({ to: "/signup" }) : setStep(step - 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-surface text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
        </div>

        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-ink" : "bg-border"
              }`}
            />
          ))}
        </div>
      </header>

      <div key={step} className="animate-rise flex min-h-0 flex-1 flex-col overflow-hidden px-5">
        {step === 0 && (
          <StepShell
            icon={<Camera className="h-4 w-4" />}
            title="Add your first photos"
            copy="Shown briefly when someone nearby buzzes. Three is plenty."
          >
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) =>
                i < photos ? (
                  <PhotoPanel
                    key={i}
                    name={me.name}
                    src={me.photos[i] ?? me.photo}
                    hue={me.hue}
                    className="aspect-[3/4] w-full rounded-2xl"
                  />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotos((p) => Math.min(3, p + 1))}
                    className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-ink/30 hover:bg-muted hover:text-ink"
                    aria-label="Add a photo"
                  >
                    {i === photos ? <Camera className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                ),
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {photos} of 3 · first photo is what they see
            </p>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            icon={<SlidersHorizontal className="h-4 w-4" />}
            title="Who should buzz you?"
            copy="Buzld only matches people who fit both of your preferences."
          >
            <div className="min-h-0 overflow-y-auto no-scrollbar pb-1">
              <MatchPreferencesForm value={prefs} onChange={setPrefs} compact />
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            icon={<Radar className="h-4 w-4" />}
            title="How close is close enough?"
            copy="Only buzz when someone is inside this radius."
          >
            <RadiusSlider value={radius} onChange={setRadius} compact />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            icon={<Clock className="h-4 w-4" />}
            title="Quiet hours"
            copy="Pick when discovery pauses — and on which days."
          >
            <div className="space-y-2">
              <Toggle
                compact
                label="Quiet hours"
                hint="Pause buzzes on your schedule."
                value={quiet}
                onChange={setQuiet}
              />

              <div
                className={`space-y-2 transition-opacity ${
                  quiet ? "opacity-100" : "pointer-events-none opacity-40"
                }`}
              >
                <div className="rounded-2xl border border-border/70 bg-surface p-3 shadow-soft">
                  <div className="grid grid-cols-2 gap-2">
                    <TimeSelect label="From" value={from} onChange={setFrom} />
                    <TimeSelect label="Until" value={to} onChange={setTo} />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Silent {quietDuration(from, to)}
                    {to <= from ? " · overnight" : ""}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-surface p-3 shadow-soft">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Days
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!quiet}
                        onClick={() => setDays(DAYS.map((d) => d.id))}
                        className="text-[11px] font-semibold text-ink"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        disabled={!quiet}
                        onClick={() => setDays([...WEEKNIGHTS])}
                        className="text-[11px] font-semibold text-ink"
                      >
                        Weekdays
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {DAYS.map(({ id, label }) => {
                      const active = days.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          disabled={!quiet}
                          aria-label={id}
                          onClick={() =>
                            setDays((prev) => {
                              if (prev.includes(id)) {
                                if (prev.length === 1) return prev;
                                return prev.filter((d) => d !== id);
                              }
                              return [...prev, id];
                            })
                          }
                          className={`flex h-8 flex-1 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                            active
                              ? "bg-ink text-primary-foreground"
                              : "border border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Toggle
                  compact
                  label="Different weekend hours"
                  hint="Separate Sat–Sun window."
                  value={weekendSchedule}
                  onChange={setWeekendSchedule}
                />

                {weekendSchedule ? (
                  <div className="rounded-2xl border border-border/70 bg-surface p-3 shadow-soft">
                    <div className="grid grid-cols-2 gap-2">
                      <TimeSelect label="Weekend from" value={weekendFrom} onChange={setWeekendFrom} />
                      <TimeSelect label="Until" value={weekendTo} onChange={setWeekendTo} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            icon={<Sparkles className="h-4 w-4" />}
            title="You're ready"
            copy="Put your phone away — Buzld takes it from here."
          >
            <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-surface">
              <Summary label="Photos" value={`${photos} added`} />
              <Summary label="Matching" value={formatPreferencesSummary(prefs)} />
              <Summary label="Buzz radius" value={`${radius}m`} />
              <Summary
                label="Quiet hours"
                value={
                  quiet
                    ? `${from}–${to} · ${formatDays(days)}${
                        weekendSchedule ? ` · wknd ${weekendFrom}–${weekendTo}` : ""
                      }`
                    : "Off"
                }
              />
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Exact location never leaves your phone — we only compare distances.
            </p>
          </StepShell>
        )}
      </div>

      <div className="shrink-0 space-y-1.5 px-5 pt-3">
        <button
          type="button"
          onClick={next}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          {step === LAST_STEP ? "Start buzzing" : "Continue"}
          {step === LAST_STEP ? <Check className="h-4 w-4" /> : null}
        </button>
        {step < LAST_STEP ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="w-full py-1 text-center text-[11px] font-medium text-muted-foreground"
          >
            Skip for now
          </button>
        ) : (
          <div className="h-6" aria-hidden />
        )}
      </div>
    </PhoneFrame>
  );
}

function StepShell({
  icon,
  title,
  copy,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col pt-4">
      <div className="shrink-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-ink">
          {icon}
        </span>
        <h1 className="mt-3 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-ink">
          {title}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{copy}</p>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-hidden">{children}</div>
    </section>
  );
}

function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full appearance-none rounded-xl border border-border bg-background px-2.5 font-display text-base font-semibold tracking-tight text-foreground outline-none transition-colors focus:border-ink"
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start justify-between gap-3 px-3.5 py-2.5">
      <span className="shrink-0 text-[13px] text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-semibold leading-snug">{value}</span>
    </li>
  );
}

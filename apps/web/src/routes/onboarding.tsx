import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  Check,
  Clock,
  Heart,
  Plus,
  Radar,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Toggle, RadiusSlider } from "@/components/Settings";
import { PhotoPanel } from "@/components/Avatar";
import { MatchPreferencesForm } from "@/components/MatchPreferencesForm";
import { me } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  AGE_CEILING,
  AGE_FLOOR,
  MAX_LOOKING_FOR_TAGS,
  MAX_STYLE_TAGS,
  STYLE_TAGS,
  defaultSeekHeightRange,
  emptyPhysicalLooks,
  flashAudienceFromLookingFor,
  flashSamplesFor,
  formatLooksSummary,
  formatPreferencesSummary,
  lookingForTagsFor,
  physicalLooksComplete,
  savePhysicalLooks,
  savePreferences,
  type LookingForTag,
  type MatchPreferences,
  type PhysicalLooks,
  type StyleTag,
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

const STEPS = [
  "Photos",
  "Preferences",
  "Your type",
  "Looks",
  "Radius",
  "Quiet hours",
  "Ready",
] as const;
const LAST_STEP = STEPS.length - 1;
const REQUIRED_PHOTOS = 3;

const EMPTY_PREFS: MatchPreferences = {
  lookingFor: [],
  ageMin: 23,
  ageMax: 35,
  intents: [],
};

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

function prefsComplete(prefs: MatchPreferences) {
  return (
    prefs.lookingFor.length > 0 &&
    prefs.intents.length > 0 &&
    prefs.ageMin >= AGE_FLOOR &&
    prefs.ageMax <= AGE_CEILING &&
    prefs.ageMin <= prefs.ageMax
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [photos, setPhotos] = useState(0);
  const [prefs, setPrefs] = useState<MatchPreferences>(EMPTY_PREFS);
  const audience = useMemo(
    () => flashAudienceFromLookingFor(prefs.lookingFor),
    [prefs.lookingFor],
  );
  const flashSamples = useMemo(() => flashSamplesFor(audience), [audience]);
  const lookTagCatalog = useMemo(() => lookingForTagsFor(audience), [audience]);
  const [looks, setLooks] = useState<PhysicalLooks>(() => emptyPhysicalLooks("mixed"));
  const [flashIndex, setFlashIndex] = useState(0);
  const [radius, setRadius] = useState(50);
  const [radiusSet, setRadiusSet] = useState(false);
  const [quiet, setQuiet] = useState(true);
  const [from, setFrom] = useState("22:00");
  const [to, setTo] = useState("07:00");
  const [days, setDays] = useState<DayId[]>([...WEEKNIGHTS]);
  const [weekendSchedule, setWeekendSchedule] = useState(false);
  const [weekendFrom, setWeekendFrom] = useState("00:00");
  const [weekendTo, setWeekendTo] = useState("09:00");

  const flashDone = looks.flashVotes.length >= flashSamples.length;
  const flashSample = flashSamples[Math.min(flashIndex, flashSamples.length - 1)];

  // When who they want changes, refresh flash pack + look tags + height defaults
  const applyAudienceDefaults = (nextPrefs: MatchPreferences) => {
    const nextAudience = flashAudienceFromLookingFor(nextPrefs.lookingFor);
    const range = defaultSeekHeightRange(nextAudience);
    const allowed = new Set(lookingForTagsFor(nextAudience).map((t) => t.id));
    setPrefs(nextPrefs);
    setFlashIndex(0);
    setLooks((prev) => ({
      ...prev,
      flashVotes: [],
      lookingForTags: prev.lookingForTags.filter((t) => allowed.has(t)),
      heightMin: range.min,
      heightMax: range.max,
    }));
    setError(null);
  };

  const stepHint = useMemo(() => {
    if (step === 0 && photos < REQUIRED_PHOTOS) {
      return `Add all ${REQUIRED_PHOTOS} photos to continue.`;
    }
    if (step === 1) {
      if (!prefs.lookingFor.length) return "Choose who you want to meet.";
      if (!prefs.intents.length) return "Pick at least one dating intent.";
      if (!prefsComplete(prefs)) return "Set a valid age range.";
    }
    if (step === 2 && !flashDone) return "Finish the flash round — tap ♥ or ✕ on each photo.";
    if (step === 3) {
      if (!looks.lookingForTags.length) return "Pick at least one look preference.";
      if (!looks.styleTags.length) return "Pick at least one style for yourself.";
      if (looks.heightMin > looks.heightMax) return "Seeking height range is invalid.";
    }
    if (step === 4 && !radiusSet) return "Set your buzz radius.";
    if (step === 5) {
      if (quiet && days.length === 0) return "Pick at least one quiet day.";
      if (quiet && weekendSchedule && (!weekendFrom || !weekendTo)) {
        return "Set weekend quiet hours.";
      }
    }
    return null;
  }, [
    step,
    photos,
    prefs,
    flashDone,
    looks,
    radiusSet,
    quiet,
    days.length,
    weekendSchedule,
    weekendFrom,
    weekendTo,
  ]);

  const canContinue = !stepHint;

  const finish = () => {
    if (!prefsComplete(prefs) || photos < REQUIRED_PHOTOS || !radiusSet || !physicalLooksComplete(looks, audience)) {
      return;
    }
    savePreferences(prefs);
    savePhysicalLooks(looks);
    navigate({ to: "/nearby" });
  };

  const next = () => {
    if (!canContinue) {
      setError(stepHint);
      return;
    }
    setError(null);
    if (step < LAST_STEP) setStep(step + 1);
    else finish();
  };

  const voteFlash = (liked: boolean) => {
    if (!flashSample || flashDone) return;
    setLooks((prev) => ({
      ...prev,
      flashVotes: [...prev.flashVotes.filter((v) => v.id !== flashSample.id), { id: flashSample.id, liked }],
    }));
    setError(null);
    if (flashIndex >= flashSamples.length - 1) return;
    setFlashIndex((i) => i + 1);
  };

  const toggleLookingTag = (id: LookingForTag) => {
    setLooks((prev) => {
      const has = prev.lookingForTags.includes(id);
      if (has) return { ...prev, lookingForTags: prev.lookingForTags.filter((t) => t !== id) };
      if (prev.lookingForTags.length >= MAX_LOOKING_FOR_TAGS) return prev;
      return { ...prev, lookingForTags: [...prev.lookingForTags, id] };
    });
    setError(null);
  };

  const toggleStyleTag = (id: StyleTag) => {
    setLooks((prev) => {
      const has = prev.styleTags.includes(id);
      if (has) return { ...prev, styleTags: prev.styleTags.filter((t) => t !== id) };
      if (prev.styleTags.length >= MAX_STYLE_TAGS) return prev;
      return { ...prev, styleTags: [...prev.styleTags, id] };
    });
    setError(null);
  };

  const setSelfHeight = (heightCm: number) => {
    const h = Math.min(230, Math.max(120, heightCm));
    setLooks((prev) => ({
      ...prev,
      heightCm: h,
      heightMin: Math.max(120, h - 15),
      heightMax: Math.min(230, h + 15),
    }));
    setError(null);
  };

  return (
    <PhoneFrame
      hideNav
      className="flex h-full flex-col overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <header className="shrink-0 px-5 pt-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              if (step === 0) navigate({ to: "/signup" });
              else setStep(step - 1);
            }}
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
            copy={`Add all ${REQUIRED_PHOTOS} photos — first is what they see when you buzz.`}
          >
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: REQUIRED_PHOTOS }).map((_, i) =>
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
                    onClick={() => {
                      setPhotos((p) => Math.min(REQUIRED_PHOTOS, p + 1));
                      setError(null);
                    }}
                    className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-ink/30 hover:bg-muted hover:text-ink"
                    aria-label="Add a photo"
                  >
                    {i === photos ? <Camera className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                ),
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {photos} of {REQUIRED_PHOTOS} required
            </p>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            icon={<SlidersHorizontal className="h-4 w-4" />}
            title="Who should buzz you?"
            copy="Choose who you want to meet, your age range, and what you’re looking for."
          >
            <MatchPreferencesForm
              value={prefs}
              onChange={applyAudienceDefaults}
              compact
            />
          </StepShell>
        )}

        {step === 2 && flashSample && (
          <StepShell
            icon={<Heart className="h-4 w-4" />}
            title="Your type"
            copy={
              audience === "women"
                ? "Flash round of women — strongest signal for who we show nearby."
                : audience === "men"
                  ? "Flash round of men — strongest signal for who we show nearby."
                  : "Tap ♥ or ✕ — photos match who you said you’re open to."
            }
          >
            <p className="mb-2 text-[11px] text-muted-foreground">
              {Math.min(flashIndex + 1, flashSamples.length)} / {flashSamples.length}
              {flashDone ? " · done" : ""}
            </p>
            <img
              src={flashSample.url}
              alt=""
              className="aspect-[3/4] w-full rounded-2xl object-cover"
            />
            <div className="mt-3 flex justify-center gap-4">
              <button
                type="button"
                disabled={flashDone}
                onClick={() => voteFlash(false)}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-lg font-bold disabled:opacity-40"
                aria-label="Pass"
              >
                ✕
              </button>
              <button
                type="button"
                disabled={flashDone}
                onClick={() => voteFlash(true)}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-ink bg-ink text-lg font-bold text-primary-foreground disabled:opacity-40"
                aria-label="Like"
              >
                ♥
              </button>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            icon={<UserRound className="h-4 w-4" />}
            title="Looks & height"
            copy={
              audience === "women"
                ? "Traits and height range for women you want to meet."
                : audience === "men"
                  ? "Traits and height range for men you want to meet."
                  : "Soft preferences that train matching — not hard filters."
            }
          >
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Anything you notice · {looks.lookingForTags.length}/{MAX_LOOKING_FOR_TAGS}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lookTagCatalog.map(({ id, label }) => {
                  const active = looks.lookingForTags.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleLookingTag(id)}
                      className={cn(
                        "h-8 rounded-full px-3 text-[12px] font-semibold transition-colors",
                        active
                          ? "bg-ink text-primary-foreground"
                          : "border border-border text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Your look · {looks.styleTags.length}/{MAX_STYLE_TAGS}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_TAGS.map(({ id, label }) => {
                  const active = looks.styleTags.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleStyleTag(id)}
                      className={cn(
                        "h-8 rounded-full px-3 text-[12px] font-semibold transition-colors",
                        active
                          ? "bg-ink text-primary-foreground"
                          : "border border-border text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-border/70 bg-surface p-3">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Your height
                </p>
                <p className="font-display text-sm font-semibold">{looks.heightCm} cm</p>
              </div>
              <input
                type="range"
                min={120}
                max={230}
                value={looks.heightCm}
                onChange={(e) => setSelfHeight(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--ink)]"
                aria-label="Your height"
              />
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Seeking height
                </p>
                <p className="font-display text-sm font-semibold">
                  {looks.heightMin}–{looks.heightMax} cm
                </p>
              </div>
              <label className="mt-2 block">
                <span className="text-[11px] text-muted-foreground">Min {looks.heightMin}</span>
                <input
                  type="range"
                  min={120}
                  max={looks.heightMax}
                  value={looks.heightMin}
                  onChange={(e) => {
                    setLooks((prev) => ({ ...prev, heightMin: Number(e.target.value) }));
                    setError(null);
                  }}
                  className="w-full accent-[var(--ink)]"
                />
              </label>
              <label className="mt-1 block">
                <span className="text-[11px] text-muted-foreground">Max {looks.heightMax}</span>
                <input
                  type="range"
                  min={looks.heightMin}
                  max={230}
                  value={looks.heightMax}
                  onChange={(e) => {
                    setLooks((prev) => ({ ...prev, heightMax: Number(e.target.value) }));
                    setError(null);
                  }}
                  className="w-full accent-[var(--ink)]"
                />
              </label>
            </section>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            icon={<Radar className="h-4 w-4" />}
            title="How close is close enough?"
            copy="Move the slider to set when someone is close enough to buzz."
          >
            <RadiusSlider
              value={radius}
              onChange={(v) => {
                setRadius(v);
                setRadiusSet(true);
                setError(null);
              }}
              compact
            />
            {!radiusSet ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Adjust the radius to confirm your range.
              </p>
            ) : null}
          </StepShell>
        )}

        {step === 5 && (
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
                onChange={(v) => {
                  setQuiet(v);
                  setError(null);
                }}
              />

              <div
                className={`space-y-2 transition-opacity ${
                  quiet ? "opacity-100" : "pointer-events-none opacity-40"
                }`}
              >
                <div className="rounded-2xl border border-border/70 bg-surface p-3 shadow-soft">
                  <div className="grid grid-cols-2 gap-2">
                    <TimeSelect
                      label="From"
                      value={from}
                      onChange={(v) => {
                        setFrom(v);
                        setError(null);
                      }}
                    />
                    <TimeSelect
                      label="Until"
                      value={to}
                      onChange={(v) => {
                        setTo(v);
                        setError(null);
                      }}
                    />
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
                        onClick={() => {
                          setDays(DAYS.map((d) => d.id));
                          setError(null);
                        }}
                        className="text-[11px] font-semibold text-ink"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        disabled={!quiet}
                        onClick={() => {
                          setDays([...WEEKNIGHTS]);
                          setError(null);
                        }}
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
                              setError(null);
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
                  onChange={(v) => {
                    setWeekendSchedule(v);
                    setError(null);
                  }}
                />

                {weekendSchedule ? (
                  <div className="rounded-2xl border border-border/70 bg-surface p-3 shadow-soft">
                    <div className="grid grid-cols-2 gap-2">
                      <TimeSelect
                        label="Weekend from"
                        value={weekendFrom}
                        onChange={(v) => {
                          setWeekendFrom(v);
                          setError(null);
                        }}
                      />
                      <TimeSelect
                        label="Until"
                        value={weekendTo}
                        onChange={(v) => {
                          setWeekendTo(v);
                          setError(null);
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell
            icon={<Sparkles className="h-4 w-4" />}
            title="You're ready"
            copy="Put your phone away — Buzld takes it from here."
          >
            <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-surface">
              <Summary label="Photos" value={`${photos} added`} />
              <Summary label="Matching" value={formatPreferencesSummary(prefs)} />
              <Summary label="Looks" value={formatLooksSummary(looks)} />
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
        {error || (stepHint && !canContinue) ? (
          <p className="text-center text-[11px] font-medium text-muted-foreground" role="status">
            {error ?? stepHint}
          </p>
        ) : (
          <div className="h-4" aria-hidden />
        )}
        <button
          type="button"
          onClick={next}
          disabled={!canContinue}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          {step === LAST_STEP ? "Start buzzing" : "Continue"}
          {step === LAST_STEP ? <Check className="h-4 w-4" /> : null}
        </button>
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
      <div className="no-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1">
        {children}
      </div>
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

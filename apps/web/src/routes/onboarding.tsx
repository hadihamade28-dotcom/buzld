import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Check, Clock, Plus, Radar, Sparkles } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Toggle, RadiusSlider } from "@/components/Settings";
import { PhotoPanel } from "@/components/Avatar";
import { me } from "@/lib/mock-data";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up Orbit — buzz radius, quiet hours & photos" },
      {
        name: "description",
        content:
          "A quick first-time setup: choose your buzz radius, set quiet hours, and add the photos that appear when you cross someone's path.",
      },
      { property: "og:title", content: "Set up Orbit" },
      {
        property: "og:description",
        content: "Choose your buzz radius, quiet hours and first photos before you head out.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const HOURS = ["20:00", "21:00", "22:00", "23:00", "00:00"];
const WAKE = ["06:00", "07:00", "08:00", "09:00", "10:00"];

const STEPS = ["Photos", "Radius", "Quiet hours", "Ready"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [photos, setPhotos] = useState(1);
  const [radius, setRadius] = useState(50);
  const [quiet, setQuiet] = useState(true);
  const [from, setFrom] = useState("22:00");
  const [to, setTo] = useState("07:00");
  const [weekends, setWeekends] = useState(false);

  const next = () => (step < 3 ? setStep(step + 1) : navigate({ to: "/nearby" }));

  return (
    <PhoneFrame hideNav className="flex min-h-screen flex-col pb-8">
      <header className="px-6 pt-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? navigate({ to: "/signup" }) : setStep(step - 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Step {step + 1} of 4 · {STEPS[step]}
          </p>
        </div>

        <div className="mt-5 flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "gradient-warm" : "bg-border"
              }`}
            />
          ))}
        </div>
      </header>

      <div key={step} className="animate-rise flex-1 px-6">
        {step === 0 && (
          <StepShell
            icon={<Camera className="h-5 w-5" />}
            title="Add your first photos"
            copy="These only appear for a moment, and only to someone standing near you. Three is plenty."
          >
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 6 }).map((_, i) =>
                i < photos ? (
                  <PhotoPanel key={i} name={me.name} hue={me.hue} className="aspect-3/4 w-full" />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotos((p) => Math.min(6, p + 1))}
                    className="flex aspect-3/4 w-full items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/50 hover:text-primary"
                    aria-label="Add a photo"
                  >
                    {i === photos ? <Camera className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                ),
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {photos} of 6 added. The first one is what a nearby stranger sees when you both buzz.
            </p>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            icon={<Radar className="h-5 w-5" />}
            title="How close is close enough?"
            copy="Orbit only buzzes when someone is inside this radius, so pick a distance you'd actually look up for."
          >
            <RadiusSlider value={radius} onChange={setRadius} />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            icon={<Clock className="h-5 w-5" />}
            title="When should Orbit stay silent?"
            copy="Your phone won't buzz during these hours, and nobody will see you either."
          >
            <div className="space-y-3">
              <Toggle
                label="Quiet hours"
                hint="Pause all buzzes overnight."
                value={quiet}
                onChange={setQuiet}
              />

              <div
                className={`rounded-3xl border border-border/70 bg-surface p-4 shadow-soft transition-opacity ${
                  quiet ? "opacity-100" : "pointer-events-none opacity-40"
                }`}
              >
                <TimeRow label="Silence from" options={HOURS} value={from} onChange={setFrom} />
                <div className="mt-4">
                  <TimeRow label="Back on at" options={WAKE} value={to} onChange={setTo} />
                </div>
              </div>

              <Toggle
                label="Weekend nights are different"
                hint="Keep buzzing until 2am on Friday and Saturday."
                value={weekends}
                onChange={setWeekends}
              />
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            icon={<Sparkles className="h-5 w-5" />}
            title="You're ready to orbit"
            copy="That's everything. Put your phone away — Orbit takes it from here."
          >
            <ul className="space-y-2.5">
              <Summary label="Photos" value={`${photos} added`} />
              <Summary label="Buzz radius" value={`${radius}m`} />
              <Summary
                label="Quiet hours"
                value={quiet ? `${from} – ${to}${weekends ? " · relaxed weekends" : ""}` : "Off"}
              />
            </ul>
            <div className="mt-5 rounded-3xl gradient-dusk p-5">
              <p className="text-sm font-semibold text-primary-foreground">One last thing</p>
              <p className="mt-1.5 text-xs leading-relaxed text-primary-foreground/80">
                Keep Orbit running in the background. Your exact location never leaves your phone — we only
                compare distances.
              </p>
            </div>
          </StepShell>
        )}
      </div>

      <div className="mt-8 space-y-2.5 px-6">
        <button
          type="button"
          onClick={next}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-warm py-4 text-sm font-semibold text-primary-foreground shadow-lift transition-transform active:scale-[0.98]"
        >
          {step === 3 ? "Start orbiting" : "Continue"}
          {step === 3 ? <Check className="h-4 w-4" /> : null}
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="w-full text-center text-xs font-medium text-muted-foreground underline underline-offset-4"
          >
            Skip for now
          </button>
        ) : null}
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
    <section className="pt-7">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">{icon}</span>
      <h1 className="mt-4 font-display text-[1.7rem] font-semibold leading-tight tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TimeRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
              value === o
                ? "gradient-warm text-primary-foreground shadow-soft"
                : "border border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface px-4 py-3.5 shadow-soft">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </li>
  );
}

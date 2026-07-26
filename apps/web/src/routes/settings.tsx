import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Toggle, RadiusSlider } from "@/components/Settings";
import {
  defaultPreferences,
  formatAgeRange,
  formatIntents,
  formatLookingFor,
  loadPreferences,
  type MatchPreferences,
} from "@/lib/preferences";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Buzld" },
      {
        name: "description",
        content: "Control match preferences, buzz radius, visibility, quiet hours and privacy on Buzld.",
      },
      { property: "og:title", content: "Settings — Buzld" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [radius, setRadius] = useState(50);
  const [visible, setVisible] = useState(true);
  const [quiet, setQuiet] = useState(false);
  const [prefs, setPrefs] = useState<MatchPreferences>(defaultPreferences);

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  return (
    <PhoneFrame hideNav className="pb-8">
      <header className="px-6 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-surface text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="mt-5 font-display text-[13px] font-semibold lowercase tracking-[-0.02em] text-ink">
          buzld
        </p>
        <h1 className="mt-1 font-display text-[1.55rem] font-semibold tracking-[-0.03em] text-ink">
          Settings
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Matching, buzz radius, visibility and privacy.
        </p>
      </header>

      <section className="mt-6 px-6">
        <h2 className="text-[13px] font-semibold text-ink">Matching</h2>
        <Link
          to="/preferences"
          className="mt-3 flex w-full items-center justify-between gap-3 border-y border-border/70 py-3.5 text-left transition-colors hover:bg-muted/40"
        >
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-tight text-ink">Preferences</p>
            <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
              {formatLookingFor(prefs.lookingFor)} · {formatAgeRange(prefs.ageMin, prefs.ageMax)} ·{" "}
              {formatIntents(prefs.intents)}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      </section>

      <section className="mt-7 space-y-2.5 px-6">
        <h2 className="text-[13px] font-semibold text-ink">Buzz</h2>
        <RadiusSlider value={radius} onChange={setRadius} compact />
        <Toggle
          compact
          label="Visible while out"
          hint="Off means nobody can find you."
          value={visible}
          onChange={setVisible}
        />
        <Toggle
          compact
          label="Quiet hours"
          hint="No buzzes from 22:00 to 07:00."
          value={quiet}
          onChange={setQuiet}
        />
      </section>

      <section className="mx-6 mt-7 border-t border-border/70 pt-5">
        <h2 className="text-[13px] font-semibold text-ink">Privacy</h2>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          Exact location never leaves your phone. We only compare distances while you're both out.
        </p>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-between py-2 text-[13px] font-medium text-ink"
        >
          How proximity works
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </section>
    </PhoneFrame>
  );
}

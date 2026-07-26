import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { MatchPreferencesForm } from "@/components/MatchPreferencesForm";
import {
  defaultPreferences,
  formatPreferencesSummary,
  loadPreferences,
  savePreferences,
  type MatchPreferences,
} from "@/lib/preferences";

export const Route = createFileRoute("/preferences")({
  head: () => ({
    meta: [
      { title: "Match preferences — Buzld" },
      {
        name: "description",
        content: "Choose who Buzld should buzz you for — age, gender, and what you're looking for.",
      },
      { property: "og:title", content: "Match preferences — Buzld" },
    ],
  }),
  component: PreferencesPage,
});

function PreferencesPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<MatchPreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  const save = () => {
    savePreferences(prefs);
    setSaved(true);
    window.setTimeout(() => navigate({ to: "/settings" }), 500);
  };

  return (
    <PhoneFrame hideNav className="pb-8">
      <header className="px-6 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <Link
          to="/settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-surface text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="mt-5 font-display text-[13px] font-semibold lowercase tracking-[-0.02em] text-ink">
          buzld
        </p>
        <h1 className="mt-1 font-display text-[1.55rem] font-semibold tracking-[-0.03em] text-ink">
          Preferences
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Used to decide who can buzz you nearby. Change this anytime.
        </p>
      </header>

      <div className="mt-5 px-6">
        <MatchPreferencesForm value={prefs} onChange={setPrefs} />
      </div>

      <div className="mt-8 px-6">
        <button
          type="button"
          onClick={save}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            "Save preferences"
          )}
        </button>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          Currently matching {formatPreferencesSummary(prefs).toLowerCase()}
        </p>
      </div>
    </PhoneFrame>
  );
}

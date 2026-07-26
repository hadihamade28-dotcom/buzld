import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Avatar } from "@/components/Avatar";
import { BuzzSheet } from "@/components/BuzzSheet";
import { encounterFeed, byId, type Person } from "@/lib/mock-data";

export const Route = createFileRoute("/encounters")({
  head: () => ({
    meta: [
      { title: "Paths crossed — Buzld" },
      {
        name: "description",
        content: "A quiet log of the people you walked past today, and how often your paths overlapped.",
      },
      { property: "og:title", content: "Paths crossed — Buzld" },
      { property: "og:description", content: "See who you kept crossing paths with today on Buzld." },
    ],
  }),
  component: Encounters,
});

function Encounters() {
  const [buzzing, setBuzzing] = useState<Person | null>(null);

  return (
    <PhoneFrame>
      <header className="px-6 pb-4 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <p className="font-display text-[13px] font-semibold lowercase tracking-[-0.02em] text-ink">
          buzld
        </p>
        <h1 className="mt-1 font-display text-[1.55rem] font-semibold tracking-[-0.03em]">Paths</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          People you crossed today. Tap to buzz again.
        </p>
      </header>

      <ul className="divide-y divide-border/70 border-y border-border/70">
        {encounterFeed.map((e) => {
          const person = byId(e.personId);
          if (!person) return null;
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setBuzzing(person)}
                className="flex w-full items-center gap-3.5 px-6 py-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
              >
                <Avatar
                  name={person.name}
                  src={person.photo}
                  hue={person.hue}
                  className="h-11 w-11"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold tracking-tight text-ink">
                    {person.name}, {person.age}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{e.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{e.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="px-6 pt-5 text-[12px] leading-relaxed text-muted-foreground">
        Paths clear at midnight. Nothing here is stored as a location.
      </p>

      {buzzing && <BuzzSheet person={buzzing} onClose={() => setBuzzing(null)} />}
    </PhoneFrame>
  );
}

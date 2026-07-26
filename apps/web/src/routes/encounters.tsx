import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Footprints } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Avatar } from "@/components/Avatar";
import { BuzzSheet } from "@/components/BuzzSheet";
import { PageHeader } from "@/components/PageHeader";
import { encounterFeed, byId, type Person } from "@/lib/mock-data";

export const Route = createFileRoute("/encounters")({
  head: () => ({
    meta: [
      { title: "Paths crossed — Orbit" },
      {
        name: "description",
        content: "A quiet log of the people you walked past today, and how often your paths overlapped.",
      },
      { property: "og:title", content: "Paths crossed — Orbit" },
      { property: "og:description", content: "See who you kept crossing paths with today on Orbit." },
    ],
  }),
  component: Encounters,
});

function Encounters() {
  const [buzzing, setBuzzing] = useState<Person | null>(null);

  return (
    <PhoneFrame>
      <PageHeader
        eyebrow="Today"
        title="Paths you crossed"
        subtitle="People you were near long enough for Orbit to notice. Tap one to buzz them again."
      />

      <ul className="mt-1 space-y-3 px-5">
        {encounterFeed.map((e) => {
          const person = byId(e.personId);
          if (!person) return null;
          return (
            <li key={e.id}>
              <button
                onClick={() => setBuzzing(person)}
                className="flex w-full items-center gap-3 rounded-3xl border border-border/70 bg-surface p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30"
              >
                <Avatar name={person.name} hue={person.hue} className="h-12 w-12" textClassName="text-lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {person.name}, {person.age}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{e.detail}</p>
                </div>
                <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground">
                  {e.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mx-5 mt-6 flex items-start gap-3 rounded-3xl border border-dashed border-border p-4">
        <Footprints className="mt-0.5 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Paths clear every night at midnight. Nothing here is stored as a location — just a moment and a
          name.
        </p>
      </div>

      {buzzing && <BuzzSheet person={buzzing} onClose={() => setBuzzing(null)} />}
    </PhoneFrame>
  );
}

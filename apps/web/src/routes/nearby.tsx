import { useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BuzzSheet } from "@/components/BuzzSheet";
import { Avatar } from "@/components/Avatar";
import { people, type Person } from "@/lib/mock-data";

export const Route = createFileRoute("/nearby")({
  head: () => ({
    meta: [
      { title: "Buzld — Dating without swiping" },
      {
        name: "description",
        content:
          "Buzld matches you with people you actually walk past. Your phones buzz when you're near, photos appear, and only a mutual yes opens a chat.",
      },
      { property: "og:title", content: "Buzld — Dating without swiping" },
      {
        property: "og:description",
        content: "Your phones buzz when you're near each other. No swiping, just real proximity.",
      },
    ],
  }),
  component: Nearby,
});

const RINGS = [72, 112, 152];

/** Fixed orbit lanes so motion stays smooth and readable. */
const ORBITS = people.slice(0, 5).map((person, i) => ({
  person,
  radius: 56 + ((i % 3) + 1) * 32,
  duration: `${24 + i * 8}s`,
  start: (i / 5) * 360,
}));

function Nearby() {
  const [live, setLive] = useState(true);
  const [buzzing, setBuzzing] = useState<Person | null>(null);

  const closest = [...people].sort((a, b) => a.distance - b.distance)[0];

  return (
    <PhoneFrame>
      <header className="px-6 pb-1 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-[13px] font-semibold lowercase tracking-[-0.02em] text-ink">
              buzld
            </p>
            <h1 className="mt-1 font-display text-[1.55rem] font-semibold tracking-[-0.03em]">
              Nearby
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {live ? `${people.length} people close by` : "Discovery paused"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLive((v) => !v)}
            className={`mt-1 flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
              live ? "bg-ink text-primary-foreground" : "border border-border text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${live ? "bg-primary-foreground" : "bg-muted-foreground"}`}
            />
            {live ? "Live" : "Paused"}
          </button>
        </div>
      </header>

      <section className="relative mx-auto mt-6 flex h-[304px] w-[304px] items-center justify-center">
        {RINGS.map((r) => (
          <span
            key={r}
            className="absolute rounded-full border border-foreground/[0.07]"
            style={{ width: r * 2, height: r * 2 }}
          />
        ))}

        {live &&
          [0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute h-[304px] w-[304px] animate-radar rounded-full border border-ink/20"
              style={{ animationDelay: `${i * 1.35}s` }}
            />
          ))}

        <span className="relative z-10 h-2.5 w-2.5 rounded-full bg-ink shadow-[0_0_0_6px_oklch(0.16_0.025_255_/_0.06)]" />

        {ORBITS.map(({ person, radius, duration, start }) => {
          const spinStyle = {
            "--orbit-duration": duration,
            animationPlayState: live ? "running" : "paused",
          } as CSSProperties;

          return (
            <div
              key={person.id}
              className="pointer-events-none absolute"
              style={{
                width: radius * 2,
                height: radius * 2,
                transform: `rotate(${start}deg)`,
              }}
            >
              <div className="absolute inset-0 animate-orbit" style={spinStyle}>
                <button
                  type="button"
                  onClick={() => setBuzzing(person)}
                  className="pointer-events-auto absolute left-1/2 top-0 z-20 rounded-full transition-transform hover:scale-110 active:scale-95 animate-orbit-item"
                  style={spinStyle}
                  aria-label={`${person.name}, ${person.distance} metres away`}
                >
                  <Avatar
                    name={person.name}
                    src={person.photo}
                    hue={person.hue}
                    className="h-10 w-10 shadow-soft ring-2 ring-background"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-8 px-6">
        <button
          type="button"
          onClick={() => setBuzzing(closest)}
          className="flex w-full items-center gap-3 text-left"
        >
          <Avatar
            name={closest.name}
            src={closest.photo}
            hue={closest.hue}
            className="h-11 w-11"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold tracking-tight text-ink">
              {closest.name}
            </p>
            <p className="truncate text-[12px] text-muted-foreground">
              Closest · {closest.distance}m · {closest.place}
            </p>
          </div>
        </button>
        <p className="mt-4 text-center text-[12px] text-muted-foreground">
          Location stays on your phone. Only distance is shared.
        </p>
      </section>

      {buzzing && <BuzzSheet person={buzzing} onClose={() => setBuzzing(null)} />}
    </PhoneFrame>
  );
}

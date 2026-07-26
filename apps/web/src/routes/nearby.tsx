import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Radar as RadarIcon, Vibrate, Waves } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BuzzSheet } from "@/components/BuzzSheet";
import { Avatar } from "@/components/Avatar";
import { people, type Person } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/nearby")({
  head: () => ({
    meta: [
      { title: "Orbit — Dating without swiping" },
      {
        name: "description",
        content:
          "Orbit matches you with people you actually walk past. Your phones buzz when you're near, photos appear, and only a mutual yes opens a chat.",
      },
      { property: "og:title", content: "Orbit — Dating without swiping" },
      {
        property: "og:description",
        content: "Your phones buzz when you're near each other. No swiping, just real proximity.",
      },
    ],
  }),
  component: Nearby,
});

const ORBITS = [
  { radius: 92, duration: "26s" },
  { radius: 138, duration: "38s" },
  { radius: 184, duration: "50s" },
];

function Nearby() {
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [buzzing, setBuzzing] = useState<Person | null>(null);

  useEffect(() => {
    if (!live) return;
    const i = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(i);
  }, [live]);

  const nearby = useMemo(() => {
    return people.map((p, idx) => {
      const drift = Math.round(Math.sin((tick + idx * 2) / 2.2) * 22);
      return { ...p, distance: Math.max(6, p.distance + drift) };
    });
  }, [tick]);

  const closest = nearby.slice().sort((a, b) => a.distance - b.distance)[0];

  return (
    <PhoneFrame>
      <PageHeader
        eyebrow="Orbit"
        title="Out and about"
        subtitle={
          live
            ? `${nearby.length} people with Orbit on are moving around you right now.`
            : "Discovery paused. Nobody can find you."
        }
        action={
          <button
            onClick={() => setLive((v) => !v)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
              live
                ? "gradient-warm text-primary-foreground shadow-soft"
                : "border border-border bg-background text-muted-foreground"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${live ? "bg-primary-foreground animate-pulse" : "bg-muted-foreground"}`}
            />
            {live ? "Live" : "Paused"}
          </button>
        }
      />

      {/* radar */}
      <section className="relative mx-auto mt-1 flex h-[290px] w-[290px] items-center justify-center">
        <span className="absolute h-[290px] w-[290px] rounded-full bg-[radial-gradient(circle,oklch(0.9_0.09_35/45%),transparent_68%)]" />
        {ORBITS.map((o) => (
          <span
            key={o.radius}
            className="absolute rounded-full border border-primary/12"
            style={{ width: o.radius * 2, height: o.radius * 2 }}
          />
        ))}
        {live &&
          [0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute h-[290px] w-[290px] animate-radar rounded-full border border-primary/25 bg-primary/8"
              style={{ animationDelay: `${i * 1.05}s` }}
            />
          ))}

        <div className="relative z-10 flex h-[62px] w-[62px] items-center justify-center rounded-full gradient-warm shadow-float ring-[6px] ring-background/70">
          <RadarIcon className="h-7 w-7 text-primary-foreground" />
        </div>

        {nearby.slice(0, 5).map((p, i) => {
          const angle = (i / 5) * Math.PI * 2 + tick * 0.08;
          const r = 58 + Math.min(p.distance, 220) * 0.48;
          const x = Math.round(Math.cos(angle) * r);
          const y = Math.round(Math.sin(angle) * r);
          return (
            <button
              key={p.id}
              onClick={() => setBuzzing(p)}
              className="absolute z-20 transition-transform duration-[2600ms] ease-linear hover:scale-110"
              style={{ transform: `translate(${x}px, ${y}px)` }}
              aria-label={`${p.name}, ${p.distance} metres away`}
            >
              <Avatar name={p.name} hue={p.hue} className="h-11 w-11 shadow-float ring-[3px]" ring />
            </button>
          );
        })}
      </section>

      <section className="mt-6 px-5">
        <div className="rounded-[1.6rem] border border-border/60 bg-surface p-4 shadow-float">
          <div className="flex items-center gap-3">
            <Avatar name={closest.name} hue={closest.hue} className="h-12 w-12" textClassName="text-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold tracking-tight">
                Closest right now · {closest.distance}m
              </p>
              <p className="truncate text-xs text-muted-foreground">{closest.place}</p>
            </div>
          </div>
          <button
            onClick={() => setBuzzing(closest)}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[1.15rem] gradient-warm text-[15px] font-semibold text-primary-foreground shadow-float transition-transform active:scale-[0.98]"
          >
            <Vibrate className="h-[18px] w-[18px]" /> Simulate a buzz
          </button>
          <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
            In real life this fires on its own when you're within 50m.
          </p>
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-[1.4rem] bg-accent/55 p-4">
          <Waves className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
          <p className="text-[12px] leading-relaxed text-accent-foreground">
            Orbit never shows anyone a map of you. Only distance, only while you're both out, only in the
            moment you cross paths.
          </p>
        </div>
      </section>


      {buzzing && <BuzzSheet person={buzzing} onClose={() => setBuzzing(null)} />}
    </PhoneFrame>
  );
}

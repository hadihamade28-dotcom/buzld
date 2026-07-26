import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, ChevronRight, Plus, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Avatar, PhotoPanel } from "@/components/Avatar";
import { me } from "@/lib/mock-data";
import { Toggle, RadiusSlider } from "@/components/Settings";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Orbit" },
      {
        name: "description",
        content:
          "Set the photos that appear when someone near you buzzes, and control your radius and visibility.",
      },
      { property: "og:title", content: "Your profile — Orbit" },
      { property: "og:description", content: "Control your photos, buzz radius and visibility on Orbit." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const [radius, setRadius] = useState(50);
  const [visible, setVisible] = useState(true);
  const [quiet, setQuiet] = useState(false);

  return (
    <PhoneFrame>
      <header className="relative mx-5 mt-6 flex items-center gap-4 overflow-hidden rounded-3xl border border-border/70 bg-surface p-5 shadow-soft">
        <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <Avatar name={me.name} hue={me.hue} className="h-16 w-16" textClassName="text-2xl" />
        <div>
          <h1 className="text-2xl font-semibold">
            {me.name}, {me.age}
          </h1>
          <p className="text-xs text-muted-foreground">{me.work}</p>
        </div>
      </header>

      <p className="mt-3 px-5 text-sm text-foreground/85">{me.bio}</p>

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Photos that pop up</h2>
          <span className="text-xs text-muted-foreground">3 of 6</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <PhotoPanel key={i} name={me.name} hue={me.hue} className="aspect-3/4 w-full" />
          ))}
          {[0, 1, 2].map((i) => (
            <button
              key={`empty-${i}`}
              className="flex aspect-3/4 w-full items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Add a photo"
            >
              {i === 0 ? <Camera className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          The first photo is what a nearby stranger sees the moment you both buzz.
        </p>
      </section>

      <section className="mt-7 space-y-3 px-5">
        <h2 className="text-sm font-semibold">Buzz settings</h2>

        <RadiusSlider value={radius} onChange={setRadius} />

        <Toggle
          label="Visible while I'm out"
          hint="Turn off and nobody's phone can find you."
          value={visible}
          onChange={setVisible}
        />
        <Toggle
          label="Quiet hours"
          hint="No buzzes between 22:00 and 07:00."
          value={quiet}
          onChange={setQuiet}
        />
      </section>

      <section className="mt-7 space-y-3 px-5">
        <h2 className="text-sm font-semibold">Your prompts</h2>
        {me.prompts.map((p) => (
          <div key={p.q} className="rounded-3xl border border-border bg-surface p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{p.q}</p>
            <p className="mt-1.5 text-sm">{p.a}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {me.interests.map((i) => (
            <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              {i}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-7 rounded-3xl gradient-dusk p-5">
        <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        <h2 className="mt-3 text-lg font-semibold text-primary-foreground">Safety, plainly</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-primary-foreground/80">
          Your exact location never leaves your phone. Orbit compares distances, not coordinates, and only
          while you're both moving through the world.
        </p>
        <button className="mt-4 flex w-full items-center justify-between rounded-2xl bg-primary-foreground/12 px-4 py-3 text-sm font-medium text-primary-foreground">
          How proximity matching works
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>
    </PhoneFrame>
  );
}

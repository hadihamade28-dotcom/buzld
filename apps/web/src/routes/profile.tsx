import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ChevronRight, Plus, Settings } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Avatar, PhotoPanel } from "@/components/Avatar";
import { me } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Buzld" },
      {
        name: "description",
        content:
          "Your Buzld profile — photos and prompts that appear when someone nearby buzzes.",
      },
      { property: "og:title", content: "Your profile — Buzld" },
      { property: "og:description", content: "Photos and prompts on Buzld." },
    ],
  }),
  component: Profile,
});

function Profile() {
  return (
    <PhoneFrame>
      <header className="px-6 pb-5 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-[13px] font-semibold lowercase tracking-[-0.02em] text-ink">
            buzld
          </p>
          <Link
            to="/settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-ink transition-colors hover:bg-muted"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-3.5">
          <Avatar name={me.name} src={me.photo} hue={me.hue} className="h-14 w-14" />
          <div className="min-w-0">
            <h1 className="font-display text-[1.55rem] font-semibold tracking-[-0.03em] text-ink">
              {me.name}, {me.age}
            </h1>
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{me.work}</p>
          </div>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{me.bio}</p>
      </header>

      <section className="px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold text-ink">Photos</h2>
          <span className="text-[11px] text-muted-foreground">3 of 6</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {me.photos.map((src) => (
            <PhotoPanel
              key={src}
              name={me.name}
              src={src}
              hue={me.hue}
              className="aspect-[3/4] w-full rounded-2xl"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <button
              key={`empty-${i}`}
              type="button"
              className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-ink/25 hover:text-ink"
              aria-label="Add a photo"
            >
              {i === 0 ? <Camera className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7 px-6">
        <h2 className="text-[13px] font-semibold text-ink">Prompts</h2>
        <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
          {me.prompts.map((p) => (
            <li key={p.q} className="py-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">{p.q}</p>
              <p className="mt-1 text-[14px] font-medium tracking-tight text-ink">{p.a}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {me.interests.map((i) => (
            <span
              key={i}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              {i}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-7 px-6 pb-2">
        <Link
          to="/settings"
          className="flex w-full items-center justify-between gap-3 border-y border-border/70 py-3.5 text-left transition-colors hover:bg-muted/40"
        >
          <div>
            <p className="text-[14px] font-semibold tracking-tight text-ink">Settings</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Preferences, buzz radius, visibility
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      </section>
    </PhoneFrame>
  );
}

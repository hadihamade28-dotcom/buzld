import { createFileRoute, Link } from "@tanstack/react-router";
import { Radar, Vibrate, ShieldCheck, MessageCircleHeart } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbit — Dating that starts when you're nearby" },
      {
        name: "description",
        content:
          "Orbit is a dating app without swiping. Your phones buzz when you cross paths in real life, photos appear, and a mutual yes opens the chat.",
      },
      { property: "og:title", content: "Orbit — Dating that starts when you're nearby" },
      {
        property: "og:description",
        content: "No swiping. Your phones buzz when you're near each other, and only a mutual yes opens a chat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const steps = [
  {
    icon: Radar,
    title: "Go about your day",
    copy: "Orbit runs quietly in your pocket, noticing people you actually walk past.",
  },
  {
    icon: Vibrate,
    title: "Both phones buzz",
    copy: "When someone compatible is within your buzz radius, you both feel it at once.",
  },
  {
    icon: MessageCircleHeart,
    title: "A mutual yes opens chat",
    copy: "Photos appear for a moment. If you both say yes, the conversation is yours.",
  },
];

function Welcome() {
  return (
    <PhoneFrame hideNav className="pb-10">
      <section className="relative overflow-hidden px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-6 h-60 w-60 rounded-full bg-primary-glow/25 blur-3xl" />

        <div className="relative">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-primary shadow-soft">
            <Radar className="h-3.5 w-3.5" /> Orbit
          </span>

          <h1 className="mt-7 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.035em]">
            Dating that starts
            <span className="block text-gradient-warm">when you're nearby.</span>
          </h1>

          <p className="mt-4 max-w-[19rem] text-[15px] leading-relaxed text-muted-foreground">
            No swiping, no endless feed. Orbit waits until you and someone else are in the same place — then your phones
            buzz.
          </p>

          <div className="mt-8 space-y-2.5">
            <Link
              to="/signup"
              className="flex h-14 w-full items-center justify-center rounded-[1.25rem] gradient-warm text-[15px] font-semibold text-primary-foreground shadow-float transition-transform active:scale-[0.98]"
            >
              Create your account
            </Link>
            <Link
              to="/signin"
              className="flex h-14 w-full items-center justify-center rounded-[1.25rem] border border-border bg-surface text-[15px] font-semibold text-foreground shadow-soft transition-colors hover:bg-accent/60"
            >
              I already have Orbit
            </Link>
          </div>

          <Link
            to="/nearby"
            className="mt-4 block text-center text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Take a look around first
          </Link>
        </div>
      </section>

      <section className="px-6">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">How Orbit works</h2>
        <ul className="mt-4 space-y-2.5">
          {steps.map(({ icon: Icon, title, copy }, i) => (
            <li
              key={title}
              className="flex gap-4 rounded-[1.5rem] border border-border/60 bg-surface p-4 shadow-soft"
            >
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] bg-accent/70 text-primary">
                <Icon className="h-5 w-5" />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full gradient-warm text-[9px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-tight">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 flex items-start gap-2 rounded-[1.25rem] bg-accent/50 p-4 text-[12px] leading-relaxed text-accent-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Your exact location is never shown to anyone. Orbit only ever says "close by", and you can go invisible at any
          time.
        </p>
      </section>
    </PhoneFrame>
  );
}


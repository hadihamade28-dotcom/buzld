import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Buzld — Dating that starts when you're nearby" },
      {
        name: "description",
        content:
          "Buzld is a dating app without swiping. Your phones buzz when you cross paths in real life, photos appear, and a mutual yes opens the chat.",
      },
      { property: "og:title", content: "Buzld — Dating that starts when you're nearby" },
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

function Welcome() {
  return (
    <PhoneFrame hideNav>
      <section className="relative flex min-h-full flex-col px-7 pb-8 pt-[max(3rem,env(safe-area-inset-top))]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,oklch(0.9_0.05_195_/_40%),transparent_58%)]"
          aria-hidden
        />

        <div className="relative flex flex-1 flex-col items-center justify-center text-center animate-rise">
          <div className="relative mb-10 flex h-28 w-28 items-center justify-center" aria-hidden>
            <span className="absolute inset-0 rounded-full border border-primary/20 animate-radar" />
            <span className="absolute inset-3 rounded-full border border-primary/15 animate-radar [animation-delay:0.9s]" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          </div>

          <p className="font-display text-5xl font-semibold lowercase tracking-[-0.045em] text-ink">buzld</p>
          <p className="mt-4 max-w-[18ch] text-[15px] leading-relaxed text-muted-foreground">
            Meet when you cross paths. No swiping.
          </p>
        </div>

        <div className="relative space-y-3 animate-rise [animation-delay:100ms]">
          <Link
            to="/signup"
            className="flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Get started
          </Link>
          <p className="text-center text-[13px] text-muted-foreground">
            Already here?{" "}
            <Link to="/signin" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </PhoneFrame>
  );
}

import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AuthField, SocialRow } from "@/components/AuthField";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Orbit" },
      {
        name: "description",
        content:
          "Set up Orbit in a minute: your name, your buzz radius, and you're ready to match with people you actually cross paths with.",
      },
      { property: "og:title", content: "Create your account — Orbit" },
      { property: "og:description", content: "Join Orbit and start matching by proximity, not swiping." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);

  return (
    <PhoneFrame hideNav className="pb-10">
      <header className="px-6 pt-8">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(0))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface text-muted-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="mt-6 flex gap-2">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
          {step === 0 ? "Create your account" : "A little about you"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === 0
            ? "Orbit only needs the basics. No bio marathon, no swiping."
            : "This is what appears for a moment when your phones buzz."}
        </p>
      </header>

      {step === 0 ? (
        <form
          className="mt-8 space-y-4 px-6"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(1);
          }}
        >
          <AuthField label="Email" type="email" name="email" placeholder="you@example.com" required />
          <AuthField
            label="Password"
            type="password"
            name="password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />

          <button
            type="button"
            onClick={() => setAgreed((a) => !a)}
            className="flex w-full items-start gap-3 text-left"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                agreed ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface"
              }`}
            >
              {agreed ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <span className="text-[12px] leading-relaxed text-muted-foreground">
              I'm 18 or older and I agree to Orbit's terms and privacy policy, including sharing approximate proximity
              while the app is on.
            </span>
          </button>

          <button
            type="submit"
            disabled={!agreed}
            className="w-full rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            Continue
          </button>
        </form>
      ) : (
        <form
          className="mt-8 space-y-4 px-6"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/onboarding" });
          }}
        >
          <AuthField label="First name" name="name" placeholder="Alex" required />
          <AuthField label="Age" name="age" type="number" min={18} max={99} placeholder="27" required />
          <AuthField
            label="One line about you"
            name="tagline"
            placeholder="Always three coffees deep"
            hint="Shown with your photo when you cross someone's path."
          />

          <div className="rounded-3xl border border-border/70 bg-surface p-4">
            <p className="text-sm font-semibold">Your photos</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Add up to three. These only appear to someone once you're actually near each other.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-border text-2xl font-light text-muted-foreground"
                >
                  +
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-transform active:scale-[0.98]"
          >
            Continue setup
          </button>
        </form>
      )}

      {step === 0 ? <SocialRow /> : null}

      <p className="mt-8 px-6 text-center text-sm text-muted-foreground">
        Already have Orbit?{" "}
        <Link to="/signin" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </PhoneFrame>
  );
}

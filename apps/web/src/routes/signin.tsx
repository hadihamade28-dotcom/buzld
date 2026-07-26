import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AuthField, SocialRow } from "@/components/AuthField";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Buzld" },
      {
        name: "description",
        content: "Sign in to Buzld and pick up where you left off with the people you crossed paths with.",
      },
      { property: "og:title", content: "Sign in — Buzld" },
      { property: "og:description", content: "Welcome back to proximity-first dating." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  return (
    <PhoneFrame hideNav className="pb-10">
      <header className="px-6 pt-8">
        <Link
          to="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface text-muted-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Turn your buzz radius back on and see who you walk past today.
        </p>
      </header>

      <form
        className="mt-8 space-y-4 px-6"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/nearby" });
        }}
      >
        <AuthField label="Email" type="email" name="email" placeholder="you@example.com" autoComplete="email" required />

        <div className="relative">
          <AuthField
            label="Password"
            type={show ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-4 top-[2.35rem] text-muted-foreground"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex justify-end">
          <button type="button" className="text-xs font-medium text-primary">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-transform active:scale-[0.98]"
        >
          Sign in
        </button>
      </form>

      <SocialRow />

      <p className="mt-8 px-6 text-center text-sm text-muted-foreground">
        New to Buzld?{" "}
        <Link to="/signup" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </PhoneFrame>
  );
}

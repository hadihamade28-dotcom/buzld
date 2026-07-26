import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, X, MapPin, Vibrate, Check } from "lucide-react";
import type { Person } from "@/lib/mock-data";
import { PhotoPanel } from "./Avatar";

type Stage = "buzz" | "reveal" | "waiting" | "matched" | "passed";

export function BuzzSheet({ person, onClose }: { person: Person; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("buzz");
  const navigate = useNavigate();

  useEffect(() => {
    if (stage !== "buzz") return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([120, 80, 120]);
    }
    const t = setTimeout(() => setStage("reveal"), 1600);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "waiting") return;
    const t = setTimeout(() => setStage("matched"), 2200);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "passed") return;
    const t = setTimeout(onClose, 1100);
    return () => clearTimeout(t);
  }, [stage, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 backdrop-blur-sm">
      <div className="w-full max-w-[430px] animate-rise rounded-t-[2rem] bg-surface p-5 pb-8 shadow-lift">
        {stage === "buzz" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="animate-buzz rounded-full gradient-warm p-5">
              <Vibrate className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Someone's close</h2>
            <p className="max-w-[24ch] text-sm text-muted-foreground">
              Both your phones just buzzed. Hold tight while their photo loads.
            </p>
          </div>
        )}

        {stage === "reveal" && (
          <div className="animate-rise">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Within {person.distance}m
                </p>
                <h2 className="text-2xl font-semibold">
                  {person.name}, {person.age}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {person.place}
              </span>
            </div>

            <PhotoPanel
              name={person.name}
              hue={person.hue}
              caption={person.work}
              className="h-64 w-full"
            />

            <p className="mt-4 text-sm leading-relaxed text-foreground/85">{person.bio}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {person.interests.map((i) => (
                <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  {i}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setStage("passed")}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" /> Not now
              </button>
              <button
                onClick={() => setStage("waiting")}
                className="flex h-14 flex-[1.4] items-center justify-center gap-2 rounded-2xl gradient-warm text-sm font-semibold text-primary-foreground shadow-lift transition-transform active:scale-[0.98]"
              >
                <Heart className="h-5 w-5" /> Yes, that's them
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              They only find out if you both say yes.
            </p>
          </div>
        )}

        {stage === "waiting" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-radar rounded-full bg-primary/30" />
              <span className="relative rounded-full gradient-warm p-4">
                <Heart className="h-7 w-7 text-primary-foreground" />
              </span>
            </div>
            <h2 className="text-xl font-semibold">Waiting on {person.name}</h2>
            <p className="max-w-[26ch] text-sm text-muted-foreground">
              Their phone is buzzing right now. You'll know the second they answer.
            </p>
          </div>
        )}

        {stage === "matched" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center animate-rise">
            <div className="rounded-full bg-primary/12 p-4">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl font-semibold text-gradient-warm">You both said yes</h2>
            <p className="max-w-[28ch] text-sm text-muted-foreground">
              {person.name} is {person.distance}m away at {person.place}. Say something before one of you
              walks off.
            </p>
            <button
              onClick={() => navigate({ to: "/chat/$id", params: { id: person.id } })}
              className="mt-2 h-13 w-full rounded-2xl gradient-warm py-4 text-sm font-semibold text-primary-foreground shadow-lift"
            >
              Open chat
            </button>
            <button onClick={onClose} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline">
              Later
            </button>
          </div>
        )}

        {stage === "passed" && (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <p className="text-sm text-muted-foreground">No problem — they'll never know.</p>
          </div>
        )}
      </div>
    </div>
  );
}

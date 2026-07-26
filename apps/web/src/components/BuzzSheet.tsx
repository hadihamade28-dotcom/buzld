import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, X, MapPin, Vibrate, Check } from "lucide-react";
import type { Person } from "@/lib/mock-data";
import { PhotoPanel } from "./Avatar";
import { cn } from "@/lib/utils";

type Stage = "buzz" | "reveal" | "waiting" | "matched" | "passed";

export function BuzzSheet({ person, onClose }: { person: Person; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("buzz");
  const navigate = useNavigate();
  const photos = (person.photos.length > 0 ? person.photos : [person.photo]).slice(0, 3);

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
            <div className="animate-buzz rounded-full bg-ink p-5">
              <Vibrate className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Someone's close</h2>
            <p className="max-w-[24ch] text-sm text-muted-foreground">
              Both your phones just buzzed. Hold tight while their photos load.
            </p>
          </div>
        )}

        {stage === "reveal" && (
          <div className="animate-rise">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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

            <PhotoCarousel
              name={person.name}
              photos={photos}
              hue={person.hue}
              caption={person.work}
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
                type="button"
                onClick={() => setStage("passed")}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" /> Not now
              </button>
              <button
                type="button"
                onClick={() => setStage("waiting")}
                className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
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
              <span className="absolute inset-0 animate-radar rounded-full border border-foreground/15" />
              <span className="relative rounded-full bg-ink p-4">
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
            <div className="rounded-full bg-muted p-4">
              <Check className="h-7 w-7 text-ink" />
            </div>
            <h2 className="text-3xl font-semibold text-ink">You both said yes</h2>
            <p className="max-w-[28ch] text-sm text-muted-foreground">
              {person.name} is {person.distance}m away at {person.place}. Say something before one of you
              walks off.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/chat/$id", params: { id: person.id } })}
              className="mt-2 h-12 w-full rounded-full bg-ink text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Open chat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
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

function PhotoCarousel({
  name,
  photos,
  hue,
  caption,
}: {
  name: string;
  photos: string[];
  hue: [string, string];
  caption: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const next = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(Math.min(photos.length - 1, Math.max(0, next)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-3xl"
      >
        {photos.map((src, i) => (
          <div key={src} className="w-full min-w-full shrink-0 snap-center">
            <PhotoPanel
              name={name}
              src={src}
              hue={hue}
              caption={i === 0 ? caption : undefined}
              className="h-72 w-full rounded-none"
            />
          </div>
        ))}
      </div>

      {photos.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center gap-1.5 px-4">
          {photos.map((src, i) => (
            <span
              key={src}
              className={cn(
                "h-0.5 max-w-16 flex-1 rounded-full transition-colors",
                i === index ? "bg-primary-foreground" : "bg-primary-foreground/35",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

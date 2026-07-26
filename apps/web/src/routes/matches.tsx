import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Avatar } from "@/components/Avatar";
import { matches, byId } from "@/lib/mock-data";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Your matches — Buzld" },
      {
        name: "description",
        content: "Everyone who said yes back after your phones buzzed nearby. Pick up the conversation.",
      },
      { property: "og:title", content: "Your matches — Buzld" },
      {
        property: "og:description",
        content: "Conversations that started because you were in the same place.",
      },
    ],
  }),
  component: Matches,
});

function Matches() {
  return (
    <PhoneFrame>
      <header className="px-6 pb-4 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <p className="font-display text-[13px] font-semibold lowercase tracking-[-0.02em] text-ink">
          buzld
        </p>
        <h1 className="mt-1 font-display text-[1.55rem] font-semibold tracking-[-0.03em]">
          Matches
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Mutual yes after a buzz nearby.
        </p>
      </header>

      <ul className="divide-y divide-border/70 border-y border-border/70">
        {matches.map((m) => {
          const person = byId(m.personId);
          if (!person) return null;
          return (
            <li key={m.personId}>
              <Link
                to="/chat/$id"
                params={{ id: person.id }}
                className="flex items-center gap-3.5 px-6 py-3.5 transition-colors hover:bg-muted/40 active:bg-muted/60"
              >
                <div className="relative shrink-0">
                  <Avatar
                    name={person.name}
                    src={person.photo}
                    hue={person.hue}
                    className="h-11 w-11"
                  />
                  {m.unread ? (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-ink ring-2 ring-background" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[14px] font-semibold tracking-tight text-ink">
                      {person.name}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{m.metAt}</span>
                  </div>
                  <p
                    className={`mt-0.5 truncate text-[12px] ${
                      m.unread ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {m.lastMessage}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">Met at {m.where}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="px-6 pt-5 text-[12px] leading-relaxed text-muted-foreground">
        Matches go quiet after 7 days without a reply.
      </p>
    </PhoneFrame>
  );
}

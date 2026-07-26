import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Avatar } from "@/components/Avatar";
import { matches, byId } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Your matches — Orbit" },
      {
        name: "description",
        content: "Everyone who said yes back after your phones buzzed nearby. Pick up the conversation.",
      },
      { property: "og:title", content: "Your matches — Orbit" },
      { property: "og:description", content: "Conversations that started because you were in the same place." },
    ],
  }),
  component: Matches,
});

function Matches() {
  return (
    <PhoneFrame>
      <PageHeader
        eyebrow="Mutual"
        title="Matches"
        subtitle="Each of these started with two phones buzzing in the same street."
      />

      <ul className="mt-4 space-y-2.5 px-5">
        {matches.map((m) => {
          const person = byId(m.personId);
          if (!person) return null;
          return (
            <li key={m.personId}>
              <Link
                to="/chat/$id"
                params={{ id: person.id }}
                className="flex items-center gap-3 rounded-[1.4rem] border border-border/60 bg-surface p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-float"
              >
                <div className="relative shrink-0">
                  <Avatar name={person.name} hue={person.hue} className="h-14 w-14" textClassName="text-xl" />
                  {m.unread && (
                    <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full gradient-warm ring-[3px] ring-surface" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[14px] font-semibold tracking-tight">{person.name}</p>
                    <span className="shrink-0 text-[10.5px] text-muted-foreground">{m.metAt}</span>
                  </div>
                  <p
                    className={`mt-0.5 truncate text-[12.5px] ${m.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {m.lastMessage}
                  </p>
                  <p className="mt-1.5 inline-flex max-w-full truncate rounded-full bg-accent/60 px-2 py-0.5 text-[10.5px] font-medium text-accent-foreground">
                    Met at {m.where}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mx-5 mt-4 rounded-[1.4rem] bg-secondary p-4 text-[12px] leading-relaxed text-secondary-foreground">
        A match goes quiet after 7 days without a reply. Orbit is built for right now, not a backlog.
      </p>

    </PhoneFrame>
  );
}

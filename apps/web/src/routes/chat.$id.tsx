import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Send } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Avatar } from "@/components/Avatar";
import { byId, conversations, type Message } from "@/lib/mock-data";

export const Route = createFileRoute("/chat/$id")({
  head: () => ({
    meta: [
      { title: "Chat — Orbit" },
      { name: "description", content: "Talk to someone you actually crossed paths with today." },
      { property: "og:title", content: "Chat — Orbit" },
      { property: "og:description", content: "Talk to someone you actually crossed paths with today." },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { id } = useParams({ from: "/chat/$id" });
  const person = byId(id);
  const [messages, setMessages] = useState<Message[]>(conversations[id] ?? []);
  const [draft, setDraft] = useState("");

  if (!person) {
    return (
      <PhoneFrame>
        <div className="flex flex-col items-center gap-3 px-5 pt-24 text-center">
          <h1 className="text-xl font-semibold">This chat isn't here</h1>
          <Link to="/matches" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Back to matches
          </Link>
        </div>
      </PhoneFrame>
    );
  }

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      {
        id: String(m.length + 1),
        from: "me",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  };

  return (
    <PhoneFrame hideNav className="flex flex-col pb-0">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-surface/95 px-4 py-3 backdrop-blur">
        <Link
          to="/matches"
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Back to matches"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar name={person.name} hue={person.hue} className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{person.name}</p>
          <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> {person.distance}m away · {person.place}
          </p>
        </div>
      </header>

      <div className="flex min-h-[60vh] flex-1 flex-col gap-3 px-4 py-5">
        <p className="mx-auto max-w-[30ch] rounded-2xl bg-accent/60 px-3 py-2 text-center text-[11px] leading-relaxed text-accent-foreground">
          You both buzzed at {person.place}. Photos were revealed and you both said yes.
        </p>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.from === "me" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[78%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
                m.from === "me"
                  ? "gradient-warm rounded-br-lg text-primary-foreground"
                  : "rounded-bl-lg bg-secondary text-secondary-foreground"
              }`}
            >
              {m.text}
            </div>
            <span className="mt-1 px-1 text-[10px] text-muted-foreground">{m.time}</span>
          </div>
        ))}
      </div>

      <form
        onSubmit={send}
        className="sticky bottom-0 flex items-center gap-2 border-t border-border/70 bg-surface/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Say where you are, ${person.name} is close`}
          className="h-12 flex-1 rounded-2xl border border-input bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
        />
        <button
          type="submit"
          className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-warm text-primary-foreground shadow-soft transition-transform active:scale-95"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </PhoneFrame>
  );
}

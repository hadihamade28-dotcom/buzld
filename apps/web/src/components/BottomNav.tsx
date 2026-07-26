import { Link, useRouterState } from "@tanstack/react-router";
import { Radar, Footprints, MessageCircleHeart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/nearby", label: "Nearby", icon: Radar },
  { to: "/encounters", label: "Paths", icon: Footprints },
  { to: "/matches", label: "Matches", icon: MessageCircleHeart },
  { to: "/profile", label: "You", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="glass pointer-events-auto flex items-stretch gap-1 rounded-[1.65rem] p-1.5 shadow-float">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "relative flex flex-col items-center gap-[3px] rounded-[1.3rem] px-1 py-2 text-[10.5px] font-semibold tracking-tight transition-all duration-300",
                  active
                    ? "gradient-warm text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 1.9} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

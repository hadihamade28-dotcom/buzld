import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";

/**
 * App shell. On a real phone this is edge-to-edge and exactly one viewport tall
 * (the content column scrolls, the page never does). On desktop the same column
 * is centred inside a device-style frame.
 */
export function PhoneFrame({
  children,
  className,
  hideNav,
}: {
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
}) {
  return (
    <div className="app-viewport flex w-full items-center justify-center bg-app-ambient sm:p-6">
      <div className="device-shell relative flex w-full max-w-[420px] flex-col overflow-hidden bg-background">
        {/* status-bar spacer / notch pill */}
        <div className="pointer-events-none relative z-30 h-[env(safe-area-inset-top)] w-full shrink-0 sm:h-0" />

        <main
          className={cn(
            "no-scrollbar relative flex-1 overflow-y-auto overscroll-contain",
            hideNav ? "pb-[max(1.25rem,env(safe-area-inset-bottom))]" : "pb-28",
            className,
          )}
        >
          {children}
        </main>

        {hideNav ? null : <BottomNav />}
      </div>
    </div>
  );
}

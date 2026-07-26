import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";

/**
 * App shell. On a real phone this is edge-to-edge and exactly one viewport tall
 * (the content column scrolls, the page never does). On desktop the same column
 * is centred inside a device-style frame.
 *
 * Pass `overflow-hidden` via className to lock a screen to the viewport
 * (e.g. onboarding) so inner layouts can fit without scrolling.
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
            "no-scrollbar relative flex min-h-0 flex-1 flex-col overscroll-contain",
            hideNav ? "pb-[max(1.25rem,env(safe-area-inset-bottom))]" : "pb-28",
            "overflow-y-auto",
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

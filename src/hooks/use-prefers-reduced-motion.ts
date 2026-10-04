"use client";

import { useSyncExternalStore } from "react";
import { motionQueries } from "@/animations/config";

function subscribe(callback: () => void) {
  const media = window.matchMedia(motionQueries.reduced);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** True when the visitor has asked the OS to reduce motion. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(motionQueries.reduced).matches,
    () => false,
  );
}

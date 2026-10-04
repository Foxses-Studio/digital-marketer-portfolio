"use client";

import {
  createContext,
  use,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  isThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme-config";

type ThemeContextValue = {
  /** What the visitor chose, including "system". */
  preference: ThemePreference;
  /** The theme actually applied to the page. */
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const darkQuery = "(prefers-color-scheme: dark)";

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;
  return window.matchMedia(darkQuery).matches ? "dark" : "light";
}

function applyTheme() {
  const theme = resolve(readPreference());
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

/*
 * The theme lives outside React: localStorage holds the preference and the
 * <html data-theme> attribute holds the applied theme. React subscribes to
 * it, so there is a single source of truth and no state to keep in sync.
 */
const listeners = new Set<() => void>();

function notify() {
  applyTheme();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia(darkQuery);
  // OS theme changed, or the preference changed in another tab.
  const onExternalChange = () => notify();
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) onExternalChange();
  };
  media.addEventListener("change", onExternalChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onExternalChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  const preference = readPreference();
  return `${preference}:${resolve(preference)}`;
}

// Server render uses a neutral value; the inline ThemeScript has already
// applied the real theme before paint.
const getServerSnapshot = () => "system:light";

function setPreference(next: ThemePreference) {
  try {
    if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage unavailable (private mode); nothing to persist.
  }
  notify();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // React clears attributes set by the inline script when it remounts <html>
  // in development Strict Mode; re-apply before paint. No-op in production.
  useLayoutEffect(applyTheme, []);

  const value = useMemo(() => {
    const [preference, resolvedTheme] = snapshot.split(":") as [
      ThemePreference,
      ResolvedTheme,
    ];
    return { preference, resolvedTheme, setPreference };
  }, [snapshot]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

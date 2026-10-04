"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ThemePreference } from "./theme-config";
import { useTheme } from "./theme-provider";

const options: Array<{ value: ThemePreference; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
  { value: "system", label: "System theme", Icon: Monitor },
];

/** Compact light / dark / system switch. */
export function ThemeToggle({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5", className)}
    >
      {options.map(({ value, label, Icon }) => {
        const selected = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={cn(
              "grid size-7 place-items-center rounded-sm transition-colors",
              selected ? "bg-elevated text-fg shadow-sm" : "text-fg-muted hover:text-fg",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

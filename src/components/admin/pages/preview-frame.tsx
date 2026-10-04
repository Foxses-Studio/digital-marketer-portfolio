"use client";

import { ExternalLink, Monitor, RotateCw, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, label: "Desktop", Icon: Monitor },
  mobile: { width: 390, height: 844, label: "Mobile", Icon: Smartphone },
} as const;

/**
 * Live preview of a public page, scaled to fit the panel. It shows what is
 * published; `version` bumps after each save to reload it.
 */
export function PreviewFrame({ path, version }: { path: string; version: number }) {
  const [viewport, setViewport] = useState<keyof typeof VIEWPORTS>("desktop");
  const [reloads, setReloads] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const { width, height } = VIEWPORTS[viewport];

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry!.contentRect.width / width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div className="rounded-md border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div role="radiogroup" aria-label="Preview size" className="flex gap-1">
          {Object.entries(VIEWPORTS).map(([key, { label, Icon }]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={viewport === key}
              onClick={() => setViewport(key as keyof typeof VIEWPORTS)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-small",
                viewport === key ? "bg-hover font-medium text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setReloads((n) => n + 1)} aria-label="Reload preview" className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg">
            <RotateCw className="size-3.5" aria-hidden />
          </button>
          <a href={path} target="_blank" rel="noopener noreferrer" aria-label="Open page in a new tab" className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg">
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
      <div ref={box} className="overflow-hidden bg-surface-muted p-0">
        <div className="mx-auto" style={{ width: width * scale, height: height * scale }}>
          <iframe
            key={`${version}-${reloads}-${viewport}`}
            title="Page preview"
            src={path}
            loading="lazy"
            style={{ width, height, transform: `scale(${scale})`, transformOrigin: "0 0" }}
            className="border-0 bg-canvas"
          />
        </div>
      </div>
      <p className="px-3 py-2 text-[0.75rem] text-fg-muted">Shows the published page. Save to update it.</p>
    </div>
  );
}

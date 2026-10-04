import Image from "next/image";
import type { MediaItem } from "@/lib/media/types";
import { cn } from "@/lib/utils/cn";

/**
 * Entry cover: the uploaded image, or an art-directed composition in the
 * entry's cover style (never an empty box). Fills its positioned parent.
 */
const PALETTES = {
  ember: { bg: "#c8401f", fg: "#f6efe7", line: "rgba(246,239,231,0.22)", block: "#9c2f15" },
  ink: { bg: "#151514", fg: "#f1efe9", line: "rgba(241,239,233,0.14)", block: "#ff6b47" },
  moss: { bg: "#1d4a3b", fg: "#e8efe9", line: "rgba(232,239,233,0.18)", block: "#5cc79f" },
  slate: { bg: "#232a33", fg: "#e9edf2", line: "rgba(233,237,242,0.16)", block: "#8aa8ff" },
  sand: { bg: "#e6dfd2", fg: "#1d1b17", line: "rgba(29,27,23,0.14)", block: "#c8401f" },
} as const;

export type CoverStyle = keyof typeof PALETTES;

export function CoverArt({
  image,
  style,
  label,
  sizes,
  className,
  imageClassName,
  preload,
}: {
  image: MediaItem | null;
  style: string;
  label: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  preload?: boolean;
}) {
  if (image) {
    return (
      <div className={cn("absolute inset-0 overflow-hidden bg-surface-muted", className)}>
        <Image src={image.url} alt={image.alt} fill sizes={sizes} preload={preload} className={cn("object-cover", imageClassName)} />
      </div>
    );
  }
  const p = PALETTES[(style as CoverStyle) in PALETTES ? (style as CoverStyle) : "ink"];
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} style={{ background: p.bg, color: p.fg }} aria-hidden>
      <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" className={cn("absolute inset-0 size-full", imageClassName)}>
        {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="160" y1={y} y2={y} stroke={p.line} strokeWidth="0.3" />)}
        {[32, 64, 96, 128].map((x) => <line key={x} x1={x} x2={x} y1="0" y2="100" stroke={p.line} strokeWidth="0.3" />)}
        <circle cx="118" cy="38" r="26" fill="none" stroke={p.fg} strokeOpacity="0.5" strokeWidth="0.4" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={20 + i * 11} y={78 - (i + 2) * 6} width="6" height={(i + 2) * 6} fill={i === 5 ? p.block : p.fg} fillOpacity={i === 5 ? 1 : 0.18} />
        ))}
        <path d="M16 70 C 50 64, 70 52, 96 40 S 132 20, 146 16" fill="none" stroke={p.block} strokeWidth="0.9" />
      </svg>
      <span className="absolute bottom-[8%] left-[6%] max-w-[70%] font-serif text-[clamp(1.25rem,3vw,2.5rem)] leading-none italic">{label}</span>
    </div>
  );
}

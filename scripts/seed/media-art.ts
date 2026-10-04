/**
 * Generated artwork for demo covers: abstract, art-directed compositions
 * rendered from SVG to WebP with sharp. No text and no stock imagery, so
 * nothing implies a real brand. Replace with real images in the admin.
 */

type Palette = { bg: string; bg2: string; fg: string; accent: string; soft: string };

const PALETTES: Record<string, Palette> = {
  ember: { bg: "#b9391b", bg2: "#e2683f", fg: "#f6efe7", accent: "#1d1b17", soft: "rgba(246,239,231,0.16)" },
  slate: { bg: "#1b222c", bg2: "#2f3b4c", fg: "#e9edf2", accent: "#8aa8ff", soft: "rgba(233,237,242,0.10)" },
  moss: { bg: "#173d31", bg2: "#2a6650", fg: "#e8efe9", accent: "#ffb48f", soft: "rgba(232,239,233,0.12)" },
  sand: { bg: "#d9cfbd", bg2: "#efe9de", fg: "#1d1b17", accent: "#c8401f", soft: "rgba(29,27,23,0.07)" },
  ink: { bg: "#121211", bg2: "#2a2926", fg: "#f1efe9", accent: "#ff6b47", soft: "rgba(241,239,233,0.09)" },
};

const grid = (w: number, h: number, step: number, color: string) => {
  let out = "";
  for (let x = step; x < w; x += step) out += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${color}" stroke-width="1"/>`;
  for (let y = step; y < h; y += step) out += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="1"/>`;
  return out;
};

const frame = (w: number, h: number, p: Palette, body: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.75" cy="0.2" r="0.7">
      <stop offset="0" stop-color="${p.fg}" stop-opacity="0.22"/><stop offset="1" stop-color="${p.fg}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#000" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${grid(w, h, 100, p.soft)}
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${body}
</svg>`;

/** Phone-shaped ad creatives fanned over a sun disc. */
function creatives(w: number, h: number, p: Palette) {
  const phone = (x: number, y: number, r: number, tint: string, bars: number) => `
    <g transform="translate(${x} ${y}) rotate(${r})" filter="url(#shadow)">
      <rect x="-150" y="-300" width="300" height="600" rx="36" fill="${p.fg}"/>
      <rect x="-128" y="-270" width="256" height="380" rx="18" fill="${tint}"/>
      <circle cx="0" cy="-90" r="70" fill="${p.fg}" fill-opacity="0.35"/>
      ${Array.from({ length: bars }, (_, i) => `<rect x="-128" y="${140 + i * 34}" width="${220 - i * 60}" height="14" rx="7" fill="${p.accent}" fill-opacity="${0.85 - i * 0.25}"/>`).join("")}
      <rect x="-128" y="232" width="120" height="40" rx="20" fill="${p.bg}"/>
    </g>`;
  return frame(w, h, p, `
    <circle cx="${w * 0.62}" cy="${h * 0.42}" r="${h * 0.34}" fill="${p.fg}" fill-opacity="0.12"/>
    ${phone(w * 0.36, h * 0.56, -9, p.bg2, 3)}
    ${phone(w * 0.62, h * 0.5, 4, p.accent, 2)}
    <path d="M${w * 0.08} ${h * 0.86} C ${w * 0.3} ${h * 0.8}, ${w * 0.55} ${h * 0.7}, ${w * 0.92} ${h * 0.3}" stroke="${p.fg}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="${w * 0.92}" cy="${h * 0.3}" r="14" fill="${p.fg}"/>`);
}

/** A rising line over pipeline bars on a dark grid. */
function pipeline(w: number, h: number, p: Palette) {
  const bars = [0.92, 0.74, 0.58, 0.46, 0.38];
  return frame(w, h, p, `
    ${bars.map((value, i) => `<rect x="${w * 0.1}" y="${h * 0.2 + i * h * 0.12}" width="${w * 0.62 * value}" height="${h * 0.075}" rx="6" fill="${i === bars.length - 1 ? p.accent : p.fg}" fill-opacity="${i === bars.length - 1 ? 1 : 0.14 + i * 0.05}"/>`).join("")}
    <g filter="url(#shadow)">
      <rect x="${w * 0.58}" y="${h * 0.14}" width="${w * 0.32}" height="${h * 0.34}" rx="20" fill="${p.bg2}"/>
      <path d="M${w * 0.61} ${h * 0.42} L ${w * 0.67} ${h * 0.38} L ${w * 0.73} ${h * 0.39} L ${w * 0.79} ${h * 0.3} L ${w * 0.87} ${h * 0.2}" stroke="${p.accent}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${w * 0.87}" cy="${h * 0.2}" r="12" fill="${p.accent}"/>
    </g>
    <circle cx="${w * 0.84}" cy="${h * 0.8}" r="${h * 0.12}" fill="none" stroke="${p.fg}" stroke-opacity="0.3" stroke-width="2"/>
    <circle cx="${w * 0.84}" cy="${h * 0.8}" r="${h * 0.06}" fill="${p.accent}" fill-opacity="0.9"/>`);
}

/** Layered ridgelines with a floating product card. */
function ridges(w: number, h: number, p: Palette) {
  const ridge = (y: number, amp: number, opacity: number) =>
    `<path d="M0 ${h} L0 ${y} C ${w * 0.2} ${y - amp}, ${w * 0.35} ${y + amp * 0.4}, ${w * 0.5} ${y - amp * 0.6} S ${w * 0.8} ${y - amp * 1.2}, ${w} ${y - amp * 0.2} L ${w} ${h} Z" fill="${p.fg}" fill-opacity="${opacity}"/>`;
  return frame(w, h, p, `
    <circle cx="${w * 0.72}" cy="${h * 0.3}" r="${h * 0.12}" fill="${p.accent}"/>
    ${ridge(h * 0.6, h * 0.16, 0.08)}
    ${ridge(h * 0.72, h * 0.12, 0.12)}
    ${ridge(h * 0.84, h * 0.08, 0.18)}
    <g filter="url(#shadow)" transform="translate(${w * 0.12} ${h * 0.18}) rotate(-4)">
      <rect width="${w * 0.3}" height="${h * 0.46}" rx="22" fill="${p.fg}"/>
      <rect x="24" y="24" width="${w * 0.3 - 48}" height="${h * 0.26}" rx="14" fill="${p.bg2}"/>
      <rect x="24" y="${h * 0.3}" width="${w * 0.18}" height="16" rx="8" fill="${p.bg}" fill-opacity="0.8"/>
      <rect x="24" y="${h * 0.3 + 32}" width="${w * 0.1}" height="16" rx="8" fill="${p.bg}" fill-opacity="0.4"/>
      <rect x="${w * 0.3 - 140}" y="${h * 0.46 - 70}" width="116" height="44" rx="22" fill="${p.accent}"/>
    </g>`);
}

/** Concentric rings and a signal: an algorithm finding demand. */
function rings(w: number, h: number, p: Palette) {
  const cx = w * 0.6;
  const cy = h * 0.52;
  return frame(w, h, p, `
    ${[0.42, 0.33, 0.24, 0.15].map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${h * r}" fill="none" stroke="${p.fg}" stroke-opacity="${0.12 + i * 0.08}" stroke-width="2"/>`).join("")}
    <circle cx="${cx}" cy="${cy}" r="${h * 0.06}" fill="${p.accent}"/>
    ${[[-0.3, -0.2], [0.25, -0.28], [0.32, 0.2], [-0.2, 0.3], [-0.36, 0.05]].map(([dx, dy], i) => `<line x1="${cx}" y1="${cy}" x2="${cx + dx! * h}" y2="${cy + dy! * h}" stroke="${p.fg}" stroke-opacity="0.25" stroke-width="2"/><circle cx="${cx + dx! * h}" cy="${cy + dy! * h}" r="${i === 1 ? 16 : 10}" fill="${i === 1 ? p.accent : p.fg}"/>`).join("")}
    <rect x="${w * 0.08}" y="${h * 0.12}" width="${w * 0.14}" height="${h * 0.05}" rx="${h * 0.025}" fill="${p.fg}" fill-opacity="0.14"/>`);
}

/** A wall of creative variants with one winner. */
function tiles(w: number, h: number, p: Palette) {
  const cols = 5;
  const rows = 3;
  const gap = 28;
  const tw = (w * 0.84 - gap * (cols - 1)) / cols;
  const th = (h * 0.76 - gap * (rows - 1)) / rows;
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = w * 0.08 + c * (tw + gap);
      const y = h * 0.12 + r * (th + gap);
      const win = r === 1 && c === 3;
      out += `<g ${win ? 'filter="url(#shadow)"' : ""}><rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="16" fill="${win ? p.fg : p.fg}" fill-opacity="${win ? 1 : 0.1 + ((r + c) % 3) * 0.04}"/>${win ? `<rect x="${x + 20}" y="${y + 20}" width="${tw - 40}" height="${th * 0.5}" rx="10" fill="${p.bg}"/><rect x="${x + 20}" y="${y + th * 0.5 + 36}" width="${tw * 0.5}" height="14" rx="7" fill="${p.accent}"/>` : ""}</g>`;
    }
  }
  return frame(w, h, p, out);
}

/** Connected nodes: events flowing from site to server to platforms. */
function network(w: number, h: number, p: Palette) {
  const nodes: Array<[number, number, number]> = [
    [0.18, 0.5, 46], [0.45, 0.3, 30], [0.45, 0.7, 30], [0.72, 0.2, 24], [0.72, 0.5, 34], [0.72, 0.8, 24], [0.88, 0.5, 18],
  ];
  const links = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [4, 6], [3, 6], [5, 6]];
  return frame(w, h, p, `
    ${links.map(([a, b]) => `<line x1="${nodes[a!]![0] * w}" y1="${nodes[a!]![1] * h}" x2="${nodes[b!]![0] * w}" y2="${nodes[b!]![1] * h}" stroke="${p.fg}" stroke-opacity="0.3" stroke-width="3"/>`).join("")}
    ${nodes.map(([x, y, r], i) => `<circle cx="${x * w}" cy="${y * h}" r="${r}" fill="${i === 4 ? p.accent : p.fg}" fill-opacity="${i === 4 ? 1 : 0.85}"/>`).join("")}
    <circle cx="${0.72 * w}" cy="${0.5 * h}" r="70" fill="none" stroke="${p.accent}" stroke-opacity="0.5" stroke-width="2"/>`);
}

export type DemoMedia = {
  /** Reference used in demo content, e.g. "media:cover-halden". */
  ref: string;
  /** Fixed ObjectId hex. */
  id: string;
  /** Fixed storage key (matches the local driver's key format). */
  key: string;
  originalName: string;
  alt: string;
  width: number;
  height: number;
  svg: () => string;
};

const media = (n: number, ref: string, alt: string, width: number, height: number, draw: (w: number, h: number) => string): DemoMedia => ({
  ref: `media:${ref}`,
  id: `64d0ae000000000000000${String(n).padStart(3, "0")}`,
  key: `2026/01/0f3e2a10-6b7c-4d8e-9a1b-${String(n).padStart(12, "0")}.webp`,
  originalName: `demo-${ref}.webp`,
  alt,
  width,
  height,
  svg: () => draw(width, height),
});

export const DEMO_MEDIA: DemoMedia[] = [
  media(1, "cover-halden", "Two phone-shaped ad creatives over a warm orange background with a rising trend line", 1600, 1200, (w, h) => creatives(w, h, PALETTES.ember!)),
  media(2, "cover-orbitpay", "Pipeline bars and a rising chart on a dark blue grid", 1600, 1200, (w, h) => pipeline(w, h, PALETTES.slate!)),
  media(3, "cover-marlow", "Layered green ridgelines with a floating product card", 1600, 1200, (w, h) => ridges(w, h, PALETTES.moss!)),
  media(4, "cover-pmax", "Concentric rings around an orange signal on a dark background", 1600, 1000, (w, h) => rings(w, h, PALETTES.ink!)),
  media(5, "cover-creative", "A grid of creative variants with one highlighted winner", 1600, 1000, (w, h) => tiles(w, h, PALETTES.ember!)),
  media(6, "cover-pipeline", "Funnel bars beside a rising line chart on a warm sand background", 1600, 1000, (w, h) => pipeline(w, h, PALETTES.sand!)),
  media(7, "cover-tracking", "Connected nodes showing data flowing between systems", 1600, 1000, (w, h) => network(w, h, PALETTES.moss!)),
];

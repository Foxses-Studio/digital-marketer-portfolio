/**
 * Decorative campaign-performance line for the hero visual. Illustrative
 * (not data), so it's hidden from assistive technology. A smooth curve is
 * computed once from a fixed point set (Catmull-Rom to cubic Bézier).
 */
const POINTS: Array<[number, number]> = [
  [0, 172], [36, 164], [72, 168], [108, 146], [144, 151], [180, 126],
  [216, 132], [252, 104], [288, 96], [324, 70], [360, 58], [400, 34],
];

function smoothPath(points: Array<[number, number]>) {
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1] ?? points[i]!;
    const [x1, y1] = points[i]!;
    const [x2, y2] = points[i + 1]!;
    const [x3, y3] = points[i + 2] ?? points[i + 1]!;
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    d += ` C${c1[0]!.toFixed(1)},${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)},${c2[1]!.toFixed(1)} ${x2},${y2}`;
  }
  return d;
}

const LINE = smoothPath(POINTS);
const AREA = `${LINE} L400,200 L0,200 Z`;
const DOTS = [POINTS[5]!, POINTS[8]!, POINTS[11]!];

export function HeroChart({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      className={className}
    >
      <g className="text-line" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {[50, 100, 150].map((y) => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1="0" x2="400" y1="199.5" y2="199.5" vectorEffect="non-scaling-stroke" />
      </g>
      <path data-chart-area d={AREA} className="fill-accent" fillOpacity="0.07" />
      <path
        data-chart-line
        d={LINE}
        fill="none"
        className="stroke-accent"
        strokeWidth="1.75"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {DOTS.map(([x, y]) => (
        <circle key={x} data-chart-dot cx={x} cy={y} r="3.5" className="fill-surface stroke-accent" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

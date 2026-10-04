import { CHART_HEIGHT, CHART_WIDTH, type ChartGeometry } from "./chart-geometry";

/**
 * Performance graph for the hero visual, drawn from CMS values (or a
 * neutral curve when there are none). Decorative for assistive technology;
 * the numbers it represents are also given as text.
 */
export function HeroChart({ geometry, className }: { geometry: ChartGeometry; className?: string }) {
  const last = geometry.points.at(-1)!;
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      preserveAspectRatio="none"
      className={className}
    >
      <g className="text-line" stroke="currentColor" strokeWidth="1">
        {[50, 100, 150].map((y) => (
          <line key={y} x1="0" x2={CHART_WIDTH} y1={y} y2={y} strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1="0" x2={CHART_WIDTH} y1={CHART_HEIGHT - 0.5} y2={CHART_HEIGHT - 0.5} vectorEffect="non-scaling-stroke" />
      </g>
      <path data-chart-area d={geometry.area} className="fill-accent" fillOpacity="0.08" />
      <path
        data-chart-line
        d={geometry.line}
        fill="none"
        className="stroke-accent"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Vertical guide at the latest value. */}
      <line
        data-chart-dot
        x1={last[0]}
        x2={last[0]}
        y1={last[1]}
        y2={CHART_HEIGHT}
        className="stroke-accent"
        strokeOpacity="0.35"
        strokeDasharray="2 4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

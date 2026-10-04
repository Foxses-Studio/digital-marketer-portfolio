/**
 * Geometry for the hero performance graph, computed on the server from CMS
 * values. Pure functions; coordinates are in a 400×200 viewBox.
 */
export const CHART_WIDTH = 400;
export const CHART_HEIGHT = 200;

/** Neutral curve used when the admin hasn't entered any values. */
const ILLUSTRATIVE = [28, 32, 30, 41, 39, 52, 49, 63, 67, 79, 85, 96];

export type ChartGeometry = {
  line: string;
  area: string;
  /** Points in viewBox coordinates. */
  points: Array<[number, number]>;
  /** Bar heights 0–1, for compact bar renderings. */
  bars: number[];
  /** Percentage growth from first to last value, or null if illustrative. */
  growth: number | null;
};

function smoothPath(points: Array<[number, number]>) {
  let d = `M${points[0]![0].toFixed(1)},${points[0]![1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1] ?? points[i]!;
    const [x1, y1] = points[i]!;
    const [x2, y2] = points[i + 1]!;
    const [x3, y3] = points[i + 2] ?? points[i + 1]!;
    // Catmull-Rom to cubic Bézier, slightly tensioned to avoid overshoot.
    const t = 1 / 7;
    const c1 = [x1 + (x2 - x0) * t, y1 + (y2 - y0) * t];
    const c2 = [x2 - (x3 - x1) * t, y2 - (y3 - y1) * t];
    d += ` C${c1[0]!.toFixed(1)},${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)},${c2[1]!.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
  }
  return d;
}

export function chartGeometry(values: number[]): ChartGeometry {
  const real = values.length >= 2;
  const data = real ? values : ILLUSTRATIVE;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  // Leave headroom above the peak and a floor so the curve never touches edges.
  const top = 18;
  const bottom = CHART_HEIGHT - 14;
  const points = data.map((value, index): [number, number] => [
    (index / (data.length - 1)) * CHART_WIDTH,
    bottom - ((value - min) / range) * (bottom - top),
  ]);
  const line = smoothPath(points);
  return {
    line,
    area: `${line} L${CHART_WIDTH},${CHART_HEIGHT} L0,${CHART_HEIGHT} Z`,
    points,
    bars: data.map((value) => (max ? value / max : 0)),
    growth: real && data[0]! > 0 ? ((data.at(-1)! - data[0]!) / data[0]!) * 100 : null,
  };
}

/** Growth as a metric-like value for display and counting, e.g. "+176%". */
export function growthParts(growth: number) {
  const rounded = Math.abs(growth) >= 100 ? Math.round(growth) : Math.round(growth * 10) / 10;
  return {
    prefix: rounded >= 0 ? "+" : "−",
    value: String(Math.abs(rounded)),
    suffix: "%",
  };
}

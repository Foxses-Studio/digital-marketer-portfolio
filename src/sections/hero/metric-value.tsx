import { formatMetric, metricDecimals, type MetricParts } from "@/lib/metrics";

/**
 * A metric rendered at its final value (correct without JavaScript and for
 * search engines). The motion layer counts the visible copy up from zero;
 * screen readers always get the final value once.
 */
export function MetricValue({ metric, className }: { metric: MetricParts; className?: string }) {
  const final = formatMetric(metric);
  return (
    <span className={className}>
      <span
        aria-hidden
        data-count={metric.value}
        data-decimals={metricDecimals(metric.value)}
        data-prefix={metric.prefix}
        data-suffix={metric.suffix}
        className="tabular-nums"
      >
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}

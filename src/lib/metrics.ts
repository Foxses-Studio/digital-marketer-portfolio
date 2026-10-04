/**
 * Metric values are stored as a numeric string plus optional prefix and
 * suffix ("$" + "1.2" + "M"), so they can be formatted and animated
 * reliably whatever the admin enters. Pure; used on server and client.
 */

export const METRIC_VALUE_PATTERN = /^\d{1,9}(\.\d{1,3})?$/;

export type MetricParts = { prefix: string; value: string; suffix: string };

/** Number of decimals the admin typed ("4.80" keeps two). */
export function metricDecimals(value: string) {
  return value.includes(".") ? value.split(".")[1]!.length : 0;
}

/** Formats a number with the given decimals and thousands separators. */
export function formatMetricNumber(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Final display string, e.g. "$1.2M", "4.8x", "8,400". */
export function formatMetric({ prefix, value, suffix }: MetricParts) {
  const number = Number(value);
  if (!Number.isFinite(number)) return `${prefix}${value}${suffix}`;
  return `${prefix}${formatMetricNumber(number, metricDecimals(value))}${suffix}`;
}

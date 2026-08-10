"use client";

import type { Metric } from "@/config/metrics";

export function MetricMoment({ metric }: { metric: Metric }) {
  return (
    <div className="container-narrow text-center">
      <p className="text-metric editorial-type" aria-label={`${metric.value} ${metric.label}`}>
        {metric.value}
      </p>
      <p className="mt-4 text-subhead text-ink/70">{metric.label}</p>
    </div>
  );
}

"use client";

import { businessDashboardDemo } from "@/config/businesses";

export function BusinessDashboard() {
  return (
    <div
      className="dhs-insight-metrics"
      aria-label="Business dashboard demonstration"
    >
      <p className="text-label text-muted-dark mb-4">Business insights</p>
      <div className="dhs-insight-metrics__grid">
        {businessDashboardDemo.metrics.map((m) => (
          <div key={m.label} className="dhs-insight-metrics__card">
            <p className="dhs-insight-metrics__value">{m.value}</p>
            <p className="dhs-insight-metrics__label">{m.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-muted-dark">
        {businessDashboardDemo.disclaimer}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { managementReportDemo, sections } from "@/config/caseStudy";

export function ManagementInsight({ active }: { active: boolean }) {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    if (!active) {
      setReveal(0);
      return;
    }
    const timers = [1, 2, 3, 4].map((n, i) =>
      window.setTimeout(() => setReveal(n), 500 + i * 700),
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="w-full max-w-2xl" aria-label="Management AI insight demonstration">
      <h2 className="text-headline editorial-type">
        {sections.management.headline}
      </h2>
      <GlassPanel variant="light" className="mt-8 p-5 md:p-7">
        <p className="text-label text-muted-dark mb-3">Management prompt</p>
        <p className="text-body text-ink/85">“{sections.management.prompt}”</p>
        <p className="mt-3 text-xs text-muted-dark">{sections.management.note}</p>

        <div className="mt-8 space-y-5 min-h-[240px]" aria-live="polite">
          {reveal >= 1 &&
            managementReportDemo.issues.map((issue, i) =>
              reveal > i ? (
                <div key={issue.id}>
                  <p className="text-label text-muted-dark">
                    Recurring issue {issue.id}
                  </p>
                  <p className="mt-1 text-lg font-medium">{issue.title}</p>
                </div>
              ) : null,
            )}
          {reveal >= 4 && (
            <div className="border-t border-ink/10 pt-5">
              <p className="text-label text-muted-dark mb-3">Recommended actions</p>
              <ul className="space-y-2">
                {managementReportDemo.actions.map((a) => (
                  <li key={a} className="text-sm text-ink/80">
                    — {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

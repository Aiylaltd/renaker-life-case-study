"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { residentChatDemo, sections } from "@/config/caseStudy";
import { metrics } from "@/config/metrics";

export function ResidentAIChat({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const metric = metrics.find((m) => m.id === "ai-resolved")!;

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const timers = [
      window.setTimeout(() => setStep(1), 400),
      window.setTimeout(() => setStep(2), 1200),
      window.setTimeout(() => setStep(3), 2200),
      window.setTimeout(() => setStep(4), 3200),
      window.setTimeout(() => setStep(5), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="w-full max-w-md" aria-label="AI concierge demonstration">
      <p className="text-label text-muted-dark mb-3">
        {sections.resident.conciergeHeadline}
      </p>
      <GlassPanel variant="light" className="p-5">
        <p className="text-label text-muted-dark mb-4">Renaker Life</p>
        <div className="space-y-3 min-h-[220px]">
          {step >= 1 && (
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-sm text-stone">
              {residentChatDemo.messages[0].text}
            </div>
          )}
          {step === 2 && (
            <div className="text-sm text-muted-dark" aria-live="polite">
              Aiyla is typing…
            </div>
          )}
          {step >= 3 && (
            <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-white/70 px-4 py-3 text-sm text-ink border border-ink/5">
              {residentChatDemo.messages[1].text}
            </div>
          )}
          {step >= 4 && (
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-sm text-stone">
              {residentChatDemo.messages[2].text}
            </div>
          )}
          {step >= 5 && (
            <div className="pt-2 text-sm text-muted-dark flex items-center gap-2">
              <span className="status-pulse" /> Resolved
            </div>
          )}
        </div>
      </GlassPanel>
      {step >= 5 && (
        <div className="mt-6">
          <p className="text-metric leading-none">{metric.value}</p>
          <p className="mt-2 text-body text-ink/70">{metric.label}</p>
        </div>
      )}
    </div>
  );
}

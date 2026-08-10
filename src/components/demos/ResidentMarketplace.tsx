"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { marketplaceDemo, sections } from "@/config/caseStudy";

export function ResidentMarketplace() {
  return (
    <div className="w-full max-w-md" aria-label="Community marketplace demonstration">
      <p className="text-label text-muted-dark mb-3">
        {sections.resident.marketplaceHeadline}
      </p>
      <GlassPanel variant="light" className="overflow-hidden">
        <div className="placeholder-surface aspect-[16/10] w-full" role="img" aria-label="Marketplace item image placeholder" />
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-xl font-medium">{marketplaceDemo.title}</h3>
            <p className="text-lg">{marketplaceDemo.price}</p>
          </div>
          <p className="mt-1 text-sm text-muted-dark">{marketplaceDemo.seller}</p>
          <div className="mt-5 space-y-2 border-t border-ink/8 pt-4">
            {marketplaceDemo.chat.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  m.from === "buyer"
                    ? "ml-auto bg-ink text-stone rounded-br-md"
                    : "bg-white/70 text-ink rounded-bl-md border border-ink/5"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

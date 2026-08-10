"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { aiNeighbourhoodDemos, businesses } from "@/config/businesses";
import { sections } from "@/config/caseStudy";

export function AIQuestionDemo({ phase }: { phase: number }) {
  const birthday = aiNeighbourhoodDemos[0];
  const cocktails = aiNeighbourhoodDemos[1];
  const results =
    phase < 0.55
      ? businesses.filter((b) => birthday.resultAnchors.includes(b.anchor))
      : businesses.filter((b) => cocktails.resultAnchors.includes(b.anchor));

  const query = phase < 0.55 ? birthday.query : cocktails.query;

  return (
    <div className="w-full max-w-xl" aria-label="Neighbourhood AI search demonstration">
      <p className="text-label text-muted-dark mb-2">{sections.dhsEarly.askHeadline}</p>
      <GlassPanel variant="light" className="p-5">
        <p className="text-sm text-muted-dark mb-2">Resident asks</p>
        <p className="text-lg font-medium">“{query}”</p>
        <div className="mt-6 grid gap-3">
          {results.map((biz) => (
            <div
              key={biz.id}
              className="rounded-2xl border border-ink/8 bg-white/55 p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{biz.name}</p>
                <p className="text-xs text-muted-dark">{biz.walkMinutes} min walk</p>
              </div>
              <p className="mt-1 text-sm text-muted-dark">{biz.category}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {biz.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {biz.sampleProduct && (
                <p className="mt-3 text-sm text-ink/80">
                  {biz.sampleProduct.title} · {biz.sampleProduct.price}
                </p>
              )}
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

"use client";

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
    <div aria-label="Neighbourhood AI search demonstration">
      <p className="text-label text-muted-dark">{sections.dhsEarly.askHeadline}</p>
      <p className="mt-4 text-lg font-medium tracking-tight text-ink">
        “{query}”
      </p>
      <div className="mt-5 grid gap-3">
        {results.map((biz) => (
          <div
            key={biz.id}
            className="rounded-2xl border border-ink/8 bg-white/60 px-4 py-3"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium text-ink">{biz.name}</p>
              <p className="text-xs text-muted-dark">
                {biz.walkMinutes} min walk
              </p>
            </div>
            <p className="mt-1 text-sm text-muted-dark">{biz.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

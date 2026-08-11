"use client";

import { sections } from "@/config/caseStudy";
import { businesses } from "@/config/businesses";
import { AIQuestionDemo } from "@/components/demos/AIQuestionDemo";
import { BusinessDashboard } from "@/components/demos/BusinessDashboard";
import { useScrollStore } from "@/store/scrollStore";

export function DhsEarlySection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "dhs-early" ? s.sectionProgress : 0,
  );

  // Longer hold on discovery + business beats so copy can be read
  const activeBizIndex =
    progress >= 0.32 && progress < 0.58
      ? Math.min(
          businesses.length - 1,
          Math.floor(((progress - 0.32) / 0.26) * businesses.length),
        )
      : -1;

  return (
    <section
      id="section-dhs-early"
      className="story-section--pin story-section--dhs"
      aria-labelledby="beyond-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-start py-[12vh]">
        <div className="container-wide grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="relative z-10 max-w-xl">
            {progress < 0.16 && (
              <div className="beyond-title dhs-beat">
                <h2
                  id="beyond-heading"
                  className="text-display editorial-type max-w-3xl"
                >
                  {sections.beyond.headline}
                </h2>
                <p className="mt-5 max-w-xl text-subhead text-ink/70">
                  {sections.beyond.supporting}
                </p>
              </div>
            )}

            {progress >= 0.16 && progress < 0.32 && (
              <div className="dhs-beat">
                <p className="text-label text-muted-dark">
                  {sections.dhsEarly.rewardsLine}
                </p>
                <h2 className="mt-3 text-display editorial-type">
                  {sections.dhsEarly.headline}
                </h2>
                <p className="mt-5 text-body text-ink/70">
                  {sections.dhsEarly.body}
                </p>
              </div>
            )}

            {progress >= 0.32 && progress < 0.58 && (
              <div className="dhs-beat">
                <p className="text-label text-muted-dark">Local businesses</p>
                <h3 className="mt-3 text-headline editorial-type">
                  Discover what&apos;s around you.
                </h3>
                <p className="mt-4 text-body text-ink/70">
                  Nearby places surface with the detail residents actually need —
                  category, walk time, and what makes them worth the visit.
                </p>
              </div>
            )}

            {progress >= 0.58 && progress < 0.76 && (
              <div className="dhs-beat">
                <AIQuestionDemo phase={progress} />
              </div>
            )}

            {progress >= 0.76 && (
              <div className="dhs-beat">
                <p className="text-label text-muted-dark">For local businesses</p>
                <h3 className="mt-3 text-headline editorial-type">
                  {sections.dhsEarly.businessHeadline}
                </h3>
                <p className="mt-4 text-body text-ink/70">
                  {sections.dhsEarly.businessBody}
                </p>
                <div className="mt-6">
                  <BusinessDashboard />
                </div>
              </div>
            )}
          </div>

          <div className="relative min-h-[240px] lg:min-h-[380px] lg:pt-6">
            {activeBizIndex >= 0
              ? businesses.map((biz, i) => (
                  <article
                    key={biz.id}
                    className={`dhs-biz-card ${
                      i === activeBizIndex
                        ? "dhs-biz-card--active"
                        : "dhs-biz-card--idle"
                    }`}
                    aria-hidden={i !== activeBizIndex}
                  >
                    <p className="dhs-biz-card__cat">{biz.category}</p>
                    <h3 className="dhs-biz-card__name">{biz.name}</h3>
                    <p className="dhs-biz-card__meta">
                      {biz.walkMinutes} min walk
                    </p>
                    <div className="dhs-biz-card__tags">
                      {biz.tags.slice(0, 3).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    {biz.sampleProduct ? (
                      <p className="dhs-biz-card__product">
                        {biz.sampleProduct.title}
                        <span>{biz.sampleProduct.price}</span>
                      </p>
                    ) : null}
                  </article>
                ))
              : null}
          </div>
        </div>
      </div>
    </section>
  );
}

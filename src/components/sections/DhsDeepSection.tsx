"use client";

import {
  businesses,
  dhsBusinessGains,
  dhsPublishable,
} from "@/config/businesses";
import { sections } from "@/config/caseStudy";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function DhsDeepSection() {
  return (
    <section
      id="section-dhs-deep"
      className="story-section--tall"
      aria-labelledby="dhs-deep-heading"
    >
      <div className="container-wide w-full py-20">
        <p className="text-label text-muted-dark">{sections.dhsDeep.bridge}</p>
        <h2 id="dhs-deep-heading" className="mt-4 text-display editorial-type max-w-3xl">
          {sections.dhsDeep.headline}
        </h2>
        <p className="mt-4 max-w-xl text-subhead text-ink/70">
          {sections.dhsDeep.supporting}
        </p>
        <p className="mt-6 max-w-2xl text-body text-ink/65">
          {sections.dhsDeep.notOffers}
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {businesses.map((biz) => (
            <GlassPanel key={biz.id} variant="light" className="p-5">
              <p className="text-label text-muted-dark">{biz.category}</p>
              <h3 className="mt-2 text-xl font-medium">{biz.name}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {biz.distinctives.map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/75"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {biz.tags.map((t) => (
                  <span key={t} className="text-xs text-muted-dark">
                    {t}
                  </span>
                ))}
              </div>
            </GlassPanel>
          ))}
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-label text-muted-dark mb-3">Businesses can publish</p>
            <ul className="columns-2 gap-6 text-sm text-ink/75 space-y-2">
              {dhsPublishable.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-label text-muted-dark mb-3">Businesses gain</p>
            <ul className="space-y-2 text-sm text-ink/75">
              {dhsBusinessGains.map((item) => (
                <li key={item}>— {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

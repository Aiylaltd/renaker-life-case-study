"use client";

import { sections } from "@/config/caseStudy";

export function PlacemakingSection() {
  return (
    <section
      id="section-placemaking"
      className="story-section"
      aria-labelledby="placemaking-heading"
    >
      <div className="container-narrow w-full text-center">
        <h2 id="placemaking-heading" className="text-display editorial-type">
          {sections.placemaking.headline}
        </h2>
        <ul className="mt-10 space-y-3 text-subhead text-ink/70">
          {sections.placemaking.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-12 text-body text-ink/65">
          {sections.placemaking.philosophy}
        </p>
      </div>
    </section>
  );
}

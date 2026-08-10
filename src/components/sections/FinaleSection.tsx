"use client";

import { brand, sections } from "@/config/caseStudy";
import { Button } from "@/components/ui/Button";
import { useScrollStore } from "@/store/scrollStore";

export function FinaleSection() {
  const orb = useScrollStore((s) => s.orbReveal);

  return (
    <section
      id="section-finale"
      className="story-section--tall"
      aria-labelledby="finale-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center justify-center py-16">
        <div className="container-narrow text-center">
          <p
            className={`text-label tracking-[0.2em] transition-opacity duration-700 ${
              orb < 0.4 ? "opacity-100 text-ink/70" : "opacity-40 text-ink/50"
            }`}
          >
            {brand.product}
          </p>
          <h2
            id="finale-heading"
            className={`mt-6 text-display transition-all duration-1000 ${
              orb > 0.35 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {sections.finale.brand}
          </h2>
          <p
            className={`mt-5 text-subhead text-ink/70 transition-opacity duration-700 ${
              orb > 0.5 ? "opacity-100" : "opacity-0"
            }`}
          >
            {sections.finale.line}
          </p>
          <p
            className={`mt-3 text-body text-ink/60 transition-opacity duration-700 ${
              orb > 0.65 ? "opacity-100" : "opacity-0"
            }`}
          >
            {sections.finale.supporting}
          </p>
          <div
            className={`mt-10 transition-opacity duration-700 ${
              orb > 0.8 ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button href="https://aiyla.co.uk" external theme="light">
              Explore Aiyla
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

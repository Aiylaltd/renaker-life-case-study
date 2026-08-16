"use client";

import { sections } from "@/config/caseStudy";
import { Button } from "@/components/ui/Button";
import { RenakerLifeLogo } from "@/components/ui/RenakerLifeLogo";
import { FinaleLiquidOrb } from "@/components/liquid-bubble/FinaleLiquidOrb";
import { useScrollStore } from "@/store/scrollStore";

export function FinaleSection() {
  const sectionId = useScrollStore((s) => s.sectionId);
  const orb = useScrollStore((s) => s.orbReveal);
  const year = new Date().getFullYear();

  // Latch once — avoid scroll-tied opacity that flickers mid-section
  const inFinale = sectionId === "finale" && orb > 0.08;

  return (
    <section
      id="section-finale"
      className={`story-section--finale ${inFinale ? "is-active" : ""}`}
      aria-labelledby="finale-heading"
    >
      <div className="finale-blackout" aria-hidden />

      <div className="finale-stage">
        <div className={`finale-content ${inFinale ? "is-on" : ""}`}>
          <div className="finale-logo">
            <RenakerLifeLogo variant="light" />
          </div>

          <FinaleLiquidOrb active={inFinale} />

          <h2 id="finale-heading" className="finale-line">
            {sections.finale.line}
          </h2>

          <div className="finale-actions">
            <Button href="https://aiyla.co.uk" external theme="dark">
              Visit Aiyla
            </Button>
            <Button
              href="https://renakerlife.com"
              external
              theme="dark"
              variant="secondary"
            >
              View Renaker Life
            </Button>
          </div>

          <div className="finale-contact">
            <p className="finale-contact__eyebrow">Contact Aiyla</p>
            <p className="finale-contact__body">
              For enquiries about how Aiyla can enhance your real estate,
              contact us here
            </p>
            <Button
              href="mailto:hello@aiyla.co.uk"
              theme="dark"
              className="finale-contact__btn"
            >
              Contact
            </Button>
          </div>

          <p className="finale-legal">
            © {year} Aiyla LTD. Renaker belongs to Renaker Build.
          </p>
        </div>
      </div>
    </section>
  );
}

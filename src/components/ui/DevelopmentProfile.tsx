"use client";

import type { Development } from "@/config/developments";

export function DevelopmentProfile({
  development,
  visible,
  side = "left",
}: {
  development: Development;
  visible: boolean;
  side?: "left" | "right";
}) {
  return (
    <article
      className={`dev-profile glass-panel overflow-hidden ${
        visible ? "dev-profile--in" : "dev-profile--out"
      } ${side === "right" ? "ml-auto" : ""}`}
      aria-hidden={!visible}
    >
      <div className="dev-profile__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={development.image}
          alt={development.imageAlt}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="px-5 py-5 md:px-6 md:py-6">
        <p className="text-label text-muted-dark">{development.location}</p>
        <h3 className="dev-profile__title mt-2 text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]">
          {development.name}
        </h3>
        <p className="mt-2 text-sm text-ink/55">{development.homes}</p>
        <p className="mt-4 flex items-center gap-2 text-sm text-ink/70">
          <span className="status-pulse status-pulse--accent" aria-hidden />
          {development.statusLine}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/55">
          {development.shortLine}
        </p>
      </div>
    </article>
  );
}

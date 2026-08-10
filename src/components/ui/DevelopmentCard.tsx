"use client";

import Image from "next/image";
import type { Development } from "@/config/developments";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function DevelopmentCard({
  development,
  visible,
}: {
  development: Development;
  visible: boolean;
}) {
  return (
    <div
      className={`w-full max-w-sm transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      {visible && (
        <GlassPanel variant="light" className="dev-card-enter p-4 md:p-5">
          <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded-[1rem]">
            <Image
              src={development.image}
              alt={development.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 320px"
              priority={false}
            />
          </div>
          <p className="text-label text-muted-dark">{development.location}</p>
          <h3 className="mt-1 text-xl font-medium tracking-tight md:text-2xl">
            {development.name}
          </h3>
          <p className="mt-2 text-sm text-ink/70">{development.homes}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-ink/80">
            <span className="status-pulse" aria-hidden />
            <span>{development.statusLine}</span>
          </div>
          <p className="mt-3 text-sm text-muted-dark">{development.shortLine}</p>
        </GlassPanel>
      )}
    </div>
  );
}

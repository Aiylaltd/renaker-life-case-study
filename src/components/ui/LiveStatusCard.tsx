"use client";

import { useEffect, useState } from "react";
import type { Development } from "@/config/developments";

export function LiveStatusCard({
  development,
  visible,
}: {
  development: Development;
  visible: boolean;
}) {
  const [cursor, setCursor] = useState(0);
  const feed = development.liveFeed;

  useEffect(() => {
    if (!visible || feed.length === 0) return;
    setCursor(0);
    const id = window.setInterval(() => {
      setCursor((c) => (c + 1) % feed.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [visible, development.id, feed.length]);

  const items = [
    feed[cursor % feed.length],
    feed[(cursor + 1) % feed.length],
    feed[(cursor + 2) % feed.length],
  ].filter(Boolean);

  return (
    <aside
      className={`live-status glass-panel glass-panel-light ${
        visible ? "live-status--in" : "live-status--out"
      }`}
      aria-hidden={!visible}
      aria-label={`${development.name} live status`}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <p className="text-label tracking-[0.16em] text-ink/55">Live status</p>
        <span className="status-pulse status-pulse--accent" aria-hidden />
      </div>
      <ul className="mt-3 space-y-0 px-2 pb-3">
        {items.map((item, i) => (
          <li
            key={`${item.time}-${item.title}-${i}`}
            className="live-status__row"
            style={{ opacity: 1 - i * 0.22 }}
          >
            <span className="live-status__time">{item.time}</span>
            <div>
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="text-xs text-ink/50">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

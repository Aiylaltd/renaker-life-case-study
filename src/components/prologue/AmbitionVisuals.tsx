"use client";

import { useEffect, useRef, useState } from "react";
import type { PrologueAmbitionId } from "@/config/prologue";
import { managementReportDemo } from "@/config/caseStudy";

function useOnceActive(active: boolean) {
  const [on, setOn] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    if (!active || played.current) return;
    played.current = true;
    setOn(true);
  }, [active]);

  return on;
}

function ResidentVisual({ active }: { active: boolean }) {
  const on = useOnceActive(active);

  return (
    <div className={`prologue-duo ${on ? "is-on" : ""}`} aria-label="Resident web and app">
      <div className="prologue-duo__web">
        <div className="prologue-duo__chrome">
          <span />
          <span />
          <span />
          <p>renaker.life</p>
        </div>
        <div className="prologue-duo__web-body">
          <aside className="prologue-duo__side">
            <p className="prologue-duo__greet">Hi Michael</p>
            <p className="prologue-duo__muted">Deansgate Square</p>
            <div className="prologue-duo__pill">Active</div>
          </aside>
          <div className="prologue-duo__main">
            <div className="prologue-duo__hero">
              <p className="prologue-duo__label">Home</p>
              <p className="prologue-duo__hero-title">Deansgate Square</p>
            </div>
            <div className="prologue-duo__rows">
              <div className="prologue-duo__row">
                <span>Parcel ready</span>
                <em>Collect</em>
              </div>
              <div className="prologue-duo__row">
                <span>Gym booked</span>
                <em>Today 18:00</em>
              </div>
              <div className="prologue-duo__row is-ai">
                <span>Ask Aiyla</span>
                <em>Open</em>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="prologue-duo__phone">
        <p className="prologue-duo__phone-greet">Good evening</p>
        <p className="prologue-duo__phone-name">Caitlin</p>
        <div className="prologue-duo__actions">
          <span>Amenities</span>
          <span>Requests</span>
          <span>Community</span>
        </div>
        <div className="prologue-duo__today">
          <p className="prologue-duo__label">Today</p>
          <div className="prologue-duo__note">
            <strong>Parcel arriving</strong>
            <span>Amazon · lobby</span>
          </div>
          <div className="prologue-duo__note">
            <strong>Fire alarm test</strong>
            <span>10:00 · building</span>
          </div>
          <div className="prologue-duo__note is-ai">
            <strong>Aiyla answered</strong>
            <span>Hob child lock</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OperationsVisual({ active }: { active: boolean }) {
  const on = useOnceActive(active);

  return (
    <div
      className={`prologue-duo prologue-duo--ops ${on ? "is-on" : ""}`}
      aria-label="Building operations web and app"
    >
      <div className="prologue-duo__web">
        <div className="prologue-duo__chrome">
          <span />
          <span />
          <span />
          <p>operations</p>
        </div>
        <div className="prologue-duo__web-body prologue-duo__web-body--ops">
          <aside className="prologue-duo__side">
            <p className="prologue-duo__greet">Building team</p>
            <p className="prologue-duo__muted">Crown Street</p>
            <div className="prologue-duo__nav">
              <span className="is-active">Tasks</span>
              <span>Messages</span>
              <span>Compliance</span>
            </div>
          </aside>
          <div className="prologue-duo__main">
            <div className="prologue-ops__top">
              <div className="prologue-ops__chart">
                <p className="prologue-duo__label">Today</p>
                <div className="prologue-ops__bars" aria-hidden>
                  <i style={{ height: "42%" }} />
                  <i style={{ height: "68%" }} />
                  <i style={{ height: "55%" }} />
                  <i style={{ height: "86%" }} />
                  <i style={{ height: "62%" }} />
                  <i className="is-live" style={{ height: "74%" }} />
                </div>
                <p className="prologue-ops__chart-meta">24 open · 11 AI routed</p>
              </div>
              <div className="prologue-ops__compliance">
                <p className="prologue-duo__label">Compliance</p>
                <p className="prologue-ops__score">98%</p>
                <p className="prologue-ops__chart-meta">Checks on track</p>
              </div>
            </div>
            <div className="prologue-duo__rows">
              <div className="prologue-duo__row is-ai">
                <span>AI routed · Leak A1204</span>
                <em>High</em>
              </div>
              <div className="prologue-duo__row">
                <span>Parcel backlog · lobby</span>
                <em>Assigned</em>
              </div>
              <div className="prologue-duo__row">
                <span>Fire door inspection</span>
                <em>Due</em>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="prologue-duo__phone">
        <p className="prologue-duo__phone-greet">Live board</p>
        <p className="prologue-duo__phone-name">Tasks</p>
        <div className="prologue-duo__actions">
          <span>Queue</span>
          <span>Chat</span>
          <span>Checks</span>
        </div>
        <div className="prologue-duo__today">
          <p className="prologue-duo__label">AI routed</p>
          <div className="prologue-duo__note is-ai">
            <strong>Leak · kitchen sink</strong>
            <span>Routed to building team</span>
          </div>
          <div className="prologue-duo__note">
            <strong>Resident message</strong>
            <span>“Any update on my parcel?”</span>
          </div>
          <div className="prologue-duo__note">
            <strong>Compliance due</strong>
            <span>Lift log · today 16:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManagementVisual({ active }: { active: boolean }) {
  const on = useOnceActive(active);

  return (
    <div className="prologue-dash">
      <p className="prologue-dash__label">Management view</p>
      <p className="mt-5 text-sm text-stone/50">Portfolio · this week</p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Open requests", value: "128" },
          { label: "AI resolved", value: "64%" },
          { label: "Avg. response", value: "2.1h" },
        ].map((m) => (
          <div key={m.label} className={`prologue-stat ${on ? "is-on" : ""}`}>
            <p className="text-2xl font-medium tracking-tight text-stone">
              {m.value}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-stone/40">
              {m.label}
            </p>
          </div>
        ))}
      </div>
      <div className={`mt-6 prologue-insight ${on ? "is-on" : ""}`}>
        <p className="text-[11px] uppercase tracking-[0.14em] text-accent">
          AI insight
        </p>
        <p className="mt-2 text-sm text-stone/80">
          {managementReportDemo.issues[0]?.title}
        </p>
      </div>
    </div>
  );
}

function CityVisual({ active }: { active: boolean }) {
  const on = useOnceActive(active);

  const layers = [
    {
      label: "AI recommended",
      title: "Nearby for you",
      detail: "Deansgate Market · 4 min walk",
      meta: "Based on residents like you",
    },
    {
      label: "AI locations",
      title: "Products in the neighbourhood",
      detail: "Fresh bread · Castlefield Bakery",
      meta: "In stock · 0.2 mi",
    },
    {
      label: "AI offers",
      title: "Tonight only",
      detail: "2-for-1 flat whites · Copper Café",
      meta: "For Renaker Life residents",
    },
  ];

  return (
    <div className="prologue-city">
      <div className="prologue-city__head">
        <p className="prologue-dash__label">Connected city</p>
        <p className="prologue-city__ask">
          “What’s good around Deansgate Square tonight?”
        </p>
      </div>

      <ul className="prologue-city__layers">
        {layers.map((layer, i) => (
          <li
            key={layer.label}
            className={`prologue-city__card ${on ? "is-on" : ""}`}
            style={{ transitionDelay: on ? `${i * 110}ms` : "0ms" }}
          >
            <p className="prologue-city__ai">{layer.label}</p>
            <p className="prologue-city__title">{layer.title}</p>
            <p className="prologue-city__detail">{layer.detail}</p>
            <p className="prologue-city__meta">{layer.meta}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AmbitionVisual({
  id,
  active,
}: {
  id: PrologueAmbitionId;
  active: boolean;
}) {
  switch (id) {
    case "resident":
      return <ResidentVisual active={active} />;
    case "operations":
      return <OperationsVisual active={active} />;
    case "management":
      return <ManagementVisual active={active} />;
    case "city":
      return <CityVisual active={active} />;
  }
}

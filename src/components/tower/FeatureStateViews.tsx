"use client";

import type { FeatureState } from "@/config/towerChapters";

function ChatBlock({
  lines,
  dimmed,
  userLabel = "Resident",
}: {
  lines: NonNullable<FeatureState["chat"]>;
  dimmed?: boolean;
  userLabel?: string;
}) {
  return (
    <div className={`tower-chat ${dimmed ? "tower-chat--dim" : ""}`}>
      {lines.map((line, i) => (
        <div
          key={`${line.role}-${i}`}
          className={`tower-chat__row tower-chat__row--${line.role}`}
        >
          <span className="tower-chat__role">
            {line.role === "resident" ? userLabel : "AI"}
          </span>
          <p className="tower-chat__text">{line.text}</p>
        </div>
      ))}
    </div>
  );
}

export function FeatureStateViews({ state }: { state: FeatureState }) {
  switch (state.kind) {
    case "chat":
      return state.chat ? <ChatBlock lines={state.chat} /> : null;

    case "chat-locale":
      return (
        <div className="tower-locale">
          {state.chat ? (
            <ChatBlock lines={state.chat} dimmed />
          ) : null}
          {state.chatLocale ? (
            <div className="tower-locale__fade">
              <ChatBlock lines={state.chatLocale} />
            </div>
          ) : null}
          {state.localeNote ? (
            <p className="tower-feature__note">{state.localeNote}</p>
          ) : null}
        </div>
      );

    case "services": {
      const tiles =
        state.serviceTiles ??
        (state.categories ?? []).map((label) => ({
          label,
          image: "",
        }));
      return (
        <div className="tower-services">
          {state.brandLogo ? (
            <div className="tower-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.brandLogo}
                alt={state.brandLogoAlt ?? "Brand"}
                className="tower-brand__logo"
              />
            </div>
          ) : null}
          <div className="tower-services__grid">
            {tiles.map((tile) => (
              <div key={tile.label} className="tower-services__tile">
                {tile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tile.image}
                    alt=""
                    className="tower-services__tile-image"
                  />
                ) : null}
                <span className="tower-services__tile-label">{tile.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "journey":
      return (
        <div className="tower-services">
          {state.brandLogo ? (
            <div className="tower-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.brandLogo}
                alt={state.brandLogoAlt ?? "Brand"}
                className="tower-brand__logo"
              />
            </div>
          ) : null}
          <ol className="tower-journey">
            {(state.journeySteps ?? []).map((step, i) => (
              <li key={step} className="tower-journey__step">
                <span className="tower-journey__index">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "human":
      if (!state.human) return null;
      return (
        <div
          className={`tower-human ${
            state.human.image ? "tower-human--featured" : ""
          }`}
        >
          {state.brandLogo ? (
            <div className="tower-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.brandLogo}
                alt={state.brandLogoAlt ?? "Brand"}
                className="tower-brand__logo"
              />
            </div>
          ) : null}
          <div className="tower-human__portrait">
            {state.human.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.human.image}
                alt={state.human.imageAlt ?? state.human.name}
              />
            ) : (
              <span aria-hidden>{state.human.name.slice(0, 1)}</span>
            )}
          </div>
          <div className="tower-human__copy">
            <p className="tower-human__name">{state.human.name}</p>
            <p className="tower-human__value">{state.human.value}</p>
            <p className="tower-human__detail">{state.human.detail}</p>
          </div>
        </div>
      );

    case "ops-flow":
      return (
        <div className="tower-ops">
          {state.chat ? <ChatBlock lines={state.chat} /> : null}
          <ol className="tower-ops__steps">
            {(state.opsSteps ?? []).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      );

    case "comms":
      return (
        <div className="tower-comms">
          {state.opsPrompt ? (
            <blockquote className="tower-comms__prompt">
              “{state.opsPrompt}”
            </blockquote>
          ) : null}
          {state.opsResult ? (
            <div className="tower-comms__draft">
              <p className="tower-comms__draft-label">Draft announcement</p>
              <p className="tower-comms__draft-body">{state.opsResult}</p>
              <p className="tower-comms__status">Ready for review</p>
            </div>
          ) : null}
        </div>
      );

    case "consolidate": {
      const unified = state.id.includes("unified") || state.id.includes("outcome");
      return (
        <div
          className={`tower-consolidate ${
            unified ? "tower-consolidate--unified" : ""
          }`}
        >
          <ul className="tower-consolidate__list">
            {(state.functions ?? []).map((fn, i) => (
              <li key={fn} style={{ ["--i" as string]: i }}>
                {fn}
              </li>
            ))}
          </ul>
          {unified ? (
            <p className="tower-consolidate__mark">Renaker Life</p>
          ) : null}
        </div>
      );
    }

    case "management":
      return (
        <div className="tower-mgmt">
          {state.chat ? (
            <ChatBlock lines={state.chat} userLabel="You" />
          ) : null}
          {state.opsPrompt ? (
            <blockquote
              className={`tower-comms__prompt ${
                state.opsResult ? "tower-comms__prompt--echo" : ""
              }`}
            >
              “{state.opsPrompt}”
            </blockquote>
          ) : null}
          {state.opsResult ? (
            <div className="tower-mgmt__answer tower-mgmt__answer--enter">
              <p className="tower-comms__draft-label">AI response</p>
              <p className="tower-mgmt__answer-body">{state.opsResult}</p>
            </div>
          ) : null}
          {state.comparisons?.length ? (
            <div className="tower-mgmt__compare">
              {state.comparisonLabel ? (
                <p className="tower-comms__draft-label">
                  {state.comparisonLabel}
                </p>
              ) : null}
              <ul className="tower-mgmt__bars">
                {state.comparisons.map((row) => (
                  <li key={row.name}>
                    <div className="tower-mgmt__bar-meta">
                      <span>{row.name}</span>
                      <span>{row.value}</span>
                    </div>
                    <div className="tower-mgmt__bar-track">
                      <div
                        className="tower-mgmt__bar-fill"
                        style={{ width: `${Math.max(8, row.value)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {state.opsSteps ? (
            <div className="tower-mgmt__report">
              <p className="tower-comms__draft-label">
                Illustrative report structure
              </p>
              <ul>
                {state.opsSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {state.outcomeNote ? (
            <p className="tower-feature__note">{state.outcomeNote}</p>
          ) : null}
        </div>
      );

    case "outcome":
      return (
        <div
          className={`tower-outcome ${
            state.outcomeValue ? "" : "tower-outcome--copy"
          }`}
        >
          {state.outcomeValue ? (
            <p className="tower-outcome__value">{state.outcomeValue}</p>
          ) : null}
          <p className="tower-outcome__label">{state.outcomeLabel}</p>
          {state.outcomeNote ? (
            <p className="tower-feature__note">{state.outcomeNote}</p>
          ) : null}
        </div>
      );

    default:
      return null;
  }
}

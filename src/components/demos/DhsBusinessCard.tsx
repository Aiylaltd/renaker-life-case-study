"use client";

import type { DhsPartnerBusiness } from "@/config/dhsWalkthrough";

/** Screen-space partner card — always readable while the map pin lights up. */
export function DhsBusinessCard({
  business,
}: {
  business: DhsPartnerBusiness;
}) {
  return (
    <article className="dhs-map-card dhs-map-card--screen" aria-label={business.name}>
      <div className="dhs-map-card__media">
        <img
          className="dhs-map-card__header"
          src={business.header}
          alt=""
        />
        <img className="dhs-map-card__logo" src={business.logo} alt="" />
      </div>
      <div className="dhs-map-card__body">
        <p className="dhs-map-card__cat">{business.category}</p>
        <h3 className="dhs-map-card__name">{business.name}</h3>
        <p className="dhs-map-card__meta">{business.distance}</p>
        <div className="dhs-map-card__offers">
          {business.offers.map((offer) => (
            <div key={offer.label} className="dhs-map-card__offer">
              {offer.detail ? (
                <p className="dhs-map-card__offer-detail">{offer.detail}</p>
              ) : null}
              <p className="dhs-map-card__offer-label">{offer.label}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

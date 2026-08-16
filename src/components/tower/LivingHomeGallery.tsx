"use client";

/** Plain utility list — no phone chrome. */
export function LivingHomeGallery() {
  const rows = [
    {
      tag: "Amenity",
      title: "Sky lounge booked",
      detail: "Tomorrow · 18:00–20:00",
    },
    {
      tag: "Parcels",
      title: "Parcel ready",
      detail: "Amazon · Collect from lobby",
    },
    {
      tag: "Requests",
      title: "Service request",
      detail: "Kitchen leak · With building team",
      ai: true,
    },
    {
      tag: "Building info",
      title: "Gym hours updated",
      detail: "Level 2 · Open until 22:00",
    },
    {
      tag: "Notice",
      title: "Fire alarm test",
      detail: "Tuesday 10:00 · All residents",
    },
  ];

  return (
    <ul className="tower-moments" aria-label="Everyday living">
      {rows.map((row, i) => (
        <li
          key={row.title}
          className={`tower-moments__card ${row.ai ? "is-ai" : ""}`}
          style={{ ["--i" as string]: i }}
        >
          <p className="tower-moments__meta">{row.tag}</p>
          <p className="tower-moments__title">{row.title}</p>
          <p className="tower-moments__detail">{row.detail}</p>
        </li>
      ))}
    </ul>
  );
}

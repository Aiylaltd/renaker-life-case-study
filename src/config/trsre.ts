export const trsreCopy = {
  headline: "Discover your city.",
  supporting:
    "An interactive TRSRE hunt with 300+ codes hidden around Manchester — so younger residents explore their city, engage with real places, and win prizes.",
  mapLine:
    "Easy, medium and hard pins mark the hunt across the map. Find a code. Unlock a prize. See more of the city.",
  contrastNote:
    "A deliberate contrast between the digital map and real people experiencing Manchester.",
};

export const trsrePins = {
  easy: "/images/trsre/pins/easy-event.png",
  medium: "/images/trsre/pins/medium-event.png",
  hard: "/images/trsre/pins/hard-event.png",
  easySvg: "/images/trsre/pins/easy-event.svg",
  mediumSvg: "/images/trsre/pins/medium-event.svg",
  hardSvg: "/images/trsre/pins/hard-event.svg",
} as const;

export type TrsrePinDifficulty = "easy" | "medium" | "hard";

export const trsreImages = {
  /** Opening hero — pumpkin over the city */
  heroCity: "/images/trsre/hero-city.jpg",
  bunny: "/images/trsre/bunny.jpg",
  explore: "/images/trsre/explore.jpg",
  hunt1: "/images/trsre/hunt-1.jpg",
  hunt2: "/images/trsre/hunt-2.jpg",
  /** Final slide — prize cheque presentation */
  cheque: "/images/trsre/cheque.jpg",
  hunt3: "/images/trsre/hunt-3.jpg",
  hunt4: "/images/trsre/hunt-4.jpg",
  hunt5: "/images/trsre/hunt-5.jpg",
  quote: "/images/trsre/quote.jpg",
} as const;

export const trsreCopy = {
  introLabel: "TRSRE",
  introHeadline: "Gamified Local Area Exploration",
  introBody:
    "For demographics young and old, we deployed TRSRE. A real world interactive treasure hunt hidden around Manchester and beyond.",
  codesLabel: "TRSRE",
  codesHeadline: "Over 300\nhidden TRSRE codes",
  codesBody:
    "Residents battle it out to discover hidden TRSRE codes across the city during Easter and Halloween — turning digital engagement into real-world exploration, always to critical acclaim.",
  headline: "Discover your city.",
  supporting:
    "An interactive TRSRE hunt with 300+ codes hidden around Manchester — so younger residents explore their city, engage with real places, and win prizes.",
  mapLine:
    "Thousands of residents compete to find as many treasure hunts as possible in the allotted time. With top players completing over 30,000 steps and hundreds of hunts, discovering new parts of the area and beyond.",
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
  /** Exploration / 30k steps card */
  stepsMap: "/images/trsre/steps-map.png",
  stepsHunt: "/images/trsre/steps-hunt.png",
  stepsApp: "/images/trsre/steps-app.png",
} as const;

/** Autoplay loop — muted inline MP4 (prefer over GIF for quality/size) */
export const trsreVideos = {
  halloween: "/videos/trsre-halloween.mp4",
} as const;

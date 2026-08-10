import type { AnchorName } from "./scene";

/**
 * PLACEHOLDER businesses — do not invent real brand names.
 * Replace with Renaker Life Rewards partners when available.
 */

export interface Business {
  id: string;
  anchor: AnchorName;
  name: string;
  category: string;
  walkMinutes: number;
  tags: string[];
  distinctives: string[];
  sampleProduct?: { title: string; price: string };
}

export const businesses: Business[] = [
  {
    id: "biz-1",
    anchor: "ANCHOR_BIZ1",
    name: "Neighbourhood Gift Studio",
    category: "Independent retail",
    walkMinutes: 6,
    tags: ["Gifts", "Children", "Independent", "Under £50"],
    distinctives: ["Curated children's gifts", "Local makers", "Gift wrap"],
    sampleProduct: { title: "Handmade story kit", price: "£28" },
  },
  {
    id: "biz-2",
    anchor: "ANCHOR_BIZ2",
    name: "Canal Terrace Kitchen",
    category: "Food & drink",
    walkMinutes: 8,
    tags: ["Cocktails", "Terrace", "Open tonight", "Outdoor seating"],
    distinctives: ["Heated terrace", "Cocktail list", "Open until 11pm"],
    sampleProduct: { title: "Terrace cocktail set", price: "from £12" },
  },
  {
    id: "biz-3",
    anchor: "ANCHOR_BIZ3",
    name: "Evening Room",
    category: "Culture & hospitality",
    walkMinutes: 10,
    tags: ["Live music", "Tonight", "0.6 miles"],
    distinctives: ["Live sets", "Late kitchen", "Dog friendly"],
    sampleProduct: { title: "Tonight's live set", price: "Free entry" },
  },
];

export const aiNeighbourhoodDemos = [
  {
    id: "birthday",
    query: "I need a birthday present for my niece.",
    resultAnchors: ["ANCHOR_BIZ1", "ANCHOR_BIZ3"] as AnchorName[],
  },
  {
    id: "cocktails",
    query: "Where can we have cocktails outside tonight?",
    resultAnchors: ["ANCHOR_BIZ2"] as AnchorName[],
    metaTags: ["Cocktails", "Terrace", "Open tonight", "8 min walk"],
  },
];

/** Illustrative dashboard metrics — not verified Renaker statistics. */
export const businessDashboardDemo = {
  disclaimer: "Illustrative demo data — not verified Renaker statistics.",
  metrics: [
    { label: "Profile views", value: "2,840" },
    { label: "Post views", value: "6,120" },
    { label: "Search appearances", value: "1,905" },
    { label: "Product views", value: "980" },
    { label: "Click-throughs", value: "412" },
    { label: "Redemptions", value: "96" },
  ],
};

export const dhsPublishable = [
  "Products",
  "Menus",
  "Posts",
  "Events",
  "Opening information",
  "Facilities",
  "Experiences",
  "Services",
  "Images",
  "Offers where appropriate",
  "Unique attributes",
];

export const dhsBusinessGains = [
  "Search visibility",
  "Profile views",
  "Post views",
  "Click-throughs",
  "Redemptions",
  "Customer discovery",
  "Measurable engagement",
];

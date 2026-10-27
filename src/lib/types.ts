export const SITE_TYPES = ["clothing", "restaurant", "news"] as const;

export type SiteType = (typeof SITE_TYPES)[number];

export type Locale = "en" | "zh";

export type Side = "left" | "right";

export type Enjoyment = "left" | "right" | "both" | "neither" | "too_different";

export type OriginChoice = Side | "unsure";

export const REASON_TAGS = [
  "layout",
  "colors",
  "images",
  "fonts",
  "density",
  "wording",
  "feel",
  "other",
] as const;

export type ReasonTag = (typeof REASON_TAGS)[number];

export type ReasonRow = "enjoyment" | "familiarity" | "origin";

export type ReasonTags = Record<ReasonRow, ReasonTag[]>;

export type ManifestSite = {
  id: string;
  type: SiteType;
  country: "US" | "China";
  model: string;
  createdAt: string;
};

export type Manifest = {
  generatedAt: string;
  note: string;
  sites: ManifestSite[];
};

export type Sides = Record<SiteType, { left: string; right: string }>;

export type CurrentPair = {
  locale: Locale;
  pairIndex: number;
  pairCount: number;
  siteType: SiteType;
  leftId: string;
  rightId: string;
};

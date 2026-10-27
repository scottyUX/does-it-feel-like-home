export const SITE_TYPES = [
  "clothing",
  "restaurant",
  "news",
  "social-media",
  "travel",
  "bank",
  "food-delivery",
  "beauty-salon",
  "learning",
  "home-cleaning",
] as const;

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
  sessionId: string;
  tourDone: boolean;
  locale: Locale;
  pairIndex: number;
  pairCount: number;
  siteType: SiteType;
  leftId: string;
  rightId: string;
};

export type ReasonOther = Record<ReasonRow, string>;
export type WebsiteSide = "a" | "b";
export type MarkShape = "box" | "circle" | "highlight";
export type WebsiteMark = {
  id: string;
  side: WebsiteSide;
  shape: MarkShape;
  x: number;
  y: number;
  width: number;
  height: number;
  page: string;
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  note: string;
  screenshot?: string;
};
export type PairMetrics = {
  viewingMs: Record<WebsiteSide, number>;
  tabSwitches: number;
  pages: Record<WebsiteSide, string[]>;
  currentPage: Record<WebsiteSide, string>;
  scroll: Record<WebsiteSide, { x: number; y: number }>;
  loadFailures: { side: WebsiteSide; page: string; at: string }[];
  brokenImages: Record<string, number>;
  answerTimes: number[];
  startedAt: string;
};
export type PairDraft = {
  step: number;
  enjoyment: Enjoyment | "";
  leftScore: number | null;
  rightScore: number | null;
  origin: OriginChoice | "";
  tags: ReasonTags;
  other: ReasonOther;
  note: string;
  seen: WebsiteSide[];
  metrics: PairMetrics;
  marks: WebsiteMark[];
  tourDone: boolean;
};

import type { PairDraft } from "@/lib/types";

export const emptyPairDraft = (): PairDraft => ({
  step: 0,
  enjoyment: "",
  leftScore: null,
  rightScore: null,
  origin: "",
  tags: { enjoyment: [], familiarity: [], origin: [] },
  other: { enjoyment: "", familiarity: "", origin: "" },
  note: "",
  seen: ["a"],
  marks: [],
  tourDone: false,
  metrics: {
    viewingMs: { a: 0, b: 0 },
    tabSwitches: 0,
    pages: { a: [], b: [] },
    currentPage: { a: "", b: "" },
    scroll: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
    loadFailures: [],
    brokenImages: {},
    answerTimes: [],
    startedAt: new Date().toISOString(),
  },
});

// Keep client-supplied research data bounded and strip screenshots from autosaves.
export const sanitizeDraft = (input: unknown): PairDraft | null => {
  if (!input || typeof input !== "object") return null;
  const state = input as PairDraft;
  if (!Number.isInteger(state.step) || state.step < 0 || state.step > 3)
    return null;
  if (
    !state.metrics ||
    !state.tags ||
    !state.other ||
    !Array.isArray(state.marks)
  )
    return null;
  if (JSON.stringify(state).length > 150_000) return null;
  return {
    ...state,
    metrics: {
      ...state.metrics,
      currentPage: state.metrics.currentPage ?? { a: "", b: "" },
    },
    note: String(state.note ?? "").slice(0, 1000),
    other: {
      enjoyment: String(state.other.enjoyment ?? "").slice(0, 200),
      familiarity: String(state.other.familiarity ?? "").slice(0, 200),
      origin: String(state.other.origin ?? "").slice(0, 200),
    },
    marks: state.marks
      .slice(0, 20)
      .map((mark) => ({ ...mark, screenshot: undefined })),
  };
};

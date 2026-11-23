"use client";

import { useMemo, useState } from "react";
import { ArenaModelMark } from "@/components/arena-model-mark";

type Pair = { id: string; model_a: string; model_b: string; category: string };
type Candidate = { leaderboard_model: string; score: number | null; published: string | null; status: string };
type Score = { dataset_model: string; leaderboard_model: string | null; score: number | null; published: string | null; mapping: string; status: string; candidates?: Candidate[] };
export type ScoreFile = { cutoff: string; category: string; pairs: Record<string, { a: Score; b: Score }> };

function scoreValues(model: string, score?: Score): number[] | null {
  if (!score || score.dataset_model !== model) return null;
  if (score.mapping === "provisional_candidates") {
    if (!score.candidates?.length || score.candidates.some((candidate) => candidate.status !== "available" || typeof candidate.score !== "number" || !Number.isFinite(candidate.score) || !candidate.published || candidate.published > "2026-07-31")) return null;
    return score.candidates.map((candidate) => candidate.score as number);
  }
  return score.status === "available" && typeof score.score === "number" && Number.isFinite(score.score) && !!score.published && score.published <= "2026-07-31" ? [score.score] : null;
}

function scoreGap(pair: Pair, scores: ScoreFile | null): number | null {
  if (!scores || scores.cutoff !== "2026-07-31" || scores.category !== "overall") return null;
  const row = scores.pairs?.[pair.id];
  const first = scoreValues(pair.model_a, row?.a);
  const second = scoreValues(pair.model_b, row?.b);
  if (!first || !second) return null;
  return Math.max(...first.flatMap((left) => second.map((right) => Math.abs(left - right))));
}

function ModelIdentity({ model, score }: { model: string; score?: Score }) {
  const values = scoreValues(model, score);
  const range = values ? [...new Set(values.map((value) => Math.round(value)))].sort((left, right) => left - right).map((value) => value.toLocaleString()).join("–") : "Unavailable";
  return <div className="match-model"><div className="model-mark"><ArenaModelMark model={model} /></div><div className="model-description"><strong title={model}>{model}</strong><span className="arena-model-score">Arena score: {range}</span>{values && score?.mapping !== "exact" && <span className="arena-model-score-note" title={score?.mapping === "provisional_candidates" ? "Multiple possible model variants" : `Leaderboard entry: ${score?.leaderboard_model}`}>{score?.mapping === "provisional_candidates" ? "Possible variants" : "Provisional name match"}</span>}</div></div>;
}

function ModelFilter({ label, models, value, onChange }: { label: string; models: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="arena-model-filter"><span className="arena-model-filter-label">{label}</span><details name="arena-model-filter">
    <summary aria-label={`${label}: ${value || "All models"}`}>{value && <ArenaModelMark model={value} />}<span>{value || "All models"}</span><span className="arena-filter-chevron" aria-hidden="true">⌄</span></summary>
    <div className="arena-model-menu" aria-label={`${label} options`}>
      {["", ...models].map((model) => <button key={model || "all"} type="button" aria-pressed={value === model} onClick={(event) => { onChange(model); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{model ? <ArenaModelMark model={model} /> : <span className="arena-filter-all-icon" aria-hidden="true">◌</span>}<span>{model || "All models"}</span>{value === model && <span className="arena-filter-check" aria-hidden="true">✓</span>}</button>)}
    </div>
  </details></div>;
}

export function ArenaPairList({ pairs, scores }: { pairs: Pair[]; scores: ScoreFile | null }) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [matched, setMatched] = useState(false);
  const models = useMemo(() => [...new Set(pairs.flatMap((pair) => [pair.model_a, pair.model_b]))].sort((left, right) => left.localeCompare(right)), [pairs]);
  const visible = pairs.map((pair, index) => ({ pair, index })).filter(({ pair }) => {
    const gap = scoreGap(pair, scores);
    if (matched && (gap === null || gap > 100)) return false;
    if (first && second) return (pair.model_a === first && pair.model_b === second) || (pair.model_a === second && pair.model_b === first);
    const selected = first || second;
    return !selected || pair.model_a === selected || pair.model_b === selected;
  });

  return <>
    <div className="arena-filters" aria-label="Filter pilot pairs by model">
      <ModelFilter label="First model" models={models} value={first} onChange={setFirst} />
      <ModelFilter label="Second model" models={models} value={second} onChange={setSecond} />
      <button type="button" onClick={() => { setFirst(""); setSecond(""); setMatched(false); }} disabled={!first && !second && !matched}>Clear filters</button>
      <span className="arena-filter-count" aria-live="polite">{visible.length} of {pairs.length} pilot pairs</span>
    </div>
    <div className="arena-match-toggle"><button type="button" role="switch" aria-checked={matched} onClick={() => setMatched(!matched)}><span className="arena-switch-track"><span /></span>Matched on Arena scores</button></div>
    {matched && !scores && <div className="arena-score-notice" role="status">Arena scores are not loaded yet. The historical leaderboard could not be downloaded, so no pairs can be verified as matched.</div>}
    {matched && scores && <p className="arena-score-note">Pairs with missing scores are excluded. Some names or variants are provisional, including different harness labels; confirm them before using the results. Pairs with possible variants are included only when every listed score is within 100 points.</p>}
    {visible.length ? <div className="match-list">{visible.map(({ pair, index }) => <article className="match-card" key={pair.id}>
      <div className="match-heading"><span>PAIR {String(index + 1).padStart(2, "0")}</span><span>{pair.category?.replaceAll("_", " ")}</span>{matched && <span>Score gap{scores?.pairs?.[pair.id]?.a?.candidates || scores?.pairs?.[pair.id]?.b?.candidates ? " up to" : ":"} {scoreGap(pair, scores)?.toFixed(0)}</span>}<span className="match-id">{pair.id.slice(0, 8)}</span></div>
      <div className="match-body"><div className="match-side"><ModelIdentity model={pair.model_a} score={scores?.pairs?.[pair.id]?.a} /></div><div className="match-versus" aria-label="versus">vs</div><div className="match-side"><ModelIdentity model={pair.model_b} score={scores?.pairs?.[pair.id]?.b} /></div></div><a className="match-card-link" href={`/arena/pair/${encodeURIComponent(pair.id)}`} aria-label={`Open pair ${index + 1}: ${pair.model_a} versus ${pair.model_b}`} />
      {matched && scores?.pairs?.[pair.id] && <div className="match-score-info">{(["a", "b"] as const).flatMap((side) => { const score = scores.pairs[pair.id][side]; const variants = score.mapping === "provisional_candidates" ? score.candidates ?? [] : [score]; return variants.map((variant) => <span key={`${side}-${variant.leaderboard_model}`}><strong>{variant.leaderboard_model}</strong> · {variant.score?.toFixed(1)} · {variant.published}{score.mapping === "exact" ? " · Exact name" : score.mapping === "provisional_candidates" ? " · Possible variant" : " · Provisional name match"}</span>); })}</div>}
    </article>)}</div> : <div className="arena-empty"><h3>No matching pairs in this pilot</h3><p>Try another model or turn off score matching. The dashboard searches only the selected pilot pairs, not the full dataset.</p></div>}
  </>;
}

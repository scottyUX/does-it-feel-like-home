"use client";

import { useState } from "react";
import { measureGroups } from "@/lib/arena/study-measures";

export type ComparisonRow = { dataset: "study" | "arena"; language: "zh" | "en"; key: string; label: string; group: string; n: number; us: number; china: number; difference: number; low: number; high: number; q: number; higher: number; lower: number };
const preferred = ["nav_items", "text_blocks", "quadtree_blocks", "edge_density", "footer_links", "colorfulness", "page_screens"];
const details = Object.fromEntries(measureGroups.flatMap((group) => group.measures.map((measure) => [measure.key, measure.calculation])));
const format = (value: number) => Math.abs(value) >= 100 ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value.toLocaleString(undefined, { maximumFractionDigits: 2 });

function DifferencePlot({ rows }: { rows: ComparisonRow[] }) {
  const max = Math.max(0.001, ...rows.flatMap((row) => [Math.abs(row.low), Math.abs(row.high), Math.abs(row.difference)])) * 1.12;
  const position = (n: number) => `${50 + 48 * n / max}%`;
  return <div className="dataset-shift-plot" role="img" aria-label="Difference between Chinese-developed and US-developed model site averages, with 95 percent bootstrap intervals">
    <div className="dataset-shift-plot-labels"><span>US higher</span><span>China higher</span></div>
    {rows.map((row) => <div className="dataset-shift-line" key={row.dataset}><strong>{row.dataset === "study" ? "Our study" : "Arena"}</strong><div className="dataset-shift-track"><i className="dataset-shift-zero" /><i className="dataset-shift-interval" style={{ left: position(row.low), width: `${48 * (row.high - row.low) / max}%` }} /><i className="dataset-shift-point" style={{ left: position(row.difference) }} /></div><span>{row.difference > 0 ? "+" : ""}{format(row.difference)}</span></div>)}
  </div>;
}

export function ArenaDatasetComparison({ rows }: { rows: ComparisonRow[] }) {
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const [group, setGroup] = useState("Highlights");
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const groups = ["Highlights", ...new Set(rows.map((row) => row.group))];
  const list = rows.filter((row) => row.language === language && row.dataset === "study" && (group === "Highlights" ? preferred.includes(row.key) : row.group === group)).sort((a, b) => group === "Highlights" ? preferred.indexOf(a.key) - preferred.indexOf(b.key) : a.label.localeCompare(b.label));
  const comparisons = list.flatMap((study) => {
    const arena = rows.find((row) => row.dataset === "arena" && row.language === language && row.key === study.key);
    return arena && (!onlyFlagged || study.q < 0.05 || arena.q < 0.05) ? [{ study, arena }] : [];
  });
  return <>
    <div className="arena-compare-notice">These are separate within-dataset comparisons, not a test of whether the two datasets differ. Model families repeat across prompts; intervals and adjusted p-values from the existing analysis may overstate certainty. Researcher-chosen highlights are exploratory.</div>
    <div className="dataset-comparison-controls"><label>Prompt language<select value={language} onChange={(event) => setLanguage(event.target.value as "zh" | "en")}><option value="zh">Chinese prompts</option><option value="en">English prompts</option></select></label><label>Property group<select value={group} onChange={(event) => setGroup(event.target.value)}>{groups.map((name) => <option key={name}>{name}</option>)}</select></label><label className="dataset-flag-filter"><input type="checkbox" checked={onlyFlagged} onChange={(event) => setOnlyFlagged(event.target.checked)} /> Show signals flagged in either analysis</label></div>
    <p className="dataset-comparison-description">Each chart shows the average difference <strong>Chinese-developed minus US-developed</strong>. Lines are 95% pair-bootstrap intervals. Each property has its own scale.</p>
    <div className="dataset-signal-list">{comparisons.map(({ study, arena }) => <article className="dataset-signal" key={study.key}>
      <header><div><span>{study.group}</span><h2>{study.label}</h2></div><a href={study.key === "quadtree_blocks" || study.key === "edge_density" || study.key === "colorfulness" ? "https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf" : "https://ris.utwente.nl/ws/files/287498030/10.1109_procomm53155.2022.00023.pdf"} target="_blank" rel="noreferrer">Related research ↗</a></header>
      <p>{details[study.key] ?? "See the analysis tables for the calculation."}</p><DifferencePlot rows={[study, arena]} />
      <div className="dataset-shift-stats">{[study, arena].map((row) => <div key={row.dataset}><strong>{row.dataset === "study" ? "Our study" : "Arena"}</strong><span>China {format(row.china)} · US {format(row.us)} · {row.n} pairs</span><span>95% interval {format(row.low)} to {format(row.high)} · adjusted p {row.q < 0.001 ? "< 0.001" : format(row.q)}{row.q < 0.05 ? " · flagged within this analysis" : ""}</span></div>)}</div>
    </article>)}</div>
    {!comparisons.length && <p>No measures match these filters.</p>}
    <section className="dataset-homogeneity"><span>RESEARCH DIRECTION</span><h2>Measuring homogenization</h2><p>The charts above describe individual properties. They do not measure how similar sites are to one another. A homogenization analysis needs pairwise layout and color distances across multiple sites, ideally within comparable prompts and categories.</p><p>Goree and colleagues compared screenshot layouts and color distributions and examined shared libraries. Those pairwise measures have not been calculated for these datasets yet.</p><a href="https://aux.engineering.ucsc.edu/publications/Goree_Doosti_Crandall_Su-HomogenizationWebDesign-CHI21.pdf" target="_blank" rel="noreferrer">Read Goree et al. (2021) ↗</a></section>
    <p className="dataset-comparison-footnote">Our study: 80 Spark sites, four models, 10 site types and two prompt languages; 20 paired comparisons per language. Arena: 101 complete US–China battles per language; models and prompts differ from our study. Both study prompt languages asked for Simplified Chinese output. Arena scores were not used to select these samples. Screenshots were rendered with external resources blocked; some assets may be missing. Multiple-testing adjustments are within each source analysis, not across this page.</p>
  </>;
}

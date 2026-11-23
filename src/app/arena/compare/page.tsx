import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountrySignalPlots, type SignalPage } from "@/components/country-signal-plots";
import { measureGroups, measureNotes } from "@/lib/arena/study-measures";
import "../research.css";

export const instant = false;

const fiveSignals = new Set(["visible_elements_first_screen", "footer_links", "visible_links", "page_screens", "price_in_yuan"]);

export default async function ComparePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  // Written by research/analysis/export_country_signals.py.
  const pages = await readFile(path.join(process.cwd(), "research/results/new-labs/country-signals.json"), "utf8")
    .then((value) => JSON.parse(value) as SignalPage[]).catch(() => [] as SignalPage[]);
  const models = new Set(pages.map((page) => page.model));
  return <main className="arena-dashboard arena-compare-page">
    <Link href="/arena" className="arena-compare-back">← Back to Arena</Link>
    <div className="arena-compare-heading"><p className="arena-eyebrow">EXPLORATORY ANALYSIS</p><h1>Five signals that separate Chinese and US models</h1><p>{pages.length} home pages from {models.size} local models (4 Chinese, 6 US), each asked for 10 site types with a Chinese and an English prompt.</p></div>
    <div className="arena-compare-notice">Exploratory · These five came out on top of 40 measures after we looked at the data, so they are hypotheses, not findings (exact model-level p 0.010 to 0.024 each, q = 0.11 after correcting for 40 measures). &ldquo;Model pairs agreeing&rdquo; counts how many of the 24 Chinese–US model pairs have the Chinese model higher. A pre-registered test on new labs is pending.</div>
    {pages.length ? <CountrySignalPlots pages={pages} /> : <p className="arena-empty">No data. Run <code>python research/analysis/export_country_signals.py</code> from the repo root.</p>}
    <section className="measure-list">
      <h2>All 40 measures and how they are calculated</h2>
      <ul>{measureNotes.map((note) => <li key={note}>{note}</li>)}</ul>
      {measureGroups.map((group) => <div className="arena-table-wrap" key={group.name}><table>
        <caption>{group.name}</caption>
        <thead><tr><th>Measure</th><th>How it is calculated</th></tr></thead>
        <tbody>{group.measures.map((measure) => <tr key={measure.key}><td><strong>{measure.label}</strong>{fiveSignals.has(measure.key) && <span className="measure-tag">One of the five</span>}<small><code>{measure.key}</code></small></td><td>{measure.calculation}</td></tr>)}</tbody>
      </table></div>)}
    </section>
  </main>;
}

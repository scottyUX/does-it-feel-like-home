import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountrySignalPlots, type SignalPage } from "@/components/country-signal-plots";
import { measureGroups, measureNotes } from "@/lib/arena/study-measures";
import "../research.css";

export const instant = false;

const fiveSignals = new Set(["visible_elements_first_screen", "footer_links", "visible_links", "page_screens", "price_in_yuan"]);
// Both written by research/analysis/export_country_signals.py.
const sources = { ours: "research/results/new-labs/country-signals.json", arena: "research/results/tables/arena-country-signals.json" };
const tabs = [{ key: "ours", label: "Our generated sites" }, { key: "arena", label: "Arena WebDev" }] as const;

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const tab = (await searchParams).data === "arena" ? "arena" : "ours";
  const pages = await readFile(path.join(process.cwd(), sources[tab]), "utf8")
    .then((value) => JSON.parse(value) as SignalPage[]).catch(() => [] as SignalPage[]);
  const distinct = (key: "model" | "lab" | "type", origin?: string) => new Set(pages.filter((page) => !origin || page.origin === origin).map((page) => page[key])).size;
  const labs = (origin: string) => [...new Set(pages.filter((page) => page.origin === origin).map((page) => page.lab))].sort().join(", ");
  const byPrompt = `${pages.filter((page) => page.prompt === "zh").length} from Chinese prompts, ${pages.filter((page) => page.prompt === "en").length} from English`;
  const measures = { label: "Measures", value: measureGroups.reduce((n, group) => n + group.measures.length, 0), note: "Page structure, screenshots and local features" };
  const cards = tab === "ours" ? [
    { label: "Home pages", value: pages.length, note: byPrompt },
    { label: "Models", value: distinct("model"), note: `${distinct("model", "China")} Chinese, ${distinct("model", "US")} US, run locally` },
    { label: "Labs", value: distinct("lab"), note: `China: ${labs("China")}. US: ${labs("US")}` },
    { label: "Site types", value: distinct("type"), note: "Each asked for once per prompt language" },
    measures,
  ] : [
    { label: "Sites", value: pages.length, note: byPrompt },
    { label: "Battles", value: new Set(pages.map((page) => page.site.replace(/-[ab]$/, ""))).size, note: "Each a US model against a Chinese model on the same prompt" },
    { label: "Models", value: distinct("model"), note: `${distinct("model", "China")} Chinese, ${distinct("model", "US")} US` },
    { label: "Labs", value: distinct("lab"), note: `China: ${labs("China")}. US: ${labs("US")}` },
    measures,
  ];
  return <main className="arena-dashboard arena-compare-page">
    <Link href="/arena" className="arena-compare-back">← Back to Arena</Link>
    <div className="arena-compare-heading"><p className="arena-eyebrow">EXPLORATORY ANALYSIS</p><h1>{tab === "ours" ? "Five signals that separate Chinese and US models" : "Do the five signals show up on Arena?"}</h1><p>{tab === "ours"
      ? `${pages.length} home pages from ${distinct("model")} local models, each asked for ${distinct("type")} site types with a Chinese and an English prompt.`
      : `${pages.length} sites from Arena WebDev battles between a US and a Chinese model, July 2026.`}</p></div>
    <nav className="data-tabs" aria-label="Data set">{tabs.map((item) => <Link key={item.key} href={item.key === "ours" ? "/arena/compare" : "/arena/compare?data=arena"} aria-current={tab === item.key ? "page" : undefined}>{item.label}</Link>)}</nav>
    {pages.length > 0 && <div className="data-cards">{cards.map((card) => <div className="arena-card" key={card.label}><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></div>)}</div>}
    <div className="arena-compare-notice">{tab === "ours"
      ? <>Exploratory · These five came out on top of 40 measures after we looked at the data, so they are hypotheses, not findings (exact model-level p 0.010 to 0.024 each, q = 0.11 after correcting for 40 measures). &ldquo;Model pairs agreeing&rdquo; counts how many of the 24 Chinese–US model pairs have the Chinese model higher. A pre-registered test on new labs is pending.</>
      : <>A second look · The five signals were picked on our own sites; this tab shows the same measures on Arena, where they were not chosen. Arena sites start from a shared starter template, and voters and prompts are self-selected. Rows are labs because most of the {distinct("model")} models have only a few sites; &ldquo;Lab pairs agreeing&rdquo; counts the Chinese–US lab pairs with the Chinese lab higher.</>}</div>
    {pages.length ? <CountrySignalPlots key={tab} pages={pages} rowBy={tab === "arena" ? "lab" : "model"} /> : <p className="arena-empty">No data. Run <code>python research/analysis/export_country_signals.py</code> from the repo root.</p>}
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

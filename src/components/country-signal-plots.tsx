"use client";

import { useState, type CSSProperties } from "react";

export type SignalPage = { model: string; lab: string; origin: "China" | "US"; site: string; type: string; prompt: string; won?: boolean; values: Record<string, number | null> };
type RowBy = "model" | "lab";

type Signal = { key: string; label: string; unit: string; phone?: string; share?: boolean };
const signals: Signal[] = [
  { key: "visible_elements_first_screen", label: "Elements on the first screen", unit: "elements" },
  { key: "footer_links", label: "Footer links", unit: "links" },
  { key: "visible_links", label: "Links on the page", unit: "links" },
  { key: "page_screens", label: "Page length", unit: "desktop screens", phone: "mobile_page_screens" },
  { key: "price_in_yuan", label: "Prices in yuan (¥)", unit: "of sites", share: true },
];
const names: Record<string, string> = {
  "qwen/qwen3.8-27b": "Qwen 3.8 27B", "qwen/qwen3.5-122b": "Qwen 3.5 122B", "zhipu/glm-4.7-flash": "GLM 4.7 Flash", "zhipu/glm-4-9b": "GLM 4 9B",
  "google/gemma-4-31b": "Gemma 4 31B", "google/gemma-3-27b": "Gemma 3 27B", "openai/gpt-oss-120b": "gpt-oss 120B", "openai/gpt-oss-20b": "gpt-oss 20B",
  "meta/llama-4-scout": "Llama 4 Scout", "nvidia/nemotron-3-33b": "Nemotron 3 33B",
};
export const modelName = (model: string) => names[model] ?? model;
const name = modelName;
const prompts = [{ value: "all", label: "Both prompt languages" }, { value: "zh", label: "Chinese prompts" }, { value: "en", label: "English prompts" }];

const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const niceStep = (max: number) => { const raw = max / 4, power = 10 ** Math.floor(Math.log10(raw || 1)); return [1, 2, 2.5, 5, 10].map((m) => m * power).find((step) => step >= raw) ?? raw; };
const jitter = (seed: string) => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0; return ((h >>> 0) % 1000) / 1000 - 0.5; };

function SignalPlot({ signal, rank, pages, rowBy }: { signal: Signal; rank: number; pages: SignalPage[]; rowBy: RowBy }) {
  const [hover, setHover] = useState<string | null>(null);
  const unit = rowBy === "lab" ? "Lab" : "Model";
  const format = (value: number) => signal.share ? `${Math.round(value * 100)}%` : value < 20 && !Number.isInteger(value) ? value.toFixed(1) : Math.round(value).toLocaleString();
  const groups = (["China", "US"] as const).map((origin) => {
    const rows = [...new Set(pages.filter((page) => page.origin === origin).map((page) => page[rowBy]))].sort((a, b) => name(a).localeCompare(name(b))).map((row) => {
      const sites = pages.filter((page) => page[rowBy] === row && page.values[signal.key] != null);
      const phone = signal.phone ? mean(sites.flatMap((page) => page.values[signal.phone!] ?? [])) : undefined;
      return { row, sites, mean: mean(sites.map((page) => page.values[signal.key]!)), phone, hits: sites.filter((page) => page.values[signal.key]).length, lab: sites[0]?.lab ?? "", models: new Set(sites.map((page) => page.model)).size };
    }).filter((item) => item.sites.length);
    return { origin, title: `${origin === "China" ? "Chinese" : "US"} ${rowBy === "lab" ? "labs" : "models"}`, rows, mean: mean(rows.map((item) => item.mean)), phone: signal.phone ? mean(rows.map((item) => item.phone ?? 0)) : undefined };
  });
  const [china, us] = groups;
  const agree = china.rows.reduce((n, c) => n + us.rows.filter((u) => c.mean > u.mean).length, 0);
  const max = signal.share ? 1 : Math.max(1, ...pages.flatMap((page) => page.values[signal.key] ?? []));
  const step = signal.share ? 0.25 : niceStep(max), top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const x = (value: number) => `${(value / top) * 100}%`;
  const promptName = (prompt: string) => prompt === "zh" ? "Chinese prompt" : "English prompt";
  return <section className="signal-plot" aria-label={signal.label}>
    <header className="signal-plot-heading">
      <span className="signal-rank">{rank}</span>
      <div><h2>{signal.label}</h2><p>{signal.share ? `Share of each ${unit.toLowerCase()}'s sites that show a price in yuan.` : `Per site, in ${signal.unit}.`}{signal.phone && ` On a phone: Chinese ${format(china.phone!)} vs US ${format(us.phone!)} screens.`}</p></div>
      <dl className="signal-stats">
        <div><dt>Chinese {rowBy}s</dt><dd>{format(china.mean)}</dd></div>
        <div><dt>US {rowBy}s</dt><dd>{format(us.mean)}</dd></div>
        <div><dt>{unit} pairs agreeing</dt><dd>{agree} / {china.rows.length * us.rows.length}</dd></div>
      </dl>
    </header>
    <div className="signal-rows">
      {groups.map((group) => <div className="signal-group" key={group.origin} style={{ "--signal-color": group.origin === "China" ? "var(--signal-china)" : "var(--signal-us)" } as CSSProperties}>
        <div className="signal-group-title"><strong>{group.title}</strong><span>average of {rowBy} means: {format(group.mean)}</span></div>
        {group.rows.map((item) => <div className="signal-row" key={item.row}>
          <div className="signal-model"><strong>{name(item.row)}</strong><span>{rowBy === "lab" ? `${item.models} ${item.models === 1 ? "model" : "models"} · ` : `${item.lab} · `}{signal.share ? `${item.hits} of ${item.sites.length} sites` : `${item.sites.length} sites · mean ${format(item.mean)}`}</span></div>
          <div className="signal-track">
            {ticks.map((tick) => <i className="signal-grid" key={tick} style={{ left: x(tick) }} />)}
            <i className="signal-country-mean" style={{ left: x(group.mean) }} />
            {!signal.share && item.sites.map((page) => {
              const value = page.values[signal.key]!, vote = page.won === undefined ? "" : page.won ? " · won the vote" : " · lost the vote";
              const label = `${name(page.model)} · ${page.type} · ${promptName(page.prompt)}${vote}`;
              return <button type="button" className={page.won === false ? "signal-dot signal-dot-lost" : "signal-dot"} key={page.site} style={{ left: x(value), top: `calc(50% + ${jitter(page.site) * 18}px)` }} onMouseEnter={() => setHover(page.site)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(page.site)} onBlur={() => setHover(null)} aria-label={`${label}: ${format(value)}`}>
                {hover === page.site && <span className="signal-tooltip" role="tooltip"><strong>{format(value)} {signal.unit}</strong>{label}</span>}
              </button>;
            })}
            <span className={signal.share ? "signal-share" : "signal-mean"} style={{ left: x(item.mean) }} title={`${name(item.row)} mean: ${format(item.mean)}`} />
          </div>
        </div>)}
      </div>)}
      <div className="signal-axis"><span /><div>{ticks.map((tick) => <span key={tick} style={{ left: x(tick) }}>{format(tick)}</span>)}</div></div>
    </div>
  </section>;
}

export function CountrySignalPlots({ pages, rowBy = "model" }: { pages: SignalPage[]; rowBy?: RowBy }) {
  const [prompt, setPrompt] = useState("all");
  const shown = prompt === "all" ? pages : pages.filter((page) => page.prompt === prompt);
  return <section className="signal-plots">
    <div className="signal-toolbar">
      <div className="signal-legend" aria-hidden="true">
        <span><i className="signal-legend-dot" style={{ background: "var(--signal-china)" }} /><i className="signal-legend-dot" style={{ background: "var(--signal-us)" }} /> One site (Chinese / US {rowBy})</span>
        <span><i className="signal-legend-mean" /> {rowBy === "lab" ? "Lab" : "Model"} mean</span>
        <span><i className="signal-legend-country" /> Country average</span>
        {pages.some((page) => page.won !== undefined) && <span><i className="signal-legend-dot" style={{ background: "#888" }} /><i className="signal-legend-dot signal-dot-lost" /> Won / lost the vote</span>}
      </div>
      <label className="signal-filter">Prompt language<select value={prompt} onChange={(event) => setPrompt(event.target.value)}>{prompts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    </div>
    {signals.map((signal, index) => <SignalPlot key={signal.key} signal={signal} rank={index + 1} pages={shown} rowBy={rowBy} />)}
  </section>;
}

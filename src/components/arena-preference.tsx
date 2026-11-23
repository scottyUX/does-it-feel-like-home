"use client";

import { useState } from "react";

// Written by research/analysis/export_arena_preference.py.
export type ArenaPreferenceData = {
  decided_battles: number;
  expected: { prompt: string; battles: number; chinese_won: number; expected: number; difference: number; ci_low: number; ci_high: number }[];
  signals: { prompt: string; prompt_label: string; key: string; label: string; battles: number; higher_won: number; share: number | null; ci_low: number | null; ci_high: number | null; p: number | null }[];
  labs: { lab: string; origin: "China" | "US"; wins: number; battles: number; ci_low: number; ci_high: number }[];
};

const percent = (value: number) => `${Math.round(value * 100)}%`;
const points = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value * 100).toFixed(1)}`;
const pValue = (p: number) => p < 0.001 ? "p < 0.001" : `p = ${p.toFixed(3)}`;
const prompts = [{ value: "all", label: "Both" }, { value: "zh", label: "Chinese prompts" }, { value: "en", label: "English prompts" }];

export function ArenaPreference({ data }: { data: ArenaPreferenceData }) {
  const [prompt, setPrompt] = useState("all");
  const signals = data.signals.filter((row) => row.prompt === prompt);
  const labs = [...data.labs].sort((a, b) => a.origin.localeCompare(b.origin) || b.wins / b.battles - a.wins / a.battles);
  return <section className="preference">
    <div className="preference-heading"><h2>What voters picked</h2><p>Each Arena battle shows a voter two sites built from the same prompt; the voter picks one. {data.decided_battles} of the battles here have a winner.</p></div>

    <div className="preference-cards">{data.expected.map((row) => <div className="arena-card" key={row.prompt}>
      <span>{row.prompt === "zh" ? "Chinese prompts" : "English prompts"}</span>
      <strong>{percent(row.chinese_won)}</strong>
      <small>Chinese model won {percent(row.chinese_won)} of {row.battles} battles. Its Arena WebDev score predicts {percent(row.expected)}: a gap of {points(row.difference)} points (95% CI {points(row.ci_low)} to {points(row.ci_high)}).</small>
    </div>)}</div>

    <div className="signal-plot">
      <header className="preference-plot-heading">
        <div><h3>Did voters pick the busier page?</h3><p>For each signal, in battles where the two sites differ, how often the site with the higher value won. 50% means no preference.</p></div>
        <div className="preference-toggle" role="group" aria-label="Prompt language">{prompts.map((option) => <button type="button" key={option.value} aria-pressed={prompt === option.value} onClick={() => setPrompt(option.value)}>{option.label}</button>)}</div>
      </header>
      <div className="signal-rows">
        {signals.map((row) => <div className="signal-row" key={row.key}>
          <div className="signal-model"><strong>{row.label}</strong><span>{row.battles ? `higher won ${row.higher_won} of ${row.battles} · ${pValue(row.p!)}` : "no battles where the sites differ"}</span></div>
          <div className="signal-track">
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => <i className={tick === 0.5 ? "preference-even" : "signal-grid"} key={tick} style={{ left: percent(tick) }} />)}
            {row.share != null && row.battles > 0 && <>
              <i className="preference-ci" style={{ left: percent(row.ci_low!), width: percent(row.ci_high! - row.ci_low!) }} />
              <span className="preference-dot" style={{ left: percent(row.share) }} title={`${row.label}: higher won ${percent(row.share)} (95% CI ${percent(row.ci_low!)} to ${percent(row.ci_high!)})`} />
              <b className="preference-value" style={{ left: percent(row.share) }}>{percent(row.share)}</b>
            </>}
          </div>
        </div>)}
        <div className="signal-axis"><span /><div>{[0, 0.25, 0.5, 0.75, 1].map((tick) => <span key={tick} style={{ left: percent(tick) }}>{percent(tick)}</span>)}</div></div>
      </div>
      <p className="preference-note">Dot: share of battles won by the site with the higher value. Line: 95% Wilson interval. p: exact binomial test against 50%. Uncorrected across the five signals.</p>
    </div>

    <div className="arena-table-wrap"><table>
      <caption>Win rate by lab</caption>
      <thead><tr><th>Lab</th><th>Country</th><th>Won</th><th>Win rate (95% CI)</th></tr></thead>
      <tbody>{labs.map((row) => <tr key={row.lab}><td><strong>{row.lab}</strong></td><td>{row.origin}</td><td>{row.wins} of {row.battles}</td><td>{percent(row.wins / row.battles)} <small>{percent(row.ci_low)} to {percent(row.ci_high)}</small></td></tr>)}</tbody>
    </table></div>
    <p className="preference-note">Every battle here is a US model against a Chinese one, so lab win rates are against labs from the other country. Labs with few battles (Meituan 3, xAI 12) are not reliable. Arena voters are anonymous and self-selected, each battle has its own prompt, and the expected rate comes from Arena&apos;s overall WebDev scores.</p>
  </section>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArenaModelMark } from "@/components/arena-model-mark";
import { measurementDefinitions } from "@/lib/arena/measurement-definitions";

type Observation = { pairId: string; model: string; values: Record<string, unknown> };
const propertyGroups = [
  { name: "Text", description: "Character counts in the rendered document.", metrics: ["visible_text_chars", "cjk_characters"] },
  { name: "Page structure and navigation", description: "Elements, controls and document height.", metrics: ["visible_elements", "visible_buttons", "visible_links", "page_height_px"] },
  { name: "Motion", description: "Elements with a CSS animation assigned.", metrics: ["css_animated_elements"] },
  { name: "Color", description: "Brightness of the first-screen screenshot.", metrics: ["screenshot_mean_rgb_brightness"] },
  { name: "Technical diagnostics", description: "Errors captured while the page loaded.", metrics: ["javascript_error_count"] },
];
const metrics = propertyGroups.flatMap((group) => group.metrics);

function format(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(3);
}

function MetricChart({ metric, models, observations, selected }: { metric: string; models: string[]; observations: Observation[]; selected: string }) {
  const groups = models.map((model) => {
    const sites = observations.flatMap((item) => item.model === model && typeof item.values[metric] === "number" && Number.isFinite(item.values[metric]) ? [{ pairId: item.pairId, value: item.values[metric] as number }] : []);
    return { model, sites, mean: sites.length ? sites.reduce((sum, item) => sum + item.value, 0) / sites.length : 0 };
  }).filter((group) => group.sites.length && (selected === "all" || selected === group.model));
  const max = Math.max(0, ...groups.flatMap((group) => group.sites.map((site) => site.value)));
  const definition = measurementDefinitions[metric];
  return <section className="arena-metric-chart" aria-label={definition.label}>
    <div className="arena-chart-description"><h2>{definition.label}</h2><p>{definition.calculation}</p>{definition.paper && <a href={definition.paper.url} target="_blank" rel="noreferrer">Related research ↗</a>}</div>
    <div className="arena-chart-rows">{groups.map((group) => <div className="arena-chart-row" key={group.model}><div className="arena-chart-model"><ArenaModelMark model={group.model} /><div><strong>{group.model}</strong><span>{group.sites.length} {group.sites.length === 1 ? "site" : "sites"} · mean {format(group.mean)}</span></div></div><div className="arena-chart-track" aria-label={`${group.model}, mean ${format(group.mean)}`}><div className="arena-chart-axis" />{group.sites.map((site) => <Link className="arena-chart-dot" key={site.pairId} style={{ left: `${max ? (site.value / max) * 100 : 0}%` }} href={`/arena/pair/${site.pairId}`} title={`${group.model}: ${format(site.value)}. Open pair`} aria-label={`${group.model}: ${format(site.value)}. Open pair`} />)}<span className="arena-chart-mean" style={{ left: `${max ? (group.mean / max) * 100 : 0}%` }} title={`Mean: ${format(group.mean)}`} /></div></div>)}</div>
    {groups.length > 0 ? <div className="arena-chart-scale"><span>0</span><span>{format(max)}</span></div> : <p>No measurements available for this selection.</p>}
  </section>;
}

export function ArenaMetricCharts({ observations }: { observations: Observation[] }) {
  const [metric, setMetric] = useState("all");
  const [selected, setSelected] = useState("all");
  const models = [...new Set(observations.map((item) => item.model))].sort();
  return <section className="arena-charts-section">
    <div className="arena-chart-controls"><label>Property<select value={metric} onChange={(event) => setMetric(event.target.value)}><option value="all">All properties</option>{metrics.map((key) => <option key={key} value={key}>{measurementDefinitions[key].label}</option>)}</select></label><label>Model<select value={selected} onChange={(event) => setSelected(event.target.value)}><option value="all">All models</option>{models.map((model) => <option key={model}>{model}</option>)}</select></label></div>
    <div className="arena-chart-legend arena-all-legend"><span><i /> Individual site</span><span><b /> Mean</span><span>Each property uses its own scale</span></div>
    {propertyGroups.map((group) => {
      const visibleMetrics = group.metrics.filter((key) => metric === "all" || metric === key);
      return visibleMetrics.length ? <div className="arena-metric-group" key={group.name}><div className="arena-metric-group-heading"><h2>{group.name}</h2><p>{group.description}</p></div>{visibleMetrics.map((key) => <MetricChart key={key} metric={key} models={models} observations={observations} selected={selected} />)}</div> : null;
    })}
    <p className="arena-chart-footnote">Each dot is a site; overlapping values may appear as one dot. Means summarize the observed sites only. Click a dot to open its pair.</p>
  </section>;
}

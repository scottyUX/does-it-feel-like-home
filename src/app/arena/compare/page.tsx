import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArenaMetricCharts } from "@/components/arena-metric-charts";
import "../research.css";

export const instant = false;

type Pair = { id: string; model_a: string; model_b: string };
type Measurements = Record<string, Record<string, Record<string, unknown>>>;

export default async function ComparePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const folder = path.join(process.cwd(), "arena-data/pilot");
  const [pairs, measurements] = await Promise.all([
    readFile(path.join(folder, "pairs.json"), "utf8").then((value) => JSON.parse(value) as Pair[]).catch(() => []),
    readFile(path.join(folder, "measurements.json"), "utf8").then((value) => JSON.parse(value) as Measurements).catch(() => ({} as Measurements)),
  ]);
  const observations = pairs.flatMap((pair) => (["a", "b"] as const).flatMap((side) => {
    const values = measurements[pair.id]?.[side];
    return values ? [{ pairId: pair.id, model: pair[`model_${side}`], values }] : [];
  }));
  return <main className="arena-dashboard arena-compare-page">
    <Link href="/arena" className="arena-compare-back">← Back to Arena</Link>
    <div className="arena-compare-heading"><p className="arena-eyebrow">PILOT ANALYSIS</p><h1>Compare model properties</h1><p>Explore measurements from the rendered Arena sites, grouped by model.</p></div>
    <div className="arena-compare-notice">Exploratory pilot · Different models received different prompts, and some have only one site. These graphs describe the sample, not a controlled ranking. External resources were blocked during rendering.</div>
    <ArenaMetricCharts observations={observations} />
    <section className="arena-future-measures"><h2>Research measures to add</h2><p>These measures from <a href="https://doi.org/10.1145/3411764.3445156" target="_blank" rel="noreferrer">Goree and colleagues</a> have not been calculated yet.</p><div><article><strong>Layout distance</strong><span>Compare the visual arrangement of two screenshots.</span></article><article><strong>Color distance</strong><span>Compare the distribution of colors across two screenshots.</span></article><article><strong>Library overlap</strong><span>Compare detected libraries while accounting for the shared starting stack.</span></article></div></section>
  </main>;
}

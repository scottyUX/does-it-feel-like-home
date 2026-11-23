import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArenaPairList } from "@/components/arena-pair-list";
import "./research.css";
import type { ScoreFile } from "@/components/arena-pair-list";

export const instant = false;

type Report = {
  dataset_sha256: string;
  total_rows: number;
  eligible_pairs: number;
  selected_pairs: number;
  seed: number;
  exclusions: Record<string, number>;
  unmapped_models: Record<string, number>;
};

type Pair = {
  id: string;
  model_a: string;
  model_b: string;
  origin_a: string;
  origin_b: string;
  winner: string;
  category: string;
};

async function loadPilot(): Promise<{ report: Report; pairs: Pair[]; scores: ScoreFile | null } | null> {
  const folder = path.join(process.cwd(), "arena-data", "pilot");
  try {
    const [report, pairs] = await Promise.all([
      readFile(path.join(folder, "selection.json"), "utf8"),
      readFile(path.join(folder, "pairs.json"), "utf8"),
    ]);
    const scores = await readFile(path.join(folder, "score-matches.json"), "utf8").then((content) => JSON.parse(content) as ScoreFile).catch(() => null);
    return { report: JSON.parse(report), pairs: JSON.parse(pairs), scores };
  } catch {
    return null;
  }
}

export default async function ArenaPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const pilot = await loadPilot();
  const unmapped = pilot ? Object.entries(pilot.report.unmapped_models).sort((left, right) => right[1] - left[1]) : [];

  return (
    <main className="arena-dashboard">
      <section aria-label="Dataset selection">
        <div className="arena-section-heading"><p className="arena-eyebrow">DATASET SELECTION</p></div>
        <div className="arena-stats">
          {[ ["Dataset rows", pilot?.report.total_rows], ["Eligible pairs", pilot?.report.eligible_pairs], ["Selected pairs", pilot?.report.selected_pairs], ["Unmapped models", pilot ? unmapped.length : undefined] ].map(([label, value]) => (
            <div className="arena-card" key={String(label)}><span>{label}</span><strong>{value === undefined ? "—" : Number(value).toLocaleString()}</strong></div>
          ))}
        </div>
        {!pilot && <div className="arena-empty"><h3>No pilot results yet</h3><p>Create and review a model-origin mapping, then run the selection command in <code>arena/README.md</code>. Results placed in <code>arena-data/pilot</code> will appear here.</p></div>}
      </section>
      {pilot && <>
        <section aria-label="Model comparisons"><div className="arena-section-heading"><p className="arena-eyebrow">MODEL COMPARISONS</p></div>
          <div className="arena-compare-entry"><div><strong>Explore model properties</strong><span>See measured pilot sites side by side.</span></div><Link href="/arena/compare">View graphs →</Link></div>
          <ArenaPairList pairs={pilot.pairs} scores={pilot.scores} />
        </section>
      </>}
      <footer>Exploratory research tool · Model developer location does not identify users or cultural preferences.</footer>
    </main>
  );
}

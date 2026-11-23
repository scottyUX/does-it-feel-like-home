import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { ArenaPairViewer } from "@/components/arena-pair-viewer";
import "../../research.css";

export const instant = false;
type Pair = { id: string; model_a: string; model_b: string; origin_a: string; origin_b: string; category: string; winner: "model_a" | "model_b" };

export default async function PairPage({ params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) notFound();
  let pairs: Pair[];
  try { pairs = JSON.parse(await readFile(path.join(process.cwd(), "arena-data/pilot/pairs.json"), "utf8")); } catch { notFound(); }
  const index = pairs.findIndex((pair) => pair.id === id);
  if (index < 0) notFound();
  const prompt = await readFile(path.join(process.cwd(), "arena-data/pilot-sources", id, "prompt.txt"), "utf8").catch(() => "Prompt unavailable.");
  const translations: Record<string, string> = await readFile(path.join(process.cwd(), "arena/pilot-prompt-translations.json"), "utf8").then((content) => JSON.parse(content)).catch(() => ({}));
  const measurements: Record<string, Record<string, Record<string, string | number | boolean | null>>> = await readFile(path.join(process.cwd(), "arena-data/pilot/measurements.json"), "utf8").then((content) => JSON.parse(content)).catch(() => ({}));
  return <ArenaPairViewer key={id} id={id} index={index} count={pairs.length} previousId={pairs[index - 1]?.id} nextId={pairs[index + 1]?.id} prompt={prompt} translation={translations[id]} modelA={pairs[index].model_a} modelB={pairs[index].model_b} winner={pairs[index].winner} measurements={measurements[id]} />;
}

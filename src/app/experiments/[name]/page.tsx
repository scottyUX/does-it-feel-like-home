import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound, redirect } from "next/navigation";
import { ExperimentViewer } from "@/components/experiment-viewer";
import { galleryIsOpen } from "@/lib/actions";

type ExperimentSite = { label: string; id: string; model: string };

export const instant = false;

// Researcher-only A/B view of an experiment, behind the gallery password.
export default async function ExperimentPage({
  params,
}: PageProps<"/experiments/[name]">) {
  if (!(await galleryIsOpen())) redirect("/gallery");
  const { name } = await params;
  if (!/^[a-z0-9-]+$/.test(name)) notFound();
  let experiment: { description: string; sites: ExperimentSite[] };
  try {
    experiment = JSON.parse(
      await readFile(
        path.join(process.cwd(), "data", "experiments", `${name}.json`),
        "utf8",
      ),
    );
  } catch {
    notFound();
  }
  return (
    <ExperimentViewer
      description={experiment.description}
      sites={experiment.sites.slice(0, 2)}
    />
  );
}

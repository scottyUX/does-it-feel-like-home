import { redirect } from "next/navigation";
import { PairSurvey } from "@/components/pair-survey";
import { loadManifest } from "@/lib/manifest";
import { readVisit } from "@/lib/session";
import type { SiteDetails } from "@/lib/types";

export const instant = false;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  const visit = await readVisit();
  const params = await searchParams;
  if (!visit) redirect("/");
  if (visit.phase === "background") redirect("/background");
  if (visit.phase === "done") redirect("/done");

  // Every visitor can reveal which model and prompt language made each website while the study is in testing.
  const manifest = await loadManifest();
  const details: SiteDetails = Object.fromEntries(
    (manifest?.sites ?? []).map((site) => [
      site.id,
      { model: site.model, promptLanguage: site.promptLanguage },
    ]),
  );

  return (
    <PairSurvey
      key={visit.pair.pairIndex}
      pair={visit.pair}
      details={details}
      showTour={params.tour === "1" && visit.pair.pairIndex === 0 && !visit.pair.tourDone}
    />
  );
}

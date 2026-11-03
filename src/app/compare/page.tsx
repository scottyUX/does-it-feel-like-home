import { redirect } from "next/navigation";
import { PairSurvey } from "@/components/pair-survey";
import { galleryIsOpen } from "@/lib/actions";
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

  // Testers who unlocked the gallery can see which model and prompt language made each website.
  let details: SiteDetails | undefined;
  if (await galleryIsOpen()) {
    const manifest = await loadManifest();
    details = Object.fromEntries(
      (manifest?.sites ?? []).map((site) => [
        site.id,
        { model: site.model, promptLanguage: site.promptLanguage },
      ]),
    );
  }

  return (
    <PairSurvey
      key={visit.pair.pairIndex}
      pair={visit.pair}
      details={details}
      showTour={params.tour === "1" && visit.pair.pairIndex === 0 && !visit.pair.tourDone}
    />
  );
}

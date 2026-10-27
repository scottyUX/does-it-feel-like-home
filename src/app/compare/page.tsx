import { redirect } from "next/navigation";
import { PairSurvey } from "@/components/pair-survey";
import { readVisit } from "@/lib/session";

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
  return (
    <PairSurvey
      key={visit.pair.pairIndex}
      pair={visit.pair}
      showTour={params.tour === "1" && visit.pair.pairIndex === 0 && !visit.pair.tourDone}
    />
  );
}

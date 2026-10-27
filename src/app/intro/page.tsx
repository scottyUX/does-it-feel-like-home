import { redirect } from "next/navigation";
import { Introduction } from "@/components/introduction";
import { readVisit } from "@/lib/session";

export const instant = false;

export default async function IntroPage() {
  const visit = await readVisit();
  if (!visit) redirect("/");
  if (visit.phase === "background") redirect("/background");
  if (visit.phase === "done") redirect("/done");
  if (visit.phase !== "pair") redirect("/");
  return <Introduction locale={visit.pair.locale} />;
}

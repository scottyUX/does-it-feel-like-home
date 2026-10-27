import { redirect } from "next/navigation";
import { LanguageChoice } from "@/components/language-choice";
import { readVisit } from "@/lib/session";
export const instant = false;
export default async function HomePage() {
  const visit = await readVisit();
  if (visit?.phase === "pair")
    redirect(visit.pair.tourDone ? "/compare" : "/intro");
  if (visit?.phase === "background") redirect("/background");
  if (visit?.phase === "done") redirect("/done");
  return <LanguageChoice />;
}

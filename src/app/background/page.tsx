import { redirect } from "next/navigation";
import { BackgroundForm } from "@/components/background-form";
import { readVisit } from "@/lib/session";

export const instant = false;

export default async function BackgroundPage() {
  const visit = await readVisit();
  if (!visit) redirect("/");
  if (visit.phase === "pair") redirect("/compare");
  if (visit.phase === "done") redirect("/done");
  return <BackgroundForm locale={visit.locale} sessionId={visit.sessionId} />;
}

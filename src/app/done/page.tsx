import { redirect } from "next/navigation";
import { copy } from "@/lib/copy";
import { readVisit } from "@/lib/session";

export const instant = false;

export default async function DonePage() {
  const visit = await readVisit();
  if (!visit) redirect("/");
  if (visit.phase === "pair") redirect("/compare");
  if (visit.phase === "background") redirect("/background");
  const text = copy[visit.locale];
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <p className="max-w-md text-center text-lg">{text.thanks}</p>
    </main>
  );
}

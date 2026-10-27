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
    <div className="study">
      <div className="static-page">
        <main className="thank-you-card">
          <div className="completion-mark" aria-hidden="true">
            <span />
          </div>
          <span className="concept-kicker">{text.thanksKicker}</span>
          <h1>{text.thanksTitle}</h1>
          <p>{text.thanksBody}</p>
          <strong>{text.thanksClose}</strong>
          <small>{text.thanksContact}</small>
        </main>
      </div>
    </div>
  );
};

import { cookies } from "next/headers";
import { assignVisit } from "@/lib/assign";
import { getSql } from "@/lib/db";
import { loadManifest } from "@/lib/manifest";
import type { BackgroundAnswers } from "@/lib/background";
import type { CurrentPair, Locale, ReasonTags, Sides, SiteType } from "@/lib/types";
import { SITE_TYPES } from "@/lib/types";

const SESSION_COOKIE = "diflh_session";

type SessionRow = {
  id: string;
  locale: Locale;
  combination: string;
  pair_order: SiteType[];
  sides: Sides;
};

const isLocale = (value: string): value is Locale => value === "en" || value === "zh";

const isSiteType = (value: string): value is SiteType =>
  SITE_TYPES.includes(value as SiteType);

export const readSessionId = async () => {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
};

export const createParticipantSession = async (locale: Locale) => {
  const manifest = await loadManifest();
  if (!manifest || manifest.sites.length < 12) return { error: "not_ready" as const };
  const sql = getSql();
  if (!sql) return { error: "store" as const };

  const assigned = assignVisit(manifest.sites);
  const id = crypto.randomUUID();
  await sql`
    insert into sessions (id, locale, combination, pair_order, sides)
    values (
      ${id},
      ${locale},
      ${assigned.combination},
      ${JSON.stringify(assigned.pairOrder)}::jsonb,
      ${JSON.stringify(assigned.sides)}::jsonb
    )
  `;

  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return { error: null };
};

const loadSession = async (id: string) => {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    select id, locale, combination, pair_order, sides
    from sessions
    where id = ${id}
  `;
  const row = rows[0] as SessionRow | undefined;
  if (!row || !isLocale(row.locale)) return null;
  return {
    ...row,
    pair_order: typeof row.pair_order === "string" ? JSON.parse(row.pair_order) : row.pair_order,
    sides: typeof row.sides === "string" ? JSON.parse(row.sides) : row.sides,
  };
};

export const readVisit = async (): Promise<
  | { phase: "pair"; pair: CurrentPair }
  | { phase: "background"; locale: Locale }
  | { phase: "done"; locale: Locale }
  | null
> => {
  const id = await readSessionId();
  if (!id) return null;
  const sql = getSql();
  if (!sql) return null;
  const session = await loadSession(id);
  if (!session) return null;

  const background = await sql`select session_id from background where session_id = ${id}`;
  if (background.length > 0) return { phase: "done", locale: session.locale };

  const responses = await sql`
    select site_type
    from pair_responses
    where session_id = ${id}
    order by pair_index asc
  `;
  if (responses.length >= session.pair_order.length) {
    return { phase: "background", locale: session.locale };
  }

  const siteType = session.pair_order[responses.length];
  if (!siteType || !isSiteType(siteType)) return null;
  const side = session.sides[siteType];
  return {
    phase: "pair",
    pair: {
      locale: session.locale,
      pairIndex: responses.length,
      pairCount: session.pair_order.length,
      siteType,
      leftId: side.left,
      rightId: side.right,
    },
  };
};

export const savePair = async (input: {
  siteType: SiteType;
  enjoyment: string;
  familiarityLeft: number;
  familiarityRight: number;
  chineseModelSide: string;
  reason: string;
  reasonTags: ReasonTags;
}) => {
  const id = await readSessionId();
  if (!id) return { error: "missing" as const };
  const sql = getSql();
  if (!sql) return { error: "store" as const };
  const session = await loadSession(id);
  if (!session) return { error: "missing" as const };

  const existing = await sql`
    select pair_index from pair_responses where session_id = ${id} order by pair_index asc
  `;
  const pairIndex = existing.length;
  const expected = session.pair_order[pairIndex];
  if (!expected || expected !== input.siteType) return { error: "stale" as const };
  const side = session.sides[input.siteType];

  try {
    await sql`
      insert into pair_responses (
        id, session_id, site_type, pair_index, left_site_id, right_site_id,
        enjoyment, familiarity_left, familiarity_right, chinese_model_side, reason, reason_tags
      )
      values (
        ${crypto.randomUUID()},
        ${id},
        ${input.siteType},
        ${pairIndex},
        ${side.left},
        ${side.right},
        ${input.enjoyment},
        ${input.familiarityLeft},
        ${input.familiarityRight},
        ${input.chineseModelSide},
        ${input.reason || null},
        ${JSON.stringify(input.reasonTags)}::jsonb
      )
    `;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("duplicate") && !message.includes("unique")) {
      return { error: "store" as const };
    }
  }
  return { error: null, finishedPairs: pairIndex + 1 >= session.pair_order.length };
};

export const saveBackground = async (input: BackgroundAnswers) => {
  const id = await readSessionId();
  if (!id) return { error: "missing" as const };
  const sql = getSql();
  if (!sql) return { error: "store" as const };
  const livesNow = input.livesNow === "other" ? input.livesSpecify : input.livesNow;
  await sql`
    insert into background (
      session_id, lives_now, years_abroad, design_experience,
      age, gender, born, born_specify, grew_up, grew_up_specify, lives_specify,
      years_outside, first_language, language_specify, chinese_web_use
    )
    values (
      ${id},
      ${livesNow},
      ${input.yearsOutside},
      ${input.designExperience},
      ${input.age},
      ${input.gender || null},
      ${input.born},
      ${input.born === "other" ? input.bornSpecify : null},
      ${input.grewUp},
      ${input.grewUp === "other" ? input.grewUpSpecify : null},
      ${input.livesNow === "other" ? input.livesSpecify : null},
      ${input.yearsOutside},
      ${input.firstLanguage},
      ${input.firstLanguage === "other" ? input.languageSpecify : null},
      ${input.chineseWebUse}
    )
    on conflict (session_id) do nothing
  `;
  return { error: null };
};

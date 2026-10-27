"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backgroundIsValid, type BackgroundAnswers } from "@/lib/background";
import { copy } from "@/lib/copy";
import {
  createParticipantSession,
  saveBackground,
  savePair,
} from "@/lib/session";
import {
  REASON_TAGS,
  type Enjoyment,
  type Locale,
  type OriginChoice,
  type ReasonTag,
  type ReasonTags,
  type ReasonOther,
  type PairMetrics,
  type WebsiteMark,
  type SiteType,
} from "@/lib/types";

const GALLERY_COOKIE = "diflh_gallery";

const ENJOYMENT = new Set<Enjoyment>([
  "left",
  "right",
  "both",
  "neither",
  "too_different",
]);
const ORIGINS = new Set<OriginChoice>(["left", "right", "unsure"]);
const TAGS = new Set<string>(REASON_TAGS);

const cleanTags = (tags: ReasonTags): ReasonTags => {
  const keep = (list: ReasonTag[]) =>
    list.filter((tag) => TAGS.has(tag)).slice(0, REASON_TAGS.length);
  return {
    enjoyment: keep(tags.enjoyment ?? []),
    familiarity: keep(tags.familiarity ?? []),
    origin: keep(tags.origin ?? []),
  };
};

const galleryToken = (password: string) =>
  createHmac("sha256", password).update("gallery").digest("hex");

const tokensMatch = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const createSession = async (
  locale: Locale,
  metadata: { screen: { width: number; height: number }; browser: string },
) => {
  if (locale !== "en" && locale !== "zh") return { error: copy.en.notReady };
  if (
    !metadata ||
    !Number.isFinite(metadata.screen?.width) ||
    metadata.screen.width < 1024
  )
    return { error: copy[locale].deviceMessage };
  const result = await createParticipantSession(locale, {
    screen: {
      width: Math.round(metadata.screen.width),
      height: Math.round(metadata.screen.height),
    },
    browser: String(metadata.browser).slice(0, 500),
  });
  if (result.error === "not_ready") return { error: copy[locale].notReady };
  if (result.error === "store") return { error: copy[locale].storeUnavailable };
  redirect("/intro");
};

export const submitPair = async (input: {
  siteType: SiteType;
  enjoyment: Enjoyment;
  familiarityLeft: number;
  familiarityRight: number;
  chineseModelSide: OriginChoice;
  reason: string;
  reasonTags: ReasonTags;
  reasonOther: ReasonOther;
  metrics: PairMetrics;
  marks: WebsiteMark[];
}) => {
  const scores = [input.familiarityLeft, input.familiarityRight];
  const scoresAreValid = scores.every(
    (score) => Number.isInteger(score) && score >= 1 && score <= 5,
  );
  if (
    !ENJOYMENT.has(input.enjoyment) ||
    !ORIGINS.has(input.chineseModelSide) ||
    !scoresAreValid
  ) {
    return { error: copy.en.storeUnavailable };
  }
  const reason = input.reason.trim().slice(0, 1000);
  const tags = cleanTags(input.reasonTags);
  if (input.familiarityLeft === input.familiarityRight) tags.familiarity = [];
  const reasonOther = Object.fromEntries(
    (["enjoyment", "familiarity", "origin"] as const).map((row) => [
      row,
      tags[row].includes("other")
        ? String(input.reasonOther[row] ?? "").slice(0, 200)
        : "",
    ]),
  ) as ReasonOther;
  if (
    !input.metrics ||
    input.metrics.viewingMs?.a < 5000 ||
    input.metrics.viewingMs?.b < 5000
  )
    return { error: copy.en.timedHint };
  const result = await savePair({
    ...input,
    reason,
    reasonTags: tags,
    reasonOther,
  });
  if (result.error) return { error: copy.en.storeUnavailable };
  redirect(result.finishedPairs ? "/background" : "/compare");
};

export const submitBackground = async (input: BackgroundAnswers) => {
  const answers = {
    ...input,
    bornSpecify: input.bornSpecify.trim().slice(0, 500),
    grewUpSpecify: input.grewUpSpecify.trim().slice(0, 500),
    livesSpecify: input.livesSpecify.trim().slice(0, 500),
    languageSpecify: input.languageSpecify.trim().slice(0, 500),
  };
  if (!backgroundIsValid(answers)) return { error: copy.en.storeUnavailable };
  const result = await saveBackground(answers);
  if (result.error) return { error: copy.en.storeUnavailable };
  redirect("/done");
};

export const unlockGallery = async (formData: FormData) => {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.GALLERY_PASSWORD ?? "";
  if (!expected || !tokensMatch(password, expected)) {
    redirect("/gallery?error=1");
  }
  const store = await cookies();
  store.set(GALLERY_COOKIE, galleryToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/gallery");
};

export const galleryIsOpen = async () => {
  const expected = process.env.GALLERY_PASSWORD ?? "";
  if (!expected) return false;
  const store = await cookies();
  const value = store.get(GALLERY_COOKIE)?.value ?? "";
  return tokensMatch(value, galleryToken(expected));
};

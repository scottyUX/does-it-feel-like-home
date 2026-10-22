"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { copy } from "@/lib/copy";
import { createParticipantSession, saveBackground, savePair } from "@/lib/session";
import type { Enjoyment, Locale, Side, SiteType } from "@/lib/types";

const GALLERY_COOKIE = "diflh_gallery";

const ENJOYMENT = new Set<Enjoyment>(["left", "right", "both", "neither", "too_different"]);
const SIDES = new Set<Side>(["left", "right"]);

const galleryToken = (password: string) =>
  createHmac("sha256", password).update("gallery").digest("hex");

const tokensMatch = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const createSession = async (locale: Locale) => {
  if (locale !== "en" && locale !== "zh") return { error: copy.en.notReady };
  const result = await createParticipantSession(locale);
  if (result.error === "not_ready") return { error: copy[locale].notReady };
  if (result.error === "store") return { error: copy[locale].storeUnavailable };
  redirect("/compare");
};

export const submitPair = async (input: {
  siteType: SiteType;
  enjoyment: Enjoyment;
  familiarityLeft: number;
  familiarityRight: number;
  chineseModelSide: Side;
  reason: string;
}) => {
  const scores = [input.familiarityLeft, input.familiarityRight];
  const scoresAreValid = scores.every((score) => Number.isInteger(score) && score >= 1 && score <= 5);
  if (!ENJOYMENT.has(input.enjoyment) || !SIDES.has(input.chineseModelSide) || !scoresAreValid) {
    return { error: copy.en.storeUnavailable };
  }
  const reason = input.reason.trim().slice(0, 4000);
  const result = await savePair({ ...input, reason });
  if (result.error) return { error: copy.en.storeUnavailable };
  redirect(result.finishedPairs ? "/background" : "/compare");
};

export const submitBackground = async (input: {
  livesNow: string;
  yearsAbroad: string;
  designExperience: string;
}) => {
  const livesNow = input.livesNow.trim().slice(0, 500);
  const yearsAbroad = input.yearsAbroad.trim().slice(0, 500);
  const designExperience = input.designExperience.trim().slice(0, 500);
  if (!livesNow || !yearsAbroad || !designExperience) {
    return { error: copy.en.storeUnavailable };
  }
  const result = await saveBackground({ livesNow, yearsAbroad, designExperience });
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

import type { ManifestPair, ManifestSite, Sides, SiteType } from "@/lib/types";
import { SITE_TYPES } from "@/lib/types";

const randomIndex = (length: number) => {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % length;
};

const shuffle = <T>(items: readonly T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1);
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
};

export const assignVisit = (
  sites: ManifestSite[],
  rotation = 0,
  siteTypes: readonly SiteType[] = SITE_TYPES,
) => {
  const usModels = [
    ...new Set(
      sites.filter((site) => site.country === "US").map((site) => site.model),
    ),
  ];
  const chinaModels = [
    ...new Set(
      sites
        .filter((site) => site.country === "China")
        .map((site) => site.model),
    ),
  ];
  if (usModels.length === 0 || chinaModels.length === 0) {
    throw new Error("Manifest is missing a country");
  }

  const usModel =
    usModels[Math.floor(rotation / chinaModels.length) % usModels.length];
  const chinaModel = chinaModels[rotation % chinaModels.length];
  const sides = {} as Sides;

  for (const siteType of siteTypes) {
    const usSite = sites.find(
      (site) => site.type === siteType && site.model === usModel,
    );
    const chinaSite = sites.find(
      (site) => site.type === siteType && site.model === chinaModel,
    );
    if (!usSite || !chinaSite) {
      throw new Error(`Missing a pair for ${siteType}`);
    }
    const ordered =
      randomIndex(2) === 0 ? [usSite, chinaSite] : [chinaSite, usSite];
    sides[siteType] = { left: ordered[0].id, right: ordered[1].id };
  }

  return {
    combination: `${usModel}|${chinaModel}`,
    pairOrder: shuffle(siteTypes) as SiteType[],
    sides,
  };
};

// Each website type rotates through its listed pairs, so participant n sees pair n of every type.
export const assignFromPairs = (pairs: ManifestPair[], rotation = 0) => {
  const siteTypes = [...new Set(pairs.map((pair) => pair.type))];
  const sides = {} as Sides;
  const chosen: string[] = [];
  for (const siteType of siteTypes) {
    const options = pairs.filter((pair) => pair.type === siteType);
    const pair = options[rotation % options.length];
    const ordered =
      randomIndex(2) === 0 ? [pair.us, pair.china] : [pair.china, pair.us];
    sides[siteType] = { left: ordered[0], right: ordered[1] };
    chosen.push(`${siteType}:${pair.us}|${pair.china}`);
  }
  return {
    combination: chosen.join(","),
    pairOrder: shuffle(siteTypes) as SiteType[],
    sides,
  };
};

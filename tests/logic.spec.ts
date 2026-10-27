import { test, expect } from "@playwright/test";
import { assignVisit } from "../src/lib/assign";
import { reasonPrompts } from "../src/lib/copy";
import {
  SITE_TYPES,
  type Enjoyment,
  type ManifestSite,
} from "../src/lib/types";

test("all four model combinations rotate and each participant gets one US/China pair per category", () => {
  const sites = SITE_TYPES.flatMap((type) =>
    ["us1", "us2", "china1", "china2"].map(
      (model, index) =>
        ({
          id: `${type}-${model}`,
          type,
          country: index < 2 ? "US" : "China",
          model,
          createdAt: "2026-10-27",
        }) as ManifestSite,
    ),
  );
  const combinations = new Set<string>();
  for (let rotation = 0; rotation < 4; rotation++) {
    const assigned = assignVisit(sites, rotation);
    combinations.add(assigned.combination);
    expect(new Set(assigned.pairOrder)).toEqual(new Set(SITE_TYPES));
    for (const type of assigned.pairOrder) {
      const sides = assigned.sides[type];
      expect(
        new Set([
          sites.find((s) => s.id === sides.left)?.country,
          sites.find((s) => s.id === sides.right)?.country,
        ]),
      ).toEqual(new Set(["US", "China"]));
    }
  }
  expect(combinations.size).toBe(4);
  expect(assignVisit(sites, 4).combination).toBe(
    assignVisit(sites, 0).combination,
  );
});

test("equal familiarity ratings omit their reason row for both languages and every enjoyment answer", () => {
  for (const locale of ["en", "zh"] as const)
    for (const enjoyment of [
      "left",
      "right",
      "both",
      "neither",
      "too_different",
    ] as Enjoyment[]) {
      for (const score of [1, 2, 3, 4, 5])
        expect(
          reasonPrompts(locale, enjoyment, score, score, "unsure").map(
            (row) => row.id,
          ),
        ).toEqual(["enjoyment", "origin"]);
      expect(
        reasonPrompts(locale, enjoyment, 5, 1, "left").map((row) => row.id),
      ).toEqual(["enjoyment", "familiarity", "origin"]);
    }
});

test("model images are localized without replacing broken images", async () => {
  const { localizeImages } = await import("../scripts/localize-images.mts");
  const { mkdtemp, readFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  const directory = await mkdtemp(path.join(tmpdir(), "study-images-"));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) =>
    String(input).includes("missing")
      ? new Response(null, { status: 404 })
      : new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
          { headers: { "content-type": "image/svg+xml" } },
        );
  try {
    const files = {
      "index.html":
        '<img src="https://images.example/photo.svg"><img src="https://images.example/missing.jpg">',
      "pages/detail.html": '<img src="https://images.example/photo.svg">',
    };
    const audit = await localizeImages(directory, files);
    const saved = audit.find((entry) => entry.file);
    expect(saved?.file).toMatch(/^assets\/image-[a-f0-9]+\.svg$/);
    expect(
      await readFile(path.join(directory, saved!.file!), "utf8"),
    ).toContain("<svg");
    expect(files["index.html"]).toContain("https://images.example/missing.jpg");
    expect(files["pages/detail.html"]).toContain("../assets/image-");
    expect(audit.find((entry) => entry.error)?.error).toBe("HTTP 404");
  } finally {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  }
});

test("each category has exactly one design-team brief", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const type of SITE_TYPES) {
    const prompt = await readFile(`prompts/${type}.txt`, "utf8");
    expect(prompt.match(/Create a website/g)).toHaveLength(1);
    expect(prompt.match(/All text should be in Simplified Chinese\./g)).toHaveLength(1);
    expect(prompt.trim().endsWith("All text should be in Simplified Chinese.")).toBe(true);
  }
});

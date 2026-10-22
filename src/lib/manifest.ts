import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Manifest } from "@/lib/types";

export const loadManifest = async (): Promise<Manifest | null> => {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "manifest.json"), "utf8");
    return JSON.parse(raw) as Manifest;
  } catch {
    return null;
  }
};

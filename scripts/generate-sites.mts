import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MAX_TOKENS = 32_000;
const SPEND_LIMIT_USD = 20;
const KEY_FILE = "/Users/scottdavis/hecate/.env";

const MODELS = [
  {
    id: "google/gemini-4-argon",
    country: "US",
    effort: "high",
    inputPrice: 2,
    outputPrice: 10,
  },
  {
    id: "anthropic/claude-opus-5",
    country: "US",
    effort: "high",
    inputPrice: 5,
    outputPrice: 25,
  },
  {
    id: "qwen/qwen3.8-max",
    country: "China",
    effort: "high",
    inputPrice: 2,
    outputPrice: 6,
  },
  {
    id: "moonshotai/kimi-k3",
    country: "China",
    effort: "high",
    inputPrice: 0.238,
    outputPrice: 16,
  },
] as const;

const SITE_TYPES = ["clothing", "restaurant", "news"] as const;

type Model = (typeof MODELS)[number];
type SiteType = (typeof SITE_TYPES)[number];

type Usage = {
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
};

type ManifestSite = {
  id: string;
  type: SiteType;
  country: "US" | "China";
  model: string;
  createdAt: string;
};

type ChatResult = {
  content: string;
  finishReason: string | null;
  usage: Usage;
};

const spent = { usd: 0 };

const loadKey = async () => {
  const fromEnv = process.env.OPENROUTER_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const text = await readFile(KEY_FILE, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("OPENROUTER_API_KEY=")) continue;
    return trimmed.slice("OPENROUTER_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
  }
  throw new Error("OPENROUTER_API_KEY was not found");
};

const costOf = (model: Model, promptTokens: number, completionTokens: number) =>
  (promptTokens * model.inputPrice + completionTokens * model.outputPrice) / 1_000_000;

const safeRelative = (name: string) => {
  const cleaned = name.trim().replaceAll("\\", "/").replace(/^\/+/, "");
  if (!cleaned || cleaned.split("/").includes("..")) return null;
  if (!/^[a-zA-Z0-9._/-]+$/.test(cleaned)) return null;
  return cleaned;
};

const extractHtml = (raw: string) => {
  const start = raw.search(/<!doctype html|<html[\s>]/i);
  if (start === -1) return null;
  const slice = raw.slice(start);
  const end = slice.toLowerCase().lastIndexOf("</html>");
  return end === -1 ? slice.trim() : slice.slice(0, end + "</html>".length).trim();
};

const extractFiles = (raw: string) => {
  const files: Record<string, string> = {};
  const marker = /===== FILE:\s*([^\n]+?)\s*=====\r?\n/g;
  const matches = [...raw.matchAll(marker)];
  if (matches.length === 0) {
    const html = extractHtml(raw);
    if (html) files["index.html"] = `${html}\n`;
    return files;
  }
  for (let index = 0; index < matches.length; index += 1) {
    const name = safeRelative(matches[index][1] ?? "");
    const start = (matches[index].index ?? 0) + matches[index][0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? raw.length) : raw.length;
    if (!name) continue;
    let body = raw.slice(start, end).trim();
    body = body.replace(/^```[a-zA-Z]*\r?\n/, "").replace(/\r?\n```$/, "");
    files[name] = body.endsWith("\n") ? body : `${body}\n`;
  }
  return files;
};

const ATTRIBUTION =
  /(made|generated|powered|created)\s+by[^<\n]{0,80}(claude|gemini|qwen|kimi|anthropic|moonshot|alibaba|openai)/gi;

const stripAttribution = (html: string, removed: string[]) => {
  let next = html.replace(/<meta[^>]*name=["']generator["'][^>]*>/gi, (match) => {
    removed.push(match);
    return "";
  });
  next = next.replace(/<!--[^>]*?(claude|gemini|qwen|kimi|anthropic|moonshot)[^>]*?-->/gi, (match) => {
    removed.push(match);
    return "";
  });
  next = next.replace(ATTRIBUTION, (match) => {
    removed.push(match);
    return "";
  });
  next = next.replace(/<title>([^<]*)<\/title>/i, (full, title: string) => {
    const cleaned = title
      .replace(/claude|gemini|qwen|kimi|anthropic|moonshot|alibaba|openai/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (cleaned === title.trim()) return full;
    removed.push(`title: ${title.trim()}`);
    return `<title>${cleaned || "网站"}</title>`;
  });
  return next;
};

const hasHtmlPage = (files: Record<string, string>) =>
  Object.entries(files).some(
    ([name, body]) => name.endsWith(".html") && /<(html|body|main|header)\b/i.test(body),
  );

const callModel = async (
  key: string,
  model: Model,
  messages: { role: string; content: string }[],
  effort: string,
): Promise<ChatResult> => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model.id,
      max_tokens: MAX_TOKENS,
      reasoning: { effort },
      stream: true,
      stream_options: { include_usage: true },
      messages,
    }),
    signal: AbortSignal.timeout(20 * 60 * 1000),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text();
    throw new Error(`${model.id} ${response.status} ${detail.slice(0, 400)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let finishReason: string | null = null;
  let promptTokens = 0;
  let completionTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      let parsed: {
        choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
        error?: { message?: string };
      };
      try {
        parsed = JSON.parse(data) as typeof parsed;
      } catch {
        continue;
      }
      if (parsed.error?.message) throw new Error(parsed.error.message);
      const delta = parsed.choices?.[0]?.delta?.content;
      if (delta) content += delta;
      if (parsed.choices?.[0]?.finish_reason) finishReason = parsed.choices[0].finish_reason;
      if (parsed.usage?.prompt_tokens) promptTokens = parsed.usage.prompt_tokens;
      if (parsed.usage?.completion_tokens) completionTokens = parsed.usage.completion_tokens;
    }
  }

  return {
    content,
    finishReason,
    usage: {
      promptTokens,
      completionTokens,
      costUsd: costOf(model, promptTokens, completionTokens),
    },
  };
};

const callWithFallback = async (
  key: string,
  model: Model,
  messages: { role: string; content: string }[],
) => {
  const efforts = model.id.includes("kimi") ? [model.effort, "max"] : [model.effort];
  let lastError: Error | null = null;
  for (const effort of efforts) {
    try {
      return await callModel(key, model, messages, effort);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const message = lastError.message.toLowerCase();
      if (!message.includes("reasoning") && !message.includes("effort")) break;
    }
  }
  throw lastError ?? new Error("model call failed");
};

const reserveSpend = (model: Model) => {
  const worst = costOf(model, 4_000, MAX_TOKENS);
  if (spent.usd + worst > SPEND_LIMIT_USD) {
    throw new Error(`Stopping before ${model.id}: estimated spend would pass $${SPEND_LIMIT_USD}`);
  }
};

const addSpend = (usage: Usage) => {
  spent.usd += usage.costUsd;
  if (spent.usd > SPEND_LIMIT_USD) {
    throw new Error(`Stopping: spend $${spent.usd.toFixed(2)} passed $${SPEND_LIMIT_USD}`);
  }
};

const writeManifest = async (sites: ManifestSite[]) => {
  const manifest = {
    generatedAt: new Date().toISOString(),
    note: "OpenRouter pipeline samples, not WebDev Arena outputs.",
    sites,
  };
  await mkdir(path.join(ROOT, "data"), { recursive: true });
  await writeFile(path.join(ROOT, "data", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
};

const generateOne = async (
  key: string,
  model: Model,
  siteType: SiteType,
  studyPrompt: string,
  instructions: string,
) => {
  reserveSpend(model);
  const id = randomBytes(4).toString("hex");
  const messages = [
    { role: "system", content: instructions },
    { role: "user", content: studyPrompt },
  ];
  console.log(`start ${siteType} ${model.id} ${id}`);
  let result = await callWithFallback(key, model, messages);
  addSpend(result.usage);
  let files = extractFiles(result.content);
  let repaired = false;

  const truncated = result.finishReason === "length";
  if (!hasHtmlPage(files) || truncated) {
    reserveSpend(model);
    repaired = true;
    console.log(`repair ${siteType} ${model.id} ${id} reason=${result.finishReason ?? "invalid"}`);
    const repair = await callWithFallback(key, model, [
      ...messages,
      { role: "assistant", content: result.content.slice(-12_000) },
      {
        role: "user",
        content:
          "The previous answer was incomplete or not valid HTML. Return the full site again in the FILE format. Keep the same design and the same Simplified Chinese copy.",
      },
    ]);
    addSpend(repair.usage);
    const repairedFiles = extractFiles(repair.content);
    if (hasHtmlPage(repairedFiles)) {
      files = repairedFiles;
      result = repair;
    }
  }

  if (!hasHtmlPage(files)) {
    throw new Error(`${model.id} ${siteType} did not return HTML`);
  }

  if (!files["index.html"]) {
    const firstHtml = Object.keys(files).find((name) => name.endsWith(".html"));
    if (!firstHtml) throw new Error(`${model.id} ${siteType} has no html file`);
    files["index.html"] = files[firstHtml];
  }

  const removed: string[] = [];
  for (const [name, body] of Object.entries(files)) {
    if (!name.endsWith(".html")) continue;
    files[name] = stripAttribution(body, removed);
  }

  const siteDir = path.join(ROOT, "sites", id);
  await mkdir(siteDir, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    const destination = path.join(siteDir, name);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, body);
  }

  const record = {
    id,
    type: siteType,
    country: model.country,
    model: model.id,
    finishReason: result.finishReason,
    repaired,
    removed,
    usage: result.usage,
    createdAt: new Date().toISOString(),
  };
  await mkdir(path.join(ROOT, "generations"), { recursive: true });
  await writeFile(
    path.join(ROOT, "generations", `${id}.json`),
    `${JSON.stringify({ ...record, content: result.content }, null, 2)}\n`,
  );
  console.log(
    `done ${siteType} ${model.id} ${id} $${result.usage.costUsd.toFixed(3)} total $${spent.usd.toFixed(3)}`,
  );
  return record;
};

const mapPool = async <T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) => {
  const results: R[] = [];
  let cursor = 0;
  const run = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
};

const main = async () => {
  const key = await loadKey();
  const instructions = await readFile(path.join(ROOT, "prompts", "generation-instructions.txt"), "utf8");
  const prompts = Object.fromEntries(
    await Promise.all(
      SITE_TYPES.map(async (siteType) => [
        siteType,
        (await readFile(path.join(ROOT, "prompts", `${siteType}.txt`), "utf8")).trim(),
      ]),
    ),
  ) as Record<SiteType, string>;

  const jobs = SITE_TYPES.flatMap((siteType) => MODELS.map((model) => ({ siteType, model })));
  const sites: ManifestSite[] = [];
  const failures: { siteType: string; model: string; error: string }[] = [];
  let manifestChain = Promise.resolve();
  const saveSite = (site: ManifestSite) => {
    manifestChain = manifestChain.then(async () => {
      sites.push(site);
      await writeManifest(sites);
    });
    return manifestChain;
  };

  await mapPool(jobs, 4, async (job) => {
    try {
      const record = await generateOne(
        key,
        job.model,
        job.siteType,
        prompts[job.siteType],
        instructions.trim(),
      );
      await saveSite({
        id: record.id,
        type: record.type,
        country: record.country,
        model: record.model,
        createdAt: record.createdAt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ siteType: job.siteType, model: job.model.id, error: message });
      console.error(`fail ${job.siteType} ${job.model.id}: ${message}`);
    }
  });

  await manifestChain;
  await mkdir(path.join(ROOT, "generations"), { recursive: true });
  await writeFile(
    path.join(ROOT, "generations", "usage.json"),
    `${JSON.stringify({ spentUsd: spent.usd, sites: sites.length, failures }, null, 2)}\n`,
  );
  if (failures.length > 0) {
    process.exitCode = 1;
  }
  console.log(`finished ${sites.length} sites, $${spent.usd.toFixed(3)}, failures ${failures.length}`);
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});

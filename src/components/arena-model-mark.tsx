import Image from "next/image";

export function ArenaModelMark({ model }: { model: string }) {
  const family = model.split("-")[0].replace(/[0-9.].*$/, "");
  const icons: Record<string, string> = { claude: "claude-color", gpt: "openai", gemini: "gemini-color", deepseek: "deepseek-color", kimi: "kimi-color", qwen: "qwen-color", minimax: "minimax-color" };
  const icon = icons[family];
  return <span className="arena-model-icon" aria-hidden="true">{icon ? <Image unoptimized src={`https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${icon}.svg`} width={42} height={42} alt="" referrerPolicy="no-referrer" /> : <span>{family.slice(0, 2).toUpperCase()}</span>}</span>;
}

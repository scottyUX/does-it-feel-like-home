# Generates every study site type with each local model, one at a time, on the Spark itself.
# Uses the main study prompts and the same FILE format as scripts/generate-sites.mts.
# Re-running skips sites that already finished.
# Usage: python3 batch.py [en|zh] [model,model]  (zh reads prompts-zh/ and writes sites-zh/)
import json
import os
import re
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OLLAMA = "http://127.0.0.1:11434/api/chat"
TYPES = ["clothing", "restaurant", "news", "social-media", "travel", "bank",
         "food-delivery", "beauty-salon", "learning", "home-cleaning"]
MODELS = ["gemma4:31b", "qwen3.8:27b"]
MARKER = re.compile(r"===== FILE:\s*([^\n]+?)\s*=====\r?\n")
SAFE = re.compile(r"^[a-zA-Z0-9._/-]+$")


def log(message):
    print(time.strftime("%H:%M"), message, flush=True)


def generate(model, instructions, prompt):
    body = json.dumps({
        "model": model,
        "stream": True,
        "options": {"num_ctx": 40000, "num_predict": 32000},
        "messages": [
            {"role": "system", "content": instructions},
            {"role": "user", "content": prompt},
        ],
    }).encode()
    request = urllib.request.Request(OLLAMA, body, {"Content-Type": "application/json"})
    content, thinking, final = [], [], {}
    started = time.time()
    with urllib.request.urlopen(request, timeout=3600) as response:
        for line in response:
            if not line.strip():
                continue
            chunk = json.loads(line)
            if chunk.get("error"):
                raise RuntimeError(chunk["error"])
            message = chunk.get("message") or {}
            content.append(message.get("content") or "")
            thinking.append(message.get("thinking") or "")
            if chunk.get("done"):
                final = chunk
    return "".join(content), "".join(thinking), final, round(time.time() - started)


def extract_files(content):
    files = {}
    matches = list(MARKER.finditer(content))
    for index, match in enumerate(matches):
        name = match.group(1).strip().lstrip("/")
        if not SAFE.match(name) or ".." in name.split("/"):
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(content)
        body = content[match.end():end].strip()
        body = re.sub(r"^```[a-zA-Z]*\r?\n", "", body)
        body = re.sub(r"\r?\n```$", "", body)
        files[name] = body if body.endswith("\n") else body + "\n"
    return files


def main():
    language = sys.argv[1] if len(sys.argv) > 1 else "en"
    models = sys.argv[2].split(",") if len(sys.argv) > 2 else MODELS
    prompts = "prompts" if language == "en" else f"prompts-{language}"
    sites = "sites" if language == "en" else f"sites-{language}"
    instructions = open(os.path.join(HERE, prompts, "generation-instructions.txt")).read()
    for site_type in TYPES:
        prompt = open(os.path.join(HERE, prompts, f"{site_type}.txt")).read().strip()
        for model in models:
            out = os.path.join(HERE, sites, site_type, model.replace(":", "-"))
            if os.path.exists(os.path.join(out, "_generation.json")):
                log(f"skip {site_type} {model}")
                continue
            for attempt in (1, 2):
                log(f"start {site_type} {model} attempt {attempt}")
                try:
                    content, thinking, final, seconds = generate(model, instructions, prompt)
                except Exception as error:
                    log(f"error {site_type} {model}: {error}")
                    time.sleep(30)
                    continue
                files = extract_files(content)
                pages = [name for name in files if name.endswith(".html")]
                record = {
                    "model": model,
                    "siteType": site_type,
                    "promptLanguage": language,
                    "attempt": attempt,
                    "seconds": seconds,
                    "doneReason": final.get("done_reason"),
                    "promptTokens": final.get("prompt_eval_count"),
                    "completionTokens": final.get("eval_count"),
                    "tokensPerSecond": round(final.get("eval_count", 0) / (final.get("eval_duration", 1) / 1e9), 1),
                    "files": list(files),
                    "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                }
                ok = len(pages) >= 3 and final.get("done_reason") == "stop"
                os.makedirs(out, exist_ok=True)
                for old in os.listdir(out):
                    if not old.startswith("_attempt") and os.path.isfile(os.path.join(out, old)):
                        os.remove(os.path.join(out, old))
                for name, body in files.items():
                    path = os.path.join(out, name)
                    os.makedirs(os.path.dirname(path), exist_ok=True)
                    open(path, "w").write(body)
                target = "_generation.json" if ok or attempt == 2 else f"_attempt{attempt}.json"
                if not ok and attempt == 2:
                    target = "_failed.json"
                json.dump({**record, "thinking": thinking, "content": content},
                          open(os.path.join(out, target), "w"), ensure_ascii=False, indent=2)
                log(f"{'done' if ok else 'incomplete'} {site_type} {model} pages={len(pages)} "
                    f"{seconds}s {record['completionTokens']} tokens {final.get('done_reason')}")
                if ok:
                    break
    log("all finished")


if __name__ == "__main__":
    sys.exit(main())

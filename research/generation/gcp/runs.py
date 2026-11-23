# Full-experiment runs: repeat generations and new conditions, reusing batch.py's generation and parsing.
# Model-outer order so each model loads once. Re-running skips sites that already finished.
# Usage: python3 runs.py <condition> <en|zh> <run numbers, e.g. 2,3> <model,model,...>
#   condition = folder under conditions/ (e.g. china-audience) holding prompts-en/ and prompts-zh/,
#   or "china-audience", which reads the original prompts/ and prompts-zh/.
# Output: runs/<condition>/<lang>/run<N>/<type>/<model>/ with the same files and _generation.json as batch.py.
import json, os, sys, time
from batch import HERE, TYPES, generate, extract_files, log

def prompt_dir(condition, language):
    if condition == "china-audience":
        return os.path.join(HERE, "prompts" if language == "en" else "prompts-zh")
    return os.path.join(HERE, "conditions", condition, f"prompts-{language}")

def main():
    condition, language, runs, models = sys.argv[1], sys.argv[2], [int(r) for r in sys.argv[3].split(",")], sys.argv[4].split(",")
    pdir = prompt_dir(condition, language)
    instructions = open(os.path.join(pdir, "generation-instructions.txt")).read()
    for model in models:
        for run in runs:
            for site_type in TYPES:
                prompt = open(os.path.join(pdir, f"{site_type}.txt")).read().strip()
                out = os.path.join(HERE, "runs", condition, language, f"run{run}", site_type, model.replace(":", "-"))
                if os.path.exists(os.path.join(out, "_generation.json")):
                    log(f"skip {condition} {language} run{run} {site_type} {model}"); continue
                for attempt in (1, 2):
                    log(f"start {condition} {language} run{run} {site_type} {model} attempt {attempt}")
                    try:
                        content, thinking, final, seconds = generate(model, instructions, prompt)
                    except Exception as error:
                        log(f"error {site_type} {model}: {error}"); time.sleep(30); continue
                    files = extract_files(content)
                    pages = [n for n in files if n.endswith(".html")]
                    ok = len(pages) >= 3 and final.get("done_reason") == "stop"
                    record = {"model": model, "siteType": site_type, "promptLanguage": language, "condition": condition,
                              "run": run, "attempt": attempt, "seconds": seconds, "doneReason": final.get("done_reason"),
                              "promptTokens": final.get("prompt_eval_count"), "completionTokens": final.get("eval_count"),
                              "tokensPerSecond": round(final.get("eval_count", 0) / (final.get("eval_duration", 1) / 1e9), 1),
                              "files": list(files), "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z")}
                    os.makedirs(out, exist_ok=True)
                    for old in os.listdir(out):
                        if not old.startswith("_attempt") and os.path.isfile(os.path.join(out, old)):
                            os.remove(os.path.join(out, old))
                    for name, body in files.items():
                        path = os.path.join(out, name); os.makedirs(os.path.dirname(path), exist_ok=True)
                        open(path, "w").write(body)
                    target = "_generation.json" if ok else ("_failed.json" if attempt == 2 else f"_attempt{attempt}.json")
                    json.dump({**record, "thinking": thinking, "content": content}, open(os.path.join(out, target), "w"), ensure_ascii=False, indent=2)
                    log(f"{'done' if ok else 'incomplete'} {condition} {language} run{run} {site_type} {model} pages={len(pages)} {seconds}s")
                    if ok: break
    log("all finished")

if __name__ == "__main__":
    main()

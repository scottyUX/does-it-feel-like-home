"""Attach historical Arena scores using exact names or explicitly supplied aliases."""

import argparse
import hashlib
import json
from collections import defaultdict
from pathlib import Path

import duckdb


def latest_unique_scores(rows):
    candidates = defaultdict(list)
    for name, score, date in rows:
        if score is not None and (not candidates[name] or candidates[name][0][1] == date):
            candidates[name].append((score, date))
    return candidates, {name: entries[0] for name, entries in candidates.items() if len(entries) == 1}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pairs", type=Path, required=True)
    parser.add_argument("--leaderboard", type=Path, required=True)
    parser.add_argument("--aliases", type=Path, required=True)
    parser.add_argument("--candidates", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    pairs = json.loads(args.pairs.read_text())
    aliases = json.loads(args.aliases.read_text())
    possible = json.loads(args.candidates.read_text()) if args.candidates else {}
    if not isinstance(aliases, dict) or any(not isinstance(key, str) or not isinstance(value, str) for key, value in aliases.items()):
        parser.error("aliases must map dataset model names to leaderboard model names")
    if not isinstance(possible, dict) or any(not isinstance(key, str) or not isinstance(value, list) or not value or any(not isinstance(name, str) for name in value) for key, value in possible.items()):
        parser.error("candidates must map dataset model names to nonempty arrays of leaderboard names")
    if set(aliases) & set(possible):
        parser.error("a model cannot have both an alias and a candidate list")
    rows = duckdb.connect().execute("""SELECT model_name, rating, leaderboard_publish_date
        FROM read_parquet(?) WHERE category = 'overall' AND leaderboard_publish_date <= '2026-07-31'
        ORDER BY leaderboard_publish_date DESC""", [str(args.leaderboard)]).fetchall()
    candidates, scores = latest_unique_scores(rows)
    result = {}
    for pair in pairs:
        entry = {}
        for side in ("a", "b"):
            model = pair[f"model_{side}"]
            if model in possible:
                variants = []
                for candidate in possible[model]:
                    score, date = scores.get(candidate, (None, None))
                    variants.append({"leaderboard_model": candidate, "score": score, "published": date,
                                     "status": "ambiguous" if candidate in candidates and candidate not in scores else "available" if candidate in scores else "missing"})
                entry[side] = {"dataset_model": model, "leaderboard_model": None, "score": None, "published": None,
                               "mapping": "provisional_candidates", "status": "possible_variants", "candidates": variants}
                continue
            name = aliases.get(model, model)
            score, date = scores.get(name, (None, None))
            entry[side] = {"dataset_model": model, "leaderboard_model": name, "score": score, "published": date,
                           "status": "ambiguous" if name in candidates and name not in scores else "available" if name in scores else "missing",
                           "mapping": "provisional_alias" if model in aliases else "exact"}
        result[pair["id"]] = entry
    output = {"leaderboard_sha256": hashlib.sha256(args.leaderboard.read_bytes()).hexdigest(),
              "cutoff": "2026-07-31", "category": "overall", "pairs": result}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, indent=2) + "\n")
    print(f"Saved scores for {len(result)} pairs to {args.output}")


if __name__ == "__main__":
    main()

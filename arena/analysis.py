"""Select and audit Arena preference pairs without executing generated code."""

import argparse
import csv
import hashlib
import json
import random
from collections import Counter
from pathlib import Path

import duckdb


LANGUAGE_NAMES = {"zh": "chinese", "en": "english"}


def origin(name, mapping):
    return mapping.get(name)


def select_pairs(rows, mapping, prompt_language="zh"):
    selected = []
    exclusions = Counter()
    unknown = Counter()
    seen = set()
    for row in rows:
        identifier, session, language, model_a, model_b, winner, category = row
        if language != prompt_language:
            exclusions[f"non_{LANGUAGE_NAMES.get(prompt_language, prompt_language)}_prompt"] += 1
            continue
        if not identifier or identifier in seen:
            exclusions["missing_or_duplicate_id"] += 1
            continue
        seen.add(identifier)
        if winner not in ("model_a", "model_b"):
            exclusions["invalid_winner"] += 1
            continue
        country_a, country_b = origin(model_a, mapping), origin(model_b, mapping)
        if not country_a or not country_b:
            unknown.update(name for name, country in ((model_a, country_a), (model_b, country_b)) if not country)
            exclusions["unmapped_model"] += 1
            continue
        if {country_a, country_b} != {"US", "CN"}:
            exclusions["not_cross_origin"] += 1
            continue
        selected.append(dict(id=identifier, session_id=session, language=language, model_a=model_a, model_b=model_b,
                             origin_a=country_a, origin_b=country_b, winner=winner, category=category))
    return selected, exclusions, unknown


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--mapping", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--sample", type=int)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--language", default="zh", help="prompt language to select (default zh)")
    parser.add_argument("--match-categories", type=Path,
                        help="pairs.json whose category counts the sample should reproduce (instead of --sample)")
    args = parser.parse_args()
    if args.sample is not None and args.sample < 1:
        parser.error("--sample must be positive")
    if args.sample is not None and args.match_categories:
        parser.error("use either --sample or --match-categories")
    mapping = json.loads(args.mapping.read_text())
    if not isinstance(mapping, dict) or any(value not in ("US", "CN") for value in mapping.values()):
        parser.error("mapping must be an object of model names to US or CN")
    digest = hashlib.sha256()
    with args.dataset.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    connection = duckdb.connect()
    rows = connection.execute("SELECT id, session_id, language, model_a, model_b, winner, category FROM read_parquet(?)", [str(args.dataset)]).fetchall()
    selected, exclusions, unknown = select_pairs(rows, mapping, args.language)
    selected.sort(key=lambda item: item["id"])
    eligible = len(selected)
    shortfall = {}
    if args.sample is not None:
        selected = random.Random(args.seed).sample(selected, min(args.sample, eligible))
    elif args.match_categories:
        wanted = Counter(pair["category"] for pair in json.loads(args.match_categories.read_text()))
        generator, sampled = random.Random(args.seed), []
        for category, count in sorted(wanted.items()):
            pool = [pair for pair in selected if pair["category"] == category]
            sampled += generator.sample(pool, min(count, len(pool)))
            if len(pool) < count:
                shortfall[category] = count - len(pool)
        selected = sorted(sampled, key=lambda item: item["id"])
    args.output.mkdir(parents=True, exist_ok=True)
    fields = ["id", "session_id", "language", "model_a", "model_b", "origin_a", "origin_b", "winner", "category"]
    with (args.output / "pairs.csv").open("w", newline="") as target:
        writer = csv.DictWriter(target, fieldnames=fields)
        writer.writeheader()
        writer.writerows(selected)
    (args.output / "pairs.json").write_text(json.dumps(selected, indent=2) + "\n")
    report = dict(dataset_sha256=digest.hexdigest(), mapping_sha256=hashlib.sha256(args.mapping.read_bytes()).hexdigest(),
                  total_rows=len(rows), prompt_language=args.language, eligible_pairs=eligible,
                  selected_pairs=len(selected), seed=args.seed, category_shortfall=shortfall,
                  exclusions=dict(exclusions), unmapped_models=dict(unknown),
                  warning="Origin mappings require researcher review; selection is not score matching.")
    (args.output / "selection.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

"""Convert saved Hugging Face dataset-viewer response pages to a score snapshot."""

import argparse
import json
from pathlib import Path

import duckdb


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pages", type=Path, nargs="+", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        parser.error("output already exists")
    rows = []
    for page in args.pages:
        response = json.loads(page.read_text())
        if response.get("partial") is not False or not isinstance(response.get("rows"), list):
            parser.error(f"incomplete API response: {page}")
        for item in response["rows"]:
            row = item["row"]
            if item.get("truncated_cells"):
                parser.error(f"truncated API row: {page}")
            rows.append((row["model_name"], row["rating"], row["leaderboard_publish_date"], row["category"]))
    if not rows:
        parser.error("no leaderboard rows")
    database = duckdb.connect()
    database.execute("CREATE TABLE snapshots (model_name VARCHAR, rating DOUBLE, leaderboard_publish_date VARCHAR, category VARCHAR)")
    database.executemany("INSERT INTO snapshots VALUES (?, ?, ?, ?)", rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    database.table("snapshots").write_parquet(str(args.output))
    print(f"Wrote {len(rows)} historical rows to {args.output}")


if __name__ == "__main__":
    main()

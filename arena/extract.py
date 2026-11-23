"""Extract selected Arena source files without executing generated code."""

import argparse
import json
import re
from pathlib import Path, PurePosixPath

import duckdb

MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_SITE_BYTES = 50 * 1024 * 1024
SAFE_ID = re.compile(r"^[a-zA-Z0-9_-]{1,128}$")


def extract_site(payload, destination):
    data = json.loads(payload)
    files = data.get("files")
    if not isinstance(files, list):
        raise ValueError("website is missing its files array")
    prepared = []
    paths = set()
    total = 0
    for entry in files:
        name, content = entry.get("path"), entry.get("content")
        if not isinstance(name, str) or not isinstance(content, str):
            raise ValueError("file path and content must be strings")
        path = PurePosixPath(name)
        if not name or path.is_absolute() or ".." in path.parts or "\\" in name or not path.parts:
            raise ValueError("unsafe file path")
        if path.parts[0] in ("node_modules", "dist", ".git") or path.as_posix() in paths:
            raise ValueError("reserved or duplicate file path")
        encoded = content.encode("utf-8")
        total += len(encoded)
        if len(encoded) > MAX_FILE_BYTES or total > MAX_SITE_BYTES:
            raise ValueError("site exceeds extraction size limit")
        paths.add(path.as_posix())
        prepared.append((path, encoded))
    if destination.exists():
        raise FileExistsError(f"destination already exists: {destination}")
    destination.mkdir(parents=True)
    for path, content in prepared:
        target = destination.joinpath(*path.parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
    return len(prepared)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--pairs", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    pairs = json.loads(args.pairs.read_text())
    identifiers = [pair["id"] for pair in pairs]
    if len(set(identifiers)) != len(identifiers) or any(not isinstance(identifier, str) or not SAFE_ID.fullmatch(identifier) for identifier in identifiers):
        parser.error("pair IDs must be unique and contain only letters, numbers, hyphens, or underscores")
    if args.output.exists():
        parser.error("output directory must not already exist")
    args.output.mkdir(parents=True)
    connection = duckdb.connect()
    connection.execute("CREATE TEMP TABLE selected (id VARCHAR PRIMARY KEY)")
    if identifiers:
        connection.executemany("INSERT INTO selected VALUES (?)", [(identifier,) for identifier in identifiers])
    rows = connection.execute("SELECT p.id, p.prompt, p.website_a, p.website_b FROM read_parquet(?) p JOIN selected s ON p.id = s.id", [str(args.dataset)])
    records = []
    found = set()
    while batch := rows.fetchmany(10):
        for identifier, prompt, site_a, site_b in batch:
            if identifier in found:
                raise ValueError(f"duplicate dataset ID: {identifier}")
            found.add(identifier)
            for side, payload in (("a", site_a), ("b", site_b)):
                try:
                    count = extract_site(payload, args.output / identifier / side)
                    records.append(dict(id=identifier, side=side, status="extracted", files=count))
                except (ValueError, TypeError, json.JSONDecodeError, OSError) as error:
                    records.append(dict(id=identifier, side=side, status="failed", error=str(error)))
            (args.output / identifier).mkdir(exist_ok=True)
            (args.output / identifier / "prompt.txt").write_text(prompt or "", encoding="utf-8")
    for identifier in sorted(set(identifiers) - found):
        records.append(dict(id=identifier, status="missing_from_dataset"))
    (args.output / "extraction.json").write_text(json.dumps(records, indent=2) + "\n")
    print(json.dumps({"requested_pairs": len(identifiers), "found_pairs": len(found), "sites_extracted": sum(record["status"] == "extracted" for record in records), "failures": sum(record["status"] != "extracted" for record in records)}, indent=2))


if __name__ == "__main__":
    main()

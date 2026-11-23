"""Run prebuilt Arena renderer in restricted Docker containers."""

import argparse
import json
import re
import subprocess
from pathlib import Path

IDENTIFIER = re.compile(r"^[a-zA-Z0-9_-]{1,128}$")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources", type=Path, required=True)
    parser.add_argument("--pairs", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--image", default="arena-renderer:pilot")
    parser.add_argument("--timeout", type=int, default=180)
    args = parser.parse_args()
    pairs = json.loads(args.pairs.read_text())
    if args.timeout < 1 or any(not isinstance(pair.get("id"), str) or not IDENTIFIER.fullmatch(pair["id"]) for pair in pairs):
        parser.error("invalid timeout or battle ID")
    if args.output.exists():
        parser.error("output directory must not already exist")
    args.output.mkdir(parents=True)
    measurements = {}
    statuses = []
    for pair in pairs:
        identifier = pair["id"]
        measurements[identifier] = {}
        for side in ("a", "b"):
            source = (args.sources / identifier / side).resolve()
            target = (args.output / identifier / side).resolve()
            target.mkdir(parents=True)
            if not source.is_dir():
                statuses.append(dict(id=identifier, side=side, status="missing_source"))
                continue
            name = f"arena-{identifier}-{side}"[:128]
            command = ["docker", "run", "--rm", "--name", name, "--network", "none", "--read-only",
                       "--cap-drop", "ALL", "--security-opt", "no-new-privileges", "--pids-limit", "256",
                       "--memory", "2g", "--cpus", "2", "--user", "1000:1000", "--tmpfs", "/tmp:rw,nosuid,nodev,size=1536m,mode=1777",
                       "--env", "HOME=/tmp", "--env", "XDG_CONFIG_HOME=/tmp/.config", "--env", "XDG_CACHE_HOME=/tmp/.cache",
                       "--mount", f"type=bind,src={source},dst=/input,readonly",
                       "--mount", f"type=bind,src={target},dst=/output", args.image]
            try:
                result = subprocess.run(command, capture_output=True, text=True, timeout=args.timeout, check=False)
                (target / "worker.log").write_text((result.stdout + result.stderr)[-20000:])
                if result.returncode != 0:
                    statuses.append(dict(id=identifier, side=side, status="failed", exit_code=result.returncode))
                elif (target / "measurements.json").is_file() and (target / "screenshot.png").is_file():
                    measurements[identifier][side] = json.loads((target / "measurements.json").read_text())
                    statuses.append(dict(id=identifier, side=side, status="measured"))
                else:
                    statuses.append(dict(id=identifier, side=side, status="missing_output"))
            except subprocess.TimeoutExpired:
                subprocess.run(["docker", "rm", "-f", name], capture_output=True, check=False, timeout=20)
                statuses.append(dict(id=identifier, side=side, status="timeout"))
            except (OSError, ValueError) as error:
                statuses.append(dict(id=identifier, side=side, status="failed", error=str(error)))
            print(f"{identifier} {side}: {statuses[-1]['status']}", flush=True)
            (args.output / "measurements.json").write_text(json.dumps(measurements, indent=2) + "\n")
            (args.output / "status.json").write_text(json.dumps(statuses, indent=2) + "\n")


if __name__ == "__main__":
    main()

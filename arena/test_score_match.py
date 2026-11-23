import importlib.util
import sys
import types
import unittest
from pathlib import Path

sys.modules.setdefault("duckdb", types.ModuleType("duckdb"))
spec = importlib.util.spec_from_file_location("arena_scores", Path(__file__).with_name("score_match.py"))
scores = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scores)


class ScoreTests(unittest.TestCase):
    def test_ambiguous_latest_snapshot_is_not_matched(self):
        rows = [("model-a", 1200, "2026-07-31"), ("model-a", 1300, "2026-07-31"),
                ("model-a", 1100, "2026-07-24"), ("model-b", 1500, "2026-07-24")]
        candidates, unique = scores.latest_unique_scores(rows)
        self.assertEqual(len(candidates["model-a"]), 2)
        self.assertNotIn("model-a", unique)
        self.assertEqual(unique["model-b"], (1500, "2026-07-24"))


if __name__ == "__main__":
    unittest.main()

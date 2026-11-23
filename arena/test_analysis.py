import importlib.util
import sys
import types
import unittest
from pathlib import Path

sys.modules.setdefault("duckdb", types.ModuleType("duckdb"))
spec = importlib.util.spec_from_file_location("arena_analysis", Path(__file__).with_name("analysis.py"))
analysis = importlib.util.module_from_spec(spec)
spec.loader.exec_module(analysis)


class SelectionTests(unittest.TestCase):
    def test_filters_and_reports_unknown_models(self):
        rows = [
            ("one", "session", "zh", "us", "cn", "model_a", "gaming"),
            ("two", "session2", "en", "us", "cn", "model_b", "gaming"),
            ("three", "session3", "zh", "unknown", "cn", "model_a", "gaming"),
            ("four", "session4", "zh", "us", "cn", "tie", "gaming"),
            ("one", "session5", "zh", "us", "cn", "model_a", "gaming"),
        ]
        selected, exclusions, unknown = analysis.select_pairs(rows, {"us": "US", "cn": "CN"})
        self.assertEqual([item["id"] for item in selected], ["one"])
        self.assertEqual(exclusions["non_chinese_prompt"], 1)
        self.assertEqual(exclusions["invalid_winner"], 1)
        self.assertEqual(exclusions["missing_or_duplicate_id"], 1)
        self.assertEqual(unknown["unknown"], 1)


if __name__ == "__main__":
    unittest.main()

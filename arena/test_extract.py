import importlib.util
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path

sys.modules.setdefault("duckdb", types.ModuleType("duckdb"))
spec = importlib.util.spec_from_file_location("arena_extract", Path(__file__).with_name("extract.py"))
extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)


class ExtractionTests(unittest.TestCase):
    def test_extracts_safe_files(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "site"
            payload = json.dumps({"files": [{"path": "src/App.tsx", "content": "hello"}]})
            self.assertEqual(extract.extract_site(payload, target), 1)
            self.assertEqual((target / "src" / "App.tsx").read_text(), "hello")

    def test_rejects_traversal_before_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "site"
            payload = json.dumps({"files": [{"path": "ok.txt", "content": "ok"}, {"path": "../escape", "content": "bad"}]})
            with self.assertRaises(ValueError):
                extract.extract_site(payload, target)
            self.assertFalse(target.exists())


if __name__ == "__main__":
    unittest.main()

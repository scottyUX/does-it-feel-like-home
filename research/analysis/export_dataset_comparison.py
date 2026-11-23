"""Export existing paired comparison results for the dashboard."""
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
tables = root / 'research/results/tables'
rows = []
for dataset, file in [('study', 'study_comparisons.csv'), ('arena', 'arena_comparisons.csv')]:
    with (tables / file).open(newline='', encoding='utf-8') as source:
        for row in csv.DictReader(source):
            if row['comparison'] not in (f'{dataset}_origin_zh_prompt', f'{dataset}_origin_en_prompt'):
                continue
            try:
                rows.append({
                    'dataset': dataset, 'language': 'zh' if '_zh_' in row['comparison'] else 'en',
                    'key': row['measure'], 'label': row['label'], 'group': row['group'],
                    'n': int(row['n']), 'us': float(row['mean_us']), 'china': float(row['mean_china']),
                    'difference': float(row['mean_diff']), 'low': float(row['ci_low']), 'high': float(row['ci_high']),
                    'q': float(row['q']), 'higher': int(row['higher']), 'lower': int(row['lower']),
                })
            except (KeyError, ValueError):
                continue
output = tables / 'dataset-comparison.json'
output.write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'Wrote {len(rows)} comparison rows to {output}')

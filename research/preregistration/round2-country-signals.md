# Round 2: confirmatory test of five country signals

Written 2026-11-23, before any round 2 site was generated. Nothing below changes after generation starts.

## Why

Across the 10 local models measured so far (4 Chinese, 6 US), five design measures separated Chinese from US models
in most model pairs. They were picked after looking at those data, so they are hypotheses, not findings
(exact model-level p 0.010 to 0.024 each, q = 0.11 after correcting for 40 measures). Round 2 tests them on models
and labs never used before.

## Models (new labs only, none built on Qwen, Gemma or Llama weights)

| Country | Lab | Model (Ollama) |
|---|---|---|
| China | Baidu | ERNIE 4.5 21B-A3B (hf.co/unsloth/ERNIE-4.5-21B-A3B-PT-GGUF:Q4_K_M) |
| China | ByteDance | Seed-OSS 36B (hf.co/unsloth/Seed-OSS-36B-Instruct-GGUF:Q4_K_M) |
| China | Moonshot | Kimi Linear 48B-A3B (hf.co/bartowski/moonshotai_Kimi-Linear-48B-A3B-Instruct-GGUF:Q4_K_M) |
| China | DeepSeek | DeepSeek-Coder-V2 Lite 16B (deepseek-coder-v2:16b) |
| China | Tencent | Hunyuan A13B (hf.co/unsloth/Hunyuan-A13B-Instruct-GGUF:Q4_K_M) |
| US | Microsoft | Phi-4 14B (phi4:14b) |
| US | IBM | Granite 4.2 30B (granite4.2:30b) |
| US | AI2 | OLMo 3.1 32B Instruct (olmo-3.1:32b-instruct) |
| US | Thinking Machines | Inkling 2 Mini 26B-A5B (inkling-2-mini:26b-a5b) |

Same prompts and settings as round 1: 10 site types x Chinese and English prompts, one run, num_ctx 40000,
num_predict 32000. A model that cannot be loaded or produces fewer than 10 complete sites is dropped and reported.

## Hypotheses (Chinese models higher on all five), home pages

1. `visible_elements_first_screen`: elements on the first screen
2. `footer_links`: footer links
3. `visible_links`: links on the page
4. `page_screens`: page length in desktop screens
5. `price_in_yuan`: share of sites showing prices in yuan

## Tests

- Unit: the model. Each model's value is its mean over its home pages.
- **Primary:** a composite score per model, the mean of the five measures after z-scoring each across the round 2
  models. Exact one-sided permutation test over every way of labelling the round 2 models Chinese (with the observed
  number of Chinese models). Significant if p < 0.05.
- **Secondary:** each of the five measures, the same exact test, Holm correction across the five.
- **Classifier:** logistic regression on these five measures only, trained on the round 1 models, predicting
  China vs US for each round 2 model (mean predicted probability over its home pages); balanced accuracy over models.
- Everything else (all 40 measures, pooling rounds 1 and 2, lab identification) is exploratory.

#!/bin/bash
# Round 2 on the GCP VM: 9 new-lab models x 10 site types x {Chinese, English} prompts, same settings as round 1.
# Chinese and US models alternate so a cut-off run still has both sides. Each model is deleted after its runs (disk).
# Results in ~/gen2/runs/china-audience/{zh,en}/run1/<type>/<alias>/.
cd ~/gen2
MODELS="ernie4.5:21b=hf.co/unsloth/ERNIE-4.5-21B-A3B-PT-GGUF:Q4_K_M phi4:14b=phi4:14b
seed-oss:36b=hf.co/unsloth/Seed-OSS-36B-Instruct-GGUF:Q4_K_M granite4.2:30b=granite4.2:30b
kimi-linear:48b=hf.co/bartowski/moonshotai_Kimi-Linear-48B-A3B-Instruct-GGUF:Q4_K_M olmo-3.1:32b-instruct=olmo-3.1:32b-instruct
deepseek-coder-v2:16b=deepseek-coder-v2:16b inkling-2-mini:26b-a5b=inkling-2-mini:26b-a5b
hunyuan:a13b=hf.co/unsloth/Hunyuan-A13B-Instruct-GGUF:Q4_K_M"
for pair in $MODELS; do
  alias=${pair%%=*}; src=${pair#*=}
  echo "$(date +%H:%M) pull $src"; ollama pull $src >/dev/null 2>&1 || { echo "$(date +%H:%M) PULL FAILED $src"; continue; }
  [ "$alias" != "$src" ] && ollama cp $src $alias >/dev/null 2>&1
  if ! curl -s -m 600 127.0.0.1:11434/api/generate -d "{\"model\":\"$alias\",\"prompt\":\"hi\",\"stream\":false,\"options\":{\"num_ctx\":40000,\"num_predict\":5}}" | grep -q '"done":true'; then
    echo "$(date +%H:%M) LOAD FAILED $alias"; ollama rm $alias $src >/dev/null 2>&1; continue; fi
  for lang in zh en; do echo "$(date +%H:%M) generate $alias $lang"; python3 runs.py china-audience $lang 1 $alias; done
  ollama stop $alias >/dev/null 2>&1; ollama rm $alias $src >/dev/null 2>&1
done
echo "$(date +%H:%M) ALL ROUNDS FINISHED"

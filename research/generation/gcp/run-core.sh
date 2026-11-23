#!/bin/bash
# Both rounds on the GCP VM: 6 new models x 10 site types x {Chinese, English} prompts, same settings as the Spark runs.
# Model-outer so each model is pulled and loaded once. Results in ~/gen/runs/china-audience/{zh,en}/run1/<type>/<model>/.
cd ~/gen
MODELS="glm-4.7-flash:q4_K_M llama4:scout nemotron3:33b glm4:9b gemma3:27b gpt-oss:20b"
for m in $MODELS; do
  echo "$(date +%H:%M) pull $m"; ollama pull $m >/dev/null 2>&1 || { echo "$(date +%H:%M) PULL FAILED $m"; continue; }
  for lang in zh en; do echo "$(date +%H:%M) generate $m $lang"; python3 runs.py china-audience $lang 1 $m; done
  ollama stop $m >/dev/null 2>&1
done
echo "$(date +%H:%M) ALL ROUNDS FINISHED"

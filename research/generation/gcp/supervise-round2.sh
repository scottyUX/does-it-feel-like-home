#!/bin/bash
# Round 2 supervisor: keeps the spot VM going through preemptions until the run finishes, copying sites to the Mac
# every 15 minutes. runs.py skips finished sites, so a relaunch resumes. On finish: final copy, count check, VM stop.
# Gives up restarting at GIVE_UP (stops the VM, keeps what is copied) so a stockout loop cannot run up the bill.
DEST=/Users/scottdavis/Desktop/does-it-feel-like-home/generations-new-labs/gcp-round2
VM=(--project whatsapp-sales-agent --zone us-central1-a --quiet)
GIVE_UP=$(date -j -f "%Y-%m-%d %H:%M" "2026-11-23 20:00" +%s)
mkdir -p "$DEST"
ssh_vm() { gcloud compute ssh study-gen "${VM[@]}" --command "$1" 2>/dev/null; }
status() { gcloud compute instances describe study-gen "${VM[@]}" --format="value(status)" 2>/dev/null; }
sync_now() { ssh_vm "cd ~/gen2 && tar czf - runs run.log 2>/dev/null" | tar xzf - -C "$DEST" 2>/dev/null; }
count_vm() { ssh_vm "find ~/gen2/runs -name _generation.json | wc -l" | tr -d '[:space:]'; }
count_mac() { find "$DEST/runs" -name _generation.json 2>/dev/null | wc -l | tr -d '[:space:]'; }
stop_vm() { gcloud compute instances stop study-gen "${VM[@]}" --discard-local-ssd=true >/dev/null 2>&1 && echo "$(date +%H:%M) VM STOPPED"; }
while true; do
  if [ "$(status)" != "RUNNING" ]; then
    if [ "$(date +%s)" -gt "$GIVE_UP" ]; then echo "$(date +%H:%M) GAVE UP restarting; Mac has $(count_mac) sites"; stop_vm; exit 0; fi
    gcloud compute instances start study-gen "${VM[@]}" >/dev/null 2>&1
    if [ "$(status)" != "RUNNING" ]; then sleep 120; continue; fi
    echo "$(date +%H:%M) VM restarted"; sleep 60
  fi
  if ! ssh_vm "true"; then sleep 60; continue; fi
  if ! ssh_vm "grep -q 'ALL ROUNDS FINISHED' ~/gen2/run.log" && ! ssh_vm "pgrep -f '^bash run-round2' >/dev/null"; then
    ssh_vm "for i in \$(seq 1 60); do curl -s 127.0.0.1:11434/api/tags >/dev/null && break; sleep 2; done; cd ~/gen2 && setsid nohup bash run-round2.sh >> run.log 2>&1 < /dev/null & disown"
    echo "$(date +%H:%M) run (re)launched"
  fi
  sync_now; echo "$(date +%H:%M) synced: Mac has $(count_mac) sites"
  if grep -q "ALL ROUNDS FINISHED" "$DEST/run.log" 2>/dev/null; then
    sync_now; vm=$(count_vm); mac=$(count_mac)
    echo "$(date +%H:%M) finished: VM $vm sites, Mac $mac sites"
    if [ "$vm" = "$mac" ] && [ -n "$vm" ]; then stop_vm; else echo "$(date +%H:%M) COUNT MISMATCH: VM left running"; fi
    exit 0
  fi
  for i in $(seq 1 15); do sleep 60; [ "$(status)" != "RUNNING" ] && break; done
done

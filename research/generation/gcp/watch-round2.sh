#!/bin/bash
# Copies the generated sites from the VM to the Mac every 15 minutes; when both rounds finish, makes a final copy,
# checks the Mac copy matches the VM, and stops the VM (stop, not delete: the VM disk keeps a second copy).
DEST=/Users/scottdavis/Desktop/does-it-feel-like-home/generations-new-labs/gcp-round2
VM=(--project whatsapp-sales-agent --zone us-central1-a --quiet)
mkdir -p "$DEST"
sync_now() { gcloud compute ssh study-gen "${VM[@]}" --command "cd ~/gen2 && tar czf - runs run.log 2>/dev/null" 2>/dev/null | tar xzf - -C "$DEST" 2>/dev/null; }
count_vm() { gcloud compute ssh study-gen "${VM[@]}" --command "find ~/gen2/runs -name _generation.json | wc -l" 2>/dev/null | tr -d '[:space:]'; }
count_mac() { find "$DEST/runs" -name _generation.json 2>/dev/null | wc -l | tr -d '[:space:]'; }
while true; do
  status=$(gcloud compute instances describe study-gen "${VM[@]}" --format="value(status)" 2>/dev/null)
  if [ "$status" != "RUNNING" ]; then echo "$(date +%H:%M) VM is $status (preempted or time limit); Mac has $(count_mac) sites"; exit 0; fi
  sync_now; echo "$(date +%H:%M) synced: Mac has $(count_mac) sites"
  if grep -q "ALL ROUNDS FINISHED" "$DEST/run.log" 2>/dev/null; then
    sync_now; vm=$(count_vm); mac=$(count_mac)
    echo "$(date +%H:%M) finished: VM $vm sites, Mac $mac sites"
    if [ "$vm" = "$mac" ] && [ -n "$vm" ]; then
      gcloud compute instances stop study-gen "${VM[@]}" --discard-local-ssd=true >/dev/null 2>&1 && echo "$(date +%H:%M) VM STOPPED"
    else echo "$(date +%H:%M) COUNT MISMATCH: VM left running for a retry"; fi
    exit 0
  fi
  sleep 900
done

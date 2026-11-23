#!/bin/bash
G="$1"; rm -f "$G/vm"
COMMON=(--project whatsapp-sales-agent --provisioning-model SPOT --image-family common-cu129-ubuntu-2204-nvidia-580 --image-project deeplearning-platform-release --boot-disk-size 250GB --boot-disk-type pd-balanced --maintenance-policy TERMINATE --metadata install-nvidia-driver=True --labels purpose=study-site-generation --max-run-duration 8h --instance-termination-action STOP)
up() { gcloud compute instances describe study-gen --project whatsapp-sales-agent --zone "$1" --format="value(status)" 2>/dev/null | grep -q RUNNING; }
for z in us-central1-a us-central1-c; do echo "spot A100 in $z"
  gcloud compute instances create study-gen --zone $z --machine-type a2-ultragpu-1g --discard-local-ssds-at-termination-timestamp=true "${COMMON[@]}" 2>&1 | grep -E "ERROR|STOCKOUT|RUNNING|resources" | head -2
  up $z && { echo "$z a2-ultragpu-1g" > "$G/vm"; exit 0; }; done
for z in us-central1-a us-central1-c us-east4-c us-west1-a us-east1-b us-west4-a; do echo "spot 4x L4 in $z"
  gcloud compute instances create study-gen --zone $z --machine-type g2-standard-48 "${COMMON[@]}" 2>&1 | grep -E "ERROR|STOCKOUT|RUNNING|resources" | head -2
  up $z && { echo "$z g2-standard-48" > "$G/vm"; exit 0; }; done
echo "NO VM CREATED"

FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends chromium ca-certificates fonts-noto-cjk && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/arena
COPY package.json ./
RUN npm install --ignore-scripts --no-audit --no-fund
COPY render.mjs measurements.mjs page-measures.js ./
USER node
ENTRYPOINT ["node", "/opt/arena/render.mjs"]

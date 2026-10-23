#!/bin/bash
set -euo pipefail

# Deploy IGNES-Telegram-Bot to VPS.
# Excludes bot.env and docker-compose.yml — они создаются вручную и НЕ должны
# быть снесены `--delete` (иначе бот упадёт на рестарте без токена).

cd "$(dirname "$0")"

echo "→ rsync $(pwd)/ → ignes:/opt/ignes-telegram-bot/"
rsync -av --delete \
  --exclude 'node_modules' --exclude 'dist' \
  --exclude '.env' --exclude '.env.*' \
  --exclude '.git' --exclude '.gitignore' \
  --exclude 'bot.env' --exclude 'docker-compose.yml' \
  --exclude '*.md' --exclude 'LICENSE' \
  ./ ignes:/opt/ignes-telegram-bot/

echo "→ docker compose up -d --build bot"
ssh ignes 'cd /opt/ignes-telegram-bot && docker compose up -d --build bot'

echo "→ status"
ssh ignes 'cd /opt/ignes-telegram-bot && docker compose ps'

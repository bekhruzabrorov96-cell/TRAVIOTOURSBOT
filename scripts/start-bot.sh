#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
BUNDLED_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

cd "$ROOT_DIR"

echo "Working folder: $ROOT_DIR"
echo "Checking config..."

if [ ! -f ".env" ]; then
  echo ".env file is missing."
  exit 1
fi

if ! grep -q "^TELEGRAM_BOT_TOKEN=.\+" .env; then
  echo "TELEGRAM_BOT_TOKEN is missing in .env."
  exit 1
fi

if ! grep -q "^MANAGER_CHAT_ID=.\+" .env; then
  echo "MANAGER_CHAT_ID is missing in .env."
  exit 1
fi

echo "Config found."
echo ""

if command -v node >/dev/null 2>&1; then
  exec node src/bot.js
fi

if [ -x "$BUNDLED_NODE" ]; then
  exec "$BUNDLED_NODE" src/bot.js
fi

echo "Node.js was not found. Install Node.js 18+ and run this script again."
exit 1

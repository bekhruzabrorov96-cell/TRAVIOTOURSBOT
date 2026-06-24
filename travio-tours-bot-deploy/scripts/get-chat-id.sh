#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
BUNDLED_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

cd "$ROOT_DIR"

if command -v node >/dev/null 2>&1; then
  exec node src/get-chat-id.js
fi

if [ -x "$BUNDLED_NODE" ]; then
  exec "$BUNDLED_NODE" src/get-chat-id.js
fi

echo "Node.js was not found. Install Node.js 18+ and run this script again."
exit 1

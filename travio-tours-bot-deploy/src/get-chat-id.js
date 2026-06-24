import { existsSync, readFileSync } from "node:fs";

loadEnvFile();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token || token.includes("replace_with_your_bot_token")) {
  console.error("Add TELEGRAM_BOT_TOKEN to .env first.");
  process.exit(1);
}

const apiBase = `https://api.telegram.org/bot${token}`;

console.log("Send any message to your Travio Tours Bot, or add it to your manager group and send a message there.");
console.log("Waiting for chat IDs...");

let offset = 0;

while (true) {
  try {
    const updates = await telegram("getUpdates", {
      offset,
      timeout: 30,
      allowed_updates: ["message"]
    });

    for (const update of updates.result || []) {
      offset = update.update_id + 1;
      const message = update.message;
      if (!message) continue;

      const chat = message.chat;
      console.log("");
      console.log("Chat found:");
      console.log(`Title/name: ${chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || "Unknown"}`);
      console.log(`Chat ID: ${chat.id}`);
      console.log("");
      console.log("Put this into .env as MANAGER_CHAT_ID if this is your manager chat.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    await sleep(1500);
  }
}

async function telegram(method, body) {
  const response = await fetch(`${apiBase}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(`${method} failed: ${payload.description || response.statusText}`);
  }
  return payload;
}

function loadEnvFile(pathname = ".env") {
  if (!existsSync(pathname)) return;

  const lines = readFileSync(pathname, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...parts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = parts.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

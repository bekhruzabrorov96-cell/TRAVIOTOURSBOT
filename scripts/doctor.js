import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

loadEnvFile();

const checks = [];
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const managerChatId = process.env.MANAGER_CHAT_ID || "";
const logoFile = process.env.LOGO_FILE || "assets/travio-logo.png";
const leadsFile = process.env.LEADS_FILE || "work/leads.jsonl";

check("Node.js version", Number(process.versions.node.split(".")[0]) >= 18, process.versions.node);
check("Bot token exists", Boolean(token) && !token.includes("replace_with_your_bot_token"));
check("Bot token format", /^\d+:[A-Za-z0-9_-]+$/.test(token));
check("Manager chat ID exists", Boolean(managerChatId));
check("Manager chat ID format", /^-?\d+$/.test(managerChatId));
check("Logo file exists", existsSync(logoFile), logoFile);
check("Leads file path configured", Boolean(leadsFile), leadsFile);

try {
  const tours = JSON.parse(await readFile("data/tours.json", "utf8"));
  check("Tour catalog JSON", Array.isArray(tours) && tours.length > 0, `${tours.length} tours`);
  check("Tour catalog has destinations", tours.every((tour) => tour.destination && tour.title));
} catch (error) {
  check("Tour catalog JSON", false, error.message);
}

if (process.env.SKIP_TELEGRAM_CHECK === "1") {
  check("Telegram connection", true, "skipped");
} else if (token && /^\d+:[A-Za-z0-9_-]+$/.test(token)) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: "POST"
    });
    const payload = await response.json();
    check("Telegram connection", payload.ok, payload.result?.username ? `@${payload.result.username}` : payload.description);
  } catch (error) {
    check("Telegram connection", false, `${error.message}. If this happens only inside Codex, run this script from your Mac Terminal.`);
  }
}

console.log("");
console.log("Travio Tours Bot Doctor");
console.log("=======================");
for (const item of checks) {
  const mark = item.ok ? "OK" : "FAIL";
  console.log(`${mark}  ${item.name}${item.detail ? ` - ${item.detail}` : ""}`);
}

const failed = checks.filter((item) => !item.ok);
console.log("");
if (failed.length) {
  console.log(`${failed.length} check(s) need attention.`);
  process.exitCode = 1;
} else {
  console.log("Everything looks ready.");
}

function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
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

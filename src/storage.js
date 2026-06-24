import { mkdir, appendFile, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function saveLead(lead, filePath) {
  await mkdir(dirname(filePath), { recursive: true });
  const row = JSON.stringify({
    ...lead,
    createdAt: new Date().toISOString()
  });
  await appendFile(filePath, `${row}\n`, "utf8");
}

export async function loadSessions(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    return new Map(Object.entries(data));
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }
}

export async function saveSessions(sessions, filePath) {
  await mkdir(dirname(filePath), { recursive: true });
  const data = Object.fromEntries([...sessions.entries()].map(([chatId, session]) => [String(chatId), session]));
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function formatLeadForManager(lead, tours) {
  const matches = tours.length
    ? tours.map((tour, index) => `${index + 1}. ${tour.title} - от $${tour.priceFrom}`).join("\n")
    : "Нет точного совпадения, нужен ручной подбор";

  return [
    "Новая заявка из Travio Tours Bot",
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Язык: ${lead.language || "-"}`,
    `Направление: ${lead.destination}`,
    `Людей: ${lead.travelers}`,
    `Потребности: ${lead.needs}`,
    `Дата: ${lead.date}`,
    `Бюджет: ${lead.budget}`,
    `Стиль тура: ${lead.style}`,
    "",
    "Подходящие туры:",
    matches
  ].join("\n");
}

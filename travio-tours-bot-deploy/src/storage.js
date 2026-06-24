import { mkdir, appendFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function saveLead(lead, filePath) {
  await mkdir(dirname(filePath), { recursive: true });
  const row = JSON.stringify({
    ...lead,
    createdAt: new Date().toISOString()
  });
  await appendFile(filePath, `${row}\n`, "utf8");
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

import { readFile } from "node:fs/promises";

const budgetRank = {
  "До $700": 1,
  "$700 gacha": 1,
  "$700-$1200": 2,
  "$1200-$2000": 3,
  "$2000+": 4,
  "Не знаю": 4,
  "Bilmayman": 4
};

const needAliases = {
  "Dengiz bo'yida dam olish": "Пляжный отдых",
  "Ekskursiyalar": "Экскурсии",
  "Oilaviy dam olish": "Семейный отдых",
  "Asal oyi": "Медовый месяц",
  "Shopping": "Шопинг",
  "5* mehmonxona": "Отель 5*",
  "Byudjet tur": "Бюджетный тур",
  "Goryachiy tur": "Горящий тур",
  "Aviachiptalar": "Авиабилеты",
  "Transfer": "Трансфер"
};

const destinationAliases = {
  "Turkiya": "Турция",
  "Misr": "Египет",
  "Tailand": "Таиланд",
  "BAA": "ОАЭ",
  "Xitoy": "Китай",
  "Vyetnam": "Вьетнам",
  "Barcha davlatlar": "Все страны",
  "Ozarbayjon": "Азербайджан",
  "Gruziya": "Грузия",
  "Hindiston": "Индия",
  "Indoneziya": "Индонезия",
  "Qatar": "Катар",
  "Qirg'iziston": "Кыргызстан",
  "Malayziya": "Малайзия",
  "Maldiv orollari": "Мальдивы"
};

const destinationLabels = {
  "Турция": "Turkiya",
  "Египет": "Misr",
  "Таиланд": "Tailand",
  "ОАЭ": "BAA",
  "Китай": "Xitoy",
  "Вьетнам": "Vyetnam",
  "Все страны": "Barcha davlatlar",
  "Азербайджан": "Ozarbayjon",
  "Грузия": "Gruziya",
  "Индия": "Hindiston",
  "Индонезия": "Indoneziya",
  "Катар": "Qatar",
  "Кыргызстан": "Qirg'iziston",
  "Малайзия": "Malayziya",
  "Мальдивы": "Maldiv orollari"
};

export async function loadTours(pathname = "data/tours.json") {
  const raw = await readFile(pathname, "utf8");
  return JSON.parse(raw);
}

export function matchTours(tours, lead) {
  const selectedBudget = budgetRank[lead.budget] || 4;
  const selectedDestination = destinationAliases[lead.destination] || lead.destination;
  const selectedNeeds = normalizeList(lead.needs).map((need) => needAliases[need] || need);
  const selectedStyle = needAliases[lead.style] || lead.style;

  const scored = tours.map((tour) => {
    let score = 0;

    if (selectedDestination === "Все страны" || tour.destination === selectedDestination) {
      score += 10;
    }

    if ((budgetRank[tour.budget] || 4) <= selectedBudget) {
      score += 4;
    }

    if (selectedStyle && tour.needs.includes(selectedStyle)) {
      score += 3;
    }

    for (const need of selectedNeeds) {
      if (tour.needs.includes(need)) score += 2;
    }

    return { ...tour, score };
  });

  return scored
    .filter((tour) => tour.score > 0)
    .sort((a, b) => b.score - a.score || a.priceFrom - b.priceFrom)
    .slice(0, 3);
}

export function formatTourList(tours, language = "ru") {
  if (!tours.length) {
    return language === "uz"
      ? "Hozircha aniq mos variant topilmadi. Menejer qo'lda variantlarni tanlab beradi."
      : "Пока нет точного совпадения. Менеджер подберет варианты вручную.";
  }

  return tours.map((tour, index) => {
    if (language === "uz") {
      return [
        `${index + 1}. ${tour.titleUz || tour.title}`,
        `Yo'nalish: ${destinationLabels[tour.destination] || tour.destination}`,
        `Narx: $${tour.priceFrom} dan / kishi`,
        `Ichiga kiradi: ${tour.descriptionUz || tour.description}`
      ].join("\n");
    }

    return [
      `${index + 1}. ${tour.title}`,
      `Направление: ${tour.destination}`,
      `Цена: от $${tour.priceFrom} / человек`,
      `Что входит: ${tour.description}`
    ].join("\n");
  }).join("\n\n");
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function translateDestination(value, language = "ru") {
  const ruValue = destinationAliases[value] || value;
  if (language === "uz") return destinationLabels[ruValue] || value;
  return ruValue;
}

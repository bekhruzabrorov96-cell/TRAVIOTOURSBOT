import { loadTours, matchTours, formatTourList } from "./catalog.js";
import { formatLeadForManager, loadSessions, saveLead, saveSessions } from "./storage.js";
import { existsSync, readFileSync } from "node:fs";

loadEnvFile();

const token = process.env.TELEGRAM_BOT_TOKEN;
const managerChatId = process.env.MANAGER_CHAT_ID;
const leadsFile = process.env.LEADS_FILE || "work/leads.jsonl";
const sessionsFile = process.env.SESSIONS_FILE || "work/sessions.json";

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN. Create .env or export the variable before starting.");
  process.exit(1);
}

const apiBase = `https://api.telegram.org/bot${token}`;
const instanceId = Math.random().toString(36).slice(2, 8);
const sessions = await loadSessions(sessionsFile);
const tours = await loadTours();

const destinations = [
  "Турция",
  "Египет",
  "Таиланд",
  "ОАЭ",
  "Китай",
  "Вьетнам",
  "Все страны",
  "Азербайджан",
  "Грузия",
  "Индия",
  "Индонезия",
  "Катар",
  "Кыргызстан",
  "Малайзия",
  "Мальдивы"
];

const destinationsUz = [
  "Turkiya",
  "Misr",
  "Tailand",
  "BAA",
  "Xitoy",
  "Vyetnam",
  "Barcha davlatlar",
  "Ozarbayjon",
  "Gruziya",
  "Hindiston",
  "Indoneziya",
  "Qatar",
  "Qirg'iziston",
  "Malayziya",
  "Maldiv orollari"
];

const messages = {
  ru: {
    emptyAnswer: "Пожалуйста, напишите ответ или нажмите кнопку.",
    contactButton: "Отправить номер телефона",
    resultIntro: "Спасибо! Я подобрал подходящие варианты:",
    resultOutro: "Менеджер Travio Tours скоро свяжется с вами и уточнит детали."
  },
  uz: {
    emptyAnswer: "Iltimos, javob yozing yoki tugmani bosing.",
    contactButton: "Telefon raqamni yuborish",
    resultIntro: "Rahmat! Sizga mos turlarni topdim:",
    resultOutro: "Travio Tours menejeri tez orada siz bilan bog'lanib, tafsilotlarni aniqlashtiradi."
  }
};

const steps = [
  {
    key: "language",
    text: "Tilni tanlang / Выберите язык",
    buttons: ["O'zbekcha", "Русский"]
  },
  {
    key: "name",
    text: {
      ru: "Здравствуйте! Я Travio Tours Bot. Помогу подобрать тур за 1 минуту.\n\nНапишите ваше имя.",
      uz: "Assalomu alaykum! Men Travio Tours Botman. Sizga 1 daqiqada mos tur topishga yordam beraman.\n\nIsmingizni yozing."
    },
    buttons: []
  },
  {
    key: "phone",
    text: {
      ru: "Спасибо. Теперь оставьте номер телефона для связи.",
      uz: "Rahmat. Endi bog'lanish uchun telefon raqamingizni qoldiring."
    },
    buttons: [],
    requestContact: true
  },
  {
    key: "destination",
    text: {
      ru: "Куда хотите поехать?",
      uz: "Qaysi davlatga borishni xohlaysiz?"
    },
    buttons: {
      ru: destinations,
      uz: destinationsUz
    }
  },
  {
    key: "travelers",
    text: {
      ru: "Сколько человек поедет?",
      uz: "Necha kishi sayohat qiladi?"
    },
    buttons: {
      ru: ["1", "2", "3-4", "Семья", "Группа"],
      uz: ["1", "2", "3-4", "Oila", "Guruh"]
    }
  },
  {
    key: "needs",
    text: {
      ru: "Что для вас важно в туре? Можно выбрать кнопку или написать несколько вариантов.",
      uz: "Turda siz uchun nima muhim? Tugmani tanlashingiz yoki bir nechta variant yozishingiz mumkin."
    },
    buttons: {
      ru: [
        "Пляжный отдых",
        "Экскурсии",
        "Семейный отдых",
        "Медовый месяц",
        "Шопинг",
        "Отель 5*",
        "Бюджетный тур",
        "Горящий тур",
        "Авиабилеты",
        "Трансфер"
      ],
      uz: [
        "Dengiz bo'yida dam olish",
        "Ekskursiyalar",
        "Oilaviy dam olish",
        "Asal oyi",
        "Shopping",
        "5* mehmonxona",
        "Byudjet tur",
        "Goryachiy tur",
        "Aviachiptalar",
        "Transfer"
      ]
    }
  },
  {
    key: "date",
    text: {
      ru: "Когда планируете вылет?",
      uz: "Qachon uchishni rejalashtiryapsiz?"
    },
    buttons: {
      ru: ["В этом месяце", "В следующем месяце", "Летом", "Зимой", "Гибко"],
      uz: ["Shu oy", "Keyingi oy", "Yozda", "Qishda", "Moslashuvchan"]
    }
  },
  {
    key: "budget",
    text: {
      ru: "Какой примерно бюджет на человека?",
      uz: "Bir kishi uchun taxminiy byudjet qancha?"
    },
    buttons: {
      ru: ["До $700", "$700-$1200", "$1200-$2000", "$2000+", "Не знаю"],
      uz: ["$700 gacha", "$700-$1200", "$1200-$2000", "$2000+", "Bilmayman"]
    }
  },
  {
    key: "style",
    text: {
      ru: "Какой формат тура вам ближе?",
      uz: "Qaysi tur formati sizga yaqinroq?"
    },
    buttons: {
      ru: ["Пляжный отдых", "Экскурсии", "Семейный отдых", "Медовый месяц", "Шопинг", "Бюджетный тур"],
      uz: ["Dengiz bo'yida dam olish", "Ekskursiyalar", "Oilaviy dam olish", "Asal oyi", "Shopping", "Byudjet tur"]
    }
  }
];

async function main() {
  const me = await telegram("getMe", {});
  console.log(`Travio Tours Bot connected as @${me.result.username} [instance ${instanceId}]`);
  await telegram("deleteWebhook", { drop_pending_updates: false });
  console.log("Webhook cleared. Listening for Telegram messages.");
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
        if (update.message) await handleMessage(update.message);
      }
    } catch (error) {
      console.error("Polling error:", error.message);
      await sleep(1500);
    }
  }
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text?.trim();
  console.log(`Message from ${chatId}: ${text || "[non-text message]"}`);

  if (text === "/start" || text === "/restart") {
    await setSession(chatId, { stepIndex: 0, lead: {} });
    await ask(chatId);
    return;
  }

  if (!sessions.has(chatId)) {
    await setSession(chatId, { stepIndex: 0, lead: {} });
    await ask(chatId);
    return;
  }

  const session = sessions.get(chatId);
  const step = steps[session.stepIndex];
  const answer = extractAnswer(message);

  if (!answer) {
    await sendMessage(chatId, messages[session.language || "ru"].emptyAnswer);
    return;
  }

  session.lead[step.key] = answer;
  if (step.key === "language") {
    session.language = answer === "Русский" ? "ru" : "uz";
    session.lead.language = session.language === "ru" ? "Русский" : "O'zbekcha";
  }
  session.stepIndex += 1;
  await persistSessions();

  if (session.stepIndex >= steps.length) {
    await finishLead(chatId, session.lead);
    sessions.delete(chatId);
    await persistSessions();
    return;
  }

  await ask(chatId);
}

async function ask(chatId) {
  const session = sessions.get(chatId);
  const step = steps[session.stepIndex];
  await sendMessage(chatId, textFor(step, session.language), buildKeyboard(step, session.language));
}

async function finishLead(chatId, lead) {
  const matches = matchTours(tours, lead);
  const lang = lead.language === "Русский" ? "ru" : "uz";
  const clientText = [
    messages[lang].resultIntro,
    "",
    formatTourList(matches, lang),
    "",
    messages[lang].resultOutro
  ].join("\n");

  await saveLead({ ...lead, matches: matches.map((tour) => tour.id) }, leadsFile);
  await sendMessage(chatId, clientText, restartKeyboard());

  if (managerChatId) {
    await sendMessage(managerChatId, formatLeadForManager(lead, matches));
    console.log(`Lead sent to manager chat ${managerChatId}`);
  }
}

function extractAnswer(message) {
  if (message.contact?.phone_number) {
    return message.contact.phone_number;
  }
  return message.text?.trim() || "";
}

function buildKeyboard(step, language = "ru") {
  if (step.requestContact) {
    return {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [[{ text: messages[language].contactButton, request_contact: true }]]
      }
    };
  }

  const buttons = buttonsFor(step, language);
  if (!buttons.length) {
    return { reply_markup: { remove_keyboard: true } };
  }

  return {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: chunk(buttons, 2).map((row) => row.map((text) => ({ text })))
    }
  };
}

function restartKeyboard() {
  return {
    reply_markup: {
      resize_keyboard: true,
      keyboard: [[{ text: "/restart" }]]
    }
  };
}

async function setSession(chatId, session) {
  sessions.set(chatId, session);
  await persistSessions();
}

async function persistSessions() {
  await saveSessions(sessions, sessionsFile);
}

async function sendMessage(chatId, text, extra = {}) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text,
    ...extra
  });
}

function textFor(step, language = "ru") {
  if (typeof step.text === "string") return step.text;
  return step.text[language] || step.text.ru;
}

function buttonsFor(step, language = "ru") {
  if (!step.buttons) return [];
  if (Array.isArray(step.buttons)) return step.buttons;
  return step.buttons[language] || step.buttons.ru || [];
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

function chunk(items, size) {
  const rows = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

main().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});

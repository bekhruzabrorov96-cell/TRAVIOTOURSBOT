# Travio Tours Bot

Telegram bot for Travio Tours lead collection.

The bot asks:

1. Language: Uzbek or Russian
2. Name
3. Phone number
4. Destination
5. Number of travelers
6. Client needs
7. Travel date
8. Budget
9. Tour style

Then it matches suitable tour packages, saves the lead, and sends the lead summary to the manager chat.

## Setup

1. Create a Telegram bot with BotFather.
2. Copy `.env.example` to `.env`.
3. Put your bot token into `TELEGRAM_BOT_TOKEN`.
4. Add your manager group or user chat ID to `MANAGER_CHAT_ID`.
5. Check the setup:

```bash
npm run doctor
```

6. Start the bot:

```bash
npm start
```

If `node` or `npm` is not installed on this Mac, use:

```bash
sh scripts/start-bot.sh
```

To check setup without `npm`, use:

```bash
node scripts/doctor.js
```

To find the manager chat ID after adding your token:

```bash
npm run chat-id
```

Then send any message to the bot or manager group. The script will print the chat ID.

Without `npm`, use:

```bash
sh scripts/get-chat-id.sh
```

## Files

- `src/bot.js` - Telegram bot flow
- `src/catalog.js` - tour matching
- `src/storage.js` - lead saving
- `scripts/doctor.js` - setup and error checker
- `data/tours.json` - sample tour catalog
- `assets/travio-logo.png` - Travio Tours logo used by the bot
- `work/leads.jsonl` - saved leads after running the bot

## Notes

This first version uses Telegram long polling, so it does not need a server domain or webhook. Later it can be moved to hosting and connected to Google Sheets or CRM.

## Useful Commands

Check setup:

```bash
sh scripts/doctor.sh
```

Start Telegram bot:

```bash
sh scripts/start-bot.sh
```

Find manager chat ID:

```bash
sh scripts/get-chat-id.sh
```

Open browser demo:

```bash
npm run demo
```

Deploy to cloud:

See [DEPLOY.md](DEPLOY.md).

# Deploy Travio Tours Bot To Cloud

Recommended platform: Render Background Worker.

Why:

- The bot does not need a website.
- It only needs a process that stays running.
- Render Background Worker is made for this kind of always-running job.

## Step 1: Put Project On GitHub

Create a private GitHub repository and upload this folder.

Do not upload `.env`. It is ignored because it contains the private bot token.

## Step 2: Create Render Worker

1. Open Render.
2. Click New.
3. Choose Background Worker.
4. Connect the GitHub repository.
5. Use these settings:

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Plan:

```text
Starter
```

## Step 3: Add Environment Variables

Add these variables in Render:

```text
TELEGRAM_BOT_TOKEN=your_bot_token
MANAGER_CHAT_ID=your_manager_group_chat_id
LEADS_FILE=work/leads.jsonl
```

## Step 4: Deploy

Click Deploy.

When logs show this, the bot is working:

```text
Travio Tours Bot connected as @...
Webhook cleared. Listening for Telegram messages.
```

## Step 5: Test

Open Telegram and send:

```text
/start
```

The first question should be:

```text
Tilni tanlang / Выберите язык
```

## Important

Cloud file storage can reset when redeploying. The manager group notification is the main lead delivery method. Later, connect Google Sheets or CRM for permanent lead storage.

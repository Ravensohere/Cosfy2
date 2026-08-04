# Cosfy

Personal finance app for India — expense tracking, budgets, bill splitting, goals, and an AI-powered layer on top, without ever needing bank login or SMS permissions.

## Features

- **Expenses & income** — quick-add with a text parser (`"chai 40"`, `"salary 50000"`), category/payment-mode chips, monthly budgets.
- **Bill splitting** — scan a receipt, split by item or evenly across a group, settle up.
- **Goals** — savings goals with contributions.
- **Credit card tracker** — statement/due dates, amount owed, due-date reminders on the card list.
- **Salary tax calculator** — old vs new regime (FY2025-26 slabs), 80C, effective rate, which regime saves more.
- **Import expenses** (`/import`) — four ways in, all reviewed before saving:
  - Paste a bank SMS — regex-parsed for amount/merchant/category.
  - Upload a payment screenshot — parsed via OpenAI vision.
  - Upload/record a voice note — transcribed via Whisper, parsed same as quick-add text.
  - Upload a bank statement (CSV or PDF) — bulk-reviewed, then imported.
- **AI insights** (`/insights`) — category spend this month vs last, plus a short LLM-written summary of what changed.
- **Ask AI chat** (`/chat`) — general finance Q&A; pulls live headlines from Alpha Vantage for market/news questions, always shown with a "not financial advice" label.
- **Share-to-Cosfy** — once installed as a PWA on Android/Chrome, Cosfy appears in the OS share sheet; sharing an SMS or notification text lands you in the import flow pre-filled. (No Web Share Target support on iOS — Apple hasn't shipped it.)

## Setup

```bash
npm install
npx prisma migrate deploy   # or `prisma migrate dev` locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

`DATABASE_URL` / `DATABASE_URL_UNPOOLED` — Postgres (Neon), required.

All AI features (chat, spending insights, screenshot import, voice import) run on **Google Gemini Flash** — set a free key once in `.env.local`:

```
GEMINI_API_KEY=""
```

(free key at aistudio.google.com/apikey)

For live finance headlines in chat/insights, set a free Alpha Vantage key:

```
ALPHAVANTAGE_API_KEY=""
```

(free tier at alphavantage.co/support/#api-key, 25 requests/day)

## Stack

Next.js (App Router) + Prisma + Postgres (Neon) + Tailwind. No auth — a guest cookie identifies each device/browser.

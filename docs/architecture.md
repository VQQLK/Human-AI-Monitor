# Human–AI Monitor Architecture

**Version:** 0.2.0  
**Date:** September 18, 2026  
**Status:** working document  
**Language:** [🇷🇺 Русский](architecture.ru.md)

---

## 1. Overview

Human–AI Monitor is built on a **decentralized Cloudflare infrastructure** — a global network of edge servers providing:

- **Zero cold start** — Workers start instantly.
- **Global distribution** — code runs close to the user.
- **Free tier** — up to 100,000 requests/day for Workers.
- **Fault tolerance** — no single point of failure.

**Cost at launch:** $0.

---

## 2. Components

### 2.1. Cloudflare Workers — the "brain" of the system

**Role:** Orchestration of data collection, classification, and public API.

**Single Worker with two handlers:**

1. **`fetch` handler** — public API:
   - `GET /` — project metadata.
   - `GET /health` — health check.
   - `GET /gap` — current Gap Index.
   - `GET /protocols` — list of weekly protocols.
   - `GET /protocols/{week}` — single protocol metadata.
   - `GET /protocols/{week}/content` — Markdown content.
   - `GET /axes/{axis}` — signals for a specific axis.
   - `GET /classify?text=...&kind=ai|human` — classify arbitrary text.
   - `GET /collect?limit=N&max=M` — manual RSS collection.
   - `GET /generate?week=YYYY-MM-DD` — manual protocol generation.

2. **`scheduled` handler** — Cron Trigger:
   - Runs 5 batches daily (13:00, 13:15, 13:30, 13:45, 23:00 UTC).
   - Each batch collects fresh news from 8-9 sources.
   - Classifies each item via Workers AI.
   - Saves to D1.
   - Friday 13:45 UTC: generates interim protocol for current week.
   - Monday 13:45 UTC: generates final protocol for previous week.

**Technology:** TypeScript, Wrangler CLI.

### 2.2. Cloudflare D1 — database

**Role:** Storage of structured data.

**Type:** Serverless SQL (SQLite).

**Free tier:**
- 5 GB storage.
- 5M reads/day.
- 100K writes/day.

**Tables:**
- `items` — classified signals (hash, title, url, axes JSON, relevance, shift, direction, reasoning).
- `protocols` — weekly protocol metadata + Markdown content.
- `gap_history` — Gap Index dynamics.
- `index_history` — values of 12 axes over time.

**Binding:** `DB` (in `wrangler.jsonc`).

### 2.3. Cloudflare Workers AI — classifier

**Role:** Classification of signals along 12 axes.

**Model:** `@cf/qwen/qwen3-30b-a3b-fp8` (open-weight, MoE architecture).

**Why Workers AI:**
- **Independence** — open-weight model, no external providers.
- **Free tier** — 10,000 neurons/day.
- **Global edge** — runs on Cloudflare's 300+ locations.
- **No cold start** — instant inference.

**Binding:** `AI` (in `wrangler.jsonc`).

**Cost:** ~15 neurons per classification (~660 classifications/day free).

### 2.4. Cloudflare Cron Trigger — scheduler

**Role:** Daily automation with batch processing.

**Schedule:** 5 batches daily (UTC):
- `0 13 * * *` — Batch 1 (sources 0-7)
- `15 13 * * *` — Batch 2 (sources 8-15)
- `30 13 * * *` — Batch 3 (sources 16-23)
- `45 13 * * *` — Batch 4 (sources 24-31) + protocol generation
- `0 23 * * *` — Batch 5 (sources 32-40)

**Protocol generation:**
- Friday 13:45 UTC: interim protocol for current week
- Monday 13:45 UTC: final protocol for previous week

**What it does:**
1. Collects fresh RSS items.
2. Classifies via Workers AI.
3. Saves to D1.
4. Generates Markdown protocol for the past week.

---

## 3. Data Flow

Cron Trigger (5 batches daily: 13:00, 13:15, 13:30, 13:45, 23:00 UTC)
|
v
Worker.scheduled() <-- RSS, arXiv, News
|
v (items JSON)
Workers AI (Qwen 3)
|
v (classified items: axes, relevance, shift, reasoning)
D1 Database (4 tables)
|
v
Protocol Generator (Markdown)
|
v
D1 protocols table (EN/RU/ZH)
|
v
GitHub Actions sync-protocols.yml
|
v
GitHub (data/protocols/) -- appears after sync delay

API endpoints <-- Android app / web / external

---

## 4. Security

### 4.1. Secrets

Stored in **Cloudflare Secrets** (not in code):
- `CLOUDFLARE_API_TOKEN` — for deployment (local `.env`).
- `CLOUDFLARE_ACCOUNT_ID` — account identifier (local `.env`).

**Local:** `.env` — **not committed** (in `.gitignore`).

**In Git:** only `.env.example` — template without real values.

### 4.2. Verification

- **D1:** Wrangler validates token and permissions.
- **API:** parameter validation (text length <= 1000 chars).
- **No external AI providers:** all inference runs on Cloudflare's open-weight models.

### 4.3. Privacy

- **Workers AI** — data is not used for model training.
- **D1** — only structured public data.
- **No third-party analytics.**

---

## 5. Deployment

## 6. Protocol Synchronization

### 6.1. Generation vs Visibility

Protocols are generated into D1 database but **not immediately visible** in the repository. Synchronization is handled by GitHub Actions workflow `.github/workflows/sync-protocols.yml`.

### 6.2. Schedule

| Event | Generation time | Sync time | Visibility delay |
|-------|----------------|-----------|------------------|
| **Interim protocol** (Friday) | 13:45 UTC | Saturday 08:00 UTC | ~18 hours |
| **Final protocol** (Monday) | 13:45 UTC | Monday 14:00 UTC | ~15 minutes |

### 6.3. Why the delay?

- **Interim:** generated Friday 13:45, synced Saturday 08:00 (allows weekend review)
- **Final:** generated Monday 13:45, synced Monday 14:00 (immediate publication)

### 6.4. Sync workflow details

The workflow:
1. Fetches latest 2 protocols from D1 API (`/export-weekly?weeks=2`)
2. Writes to `data/protocols/` in collector repo
3. Archives all protocols to `human-ai-monitor-archive` repo
4. Triggers translation workflow (EN→RU/ZH)

### 6.5. Manual sync

```bash
# Trigger sync manually via GitHub Actions UI
gh workflow run sync-protocols.yml
```

### 5.1. Local

```bash
git clone https://github.com/VQQLK/Human-AI-Monitor.git
cd Human-AI-Monitor
npm install
cp .env.example .env
# Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to .env
npx wrangler deploy --dry-run
5.2. Production
bash
# Apply migrations
npx wrangler d1 migrations apply human-ai-monitor-db --remote

# Deploy Worker
npx wrangler deploy
5.3. Cron Trigger
Configured in wrangler.jsonc:

jsonc
"triggers": {
  "crons": [
    "0 13 * * *",
    "15 13 * * *",
    "30 13 * * *",
    "45 13 * * *",
    "0 23 * * *"
  ]
}
Runs 5 batches daily: 13:00, 13:15, 13:30, 13:45, 23:00 UTC.

6. Scaling
6.1. By Load
Resource	Free tier	On excess
Workers	100K requests/day	$5/month per 10M
D1	5 GB, 5M reads/day	$0.75/GB
Workers AI	10K neurons/day	$0.011 per 1K neurons
At launch — everything fits within the Free tier.

6.2. By Geography
Cloudflare has 300+ edge locations.

Worker runs closer to the user.

D1 has regional replicas.

6.3. By Sources
Adding a source — one line in the SOURCES array.

Scaling collection — parallel fetch calls.

Scaling classification — Workers AI handles bursts automatically.

7. Alternatives (for comparison)
Component	Our choice	Alternatives	Why our choice
Runtime	Cloudflare Workers	AWS Lambda, Vercel	Zero cold start, global edge
DB	D1	Postgres, MongoDB	Serverless, free, integrated
LLM	Workers AI (Qwen 3)	OpenAI, Anthropic	Open-weight, free tier, no external
Frontend	SvelteKit + Pages	Next.js, Astro	Lightweight, static export
CI/CD	GitHub Actions	CircleCI	Free, integrated with repo
8. Limitations
No rate limiting. Cloudflare's rate limiting binding is experimental and not available on the Free tier. Mitigation: parameter validation (text <= 1000 chars).

RSS-only collection. HTML parsing not implemented yet. Some sources without RSS are inaccessible.

Single region D1. Currently EEUR. On growth — replicas.

No automatic backups. Planned: weekly export of D1 to R2.

Monolithic src/index.ts. Refactoring into modules is in the roadmap.

9. Roadmap
□ Refactoring: split src/index.ts into 7 modules.
□ Real test coverage (parser, classifier, protocol).
□ Android APK (PWA + Capacitor).
□ Web interface (Cloudflare Pages).
□ Multilingual support (EN / RU / ZH).
□ Push notifications for threshold shifts.
□ HTML parsing for non-RSS sources.
□ Integration with global indices (V-Dem, WHR, Pew).
□ Decentralized mirror (IPFS).
□ Independent methodology audit.
10. Invitation
The architecture is open for improvement. If you see how to make it better — open an Issue or Pull Request.

Together — We Are Strong. The road will be mastered by the one who walks it.

Contact:
GitHub Issues: https://github.com/VQQLK/Human-AI-Monitor/issues

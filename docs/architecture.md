# Human–AI Monitor Architecture

**Version:** 1.0.2  
**Date:** September 29, 2026  
**Status:** working document, open for review  
**Language:** [🇷🇺 Русский](architecture.ru.md) | [🇨🇳 中文](architecture.zh.md)

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
   - `GET /protocols/{week}/content` — Markdown content (EN).
   - `GET /protocols/{week}/content/ru` — Markdown content (RU).
   - `GET /protocols/{week}/content/zh` — Markdown content (ZH).
   - `GET /protocols/current` — live draft of the current (still-open) week (EN, Markdown).
   - `GET /protocols/current/ru` — live draft (RU, Markdown).
   - `GET /protocols/current/zh` — live draft (ZH, Markdown).
   - `GET /protocols/current/view` — HTML view of the live draft (EN).
   - `GET /protocols/current/view/ru` — HTML view of the live draft (RU).
   - `GET /protocols/current/view/zh` — HTML view of the live draft (ZH).
   - `GET /protocols/latest/view` — HTML view of the latest final protocol (EN).
   - `GET /protocols/latest/view/ru` — HTML view (RU).
   - `GET /protocols/latest/view/zh` — HTML view (ZH).
   - `GET /axes-history` — historical axis data.
   - `GET /drift-events` — cron drift events.
   - `GET /verify` — reward-hacking detection.
   - `GET /translate-document` — translate arbitrary Markdown (POST, Bearer auth).
   - `GET /export-weekly` — export protocol data (Bearer auth).
   - `GET /axes/{axis}` — signals for a specific axis.
   - `GET /classify?text=...&kind=ai|human` — classify arbitrary text.
   - `GET /collect?limit=N&max=M` — manual RSS collection.
   - `GET /generate?week=YYYY-MM-DD` — manual protocol generation.

2. **`scheduled` handler** — Cron Trigger:
   - Runs 5 batches daily (13:00, 13:15, 13:30, 13:45, 23:00 UTC).
   - Each batch collects fresh news from 8 sources (batches 1–4) or 7 (evening batch 5).
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
- `index_history` — values of 13 axes (12+1) over time.

**Binding:** `DB` (in `wrangler.jsonc`).

### 2.3. Cloudflare Workers AI — classifier

**Role:** Classification of signals along 13 axes (12+1).

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
5. Dispatches `sync-protocols.yml` and `translate-protocols.yml` via GitHub API (Mon/Fri only).

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
Worker dispatches two workflows in parallel via GitHub API (Mon/Fri only):
  |- sync-protocols.yml       -->  GitHub (data/protocols/) -- EN/RU/ZH files
  '- translate-protocols.yml -->  D1 (regenerate RU/ZH translations)

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

### 5.1. Local

```bash
git clone https://github.com/VQQLK/Human-AI-Monitor.git
cd Human-AI-Monitor
npm install
cp .env.example .env
# Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to .env
npx wrangler deploy --dry-run
```

### 5.2. Production

```bash
# Apply migrations
npx wrangler d1 migrations apply human-ai-monitor-db --remote

# Deploy Worker
npx wrangler deploy
```

### 5.3. Cron Trigger

Configured in `wrangler.jsonc`:

```jsonc
"triggers": {
  "crons": [
    "0 13 * * *",
    "15 13 * * *",
    "30 13 * * *",
    "45 13 * * *",
    "0 23 * * *"
  ]
}
```

Runs 5 batches daily: 13:00, 13:15, 13:30, 13:45, 23:00 UTC.

## 6. Protocol Synchronization

### 6.1. Generation vs Visibility

Protocols are generated into D1 database but **not immediately visible** in the repository. Synchronization is handled by GitHub Actions workflow `.github/workflows/sync-protocols.yml`.

### 6.2. Schedule

Protocols are generated by the Cloudflare Worker at 13:45 UTC on Mon/Fri.
Immediately after generation, the Worker dispatches two GitHub Actions
workflows in parallel via the GitHub API (`workflow_dispatch`):

| Workflow | Trigger | Purpose | Visibility |
|----------|---------|---------|------------|
| `sync-protocols.yml` | Worker dispatch (Mon/Fri ~13:53 UTC) | Sync EN/RU/ZH files to git | ~5–10 min after generation |
| `translate-protocols.yml` | Worker dispatch (Mon/Fri ~13:53 UTC) | Regenerate RU/ZH in D1 | Next sync cycle |

> **Historical note:** both workflows still carry a `schedule:` trigger, but
> GitHub's scheduled runs are unreliable (delays of 4+ hours, skipped runs).
> The Worker's dispatch is the primary, dependable path.

### 6.3. Translation lag

English is the primary language. RU/ZH translations are regenerated
asynchronously by `translate-protocols.yml`, in parallel with sync.
As a result:

- **EN files** appear in git ~5–10 minutes after generation.
- **RU/ZH files** may lag by one sync cycle (up to ~3–4 days): `sync` picks
  up whatever translations are already in D1 at the moment it runs, and
  `translate` updates D1 in parallel.

This trade-off is intentional: keeping translation off the critical path
avoids exceeding Cloudflare Free tier limits (subrequests, CPU time) on
the Worker that generates protocols.

### 6.4. Workflow details

`sync-protocols.yml`:
1. Fetches latest 2 protocols from D1 API (`/export-weekly?weeks=2`)
2. Writes to `data/protocols/` in collector repo
3. Archives all protocols to `human-ai-monitor-archive` repo
4. Commits changes to both repos

`translate-protocols.yml`:
1. Resolves the latest week via `/protocols`
2. Calls `GET /translate/{week}` (Bearer auth) to regenerate RU/ZH in D1
3. Verifies translations via `/protocols/{week}/content/ru` and `/zh`

Both workflows are dispatched by the Worker in parallel. `sync` does **not**
invoke `translate`.

### 6.5. Emergency sync (troubleshooting)

Under normal operation, both workflows are dispatched automatically by
the Worker after protocol generation. Manual triggering is only needed
in extraordinary circumstances: if automatic dispatch fails, or when
re-running is required after a partial failure.

```bash
gh workflow run sync-protocols.yml
gh workflow run translate-protocols.yml
```

These commands are not part of routine operation.


## 7. Scaling

### 7.1. By Load
| Resource | Free tier | On excess |
|----------|-----------|-----------|
| Workers | 100K requests/day | $5/month per 10M |
| D1 | 5 GB, 5M reads/day | $0.75/GB |
| Workers AI | 10K neurons/day | $0.011 per 1K neurons |
At launch — everything fits within the Free tier.

### 7.2. By Geography
Cloudflare has 300+ edge locations.

Worker runs closer to the user.

D1 has regional replicas.

### 7.3. By Sources
Adding a source — one line in the SOURCES array.

Scaling collection — parallel fetch calls.

Scaling classification — Workers AI handles bursts automatically.

## 8. Alternatives (for comparison)
| Component | Our choice | Alternatives | Why our choice |
|-----------|-----------|--------------|----------------|
| Runtime | Cloudflare Workers | AWS Lambda, Vercel | Zero cold start, global edge |
| DB | D1 | Postgres, MongoDB | Serverless, free, integrated |
| LLM | Workers AI (Qwen 3) | OpenAI, Anthropic | Open-weight, free tier, no external |
| Frontend | SvelteKit + Pages | Next.js, Astro | Lightweight, static export |
| CI/CD | GitHub Actions | CircleCI | Free, integrated with repo |
## 9. Limitations
No rate limiting. Cloudflare's rate limiting binding is experimental and not available on the Free tier. Mitigation: parameter validation (text <= 1000 chars).

RSS-only collection. HTML parsing not implemented yet. Some sources without RSS are inaccessible.

Single region D1. Currently EEUR. On growth — replicas.

No automatic backups.

Monolithic src/index.ts. Refactoring into modules is in the roadmap.

## 10. Roadmap
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
## 11. Invitation
The architecture is open for improvement. If you see how to make it better — open an Issue or Pull Request.

Together — We Are Strong. The road will be mastered by the one who walks it.

Contact:
GitHub Issues: https://github.com/VQQLK/Human-AI-Monitor/issues

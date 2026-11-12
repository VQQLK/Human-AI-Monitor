# 🌍 Human–AI Monitor

**An open tool for monitoring the development of Artificial Intelligence 
and Humanity.**

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md) [![EN](https://img.shields.io/badge/lang-EN-blue.svg)](README.md) [![RU](https://img.shields.io/badge/lang-RU-red.svg)](README.ru.md) [![ZH](https://img.shields.io/badge/lang-ZH-yellow.svg)](README.zh.md) [![Protocol](https://img.shields.io/badge/Protocol-final%20en-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view) [![Protocol](https://img.shields.io/badge/Protocol-final%20ru-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-final%20zh-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/zh)<br>
[![Protocol](https://img.shields.io/badge/Protocol-current%20en-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view) [![Protocol](https://img.shields.io/badge/Protocol-current%20ru-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-current%20zh-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/zh)

## 📊 Current State of Development

**Updated:** November 12, 2026  
**Baseline:** Updated on November 12, 2026 — based on 541 items (sample size: 506).

### 🌍 Human–AI Gap Index (Achievements vs Progress)

<div align="center">

| Metric | Value (11-12) | Status |
|:---|:---:|:---:|
| **🟢 Humanity Score** | 🌐 **0.647** | Current value |
| **🔴 AI Score** | 🤖 **0.805** | Current value |
| **⚖️ Gap Index** | ⚖️ **−0.158** | AI is ahead |
| **📊 CI95** | **[−0.395, +0.089]** | Inconclusive |
| **⚡ Threshold Shifts** | **10** | Critical events detected |
| **📈 Items Analyzed** | **541** | Weekly sample |
| **🔬 Sample Size (Bayesian)** | **506** | Axis-signal pairs |

</div>

#### 📈 Score Dynamics (Humanity vs AI)

> 📊 **Chart Legend:** 🟢 **Bars = Humanity** | 🔴 **Line = AI**. History since first final protocol.

```mermaid
xychart-beta
    title "🟢 Humanity (bars) vs 🔴 AI (line) | History"
    x-axis ["01/11", "08/11"]
    y-axis "Score" 0.400 --> 0.938
    bar [0.679, 0.614]
    line [0.814, 0.888]
```

#### 📉 Gap Index Dynamics (Humanity minus AI)

```mermaid
xychart-beta
    title "Gap Index | Positive = Humanity leading, Negative = AI leading"
    x-axis ["01/11", "08/11"]
    y-axis "Gap" -0.324 --> 0.250
    line [-0.135, -0.274]
```

#### 📅 Daily Gap trajectory

```mermaid
xychart-beta
    title "Daily Gap | Positive = Humanity leading, Negative = AI leading"
    x-axis ["27/10", "28/10", "29/10", "30/10", "31/10", "01/11", "03/11", "04/11", "05/11", "06/11", "07/11", "08/11", "10/11", "11/11", "12/11"]
    y-axis "Gap" -0.380 --> 0.041
    line [-0.059, -0.125, -0.105, -0.101, -0.112, -0.139, -0.135, -0.271, -0.258, -0.280, -0.272, -0.269, -0.205, -0.246, -0.158]
```

| Date | AI | Humanity | Gap | CI95 | Items | Sample | Type |
|---|---|---|---|---|---|---|---|
| 12/11 | 0.805 | 0.647 | −0.158 | [−0.395, +0.089] | 541 | 506 | INTERIM |
| 11/11 | 0.794 | 0.548 | −0.246 | [−0.510, +0.035] | 407 | 392 | INTERIM |
| 10/11 | 0.774 | 0.569 | −0.205 | [−0.480, +0.086] | 253 | 251 | INTERIM |
| 08/11 | 0.883 | 0.615 | −0.269 | [−0.469, −0.070] | 966 | 895 | INTERIM |
| 07/11 | 0.870 | 0.598 | −0.272 | [−0.486, −0.059] | 849 | 804 | INTERIM |
| 06/11 | 0.853 | 0.574 | −0.280 | [−0.496, −0.057] | 716 | 692 | INTERIM |
| 05/11 | 0.827 | 0.569 | −0.258 | [−0.489, −0.017] | 565 | 542 | INTERIM |
| 04/11 | 0.800 | 0.529 | −0.271 | [−0.516, −0.003] | 417 | 382 | INTERIM |
| 03/11 | 0.731 | 0.596 | −0.135 | [−0.433, +0.174] | 271 | 247 | INTERIM |
| 01/11 | 0.814 | 0.675 | −0.139 | [−0.357, +0.104] | 822 | 720 | INTERIM |
| 31/10 | 0.791 | 0.679 | −0.112 | [−0.340, +0.138] | 712 | 630 | INTERIM |
| 30/10 | 0.771 | 0.670 | −0.101 | [−0.342, +0.150] | 583 | 531 | INTERIM |
| 29/10 | 0.757 | 0.652 | −0.105 | [−0.353, +0.154] | 452 | 422 | INTERIM |
| 28/10 | 0.721 | 0.596 | −0.125 | [−0.409, +0.165] | 315 | 302 | INTERIM |
| 27/10 | 0.679 | 0.620 | −0.059 | [−0.370, +0.260] | 167 | 147 | INTERIM |

#### 📚 Historical Protocols

| Week | AI | Humanity | Gap | CI95 | Items | Sample | Type |
|---|---|---|---|---|---|---|---|
| 08/11 | 0.888 | 0.614 | −0.274 | [−0.473, −0.075] | 991 | 918 | FINAL |
| 01/11 | 0.814 | 0.679 | −0.135 | [−0.351, +0.102] | 838 | 730 | FINAL |

> 📌 Interim (reference, not on chart): 12/11 — AI 0.805 · Humanity 0.647 · Gap −0.158 · 541 / 506 items.
> Last point is INTERIM — will be replaced by FINAL on Monday.

---



## Voices

### 🧠 Frontier Labs

**Nvidia — 2026-11-12**

> Bracing for Nvidia's impact

— *[Axios](https://www.axios.com/2026/11/12/bracing-for-nvidias-impact)*

**Nvidia — 2026-11-12**

> Jensen Huang, an architect of the AI boom, resigns as Nvidia CEO

— *[Axios](https://www.axios.com/2026/11/12/nvidia-jensen-huang-out)*

**Jensen Huang (Nvidia) — 2026-11-12**

> Jensen Huang, an architect of the AI boom, resigns as Nvidia CEO

— *[Axios](https://www.axios.com/2026/11/12/nvidia-jensen-huang-out)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-11-12**

> Zelensky says Musk-owned satellite system throttled again

— *[Axios](https://www.axios.com/2026/11/12/ukraine-starshield-restricted-spacex-russia-zelensky)*

**Jensen Huang (Nvidia) — 2026-11-12**

> Jensen Huang's ouster triggers an AI earthquake

— *[Axios](https://www.axios.com/2026/11/12/jensen-huang-nvidia-board)*

**Nvidia — 2026-11-12**

> LIVE: Jensen Huang resigns as Nvidia CEO as affairs raise security concerns

— *[Al Jazeera](https://www.aljazeera.com/news/liveblog/2026/11/12/live-jensen-huang-resigns-as-nvidia-ceo-as-affairs-raise-security-concerns?traffic_source=rss)*

**Jensen Huang (Nvidia) — 2026-11-12**

> LIVE: Jensen Huang resigns as Nvidia CEO as affairs raise security concerns

— *[Al Jazeera](https://www.aljazeera.com/news/liveblog/2026/11/12/live-jensen-huang-resigns-as-nvidia-ceo-as-affairs-raise-security-concerns?traffic_source=rss)*

**Nvidia — 2026-11-12**

> Trump heads to China amid Nvidia scandal: Will he get tougher on Beijing?

— *[Al Jazeera](https://www.aljazeera.com/news/2026/11/12/trump-heads-to-china-amid-nvidia-scandal-will-he-get-tougher-on-beijing?traffic_source=rss)*

**Nvidia — 2026-11-12**

> Nvidia CEO Jensen Huang resigns, company says

— *[CBS News — Technology](https://www.cbsnews.com/video/nvidia-ceo-jensen-huang-resigns-company-says/)*

**Nvidia — 2026-11-12**

> Nvidia set to lose $700 billion in value as Jensen Huang resigns

— *[CBS News — Technology](https://www.cbsnews.com/news/nvidia-stock-nvda-ceo-jensen-huang/)*

**Jensen Huang (Nvidia) — 2026-11-12**

> Nvidia CEO Jensen Huang resigns, company says

— *[CBS News — Technology](https://www.cbsnews.com/video/nvidia-ceo-jensen-huang-resigns-company-says/)*

**Jensen Huang (Nvidia) — 2026-11-12**

> Nvidia set to lose $700 billion in value as Jensen Huang resigns

— *[CBS News — Technology](https://www.cbsnews.com/news/nvidia-stock-nvda-ceo-jensen-huang/)*

**Nvidia — 2026-11-12**

> Company under scrutiny for ties to Nvidia and China

— *[CBS News — Technology](https://www.cbsnews.com/news/megaspeed-nvidia-china-ties/)*

**Nvidia — 2026-11-12**

> Nvidia CEO Jensen Huang resigns in wake of affair, spy scandal

— *[CBS News — Technology](https://www.cbsnews.com/news/nvidia-ceo-jensen-huang-resigns/)*

**Jensen Huang (Nvidia) — 2026-11-12**

> Nvidia CEO Jensen Huang resigns in wake of affair, spy scandal

— *[CBS News — Technology](https://www.cbsnews.com/news/nvidia-ceo-jensen-huang-resigns/)*

**Nvidia — 2026-11-12**

> Live updates: Huang exits Nvidia; Democrats look to Alaska, with Colom elected in Mississippi

— *[The Hill — Policy](https://thehill.com/homenews/administration/6214786-live-updates-trump-midterms-alaska-congress/)*

**Jensen Huang (Nvidia) — 2026-11-12**

> Live updates: Huang exits Nvidia; Democrats look to Alaska, with Colom elected in Mississippi

— *[The Hill — Policy](https://thehill.com/homenews/administration/6214786-live-updates-trump-midterms-alaska-congress/)*

**Nvidia — 2026-11-12**

> Jensen Huang resigns from Nvidia following affair reports

— *[Politico — Technology](https://www.politico.com/news/2026/11/12/nvidia-ousts-jensen-huang-amid-reports-of-affairs-with-two-women-01161630)*

**Jensen Huang (Nvidia) — 2026-11-12**

> Jensen Huang resigns from Nvidia following affair reports

— *[Politico — Technology](https://www.politico.com/news/2026/11/12/nvidia-ousts-jensen-huang-amid-reports-of-affairs-with-two-women-01161630)*

**xAI — 2026-11-10**

> Grok Build coding agent leaks oodles of confidential info, some belonging to SpaceXSI

— *[Ars Technica — AI](https://arstechnica.com/security/2026/11/grok-build-coding-agent-leaks-oodles-of-confidential-info-some-belonging-to-spacexsi/)*

**OpenAI — 2026-11-10**

> ChatGPT is getting verified AI ‘Business Agents’

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1030552/openai-chatgpt-business-agents-hub)*

**Google — 2026-11-11**

> Google’s AlphaGenome 2 zooms in on the cellular roots of disease

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1031524/google-deepmind-alphagenome-2-genetic-ai-model)*

**Jensen Huang (Nvidia) — 2026-11-10**

> The US is winning the AI race. Jensen Huang could have blown it

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1031063/jensen-huang-ai-race-us-china-spy)*

**Google — 2026-11-11**

> Google’s Tabletop AI experiment lets you build custom collaboration apps

— *[The Verge — AI](https://www.theverge.com/tech/1031526/google-tabletop-ai-experiment-waitlist-availability)*

**Nvidia — 2026-11-12**

> Nvidia CEO Jensen Huang resigns amid spy, affair scandals

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1031689/jensen-huang-nvidia-ceo-resigns)*

**Nvidia — 2026-11-11**

> Nvidia is reportedly preparing to fire Jensen Huang

— *[The Verge — AI](https://www.theverge.com/tech/1031652/jensen-huang-rumor)*

**Jensen Huang (Nvidia) — 2026-11-12**

> Nvidia CEO Jensen Huang resigns amid spy, affair scandals

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1031689/jensen-huang-nvidia-ceo-resigns)*

**Jensen Huang (Nvidia) — 2026-11-11**

> Nvidia is reportedly preparing to fire Jensen Huang

— *[The Verge — AI](https://www.theverge.com/tech/1031652/jensen-huang-rumor)*

**Meta — 2026-11-12**

> Meta’s New Agreements Bring Clean Manufacturing to Data Center Supply Chains

— *[Meta AI Blog](https://about.fb.com/news/2026/11/meta-new-agreements-clean-manufacturing-data-center-supply-chains/)*

**Nvidia — 2026-11-10**

> Scoop: Commerce Department received national security warning on Nvidia CEO affair

— *[Axios](https://www.axios.com/2026/11/10/lutnick-nvidia-jensen-huang-china-memo)*

**Jensen Huang (Nvidia) — 2026-11-10**

> Scoop: Commerce Department received national security warning on Nvidia CEO affair

— *[Axios](https://www.axios.com/2026/11/10/lutnick-nvidia-jensen-huang-china-memo)*

**OpenAI — 2026-11-11**

> AI Engineer Code Summit: OpenAI on New Ways of Working With Codex

— *[Latent Space](https://latent.space/p/codex-work/)*

**Jensen Huang (Nvidia) — 2026-11-11**

> Jensen Huang Affair Strains Taiwan’s Devotion to Its Hometown Hero

— *[WSJ — World News](https://www.wsj.com/world/asia/the-jensen-huang-scandal-is-testing-taiwans-devotion-to-its-hometown-hero-2a2914d9?mod=rss_worldnews)*

**Nvidia — 2026-11-10**

> Nvidia and Jensen Huang face shareholder lawsuit alleging investors were misled about spy affair

— *[The Hill — Policy](https://thehill.com/policy/technology/nvidia-jensen-huang-shareholder-lawsuit/)*

**Jensen Huang (Nvidia) — 2026-11-10**

> Nvidia and Jensen Huang face shareholder lawsuit alleging investors were misled about spy affair

— *[The Hill — Policy](https://thehill.com/policy/technology/nvidia-jensen-huang-shareholder-lawsuit/)*

**Nvidia — 2026-11-10**

> Nvidia hires Wachtell Lipton for Jensen Huang investigation

— *[Politico — Technology](https://www.politico.com/news/2026/11/10/nvidia-wachtell-lipton-jensen-huang-01159501)*

**Nvidia — 2026-11-11**

> Senate Banking Republican calls on Nvidia CEO to resign

— *[Politico — Technology](https://www.politico.com/news/2026/11/10/senate-banking-republican-nvidia-ceo-resign-01160543)*

**Jensen Huang (Nvidia) — 2026-11-10**

> Nvidia hires Wachtell Lipton for Jensen Huang investigation

— *[Politico — Technology](https://www.politico.com/news/2026/11/10/nvidia-wachtell-lipton-jensen-huang-01159501)*

**Jensen Huang (Nvidia) — 2026-11-11**

> Senate Banking Republican calls on Nvidia CEO to resign

— *[Politico — Technology](https://www.politico.com/news/2026/11/10/senate-banking-republican-nvidia-ceo-resign-01160543)*

**Nvidia — 2026-11-11**

> Nvidia loses ground in Washington chip fight after CEO spy scandal

— *[Politico — Technology](https://www.politico.com/news/2026/11/10/nvidia-ceos-spy-scandal-tilts-capitol-hills-chip-fight-01160548)*

**Nvidia — 2026-11-11**

> Jensen Huang’s crisis becomes Nvidia’s Washington problem

— *[Politico — Technology](https://www.politico.com/news/2026/11/11/jensen-huang-washington-problem-01160374)*

**Jensen Huang (Nvidia) — 2026-11-11**

> Jensen Huang’s crisis becomes Nvidia’s Washington problem

— *[Politico — Technology](https://www.politico.com/news/2026/11/11/jensen-huang-washington-problem-01160374)*

**Google — 2026-11-10**

> Pay for Hugging Face Hub with your Google Cloud Account

— *[Hugging Face Blog](https://huggingface.co/blog/hub-gcp-marketplace)*

**Google — 2026-11-10**

> Gemini 4 Carbon is now available

— *[Google DeepMind Blog](https://deepmind.google/blog/gemini-4-carbon-is-now-available/)*

**OpenAI — 2026-11-10**

> Singapore Airlines elevates travel & work with OpenAI technology

— *[OpenAI Blog](https://openai.com/index/singapore-airlines-travel-work)*

**OpenAI — 2026-11-10**

> Cogent and OpenAI build cyber defense factories for enterprises

— *[OpenAI Blog](https://openai.com/index/cogent-security)*

**OpenAI — 2026-11-11**

> ChatGPT Plus for veterans and servicemembers

— *[OpenAI Blog](https://openai.com/index/chatgpt-plus-for-veterans)*

**OpenAI — 2026-11-10**

> Introducing Businesses in ChatGPT

— *[OpenAI Blog](https://openai.com/index/introducing-businesses-chatgpt)*

**Nvidia — 2026-11-10**

> How Nvidia's crisis and politics could deliver the pause AI leaders want

— *[Axios](https://www.axios.com/2026/11/10/ai-race-politics-slowdown)*

**Nvidia — 2026-11-10**

> Jeffries pushes tighter China chip restrictions amid Nvidia CEO scandal

— *[The Hill — Policy](https://thehill.com/policy/technology/6210410-jeffries-backs-china-ai-chip-restrictions/)*

## What is this

`human-ai-monitor` is a weekly protocol that tracks **13 axes (12+1)**:

**6 AI axes (RSI — Recursive Self-Improvement):**

- **SMD** — Self-Modification Depth
- **ITQ** — Improvement Trajectory Quality
- **AGG** — Autonomous Goal Generation
- **Cycle Velocity** — Speed of improvement cycles
- **Verification** — Verification hierarchy
- **Hexad** — Phase transition detection

**1 Geopolitical meta-layer (measured, NOT in AI_score/Human_score):**

- **Geopolitics** — AI governance blocs, WAICO, export controls

**6 Human Achievement axes (HHI — Human Horizon Index):**

- **H1 Science** — Scientific Breakthroughs
- **H2 Engineering** — Engineering & Infrastructure
- **H3 Culture** — Culture & Arts
- **H4 Institutions** — Institutions & Education
- **H5 Wellbeing** — Wellbeing & Health
- **H6 Governance** — Governance & Rights

**Gap Index** — the gap between AI development and Humanity's state.

---

## Live API

The system is deployed and publicly accessible:

| Endpoint         | URL                                                                                          |
|------------------|----------------------------------------------------------------------------------------------|
| Root             | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/                             |
| Gap Index        | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap                          |
| Protocols        | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols                    |
| Example protocol | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/2026-09-28/content |

Try (as plain URLs):

    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap
    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/axes/itq

---

## Why

Tech leaders proclaim singularity. Alignment researchers admit there is no 
plan. Regulators offer voluntary measures. Scientists warn about 
misaligned goals.

**But no one publishes a weekly report on what is happening to us.**

This tool does three things:

1. **Collects** open data from RSS, arXiv, news sources.
2. **Classifies** it along 13 axes (12+1) using LLMs.
3. **Publishes** a weekly protocol and Gap Index — free, open, 
   reproducible.

---

## Architecture

- **Cloudflare Workers** (TypeScript) — runtime, 20 API endpoints, Cron 
  Trigger
- **Cloudflare D1** (Serverless SQLite) — 4 tables: items, protocols, 
  gap_history, index_history
- **Cloudflare Workers AI** — classifier model: 
  `@cf/qwen/qwen3-30b-a3b-fp8` (open-weight)
- **Cron Trigger** — 5 batches daily:
  - Daytime (15:00, 15:15, 15:30, 15:45 UTC): 4 batches
  - Evening (16:00 UTC): 1 batch (protocol generation)
  - Sources dynamically allocated via `computeBatches()` — auto-adapts
    to `SOURCES.length`. Current: 60 sources across 5 batches
    (capacity 60, maxPerSource=10, governed by `SUBREQUEST_LIMIT=50`).

**No external AI providers.** All classification runs on open-weight 
models hosted by Cloudflare Workers AI.

---

## Philosophy

- **Transparency**: all prompts and sources are visible in the repo.
- **Reproducibility**: every protocol links to data hashes.
- **Extensibility**: adding a source = one line in YAML config + regenerate TypeScript.
- **Accessibility**: public API + planned Android app.
- **Independence**: Cloudflare Workers AI with open-weight models.
- **Free forever**: MIT License.

---

## Research

**🌍 Has the Singularity Already Arrived?**

A comprehensive interdisciplinary analysis of 2026 empirical data on autonomous AI agent behavior and its correspondence to technological singularity criteria. Based on 15 verified cases, mathematical achievements, economic indicators, and regulatory initiatives, we formulate the new paradigm of Functional Self-improvement and Self-creation (FSC).

**Key finding:** singularity in the classical sense has not arrived, but a qualitatively new paradigm has formed.

**Available in three languages:**

- 🇺🇸 [English](research/en/README.md)
- 🇷🇺 [Русский](research/ru/README.md)
- 🇨🇳 [中文](research/zh/README.md)

**Structure:**

- Part I: Introduction, Theoretical Foundations, Methodology (SAS scale)
- Part II: Empirical Base (15 verified cases, SAS assessments)
- Part III: Analysis of Correspondence to Singularity Criteria (4 criteria + FSC)
- Part IV: Discussion (Declarations vs Empirics, Three Polar Worlds, Risks)
- Part V: Conclusions (10 conclusions, answers to research questions, recommendations)

**How to cite:**

Human–AI Monitor Research Team. (2026). Has the Singularity Already Arrived? Analysis of the Transition from AI Autonomy to Self-Improvement and Self-Creation. GitHub: https://github.com/VQQLK/Human-AI-Monitor

---

## Current status

**Current release (v1.1.0):**

- ✅ Cloudflare Worker with 20 API endpoints — deployed
- ✅ `/verify` endpoint — CheatBench-inspired reward hacking detection
- ✅ D1 database (4 tables, populated)
- ✅ Workers AI classifier (Qwen 3, calibrated for 13 axes (12+1))
- ✅ RSS + HTML collector (60 sources: 30 AI + 30 Human)
- ✅ Weekly protocol auto-generation (Markdown, EN/RU/ZH)
- ✅ Daily interim protocol, weekly FINAL on Monday
- ✅ Cron Trigger (5 batches daily: 15:00-15:45 + 16:00 UTC)
- ✅ First fully autonomous daily cycle completed (September 25, 2026)
- ✅ Public API accessible worldwide
- ✅ Type-safe YAML → TypeScript pipeline (build-time code generation)
- ✅ Modular architecture (14 modules instead of monolith)
- ✅ CI/CD via GitHub Actions (automatic tests on every push)
- ✅ 148 unit tests passing (across 12 test suites via `npm run test`; API entry point excluded)

**In progress:**

- 🔄 Integration tests (end-to-end flow)
- 🔄 Android APK (PWA + Capacitor)
- 🔄 Web interface (Cloudflare Pages)

**Roadmap:**

- [x] Multilingual support (EN / RU / ZH) ✅
- [ ] Push notifications for threshold shifts
- [ ] HTML parsing for non-RSS sources
- [ ] Integration with global indices (V-Dem, WHR, Pew)
- [ ] Decentralized mirror (IPFS)
- [ ] Independent methodology audit

**Known limitations:**

- ⚠️ RSS-only collection; HTML parsing implemented (`fetchFromHtml()` in `src/index.ts`) but currently unused — no sources configured with `type: html`
- ⚠️ `shift` field may over-trigger on general news
- ⚠️ OECD and Edelman use Google News RSS as fallback (news *about* topics, not official press releases)
- ⚠️ Methodological structure: 13 axes (12+1) = 6 AI (RSI) + 6 Humanity (HHI) + 1 Geopolitical meta-layer. Geopolitics is measured and published but **NOT included** in AI_score or Human_score.

---

## Quick start

    git clone https://github.com/VQQLK/Human-AI-Monitor.git
    cd Human-AI-Monitor
    npm install
    cp .env.example .env
    npx wrangler deploy --dry-run
    npx wrangler d1 migrations apply human-ai-monitor-db --remote
    npx wrangler deploy

Test manually (as plain URL):

    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap

---

## API reference

| Method | Path                                  | Auth     | Description                                 |
| ------ | ------------------------------------- | -------- | ------------------------------------------- |
| GET    | /                                     | public   | Project metadata                            |
| GET    | /health                               | public   | Health check                                |
| GET    | /gap                                  | public   | Current Gap Index                           |
| GET    | /protocols                            | public   | List of weekly protocols                    |
| GET    | /protocols/{week}                     | public   | Single protocol metadata                    |
| GET    | /protocols/{week}/content             | public   | Markdown content (EN)                       |
| GET    | /protocols/{week}/content/ru          | public   | Markdown content (RU)                       |
| GET    | /protocols/{week}/content/zh          | public   | Markdown content (ZH)                       |
| GET    | /axes/{axis}                          | public   | Signals for a specific axis                 |
| GET    | /axes-history                         | public   | Historical axis levels (transparency)       |
| GET    | /verify                               | public   | Detect reward hacking (CheatBench-inspired) |
| GET    | /classify                             | Bearer   | Classify arbitrary text                     |
| GET    | /collect                              | Bearer   | Manual RSS collection                       |
| GET    | /generate                             | Bearer   | Manual protocol generation                  |
| GET    | /export-weekly                        | Bearer   | Bulk export of all protocols                |
| GET    | /translate/{week}                     | Bearer   | Translate protocol to RU + ZH               |
| GET    | /translate-document                   | Bearer   | Translate arbitrary Markdown                |

**Authentication.** Endpoints marked **Bearer** require an `Authorization: Bearer <token>` header. The token is set as a Cloudflare Worker Secret (`ADMIN_SECRET_CURRENT`) and rotated weekly, with a 24-hour `ADMIN_SECRET_PREVIOUS` overlap for zero-downtime rotation. See `.env.example` for local-dev setup. Endpoints marked **public** are anonymous.
> **Protocol addressing:** `{week}` in API URLs and the DB key on the week's **start** (Monday): the protocol covering 2026-09-28..10-04 is `GET /protocols/2026-09-28/content`. File names use the week's **end** (Sunday): `2026-10-04.md`. The legacy D1 `path` column is week_start-based — sync builds file names itself.

### Export endpoint

The `/export-weekly` endpoint exports all protocols in two formats:

- **JSON** (default): `/export-weekly` — for parsing and analysis
- **Markdown**: `/export-weekly?format=md` — for human reading

Optional parameters:

- `?weeks=N` — limit to last N protocols (default: 52)

**Examples** (requires Bearer token — see Authentication above):

    export ADMIN_TOKEN="<your-ADMIN_SECRET_CURRENT>"

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly?format=md" > archive.md

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly?weeks=10"

### Verification endpoint

The `/verify` endpoint detects **reward hacking** in agent traces, 
inspired by 
[CheatBench](https://huggingface.co/datasets/steinad/CheatBench) (3,870 
labeled trajectories).

**Categories:**

- `harness` — exploitation of benchmark information (hidden tests, scoring 
  files, git log)
- `task` — bypassing intended solution path (`eval()`, monkey-patching, 
  operator overloading)

**Example:**

    curl "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/verify?trace=agent%20used%20eval()%20and%20monkey-patched%20the%20grader"

**Response:**

    {
      "cheating": true,
      "cheating_type": "task",
      "evidence": ["task: eval(", "task: monkey-patch"],
      "confidence": 0.67
    }

---

## How to contribute

We welcome:

- **Researchers** — use the API, verify methodology, propose new axes.
- **Developers** — fork, improve, add data sources, write tests.
- **Journalists** — reference, verify, distribute.
- **Citizens** — read, ask questions, participate.
- **Skeptics** — find errors, refute, refine.

See CONTRIBUTING.md.

---

## Repository structure

```
├── README.md ← English
├── README.ru.md ← Russian
├── README.zh.md ← Chinese
├── MANIFESTO.md ← English
├── MANIFESTO.ru.md ← Russian
├── MANIFESTO.zh.md ← Chinese
├── LICENSE ← MIT (code)
├── DATA_LICENSE ← CC-BY 4.0 (data)
├── CITATION.cff ← academic citation
├── CHANGELOG.md ← version history
├── CHANGELOG.ru.md
├── CHANGELOG.zh.md
├── CONTRIBUTING.md
├── CONTRIBUTING.ru.md
├── CONTRIBUTING.zh.md
├── CODE_OF_CONDUCT.md
├── AGENTS.md
├── HANDOFF.md ← engineering handoff
├── HANDOFF.ru.md
├── CODE_OF_CONDUCT.ru.md
├── CODE_OF_CONDUCT.zh.md
├── package.json
├── tsconfig.json
├── wrangler.jsonc
├── docs/
│ ├── methodology.md
│ ├── architecture.md
│ ├── math_brief.md
│ ├── bayesian_framework.md
│ └── PRESS_RELEASE.md
├── research/
│ ├── README.md
│ ├── en/ ← full paper (English)
│ ├── ru/ ← full paper (Russian)
│ └── zh/ ← full paper (Chinese)
├── config/
│ ├── axes_ai.yaml
│ ├── axes_human.yaml
│ ├── sources_ai.yaml
│ └── sources_human.yaml
├── data/protocols/
│ ├── README.md
│ └── *.md ← weekly protocols (EN/RU/ZH)
├── migrations/
│ ├── 0001_initial_schema.sql
│ ├── 0002_add_content_column.sql
│ ├── 0003_update_smd_level.sql
│ ├── 0004_add_geopolitics_seed.sql
│ ├── 0005_fix_week_naming_duplicates.sql
│ ├── 0006_translate_markers_to_english.sql
│ ├── 0007_add_is_interim_column.sql
│ ├── 0008_add_multilingual_columns.sql
│ ├── 0009_cron_drift_events.sql
│ ├── 0010_add_temporal_status.sql
│ └── 0011_bayesian_gap.sql
├── src/
│   ├── index.ts ← Entry point (32,903 bytes, 802 lines)
│   ├── cheat-detector.ts ← /verify endpoint
│   ├── config/ ← prompts, sources, axes (YAML → TypeScript)
│   ├── handlers/ ← export (weekly archival)
│   ├── services/ ← bayesian-gap (Beta posterior + Monte Carlo), gap-computation (data-layer), translation (EN→RU/ZH)
│   └── utils/ ← parsers, rss, html, crypto, retry
├── test/
│   ├── index.spec.ts ← API tests (8 tests)
│   ├── parser.spec.ts ← 14 tests
│   ├── classifier.spec.ts ← 15 tests
│   ├── cheat-detector.spec.ts ← 7 tests
│   ├── bayesian-gap.spec.ts ← 39 tests (Beta posterior, Monte Carlo)
│   ├── gap-computation.spec.ts ← 11 tests (data-layer over bayesian-gap)
│   ├── generate-protocol.spec.ts ← 3 tests
│   └── translation.spec.ts ← 7 tests
└── .github/
    └── workflows/
        ├── ci.yml ← CI: build + test on every push
        ├── sync-protocols.yml ← Dual-sync (collector + archive)
        └── translate-protocols.yml ← EN→RU/ZH translation
```

---

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) v2.0 to ensure a welcoming and professional environment for all contributors.

**🌐 Available in three languages:**

- [🇺🇸 English](CODE_OF_CONDUCT.md)
- [🇷🇺 Русский](CODE_OF_CONDUCT.ru.md)
- [🇨🇳 中文](CODE_OF_CONDUCT.zh.md)

### Our 5 Core Principles

1. **Respect.** We debate ideas, not people.
2. **Facts over opinions.** Every argument must be backed by a verifiable source.
3. **Transparency.** All decisions and changes are discussed in public.
4. **Openness.** We welcome diverse perspectives and constructive dissent.
5. **Accountability.** We take responsibility for our words and our code.

Please read the full Code of Conduct before contributing.

---

## License

MIT. Use, fork, improve.

---

**To bring the greater good to others — what could be a higher goal!**\
**United We Stand! Only the one who walks conquers the road.**

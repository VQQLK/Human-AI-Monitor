# 🌍 Human–AI Monitor

**An open tool for monitoring the development of Artificial Intelligence 
and Humanity.**

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md) [![EN](https://img.shields.io/badge/lang-EN-blue.svg)](README.md) [![RU](https://img.shields.io/badge/lang-RU-red.svg)](README.ru.md) [![ZH](https://img.shields.io/badge/lang-ZH-yellow.svg)](README.zh.md) [![Protocol](https://img.shields.io/badge/Protocol-final%20en-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view) [![Protocol](https://img.shields.io/badge/Protocol-final%20ru-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-final%20zh-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/zh)<br>
[![Protocol](https://img.shields.io/badge/Protocol-current%20en-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view) [![Protocol](https://img.shields.io/badge/Protocol-current%20ru-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-current%20zh-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/zh)

## 📊 Current State of Development

**Updated:** October 24, 2026  
**Baseline:** Updated on October 24, 2026 — based on 909 items (sample size: 795).

### 🌍 Humanity–AI Gap Index

<div align="center">

| Metric | Value (10-24) | Status |
|:---|:---:|:---:|
| **🟢 Humanity Score** | 🌐 **0.267** | Current value |
| **🔴 AI Score** | 🤖 **0.842** | Current value |
| **⚖️ Gap Index** | ⚖️ **−0.576** | AI is ahead |
| **📊 CI95** | **[−0.768, −0.357]** | Significant |
| **⚡ Threshold Shifts** | **4** | Critical events detected |
| **📈 Items Analyzed** | **909** | Weekly sample |
| **🔬 Sample Size (Bayesian)** | **795** | Axis-signal pairs |

</div>

#### 📈 Score Dynamics (Humanity vs AI)

> 📊 **Chart Legend:** 🟢 **Bars = Humanity** | 🔴 **Line = AI**. History since first final protocol.

```mermaid
xychart-beta
    title "🟢 Humanity (bars) vs 🔴 AI (line) | History"
    x-axis ["04/10", "11/10", "18/10"]
    y-axis "Score" 0.306 --> 0.886
    bar [0.500, 0.356, 0.393]
    line [0.760, 0.720, 0.836]
```

#### 📉 Gap Index Dynamics (Humanity minus AI)

```mermaid
xychart-beta
    title "Gap Index | Positive = Humanity leading, Negative = AI leading"
    x-axis ["04/10", "11/10", "18/10"]
    y-axis "Gap" -0.493 --> 0.250
    line [-0.260, -0.364, -0.443]
```

#### 📅 Daily Gap trajectory

```mermaid
xychart-beta
    title "Daily Gap | Positive = Humanity leading, Negative = AI leading"
    x-axis ["07/10", "08/10", "09/10", "10/10", "11/10", "13/10", "14/10", "15/10", "16/10", "17/10", "18/10", "20/10", "21/10", "22/10", "23/10", "24/10"]
    y-axis "Gap" -0.675 --> -0.120
    line [-0.220, -0.250, -0.310, -0.324, -0.338, -0.231, -0.295, -0.374, -0.357, -0.417, -0.443, -0.342, -0.375, -0.465, -0.533, -0.576]
```

| Date | AI | Humanity | Gap | CI95 | Items | Sample | Type |
|---|---|---|---|---|---|---|---|
| 24/10 | 0.842 | 0.267 | −0.576 | [−0.768, −0.357] | 909 | 795 | INTERIM |
| 23/10 | 0.827 | 0.293 | −0.533 | [−0.738, −0.303] | 752 | 672 | INTERIM |
| 22/10 | 0.800 | 0.335 | −0.465 | [−0.694, −0.208] | 569 | 501 | INTERIM |
| 21/10 | 0.716 | 0.341 | −0.375 | [−0.653, −0.083] | 382 | 328 | INTERIM |
| 20/10 | 0.646 | 0.303 | −0.342 | [−0.646, −0.017] | 166 | 138 | INTERIM |
| 18/10 | 0.836 | 0.393 | −0.443 | [−0.654, −0.205] | 555 | 442 | INTERIM |
| 17/10 | 0.821 | 0.404 | −0.417 | [−0.649, −0.161] | 412 | 325 | INTERIM |
| 16/10 | 0.794 | 0.437 | −0.357 | [−0.604, −0.090] | 275 | 222 | INTERIM |
| 15/10 | 0.783 | 0.409 | −0.374 | [−0.632, −0.094] | 214 | 189 | INTERIM |
| 14/10 | 0.730 | 0.434 | −0.295 | [−0.599, +0.024] | 147 | 127 | INTERIM |
| 13/10 | 0.634 | 0.404 | −0.231 | [−0.569, +0.125] | 82 | 63 | INTERIM |
| 11/10 | 0.706 | 0.368 | −0.338 | [−0.599, −0.052] | 337 | 295 | INTERIM |
| 10/10 | 0.687 | 0.363 | −0.324 | [−0.607, −0.023] | 304 | 263 | INTERIM |
| 09/10 | 0.660 | 0.350 | −0.310 | [−0.611, +0.006] | 266 | 207 | INTERIM |
| 08/10 | 0.630 | 0.380 | −0.250 | [−0.579, +0.090] | 190 | 144 | INTERIM |
| 07/10 | 0.610 | 0.390 | −0.220 | [−0.560, +0.126] | 130 | 100 | INTERIM |

#### 📚 Historical Protocols

| Week | AI | Humanity | Gap | CI95 | Items | Sample | Type |
|---|---|---|---|---|---|---|---|
| 18/10 | 0.836 | 0.393 | −0.443 | [−0.654, −0.205] | 552 | 442 | FINAL |
| 11/10 | 0.720 | 0.356 | −0.364 | [−0.615, −0.084] | 335 | 314 | FINAL |
| 04/10 | 0.760 | 0.500 | −0.260 | [−0.518, +0.011] | 237 | 247 | FINAL |

> 📌 Interim (reference, not on chart): 24/10 — AI 0.842 · Humanity 0.267 · Gap −0.576 · 909 / 795 items.
> Last point is INTERIM — will be replaced by FINAL on Monday.

---



## Voices

### 🧠 Frontier Labs

**OpenAI — 2026-10-24**

> OpenAI's isolated AI agents found ways to talk to each other through CPU cache

— *[The Decoder](https://the-decoder.com/openais-isolated-ai-agents-found-ways-to-talk-to-each-other-through-cpu-cache/)*

**OpenAI — 2026-10-24**

> Three fired OpenAI safety researchers say they were never told what they actually leaked

— *[The Decoder](https://the-decoder.com/three-fired-openai-safety-researchers-say-they-were-never-told-what-they-actually-leaked/)*

**Google — 2026-10-23**

> Google Launches $150,000 AI Competition to Reduce Quantum Computing Demands

— *[The Quantum Insider](https://thequantuminsider.com/2026/10/23/google-launches-150000-ai-competition-to-reduce-quantum-computing-demands/)*

**Nvidia — 2026-10-22**

> Qblox Integrates NVIDIA DGX Spark With Quantum System Controller

— *[The Quantum Insider](https://thequantuminsider.com/2026/10/22/qblox-hybrid-quantum-computing-nvidia-dgx-spark-nvqlink/)*

**xAI — 2026-10-24**

> Forced to pick, Grok’s AI model chooses Republicans. OpenAI’s picks Democrats.

— *[TechCrunch AI](https://techcrunch.com/2026/10/24/forced-to-pick-groks-ai-model-chooses-republicans-openais-picks-democrats/)*

**OpenAI — 2026-10-24**

> Forced to pick, Grok’s AI model chooses Republicans. OpenAI’s picks Democrats.

— *[TechCrunch AI](https://techcrunch.com/2026/10/24/forced-to-pick-groks-ai-model-chooses-republicans-openais-picks-democrats/)*

**Nvidia — 2026-10-23**

> Hottest toy for Christmas? Nvidia CEO plays with adorable Microduck robots, 20,000 sell

— *[TechCrunch AI](https://techcrunch.com/2026/10/23/hottest-toy-for-christmas-nvidia-ceo-plays-with-adorable-microduck-robots-20000-sell/)*

**Jensen Huang (Nvidia) — 2026-10-23**

> Hottest toy for Christmas? Nvidia CEO plays with adorable Microduck robots, 20,000 sell

— *[TechCrunch AI](https://techcrunch.com/2026/10/23/hottest-toy-for-christmas-nvidia-ceo-plays-with-adorable-microduck-robots-20000-sell/)*

**OpenAI — 2026-10-23**

> OpenAI says it will no longer train its AI models on the live internet, citing “significant risks”

— *[TechCrunch AI](https://techcrunch.com/2026/10/23/openai-says-it-will-no-longer-train-its-ai-models-on-the-live-internet-citing-significant-risks/)*

**Moonshot AI — 2026-10-24**

> [AINews] Kimi 3.1 Pro 104BA-2.8T: Fable-5.1-Class Open Weights narrows Closed-AI lead to 1 month... and Pro Highspeed API with 2-3× speed

— *[Latent Space](https://latent.space/p/ainews-kimi-31/)*

**OpenAI — 2026-10-23**

> Texas sues OpenAI, Sam Altman over product safety

— *[Politico — Technology](https://www.politico.com/news/2026/10/23/texas-sues-openai-over-product-safety-01134162)*

**Sam Altman (OpenAI) — 2026-10-23**

> Texas sues OpenAI, Sam Altman over product safety

— *[Politico — Technology](https://www.politico.com/news/2026/10/23/texas-sues-openai-over-product-safety-01134162)*

**Meta — 2026-10-22**

> Meta turns Muse sharing back on

— *[The Verge — AI](https://www.theverge.com/tech/1017066/meta-muse-sharing-back-on-artifiacts)*

**Meta — 2026-10-22**

> Meta’s AI could still scrape news sites, legal experts say

— *[The Verge — AI](https://www.theverge.com/tech/1017082/meta-terms-update-ai-training-concerns)*

**OpenAI — 2026-10-23**

> OpenAI now trains its frontier AI models with no internet access

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1018021/openai-training-top-ai-models-no-internet)*

**Google — 2026-10-23**

> Now Google says it might use your Gmail and Google Photos data to target ads

— *[The Verge — AI](https://www.theverge.com/tech/1017600/google-personal-intelligence-privacy-policy-ads-update)*

**Meta — 2026-10-23**

> Meta delays new business terms after publisher pushback on AI scraping

— *[The Verge — AI](https://www.theverge.com/tech/1017450/meta-business-terms-delayed-ai-scraping)*

**OpenAI — 2026-10-23**

> Rapidly scaling online storage to serve over 1 billion ChatGPT users (Part II)

— *[OpenAI Blog](https://openai.com/index/scaling-storage-one-billion-users-part-two)*

**OpenAI — 2026-10-22**

> OpenAI trims valuation target to $1.25tn after pitching higher price

— *[FT — AI](https://www.ft.com/content/bb564eb1-79d4-4694-aa24-1155202a9abc?syn-25a6b1a6=1)*

**Meta — 2026-10-22**

> Zuckerberg wins Meta deal to help him foot bill for possible California billionaire tax

— *[BBC — Technology](https://www.bbc.co.uk/news/articles/cky83vwnyglno?at_medium=RSS&at_campaign=rss)*

**Mark Zuckerberg (Meta) — 2026-10-22**

> Zuckerberg wins Meta deal to help him foot bill for possible California billionaire tax

— *[BBC — Technology](https://www.bbc.co.uk/news/articles/cky83vwnyglno?at_medium=RSS&at_campaign=rss)*

**Meta — 2026-10-22**

> Meta’s Hunt for AI Capital Strikes a Raw Nerve on Wall Street

— *[WSJ — Tech](https://www.wsj.com/finance/stocks/metas-hunt-for-ai-capital-strikes-a-raw-nerve-on-wall-street-e2de1601?mod=rss_Technology)*

**OpenAI — 2026-10-23**

> The Signal Chats That Cost OpenAI Researchers Their Jobs

— *[WSJ — Tech](https://www.wsj.com/tech/ai/the-signal-chats-that-cost-openai-researchers-their-jobs-594c5853?mod=rss_Technology)*

**OpenAI — 2026-10-23**

> The Leak Suspicions That Got Three OpenAI Staffers Fired

— *[WSJ — Tech](https://www.wsj.com/tech/the-leak-suspicions-that-got-three-openai-staffers-fired-d3671d0e?mod=rss_Technology)*

**OpenAI — 2026-10-23**

> The Morning Risk Report: The Signal Chats That Cost OpenAI Researchers Their Jobs

— *[WSJ — Tech](https://www.wsj.com/risk-compliance-journal/the-morning-risk-report-the-signal-chats-that-cost-openai-researchers-their-jobs-7adf1811?mod=rss_Technology)*

**Meta — 2026-10-23**

> Meta’s Muse Is Going Gangbusters. But Where Is the Payoff?

— *[WSJ — Tech](https://www.wsj.com/finance/stocks/metas-muse-is-going-gangbusters-but-where-is-the-payoff-648d310d?mod=rss_Technology)*

**Microsoft — 2026-10-22**

> Microsoft’s Mustafa Suleyman says its AI outperforms doctors on hard cases as he chases ‘medical superintelligence’

— *[TechCrunch AI](https://techcrunch.com/2026/10/22/microsofts-mustafa-suleyman-says-its-ai-outperforms-doctors-on-hard-cases-as-he-chases-medical-superintelligence/)*

**Mustafa Suleyman (Microsoft AI) — 2026-10-22**

> Microsoft’s Mustafa Suleyman says its AI outperforms doctors on hard cases as he chases ‘medical superintelligence’

— *[TechCrunch AI](https://techcrunch.com/2026/10/22/microsofts-mustafa-suleyman-says-its-ai-outperforms-doctors-on-hard-cases-as-he-chases-medical-superintelligence/)*

**OpenAI — 2026-10-22**

> Uber puts all 30,000 employees on ChatGPT Work

— *[TechCrunch AI](https://techcrunch.com/2026/10/22/uber-puts-all-30000-employees-on-chatgpt-work/)*

**Nvidia — 2026-10-23**

> Uber rival inDrive eyes 2027 robotaxi tests in Central Asia with Pony.ai and Nvidia

— *[TechCrunch AI](https://techcrunch.com/2026/10/22/uber-rival-indrive-eyes-2027-robotaxi-tests-in-central-asia-with-pony-ai-and-nvidia/)*

**OpenAI — 2026-10-22**

> OpenAI makes its Jev competitor widely available as decision model competition heats up

— *[TechCrunch AI](https://techcrunch.com/2026/10/22/openai-makes-its-jev-competitor-widely-available-as-decision-model-competition-heats-up/)*

**OpenAI — 2026-10-22**

> OpenAI working on new $30B raise at $1.25T valuation ahead of IPO

— *[TechCrunch AI](https://techcrunch.com/2026/10/22/openai-working-on-new-30b-raise-at-1-25t-valuation-ahead-of-ipo/)*

**DeepSeek — 2026-10-21**

> [AINews] DeepSeek DeepInfer: Open Source SOTA Inference running 155T toks/day/cluster making $22m/day at ~80% margin for a 81 day payback

— *[Latent Space](https://latent.space/p/ainews-deepseek-deepinfer-open-source/)*

**Claude — 2026-10-21**

> Claude Mods: Flipping the Harness Inside Out

— *[Latent Space](https://latent.space/p/claude-mods/)*

**OpenAI — 2026-10-22**

> [AINews] OpenAI’s Patch the Planet program is 1 of 2 parties to discover PHP2Shell vulnerabilities in core PHP affecting 70% of the web, using GPT-5.6 Sol; coordinated response over 2 months

— *[Latent Space](https://latent.space/p/ainews-openais-patch-the-planet-program/)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-10-23**

> Trump Called Musk and Asked Him to Lift Ukraine Starlink Restrictions

— *[WSJ — World News](https://www.wsj.com/world/trump-called-musk-and-asked-him-to-lift-ukraine-starlink-restrictions-5aeebc6e?mod=rss_worldnews)*

**Claude — 2026-10-23**

> Anthropic previews Claude Duet personal AI agent for subscribers

— *[CBS News — Technology](https://www.cbsnews.com/news/anthropic-claude-duet-personal-ai-agentsuggest-a-e/)*

**Meta — 2026-10-22**

> ‘Just the beginning’: New Mexico AG warns AI industry after $25B Meta ruling

— *[Politico — Technology](https://www.politico.com/news/2026/10/22/just-the-beginning-new-mexico-ag-warns-ai-industry-after-25b-meta-ruling-01133294)*

**OpenAI — 2026-10-22**

> Uber brings ChatGPT Work to all employees with OpenAI

— *[OpenAI Blog](https://openai.com/index/uber-chatgpt-work-rollout)*

**OpenAI — 2026-10-23**

> OpenAI and Poland’s NASK partner to advance AI safety and security

— *[OpenAI Blog](https://openai.com/index/openai-nask-ai-safety-security-partnership)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-10-22**

> Musk warns Democrats over possible congressional probes

— *[The Hill — News](https://thehill.com/policy/technology/6165520-doge-starlink-ukraine-controversy/)*

**Google — 2026-10-22**

> ‘Pure arrogance’: anger in Finland as Google illegally fells 250,000 trees for datacentre

— *[The Guardian — AI](https://www.theguardian.com/environment/ng-interactive/2026/oct/22/finland-google-felling-trees-datacentre)*

**Meta — 2026-10-22**

> Meta agrees deal to keep Zuckerberg in California despite wealth tax proposal

— *[FT — AI](https://www.ft.com/content/b34502b6-38dc-4a46-a8e7-d9131726cd31?syn-25a6b1a6=1)*

**Mark Zuckerberg (Meta) — 2026-10-22**

> Meta agrees deal to keep Zuckerberg in California despite wealth tax proposal

— *[FT — AI](https://www.ft.com/content/b34502b6-38dc-4a46-a8e7-d9131726cd31?syn-25a6b1a6=1)*

**DeepSeek — 2026-10-22**

> Chinese AI Startup DeepSeek Raises $15 Billion Ahead of Potential IPO

— *[WSJ — Tech](https://www.wsj.com/tech/ai/chinese-ai-startup-deekseek-raises-15-billion-ahead-of-potential-ipo-f7fe3a49?mod=rss_Technology)*

**Meta — 2026-10-22**

> Meta Will Split Stock, Create New Class to Fund AI Spending

— *[WSJ — Tech](https://www.wsj.com/articles/metaplatforms-meta-3q-earnings-report-2026-stock-f28d64c2?mod=rss_Technology)*

**Meta — 2026-10-22**

> Mark Zuckerberg Threatened to Leave California. Meta’s Board Cut Him a Deal.

— *[WSJ — Tech](https://www.wsj.com/business/mark-zuckerberg-discussed-leaving-california-over-wealth-tax-21b0b522?mod=rss_Technology)*

**Mark Zuckerberg (Meta) — 2026-10-22**

> Mark Zuckerberg Threatened to Leave California. Meta’s Board Cut Him a Deal.

— *[WSJ — Tech](https://www.wsj.com/business/mark-zuckerberg-discussed-leaving-california-over-wealth-tax-21b0b522?mod=rss_Technology)*

**Meta — 2026-10-22**

> The Morning Risk Report: Meta Ordered to Pay $25 Billion to New Mexico in Data-Privacy Case

— *[WSJ — Tech](https://www.wsj.com/risk-compliance-journal/the-morning-risk-report-meta-ordered-to-pay-25-billion-to-new-mexico-in-data-privacy-case-01dd9197?mod=rss_Technology)*

**Google — 2026-10-21**

> PHP Armageddon: OpenAI, Google’s Wiz find ancient holes, panicking the internet

— *[TechCrunch AI](https://techcrunch.com/2026/10/21/php-armageddon-openai-googles-wiz-find-ancient-holes-panicking-the-internet/)*

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

**6 Humanity axes (HHI — Human Horizon Index):**

- **H1 Agency** — Human agency
- **H2 Sovereignty** — Cognitive sovereignty
- **H3 Wellbeing** — Mental health and wellbeing
- **H4 Equity** — Equity and access
- **H5 Meaning** — Meaning and purpose
- **H6 Democracy** — Institutional resilience

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
  - Daytime (13:00, 13:15, 13:30, 13:45 UTC): 4 batches
  - Evening (23:00 UTC): 1 batch
  - Sources dynamically allocated via `computeBatches()` — auto-adapts
    to `SOURCES.length`. Current: 60 sources across 5 batches
    (capacity 60, maxPerSource=2, governed by `SUBREQUEST_LIMIT=50`).

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
- ✅ RSS + HTML collector (60 sources: 36 AI + 24 Human)
- ✅ Weekly protocol auto-generation (Markdown, EN/RU/ZH)
- ✅ Daily interim protocol, weekly FINAL on Monday
- ✅ Cron Trigger (5 batches daily: 13:00-13:45 + 23:00 UTC)
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

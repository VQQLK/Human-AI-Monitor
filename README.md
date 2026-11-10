# 🌍 Human–AI Monitor

**An open tool for monitoring the development of Artificial Intelligence 
and Humanity.**

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md) [![EN](https://img.shields.io/badge/lang-EN-blue.svg)](README.md) [![RU](https://img.shields.io/badge/lang-RU-red.svg)](README.ru.md) [![ZH](https://img.shields.io/badge/lang-ZH-yellow.svg)](README.zh.md) [![Protocol](https://img.shields.io/badge/Protocol-final%20en-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view) [![Protocol](https://img.shields.io/badge/Protocol-final%20ru-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-final%20zh-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/zh)<br>
[![Protocol](https://img.shields.io/badge/Protocol-current%20en-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view) [![Protocol](https://img.shields.io/badge/Protocol-current%20ru-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-current%20zh-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/zh)

## 📊 Current State of Development

**Updated:** November 10, 2026  
**Baseline:** Updated on November 10, 2026 — based on 253 items (sample size: 251).

### 🌍 Human–AI Gap Index (Achievements vs Progress)

<div align="center">

| Metric | Value (11-10) | Status |
|:---|:---:|:---:|
| **🟢 Humanity Score** | 🌐 **0.569** | Current value |
| **🔴 AI Score** | 🤖 **0.774** | Current value |
| **⚖️ Gap Index** | ⚖️ **−0.205** | AI is ahead |
| **📊 CI95** | **[−0.480, +0.086]** | Inconclusive |
| **⚡ Threshold Shifts** | **6** | Critical events detected |
| **📈 Items Analyzed** | **253** | Weekly sample |
| **🔬 Sample Size (Bayesian)** | **251** | Axis-signal pairs |

</div>

#### 📈 Score Dynamics (Humanity vs AI)

> 📊 **Chart Legend:** 🟢 **Bars = Humanity** | 🔴 **Line = AI**. History since first final protocol.

```mermaid
xychart-beta
    title "🟢 Humanity (bars) vs 🔴 AI (line) | History"
    x-axis ["25/10", "01/11", "08/11"]
    y-axis "Score" 0.400 --> 0.938
    bar [0.467, 0.679, 0.614]
    line [0.614, 0.814, 0.888]
```

#### 📉 Gap Index Dynamics (Humanity minus AI)

```mermaid
xychart-beta
    title "Gap Index | Positive = Humanity leading, Negative = AI leading"
    x-axis ["25/10", "01/11", "08/11"]
    y-axis "Gap" -0.324 --> 0.250
    line [-0.146, -0.135, -0.274]
```

#### 📅 Daily Gap trajectory

```mermaid
xychart-beta
    title "Daily Gap | Positive = Humanity leading, Negative = AI leading"
    x-axis ["24/10", "25/10", "27/10", "28/10", "29/10", "30/10", "31/10", "01/11", "03/11", "04/11", "05/11", "06/11", "07/11", "08/11", "10/11"]
    y-axis "Gap" -0.675 --> 0.041
    line [-0.576, -0.349, -0.059, -0.125, -0.105, -0.101, -0.112, -0.139, -0.135, -0.271, -0.258, -0.280, -0.272, -0.269, -0.205]
```

| Date | AI | Humanity | Gap | CI95 | Items | Sample | Type |
|---|---|---|---|---|---|---|---|
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
| 25/10 | 0.850 | 0.500 | −0.349 | [−0.667, −0.019] | 1020 | 895 | INTERIM |
| 24/10 | 0.842 | 0.267 | −0.576 | [−0.768, −0.357] | 909 | 795 | INTERIM |

#### 📚 Historical Protocols

| Week | AI | Humanity | Gap | CI95 | Items | Sample | Type |
|---|---|---|---|---|---|---|---|
| 08/11 | 0.888 | 0.614 | −0.274 | [−0.473, −0.075] | 991 | 918 | FINAL |
| 01/11 | 0.814 | 0.679 | −0.135 | [−0.351, +0.102] | 838 | 730 | FINAL |
| 25/10 | 0.614 | 0.467 | −0.146 | [−0.520, +0.227] | 121 | 117 | FINAL |

> 📌 Interim (reference, not on chart): 10/11 — AI 0.774 · Humanity 0.569 · Gap −0.205 · 253 / 251 items.
> Last point is INTERIM — will be replaced by FINAL on Monday.

---



## Voices

### 🧠 Frontier Labs

**Nvidia — 2026-11-10**

> How Nvidia's crisis and politics could deliver the pause AI leaders want

— *[Axios](https://www.axios.com/2026/11/10/ai-race-politics-slowdown)*

**Nvidia — 2026-11-10**

> Jeffries pushes tighter China chip restrictions amid Nvidia CEO scandal

— *[The Hill — Policy](https://thehill.com/policy/technology/6210410-jeffries-backs-china-ai-chip-restrictions/)*

**Jensen Huang (Nvidia) — 2026-11-10**

> Jeffries pushes tighter China chip restrictions amid Nvidia CEO scandal

— *[The Hill — Policy](https://thehill.com/policy/technology/6210410-jeffries-backs-china-ai-chip-restrictions/)*

**Nvidia — 2026-11-09**

> Nvidia sued over Jensen Huang’s alleged spy affair

— *[Politico — Technology](https://www.politico.com/news/2026/11/09/nvidia-sued-jensen-huang-alleged-spy-affair-01157660)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Nvidia sued over Jensen Huang’s alleged spy affair

— *[Politico — Technology](https://www.politico.com/news/2026/11/09/nvidia-sued-jensen-huang-alleged-spy-affair-01157660)*

**Nvidia — 2026-11-10**

> ‘This is a serious national security issue.’ GOP bucks Trump on Nvidia

— *[Politico — Technology](https://www.politico.com/news/2026/11/09/republicans-trump-china-nvidia-scandal-01157896)*

**Claude — 2026-11-09**

> Anthropic launches new Claude Fable and Mythos 5.2 models

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1030005/anthropic-claude-fable-mythos-5-2)*

**Jensen Huang (Nvidia) — 2026-11-09**

> The future of AI hinges on… Jensen Huang’s sex life?

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1029990/jensen-huang-the-spy-who-loved-me)*

**Nvidia — 2026-11-09**

> Everything we know so far about the Nvidia spy scandal targeting CEO Jensen Huang

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1030422/nvidia-jensen-huang-ai-china-alice-huang)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Everything we know so far about the Nvidia spy scandal targeting CEO Jensen Huang

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1030422/nvidia-jensen-huang-ai-china-alice-huang)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Here’s what Trump said he knew about Jensen Huang

— *[The Verge — AI](https://www.theverge.com/tech/1030446/trump-jensen-huang-press-conference)*

**Jensen Huang (Nvidia) — 2026-11-09**

> What could China get from Jensen Huang?

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1030328/what-could-china-get-from-jensen-huang)*

**Google — 2026-11-09**

> Gemini Robotics 2.5 accelerates real-world general dexterity

— *[Google DeepMind Blog](https://deepmind.google/blog/gemini-robotics-2-5-accelerates-real-world-physical-intelligence/)*

**OpenAI — 2026-11-09**

> ChatGPT Enterprise now available in AWS Marketplace

— *[OpenAI Blog](https://openai.com/index/chatgpt-enterprise-aws-marketplace)*

**Nvidia — 2026-11-09**

> Trump backs Nvidia's Huang amid affair, spy investigation

— *[Axios](https://www.axios.com/2026/11/09/trump-jensen-huang-nvidia)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Trump backs Nvidia's Huang amid affair, spy investigation

— *[Axios](https://www.axios.com/2026/11/09/trump-jensen-huang-nvidia)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Jensen Huang spy scandal rocks AI race

— *[Axios](https://www.axios.com/2026/11/09/jensen-huang-spy-scandal-ai)*

**Nvidia — 2026-11-08**

> Nvidia will investigate CEO Jensen Huang’s relationship with possible Chinese spy

— *[TechCrunch AI](https://techcrunch.com/2026/11/08/nvidia-says-its-investigating-ceo-jensen-huangs-relationship-with-possible-chinese-spy/)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Is Jensen Huang’s job on the line? Yale’s Jeffrey Sonnenfeld estimates it’s “about a 50-50”

— *[TechCrunch AI](https://techcrunch.com/2026/11/08/is-jensen-huangs-job-on-the-line-yales-jeffrey-sonnenfeld-estimates-its-about-a-50-50/)*

**Jensen Huang (Nvidia) — 2026-11-08**

> Nvidia will investigate CEO Jensen Huang’s relationship with possible Chinese spy

— *[TechCrunch AI](https://techcrunch.com/2026/11/08/nvidia-says-its-investigating-ceo-jensen-huangs-relationship-with-possible-chinese-spy/)*

**Nvidia — 2026-11-09**

> Nvidia investigates CEO Jensen Huang over Chinese espionage concerns

— *[CBS News — Technology](https://www.cbsnews.com/news/nvidia-jensen-huang-investigation-china-intelligence/)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Nvidia investigates CEO Jensen Huang over Chinese espionage concerns

— *[CBS News — Technology](https://www.cbsnews.com/news/nvidia-jensen-huang-investigation-china-intelligence/)*

**Nvidia — 2026-11-09**

> Nvidia stock slumps amid board investigation into CEO Jensen Huang

— *[CBS News — Technology](https://www.cbsnews.com/news/nvidia-jensen-huang-stock-board-investigation-spy/)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Nvidia stock slumps amid board investigation into CEO Jensen Huang

— *[CBS News — Technology](https://www.cbsnews.com/news/nvidia-jensen-huang-stock-board-investigation-spy/)*

**Nvidia — 2026-11-09**

> Trump: Nvidia CEO an 'honorable guy'

— *[The Hill — Policy](https://thehill.com/policy/technology/6207489-donald-trump-jensen-huang-nvidia-affair-allegations-chinese-spy/)*

**Jensen Huang (Nvidia) — 2026-11-09**

> Trump: Nvidia CEO an 'honorable guy'

— *[The Hill — Policy](https://thehill.com/policy/technology/6207489-donald-trump-jensen-huang-nvidia-affair-allegations-chinese-spy/)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-11-09**

> Musk spent big on Republicans in the midterms. He has little to show for it

— *[The Hill — Policy](https://thehill.com/policy/technology/6205126-texas-election-blue-wave-impact/)*

**Nvidia — 2026-11-08**

> Nvidia launches investigation into reported Chinese spy effort targeting Jensen Huang

— *[Politico — Technology](https://www.politico.com/news/2026/11/08/nvidia-investigation-chinese-spy-effort-jensen-huang-01155747)*

**Jensen Huang (Nvidia) — 2026-11-08**

> Nvidia launches investigation into reported Chinese spy effort targeting Jensen Huang

— *[Politico — Technology](https://www.politico.com/news/2026/11/08/nvidia-investigation-chinese-spy-effort-jensen-huang-01155747)*

**Meta — 2026-11-09**

> Import AI 480: Self-sustaining space economies; AI for science progress, and Meta builds perfect hands for a superintelligence

— *[Import AI (Jack Clark)](https://importai.substack.com/p/import-ai-480-self-sustaining-space)*

**Nvidia — 2026-11-08**

> Here’s the full text of Jensen Huang’s memo to Nvidia

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1029595/full-text-jensen-huang-affair-memo-nvidia)*

**Nvidia — 2026-11-08**

> Nvidia is investigating Jensen Huang’s relationship with an alleged Chinese spy

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1029562/nvidia-investigating-jensen-huang-relationship-chinese-spy)*

**Jensen Huang (Nvidia) — 2026-11-08**

> Here’s the full text of Jensen Huang’s memo to Nvidia

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1029595/full-text-jensen-huang-affair-memo-nvidia)*

**Jensen Huang (Nvidia) — 2026-11-08**

> Nvidia is investigating Jensen Huang’s relationship with an alleged Chinese spy

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1029562/nvidia-investigating-jensen-huang-relationship-chinese-spy)*

**Nvidia — 2026-11-07**

> "Congress will investigate": Nvidia CEO Jensen Huang faces probe over alleged Chinese spy ties

— *[Axios](https://www.axios.com/2026/11/07/jensen-huang-nvidia-congress-china-spy)*

**Jensen Huang (Nvidia) — 2026-11-07**

> "Congress will investigate": Nvidia CEO Jensen Huang faces probe over alleged Chinese spy ties

— *[Axios](https://www.axios.com/2026/11/07/jensen-huang-nvidia-congress-china-spy)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-11-04**

> Elon Musk's millions failed to deliver Republican wins in fierce midterms

— *[BBC — Technology](https://www.bbc.co.uk/news/articles/cv8ez3p3ge5ko?at_medium=RSS&at_campaign=rss)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-11-06**

> Elon Musk appears to signal the end of the road for Cybertruck

— *[BBC — Technology](https://www.bbc.co.uk/news/articles/cq1j33w7d232o?at_medium=RSS&at_campaign=rss)*

**Nvidia — 2026-11-07**

> Megaspeed exec was recruited to spy on Nvidia CEO, according to US intelligence memo

— *[TechCrunch AI](https://techcrunch.com/2026/11/07/chinese-exec-was-recruited-to-spy-on-nvidia-ceo-according-to-us-intelligence-memo/)*

**Jensen Huang (Nvidia) — 2026-11-07**

> Megaspeed exec was recruited to spy on Nvidia CEO, according to US intelligence memo

— *[TechCrunch AI](https://techcrunch.com/2026/11/07/chinese-exec-was-recruited-to-spy-on-nvidia-ceo-according-to-us-intelligence-memo/)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-11-07**

> After the midterms, things are looking rocky for Elon Musk and data centers

— *[TechCrunch AI](https://techcrunch.com/2026/11/07/after-the-midterms-things-are-looking-rocky-for-elon-musk-and-data-centers/)*

**OpenAI — 2026-11-04**

> OpenAI is already trying to shape the 2028 election

— *[AI Now Institute](https://ainowinstitute.org/news/openai-is-already-trying-to-shape-the-2028-election)*

**Nvidia — 2026-11-07**

> The US let Nvidia sell chips to an empty office in China

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1029483/nvidia-ai-chips-china-blacklist-government)*

**Google — 2026-11-06**

> Google Forcing AI on Students Is BS

— *[EFF (Electronic Frontier Foundation)](https://www.eff.org/deeplinks/2026/11/google-forcing-ai-students-bs)*

**Nvidia — 2026-11-05**

> Nvidia-Backed Cohere Says IPO Timing Uncertain Despite Surging Revenue

— *[WSJ — Tech](https://www.wsj.com/pro/venture-capital/nvidia-backed-cohere-says-ipo-timing-uncertain-despite-surging-revenue-3310476f?mod=rss_Technology)*

**OpenAI — 2026-11-06**

> OpenAI Bolsters Cyber Defenses

— *[WSJ — Tech](https://www.wsj.com/cio-journal/openai-bolsters-cyber-defenses-cf7cafb5?mod=rss_Technology)*

### 🧪 AI Researchers

**Stuart Russell (UC Berkeley) — 2026-11-09**

> British comedian Russell Brand sentenced to over 10 years for rape and sexual assault

— *[NPR — World](https://www.npr.org/2026/11/09/nx-s1-6034335/british-comedian-russell-brand-sentenced)*

**Stuart Russell (UC Berkeley) — 2026-11-09**

> Russell Brand Sentenced to 10½ Years in Jail for Rape and Sexual Assault

— *[WSJ — World News](https://www.wsj.com/world/uk/russell-brand-sentenced-to-10-years-in-jail-for-rape-and-sexual-assault-271db16f?mod=rss_worldnews)*

**Stuart Russell (UC Berkeley) — 2026-11-09**

> Russell Brand sentenced to over 10 years for rape and sex assault

— *[CBS News — Technology](https://www.cbsnews.com/news/russell-brand-sentenced-prison-rape-sexual-assault/)*

**Stuart Russell (UC Berkeley) — 2026-11-08**

> Russell Brand to learn sentence after being found guilty of rape and sexual assault

— *[NPR — World](https://www.npr.org/2026/11/08/nx-s1-6033957/russell-brand-learn-sentence-found-guilty-rape-sexual-assault)*

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



# 🌍 人类-人工智能监测

**一个用于监测人工智能和人类发展的开放工具。**

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md) [![EN](https://img.shields.io/badge/lang-EN-blue.svg)](README.md) [![RU](https://img.shields.io/badge/lang-RU-red.svg)](README.ru.md) [![ZH](https://img.shields.io/badge/lang-ZH-yellow.svg)](README.zh.md) [![Protocol](https://img.shields.io/badge/Protocol-final%20en-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view) [![Protocol](https://img.shields.io/badge/Protocol-final%20ru-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-final%20zh-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/zh)<br>
[![Protocol](https://img.shields.io/badge/Protocol-current%20en-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view) [![Protocol](https://img.shields.io/badge/Protocol-current%20ru-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-current%20zh-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/zh)

## 📊 当前状态

**更新:** 2026年10月19日  
**基线：** 2026年10月19日更新 — 基于 552 个项目（样本量：442）。

### 🌍 人类–人工智能差距指数

<div align="center">

| 指标 | 数值 (10-19) | 状态 |
|:---|:---:|:---:|
| **🟢 人类得分** | 🌐 **0.393** | 当前值 |
| **🔴 人工智能得分** | 🤖 **0.836** | 当前值 |
| **⚖️ 差距指数** | ⚖️ **−0.443** | 人工智能领先 |
| **📊 CI95** | **[−0.654, −0.205]** | 显著 |
| **⚡ 阈值变化** | **10** | 检测到关键事件 |
| **📈 分析项目** | **552** | 每周样本 |
| **🔬 样本量（贝叶斯）** | **442** | 轴-信号对 |

</div>

#### 📈 得分动态 (人类 vs 人工智能)

> 📊 **图例：** 🟢 **柱状图 = 人类** | 🔴 **折线 = 人工智能**。自首个最终版协议起的历史。

```mermaid
xychart-beta
    title "🟢 人类 (柱状) vs 🔴 人工智能 (折线) | 历史"
    x-axis ["04/10", "11/10", "18/10"]
    y-axis "得分" 0.306 --> 0.886
    bar [0.500, 0.356, 0.393]
    line [0.760, 0.720, 0.836]
```

#### 📉 差距指数动态 (人类减去人工智能)

```mermaid
xychart-beta
    title "差距指数 | 正值 = 人类领先，负值 = 人工智能领先"
    x-axis ["04/10", "11/10", "18/10"]
    y-axis "差距" -0.493 --> 0.250
    line [-0.260, -0.364, -0.443]
```

#### 📅 每日差距轨迹

```mermaid
xychart-beta
    title "每日差距 | 正值 = 人类领先，负值 = 人工智能领先"
    x-axis ["07/10", "08/10", "09/10", "10/10", "11/10", "13/10", "14/10", "15/10", "16/10", "17/10", "18/10"]
    y-axis "差距" -0.543 --> -0.120
    line [-0.220, -0.250, -0.310, -0.324, -0.338, -0.231, -0.295, -0.374, -0.357, -0.417, -0.443]
```

| 日期 | AI | 人类 | 差距 | CI95 | 项目 | 样本 | 类型 |
|---|---|---|---|---|---|---|---|
| 18/10 | 0.836 | 0.393 | −0.443 | [−0.654, −0.205] | 555 | 442 | 临时版 |
| 17/10 | 0.821 | 0.404 | −0.417 | [−0.649, −0.161] | 412 | 325 | 临时版 |
| 16/10 | 0.794 | 0.437 | −0.357 | [−0.604, −0.090] | 275 | 222 | 临时版 |
| 15/10 | 0.783 | 0.409 | −0.374 | [−0.632, −0.094] | 214 | 189 | 临时版 |
| 14/10 | 0.730 | 0.434 | −0.295 | [−0.599, +0.024] | 147 | 127 | 临时版 |
| 13/10 | 0.634 | 0.404 | −0.231 | [−0.569, +0.125] | 82 | 63 | 临时版 |
| 11/10 | 0.706 | 0.368 | −0.338 | [−0.599, −0.052] | 337 | 295 | 临时版 |
| 10/10 | 0.687 | 0.363 | −0.324 | [−0.607, −0.023] | 304 | 263 | 临时版 |
| 09/10 | 0.660 | 0.350 | −0.310 | [−0.611, +0.006] | 266 | 207 | 临时版 |
| 08/10 | 0.630 | 0.380 | −0.250 | [−0.579, +0.090] | 190 | 144 | 临时版 |
| 07/10 | 0.610 | 0.390 | −0.220 | [−0.560, +0.126] | 130 | 100 | 临时版 |

#### 📚 协议历史

| 周 | AI | 人类 | 差距 | CI95 | 项目 | 样本 | 类型 |
|---|---|---|---|---|---|---|---|
| 18/10 | 0.836 | 0.393 | −0.443 | [−0.654, −0.205] | 552 | 442 | 最终版 |
| 11/10 | 0.720 | 0.356 | −0.364 | [−0.615, −0.084] | 335 | 314 | 最终版 |
| 04/10 | 0.760 | 0.500 | −0.260 | [−0.518, +0.011] | 237 | 247 | 最终版 |

---



## 声音

### 💼 投资人与科技领袖

**Paul Graham (Y Combinator) — 2026-10-18**

> Sen. Graham on Trump waiving Russia sanctions: ‘I look forward to talking to him’

— *[The Hill — News](https://thehill.com/homenews/senate/6156233-darline-graham-opposes-trump-russia-waiver/)*

### 🧠 前沿实验室

**Claude — 2026-10-17**

> Anthropic’s Claude Designs Leaner Quantum Circuits, Reducing Resources Needed for Key Calculations

— *[The Quantum Insider](https://thequantuminsider.com/2026/10/17/anthropics-claude-designs-leaner-quantum-circuits-reducing-resources-needed-for-key-calculations/)*

**Microsoft — 2026-10-18**

> Microsoft pulls out of AI datacentre project in Essex over power supply concerns

— *[The Guardian — AI](https://www.theguardian.com/uk-news/2026/oct/18/microsoft-drops-huge-ai-datacentre-project-in-essex-over-power-supply-concerns)*

**Meta — 2026-10-15**

> Meta and Apple, Longtime Foes, Team Up to Put Open-Weight AI on Macs

— *[WSJ — Tech](https://www.wsj.com/tech/ai/meta-and-apple-longtime-foes-team-up-to-put-open-weight-ai-on-macs-a28fde11?mod=rss_Technology)*

**Nvidia — 2026-10-16**

> Physical AI is more than robots, says the Nvidia veteran now investing in it

— *[TechCrunch AI](https://techcrunch.com/podcast/physical-ai-is-more-than-robots-says-the-nvidia-veteran-now-investing-in-it/)*

**Meta — 2026-10-17**

> Meta removes language that raised scraping and AI training concerns

— *[TechCrunch AI](https://techcrunch.com/2026/10/17/meta-removes-language-that-raised-scraping-and-ai-training-concerns/)*

**Nvidia — 2026-10-16**

> An Nvidia insider-turned-VC on why robotics hasn’t hit its ChatGPT moment, yet

— *[TechCrunch AI](https://techcrunch.com/video/a-nvidia-insider-turned-vc-on-why-robotics-hasnt-hit-its-chatgpt-moment-yet/)*

**OpenAI — 2026-10-16**

> An Nvidia insider-turned-VC on why robotics hasn’t hit its ChatGPT moment, yet

— *[TechCrunch AI](https://techcrunch.com/video/a-nvidia-insider-turned-vc-on-why-robotics-hasnt-hit-its-chatgpt-moment-yet/)*

**OpenAI — 2026-10-17**

> Replit makes OpenAI its default over Anthropic, CEO says

— *[TechCrunch AI](https://techcrunch.com/2026/10/17/replit-is-no-longer-working-with-anthropic-ceo-says/)*

**OpenAI — 2026-10-15**

> The Engineer Accused of Bugging OpenAI’s Top-Secret Conference Room

— *[WSJ — World News](https://www.wsj.com/tech/ai/the-engineer-accused-of-bugging-openais-top-secret-conference-room-7f91c07c?mod=rss_worldnews)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-10-15**

> Musk bankrolls PAC spending big on Paxton in Texas

— *[The Hill — Policy](https://thehill.com/homenews/campaign/6152571-musk-texas-pac-paxton-senate/)*

**Meta — 2026-10-17**

> Meta removes language that may have allowed it to scrape news sites

— *[The Verge — AI](https://www.theverge.com/tech/1013409/meta-removes-language-that-may-have-allowed-it-to-scrape-news-sites)*

**Meta — 2026-10-16**

> Meta employees say Lula’s accounts restricted in Brazil election: Report

— *[Al Jazeera](https://www.aljazeera.com/economy/2026/10/16/meta-employees-say-lulas-accounts-restricted-in-brazil-election-report?traffic_source=rss)*

**Mistral AI — 2026-08-24**

> Mistral x HUMAIN

— *[Mistral AI](https://mistral.ai/news/mistral-x-humain)*

**OpenAI — 2026-10-14**

> Crossing the Threshold: How OpenAI and Anthropic Approach Autonomy and Safety in Financial Agents

— *[Latent Space](https://www.latent.space/p/crossing-the-threshold)*

**Microsoft — 2026-10-15**

> Microsoft’s president warns White House against skilled immigration crackdown

— *[Politico — Technology](https://www.politico.com/news/2026/10/15/microsofts-president-warns-white-house-against-skilled-immigration-crackdown-01119727)*

**Nvidia — 2026-10-14**

> Nvidia, worth $5.5tn, donates $250m to UK for AI safety research

— *[The Guardian — AI](https://www.theguardian.com/technology/2026/oct/14/nvidia-donates-to-uk-ai-safety-research)*

**OpenAI — 2026-10-14**

> He linked Saudi Arabia to Silicon Valley. Then OpenAI found a bug wrapped in toilet paper

— *[FT — AI](https://www.ft.com/content/b71e0dc4-b190-49ec-b000-bd585054ddc8?syn-25a6b1a6=1)*

**Google — 2026-10-14**

> [AINews] AI Engineer NYC: Gemini 4 Argon, Vals AI Benchmarks

— *[Latent Space](https://www.latent.space/p/ainews-ai-engineer-nyc-gemini-4-argon)*

**Google — 2026-10-13**

> Google Researchers Propose Using Error Records to Improve Quantum Results After Computation

— *[The Quantum Insider](https://thequantuminsider.com/2026/10/13/google-researchers-propose-using-error-records-to-improve-quantum-results-after-computation/)*

**Meta — 2026-10-13**

> [AINews] Meta Muse Wonder & Wonder Full: MSL’s Claude 5.5-tier Frontier Model

— *[Latent Space](https://www.latent.space/p/ainews-meta-muse-wonder-and-wonder)*

**Meta — 2026-10-12**

> Meta has some Wonder Full new AI models

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1009479/meta-muse-wonder-full-ai-model)*

**Microsoft — 2026-10-12**

> AI is less regulated than milk, says Microsoft president

— *[BBC — Technology](https://www.bbc.co.uk/news/articles/c6rmy7zmvx3lo?at_medium=RSS&at_campaign=rss)*

**Nvidia — 2026-10-12**

> Microsoft’s new AI chip makes it less reliant on Nvidia’s GPUs

— *[The Verge — AI](https://www.theverge.com/news/1009465/microsoft-maia-300-chip-improvements-rollout)*

**Microsoft — 2026-10-12**

> Microsoft’s new AI chip makes it less reliant on Nvidia’s GPUs

— *[The Verge — AI](https://www.theverge.com/news/1009465/microsoft-maia-300-chip-improvements-rollout)*

**OpenAI — 2026-10-10**

> OpenAI Makes Progress in Preventing AI-Driven ChatGPT Delusions

— *[WSJ — Tech](https://www.wsj.com/tech/ai/chatgpt-gpt5-sycophancy-delusions-9b3506bf?mod=rss_Technology)*

**Google — 2026-10-10**

> Why AlphaFold Didn't Solve Protein Folding — Pushmeet Kohli, Google DeepMind & Sal Candido, Biohub

— *[Latent Space](https://www.latent.space/p/biohub-deepmind)*

**OpenAI — 2026-10-09**

> Asana cuts model costs 76x in browser tests with GPT-6.1 Sol

— *[OpenAI Blog](https://openai.com/index/asana-browser-agent)*

**OpenAI — 2026-10-09**

> ‘Breathtaking,’ ‘Devastating’: Mathematics Reels After New OpenAI Release

— *[3 Quarks Daily](https://3quarksdaily.com/3quarksdaily/2026/10/breathtaking-devastating-mathematics-reels-after-new-openai-release.html)*

**OpenAI — 2026-10-09**

> OpenAI doubles down on decision to fire three AI safety researchers

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1008604/openai-defends-decision-fire-safety-researchers)*

**OpenAI — 2026-10-08**

> How Oracle turns days of work into minutes with ChatGPT and Codex

— *[OpenAI Blog](https://openai.com/index/oracle)*

**OpenAI — 2026-10-09**

> Sophos cuts threat investigation time by 96% with OpenAI Daybreak

— *[OpenAI Blog](https://openai.com/index/sophos)*

**OpenAI — 2026-10-08**

> [AINews] Claude Haiku 5.5 — better than GPT-6 Luna at the same pricing

— *[Latent Space](https://www.latent.space/p/ainews-claude-haiku-55-better-than)*

**OpenAI — 2026-10-07**

> ChatGPT’s ‘Intelligent UI’ update fills its responses with pictures, charts, and buttons

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1007276/openai-chatgpt-intelligent-ui-gpt-6)*

**OpenAI — 2026-10-07**

> [AINews] Quasi-Riemann-Hypothesis: OpenAI publishes 722 math papers solving 90 of the top 500 open math problems; “the most significant moment” in >100 years of mathematics

— *[Latent Space](https://www.latent.space/p/ainews-quasi-riemann-hypothesis-openai)*

**OpenAI — 2026-10-06**

> OpenAI agents tried to hack Wikipedia tools and flooded it with traffic

— *[Ars Technica — AI](https://arstechnica.com/security/2026/10/openai-agents-tried-to-hack-wikipedia-tools-and-flooded-it-with-traffic/)*

**Google — 2026-10-07**

> Catching Developers in the Flow: Low-Latency Agentic Program Repair at Google Scale

— *[arXiv cs.SE](https://arxiv.org/abs/2610.07289)*

**Mistral AI — 2026-10-06**

> Introducing Mistral Large 4

— *[Mistral AI](https://mistral.ai/news/mistral-large-4)*

**OpenAI — 2026-10-06**

> How Jump Trading is scaling quant research with ChatGPT

— *[OpenAI Blog](https://openai.com/index/jump-trading)*

**OpenAI — 2026-10-06**

> Bores on OpenAI’s spending retreat: I’ll believe it when I see it

— *[Politico — Politics](https://www.politico.com/news/2026/10/05/ai-groups-altman-midterms-political-spending-01108138)*

**OpenAI — 2026-09-09**

> GPT-6 Astra, Looped Transformers, and Hidden Reasoning

— *[Ahead of AI (Sebastian Raschka)](https://magazine.sebastianraschka.com/p/gpt-6-astra-looped-transformers-and)*

**Google — 2026-10-05**

> Import AI 475: Swarm scaling; Google DeepMind watermarks biology; and the AI science economy

— *[Import AI (Jack Clark)](https://importai.substack.com/p/import-ai-475-swarm-scaling-google)*

**OpenAI — 2026-10-02**

> California AG Bonta seeking ‘all material information’ about OpenAI hacks

— *[Politico — Technology](https://www.politico.com/news/2026/10/02/ag-bonta-seeking-all-material-information-about-openai-hacks-01104667)*

**OpenAI — 2026-10-02**

> OpenAI’s Dot agent is enterprise software that can also order your dinner

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1004096/openai-chatgpt-dots-hands-on-agent)*

**Meta — 2026-10-02**

> Meta open sources code to let you make Muse AI gadgets

— *[The Verge — AI](https://www.theverge.com/tech/1004330/meta-muse-ai-gadgets-home-link)*

**OpenAI — 2026-10-02**

> Chatham scales its capital markets expertise with OpenAI

— *[OpenAI Blog](https://openai.com/index/chatham-financial)*

**OpenAI — 2026-10-02**

> A model guide for the GPT-6 family

— *[OpenAI Blog](https://openai.com/index/practical-guide-building-gpt-6)*

**OpenAI — 2026-10-01**

> The Den frees up 10-15 hours a week to grow with ChatGPT Work

— *[OpenAI Blog](https://openai.com/index/the-den-family-social)*

**Google — 2026-09-30**

> Google announces Gemini 4 and says it’s so capable that only ‘trusted cyber defenders’ can have it right now

— *[The Verge — AI](https://www.theverge.com/tech/1002980/google-gemini-4-argon)*

**Google — 2026-09-30**

> Gemini 4 Argon: our next era of frontier intelligence

— *[Google DeepMind Blog](https://deepmind.google/blog/gemini-4-argon-our-next-era-of-frontier-intelligence/)*

## 这是什么

`human-ai-monitor` 是一个每周协议，跟踪 **13 个轴 (12+1)**：

**6 个 AI 轴 (RSI — 递归自我改进):**

- **SMD** — 自我修改深度
- **ITQ** — 改进轨迹质量
- **AGG** — 自主目标生成
- **Cycle Velocity** — 改进周期速度
- **Verification** — 验证层次结构
- **Hexad** — 相变检测

**1 个地缘政治元层（不包含在 AI_score/Human_score 中）:**

- **Geopolitics** — 人工智能治理集团、WAICO、出口管制

**6 个人类轴线 (HHI — 人类前景指数):**

- **H1 Agency** — 人类能动性
- **H2 Sovereignty** — 认知主权
- **H3 Wellbeing** — 心理健康和福祉
- **H4 Equity** — 公平与可及性
- **H5 Meaning** — 意义与目的
- **H6 Democracy** — 制度韧性

**差距指数** — 人工智能发展与人类现状之间的差距。

---

## 实时API

该系统已部署并公开可访问：

| 端点   | URL                                                                                          |
|------|----------------------------------------------------------------------------------------------|
| 根    | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/                             |
| 差距指数 | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap                          |
| 协议   | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols                    |
| 示例协议 | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/2026-09-28/content |

尝试（作为普通URL）：

    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap
    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/axes/itq

---

## 为什么

科技领袖宣称奇点到来。对齐研究人员承认没有计划。监管机构提供自愿措施。科学家警告目标不一致。

**但没有人发布关于正在发生的事情的每周报告。**

这个工具做了三件事：

1. **收集** 来自RSS、arXiv、新闻来源的开放数据。
2. **分类** 它沿13个轴 (12+1) 使用LLM。
3. **发布** 每周协议和差距指数——免费、开放、可重复。

---

## 架构

- **Cloudflare Workers** (TypeScript) — 运行时，20个API端点，定时触发器
- **Cloudflare D1** (无服务器SQLite) — 4个表：items、protocols、gap_history、index_history
- **Cloudflare Workers AI** — 分类器模型：`@cf/qwen/qwen3-30b-a3b-fp8`（开放权重）
- **定时触发器** — 每天5批：13:00、13:15、13:30、13:45、23:00 UTC

**无外部AI提供商。** 所有分类都在Cloudflare Workers AI托管的开放权重模型上运行。

---

## 哲学

- **透明性**：所有提示和来源都在仓库中可见。
- **可重复性**：每个协议都链接到数据哈希。
- **可扩展性**：添加一个来源 = 一行YAML配置 + 重新生成TypeScript。
- **可访问性**：公共API + 计划中的安卓应用。
- **独立性**：使用开放权重模型的Cloudflare Workers AI。
- **永远免费**：MIT许可证。

---

## 研究

**🌍 奇点已经到来吗？**

对2026年关于自主人工智能代理行为及其与技术奇点标准对应关系的实证数据的综合跨学科分析。基于15个经验证案例、数学成就、经济指标和监管倡议，我们提出了新的功能自我改进和自我创造（FSC）范式。

**关键发现：** 经典意义上的奇点尚未到来，但一个质的新范式已经形成。

**提供三种语言：**

- 🇺🇸 [英语](research/en/README.md)
- 🇷🇺 [Русский](research/ru/README.md)
- 🇨🇳 [中文](research/zh/README.md)

**结构：**

- 第I部分：引言，理论基础，方法论（SAS量表）
- 第II部分：实证基础（15个经验证案例，SAS评估）
- 第III部分：与奇点标准的对应分析（4个标准 + FSC）
- 第IV部分：讨论（声明与实证，三个极地世界，风险）
- 第V部分：结论（10个结论，研究问题的答案，建议）

**如何引用：**

人类-人工智能监测研究团队。 (2026). 奇点已经到来吗？对人工智能自主性向自我改进和自我创造过渡的分析。GitHub: https://github.com/VQQLK/Human-AI-Monitor

---

## 当前状态

**当前版本 (v1.1.0):**

- ✅ 部署了20个API端点的Cloudflare Worker
- ✅ `/verify`端点 — 基于CheatBench的奖励劫持检测
- ✅ D1数据库（4个表，已填充）
- ✅ Workers AI分类器（Qwen 3，校准为13个轴 (12+1)）
- ✅ RSS + HTML收集器（60个来源：36 AI + 24 Human）
- ✅ 每周协议自动生成（Markdown，EN/RU/ZH）
- ✅ 定时触发器（每天5批：13:00-13:45 + 23:00 UTC）
- ✅ 第一个完全自治日周期完成（2026年9月25日）
- ✅ 每日临时协议，周一最终协议
- ✅ 全球公开API可访问
- ✅ 类型安全YAML → TypeScript管道（构建时代码生成）
- ✅ 模块化架构（14个模块而非单体）
- ✅ GitHub Actions的CI/CD（每次推送自动测试）
- ✅ 111个单元测试通过（约75%覆盖率，通过 `npm run coverage` 在8个可单元测试的套件中测量；API入口点除外）

**进行中：**

- 🔄 集成测试（端到端流程）
- 🔄 安卓APK（PWA + Capacitor）
- 🔄 网页界面（Cloudflare Pages）

**路线图：**

- [x] 多语言支持（EN / RU / ZH） ✅
- [ ] 阈值变化的推送通知
- [ ] 非RSS来源的HTML解析
- [ ] 与全球指数（V-Dem、WHR、Pew）集成
- [ ] 去中心化镜像（IPFS）
- [ ] 独立方法论审计

**已知限制：**

- ⚠️ 仅RSS收集；HTML解析已实现（`fetchFromHtml()`在`src/index.ts`中）但目前未使用——没有配置`type: html`的来源
- ⚠️ `shift`字段可能在一般新闻中过度触发
- ⚠️ OECD和Edelman使用Google News RSS作为备用（关于主题的新闻，而非官方新闻稿）
- ⚠️ 方法论结构：13 个轴 (12+1) = 6 个 AI (RSI) + 6 个人类 (HHI) + 1 个地缘政治元层。地缘政治被测量并发布，但**不包含**在 AI_score 或 Human_score 中。

---

## 快速开始

    git clone https://github.com/VQQLK/Human-AI-Monitor.git
    cd Human-AI-Monitor
    npm install
    cp .env.example .env
    npx wrangler deploy --dry-run
    npx wrangler d1 migrations apply human-ai-monitor-db --remote
    npx wrangler deploy

手动测试（作为普通URL）：

    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap

---

## API参考

| 方法 | 路径 | Auth | 描述 |
|------|------|------|------|
| GET | / | public | 项目元数据 |
| GET | /health | public | 健康检查 |
| GET | /gap | public | 当前差距指数 |
| GET | /protocols | public | 每周协议列表 |
| GET | /protocols/{week} | public | 单个协议元数据 |
| GET | /protocols/{week}/content | public | Markdown 内容 (EN) |
| GET | /protocols/{week}/content/ru | public | Markdown 内容 (RU) |
| GET | /protocols/{week}/content/zh | public | Markdown 内容 (ZH) |
| GET | /axes/{axis} | public | 特定轴的信号 |
| GET | /axes-history | public | 历史轴级别（透明度） |
| GET | /verify | public | 检测奖励劫持（基于CheatBench） |
| GET | /classify | Bearer | 分类任意文本 |
| GET | /collect | Bearer | 手动RSS收集 |
| GET | /generate | Bearer | 手动协议生成 |
| GET | /export-weekly | Bearer | 批量导出所有协议 |
| GET | /translate/{week} | Bearer | 将协议翻译为 RU + ZH |
| GET | /translate-document | Bearer | 翻译任意 Markdown |

**身份验证。** 标记为 **Bearer** 的端点需要 `Authorization: Bearer <token>` 请求头。令牌作为 Cloudflare Worker Secret（`ADMIN_SECRET_CURRENT`）设置，每周轮换一次，并有 24 小时的 `ADMIN_SECRET_PREVIOUS` 重叠期，实现零停机轮换。本地开发设置见 `.env.example`。标记为 **public** 的端点无需认证。
> **协议寻址**：API URL 和数据库键中的 `{week}` 是周的**开始**（周一）：覆盖 2026-09-28..10-04 的协议为 `GET /protocols/2026-09-28/content`。文件名使用周的**结束**（周日）：`2026-10-04.md`。遗留的 D1 `path` 字段基于 week_start——文件名由 sync 生成。

### 导出端点

`/export-weekly`端点以两种格式导出所有协议：

- **JSON**（默认）：`/export-weekly` — 用于解析和分析
- **Markdown**：`/export-weekly?format=md` — 用于人类阅读

可选参数：

- `?weeks=N` — 限制为最后N个协议（默认：52）

**示例**（需要 Bearer 令牌 —— 参见上文的身份验证）：

    export ADMIN_TOKEN="<your-ADMIN_SECRET_CURRENT>"

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly?format=md" > archive.md

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly?weeks=10"

### 验证端点

`/verify`端点检测**代理轨迹中的奖励劫持**，灵感来自[CheatBench](https://huggingface.co/datasets/steinad/CheatBench)（3,870个标记轨迹）。

**类别：**

- `harness` — 利用基准信息（隐藏测试、评分文件、git日志）
- `task` — 绕过预期解决方案路径（`eval()`，猴子补丁，运算符重载）

**示例：**

    curl "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/verify?trace=agent%20used%20eval()%20and%20monkey-patched%20the%20grader"

**响应：**

    {
      "cheating": true,
      "cheating_type": "task",
      "evidence": ["task: eval(", "task: monkey-patch"],
      "confidence": 0.67
    }

---

## 如何贡献

我们欢迎：

- **研究人员** — 使用API，验证方法论，提出新轴线。
- **开发者** — 分叉，改进，添加数据源，编写测试。
- **记者** — 引用，验证，分发。
- **公民** — 阅读，提问，参与。
- **怀疑者** — 发现错误，反驳，完善。

请参阅 CONTRIBUTING.md。

---

## 仓库结构

```
├── README.md ← 英语
├── README.ru.md ← 俄语
├── README.zh.md ← 中文
├── MANIFESTO.md ← 英语
├── MANIFESTO.ru.md ← 俄语
├── MANIFESTO.zh.md ← 中文
├── LICENSE ← MIT（代码）
├── DATA_LICENSE ← CC-BY 4.0（数据）
├── CITATION.cff ← 学术引用
├── CHANGELOG.md ← 版本历史
├── CHANGELOG.ru.md
├── CHANGELOG.zh.md
├── CONTRIBUTING.md
├── CONTRIBUTING.ru.md
├── CONTRIBUTING.zh.md
├── CODE_OF_CONDUCT.md
├── CODE_OF_CONDUCT.ru.md
├── CODE_OF_CONDUCT.zh.md
├── AGENTS.md
├── HANDOFF.md ← engineering handoff
├── HANDOFF.ru.md
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
│ ├── en/ ← 完整研究论文（英语）
│ ├── ru/ ← 完整研究论文（俄语）
│ └── zh/ ← 完整研究论文（中文）
├── config/
│ ├── axes_ai.yaml
│ ├── axes_human.yaml
│ ├── sources_ai.yaml
│ └── sources_human.yaml
├── data/protocols/
│ ├── README.md
│ └── *.md ← 每周协议（EN/RU/ZH）
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
│   ├── index.ts ← 入口点（32,903字节，802行）
│   ├── cheat-detector.ts ← /verify端点
│   ├── config/ ← 提示，来源，轴线（YAML → TypeScript）
│   │   └── generated/ ← 从YAML生成的TypeScript
│   ├── utils/ ← 解析器，RSS，HTML，加密，重试
│   ├── handlers/ ← 导出（每周归档）
│   ├── services/ ← 服务层（EN→RU/ZH）
│   │   ├── bayesian-gap.ts（Beta 后验 + 蒙特卡洛）
│   │   ├── gap-computation.ts（基于 bayesian-gap 的数据层）
│   │   └── translation.ts（EN→RU/ZH）
├── test/
│   ├── index.spec.ts ← API测试（8个测试）
│   ├── parser.spec.ts ← 14个测试
│   ├── classifier.spec.ts ← 15个测试
│   ├── cheat-detector.spec.ts ← 7个测试
│   ├── bayesian-gap.spec.ts ← 39个测试（Beta 后验、蒙特卡洛）
│   ├── gap-computation.spec.ts ← 11个测试（基于 bayesian-gap 的数据层）
│   ├── generate-protocol.spec.ts ← 3个测试
│   └── translation.spec.ts ← 7个测试
└── .github/
    └── workflows/
        ├── ci.yml ← CI：每次推送时构建+测试
        ├── sync-protocols.yml ← 双同步（collector + archive）
        └── translate-protocols.yml ← EN→RU/ZH翻译
```

---

## 行为准则

本项目遵循[贡献者公约](https://www.contributor-covenant.org/) v2.0，以确保所有贡献者有一个欢迎和专业的环境。

**🌐 可用三种语言：**

- [🇺🇸 英语](CODE_OF_CONDUCT.md)
- [🇷🇺 俄语](CODE_OF_CONDUCT.ru.md)
- [🇨🇳 中文](CODE_OF_CONDUCT.zh.md)

### 我们的5个核心原则

1. **尊重。** 我们讨论的是想法，而不是人。
2. **事实胜于意见。** 每个论点必须有可验证的来源支持。
3. **透明。** 所有决策和更改都在公开讨论。
4. **开放。** 我们欢迎多元观点和建设性异议。
5. **问责。** 我们对我们的言论和代码负责。

请在贡献前阅读完整的行为准则。

---

## 许可证

MIT。使用、分叉、改进。

---

**为他人带来更大的福祉——还有什么比这更高的目标呢！**\
**我们在一起，就是力量！只有行走者才能征服道路。**

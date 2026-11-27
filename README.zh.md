

# 🌍 人类-人工智能监测

**一个用于监测人工智能和人类发展的开放工具。**

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md) [![EN](https://img.shields.io/badge/lang-EN-blue.svg)](README.md) [![RU](https://img.shields.io/badge/lang-RU-red.svg)](README.ru.md) [![ZH](https://img.shields.io/badge/lang-ZH-yellow.svg)](README.zh.md) [![Protocol](https://img.shields.io/badge/Protocol-final%20en-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view) [![Protocol](https://img.shields.io/badge/Protocol-final%20ru-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-final%20zh-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/zh)<br>
[![Protocol](https://img.shields.io/badge/Protocol-current%20en-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view) [![Protocol](https://img.shields.io/badge/Protocol-current%20ru-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-current%20zh-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/zh)

## 📊 当前状态

**更新:** 2026年11月27日  
**基线：** 2026年11月27日更新 — 基于 68 个项目（样本量：51）。

### 🌍 人类–人工智能差距指数（成就 vs 进步）

<div align="center">

| 指标 | 数值 (11-27) | 状态 |
|:---|:---:|:---:|
| **🟢 人类得分** | 🌐 **0.469** | 当前值 |
| **🔴 人工智能得分** | 🤖 **0.585** | 当前值 |
| **⚖️ 差距指数** | ⚖️ **−0.116** | 人工智能领先 |
| **📊 CI95** | **[−0.671, +0.545]** | 不确定 |
| **⚡ 阈值变化** | **1** | 检测到关键事件 |
| **📈 分析项目** | **68** | 每周样本 |
| **🔬 样本量（贝叶斯）** | **51** | 轴-信号对 |

</div>

#### 📈 得分动态 (人类 vs 人工智能)

> 📊 **图例：** 🟢 **柱状图 = 人类** | 🔴 **折线 = 人工智能**。自首个最终版协议起的历史。

```mermaid
xychart-beta
    title "🟢 人类 (柱状) vs 🔴 人工智能 (折线) | 历史"
    x-axis ["15/11", "22/11"]
    y-axis "得分" 0.400 --> 0.881
    bar [0.811, 0.718]
    line [0.814, 0.831]
```

#### 📉 差距指数动态 (人类减去人工智能)

```mermaid
xychart-beta
    title "差距指数 | 正值 = 人类领先，负值 = 人工智能领先"
    x-axis ["15/11", "22/11"]
    y-axis "差距" -0.163 --> 0.250
    line [-0.003, -0.113]
```

#### 📅 每日差距轨迹

```mermaid
xychart-beta
    title "每日差距 | 正值 = 人类领先，负值 = 人工智能领先"
    x-axis ["18/11", "19/11", "20/11", "21/11", "22/11", "23/11 ●", "24/11", "25/11", "26/11", "27/11"]
    y-axis "差距" -0.222 --> 0.097
    line [-0.122, -0.113, -0.113, -0.113, -0.113, -0.113, -0.003, -0.079, -0.079, -0.116]
```

> ● = 周终值（FINAL，已结束的周）；其余点为临时累积（INTERIM）。相邻日期之间的周切换不是单日变化。

| 日期 | 周 | AI | 人类 | 差距 | CI95 | 项目 | 样本 | 类型 |
|---|---|---|---|---|---|---|---|---|
| 27/11 | 23/11–29/11 | 0.585 | 0.469 | −0.116 | [−0.671, +0.545] | 68 | 51 | 临时版 |
| 26/11 | 23/11–29/11 | 0.584 | 0.505 | −0.079 | [−0.941, +0.868] | 31 | 3 | 临时版 |
| 25/11 | 23/11–29/11 | 0.584 | 0.505 | −0.079 | [−0.941, +0.868] | 4 | 1 | 临时版 |
| 24/11 | 23/11–29/11 | 0.503 | 0.500 | −0.003 | [−0.917, +0.921] | 0 | 0 | 临时版 |
| 23/11 | 16/11–22/11 | 0.831 | 0.718 | −0.113 | [−0.314, +0.165] | 599 | 422 | 最终版 ● |
| 22/11 | 16/11–22/11 | 0.831 | 0.718 | −0.113 | [−0.314, +0.165] | 599 | 422 | 临时版 |
| 21/11 | 16/11–22/11 | 0.831 | 0.718 | −0.113 | [−0.314, +0.165] | 599 | 422 | 临时版 |
| 20/11 | 16/11–22/11 | 0.831 | 0.718 | −0.113 | [−0.314, +0.165] | 603 | 422 | 临时版 |
| 19/11 | 16/11–22/11 | 0.831 | 0.718 | −0.113 | [−0.314, +0.165] | 603 | 422 | 临时版 |
| 18/11 | 16/11–22/11 | 0.811 | 0.689 | −0.122 | [−0.348, +0.171] | 453 | 323 | 临时版 |

#### 📚 协议历史

| 周 | AI | 人类 | 差距 | CI95 | 项目 | 样本 | 类型 |
|---|---|---|---|---|---|---|---|
| 22/11 | 0.831 | 0.718 | −0.113 | [−0.314, +0.165] | 599 | 422 | 最终版 |
| 15/11 | 0.814 | 0.811 | −0.003 | [−0.219, +0.363] | 889 | 652 | 最终版 |

> 📌 临时协议（仅供参考，不在图表上）：27/11 — AI 0.585 · 人类 0.469 · 差距 −0.116 · 68 / 51 items.
> 最后一点为临时版，将于周一替换为最终版。

---



## 声音

### 🧠 前沿实验室

**Jensen Huang (Nvidia) — 2026-11-25**

> Republican wants FBI and CIA answers before questioning Nvidia chief

— *[NPR — World](https://www.npr.org/2026/11/25/nx-s1-6052417/nvidia-jensen-huang-reaction-republicans-congress-investigation)*

**Nvidia — 2026-11-23**

> 2028 Democrats say Nvidia news is another example of corruption in government

— *[Politico — Politics](https://www.politico.com/news/2026/11/23/democrats-2028-nvidia-trump-corruption-message-01181056)*

**Meta — 2026-11-26**

> Introducing the llama.cpp benchmark dashboard for AMD Ryzen and Radeon

— *[Hugging Face Blog](https://huggingface.co/blog/ggml-org/llamacpp-amd-bench)*

**Perplexity AI — 2026-11-22**

> Perplexity and Intelligence

— *[OpenAI Blog](https://openai.com/index/perplexity-and-intelligence)*

**OpenAI — 2026-11-23**

> OpenAI and Cisco introduce Shirudo

— *[OpenAI Blog](https://openai.com/index/introducing-shirudo)*

**OpenAI — 2026-11-24**

> Clay helps sales teams win with Codex and ChatGPT

— *[OpenAI Blog](https://openai.com/business/customer-stories/clay-plugins-openai)*

**Google — 2026-11-24**

> From spectrum to structure: Identifying molecules with Mass Spec Skills for Google Antigravity

— *[Google DeepMind Blog](https://deepmind.google/blog/interpreting-mass-spectra-with-google-antigravity/)*

**OpenAI — 2026-11-24**

> GPT-6 models demonstrate intrinsic protein-design capabilities

— *[OpenAI Blog](https://openai.com/index/gpt-6-models-demonstrate-intrinsic-protein-design-capabilities)*

**Nvidia — 2026-11-19**

> Nvidia Is the Central Bank to AI’s Circular Economy. See Where the Money Goes.

— *[WSJ — Tech](https://www.wsj.com/finance/stocks/nvidia-is-the-central-bank-to-ais-circular-economy-see-where-the-money-goes-da480b61?mod=rss_Technology)*

**OpenAI — 2026-11-19**

> Anthropic vs. OpenAI: The Financial Metrics Behind the AI Battle

— *[WSJ — Tech](https://www.wsj.com/tech/ai/anthropic-vs-openai-the-financial-metrics-behind-the-ai-battle-4f5b90c0?mod=rss_Technology)*

**Jensen Huang (Nvidia) — 2026-11-19**

> Uber Co-Founder Kalanick Teases Protest at Nvidia as Calls for Huang’s Return Continue

— *[WSJ — Tech](https://www.wsj.com/tech/ai/uber-co-founder-kalanick-teases-protest-at-nvidia-as-calls-for-huangs-return-continue-37c4f635?mod=rss_Technology)*

**Jensen Huang (Nvidia) — 2026-11-19**

> The Morning Risk Report: The Jensen Huang Saga Has Reinvigorated Washington’s China Hawks

— *[WSJ — Tech](https://www.wsj.com/risk-compliance-journal/the-morning-risk-report-the-jensen-huang-saga-has-reinvigorated-washingtons-china-hawks-00536beb?mod=rss_Technology)*

**Nvidia — 2026-11-18**

> Nvidia created a weird bit of intrigue by not filing a routine SEC report

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/nvidia-created-a-weird-bit-of-intrigue-by-not-filing-a-routine-sec-report/)*

**Satya Nadella (Microsoft) — 2026-11-18**

> Microsoft CEO Satya Nadella remains confident in Nvidia after Huang’s exit

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/microsoft-ceo-satya-nadella-remains-confident-in-nvidia-after-huangs-exit/)*

**Satya Nadella (Microsoft) — 2026-11-18**

> Satya Nadella predicts AI agents will reshuffle the economics of the web

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/satya-nadella-predicts-ai-agents-will-reshuffle-the-economics-of-the-web/)*

**Jensen Huang (Nvidia) — 2026-11-18**

> Microsoft CEO Satya Nadella remains confident in Nvidia after Huang’s exit

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/microsoft-ceo-satya-nadella-remains-confident-in-nvidia-after-huangs-exit/)*

**Satya Nadella (Microsoft) — 2026-11-19**

> Microsoft CEO Satya Nadella explains why he asked 60K employees to quit

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/microsoft-ceo-satya-nadella-explains-why-he-asked-60k-employees-to-quit/)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-11-18**

> Elon Musk says ousting Jensen Huang is like ‘kicking Michael Jordan off your team’

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/elon-musk-says-ousting-jensen-huang-is-like-kicking-michael-jordan-off-your-team/)*

**Satya Nadella (Microsoft) — 2026-11-18**

> Amidst fears of AI cyberattacks, Satya Nadella says lots of critical infrastructure is ‘unpatchable’

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/amidst-fears-of-ai-cyberattacks-satya-nadella-says-lots-of-critical-infrastructure-is-unpatchable/)*

**Jensen Huang (Nvidia) — 2026-11-18**

> Elon Musk says ousting Jensen Huang is like ‘kicking Michael Jordan off your team’

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/elon-musk-says-ousting-jensen-huang-is-like-kicking-michael-jordan-off-your-team/)*

**Google — 2026-11-19**

> [AINews] Gemini 4 Neon: GDM's Opus/Sol Contender

— *[Latent Space](https://latent.space/p/ainews-gemini-4-neon-gdm-s-opus-sol-contender/)*

**Nvidia — 2026-11-19**

> Wall Street Pledged $500 Billion for Nvidia. Not a Dollar Has Been Deployed.

— *[WSJ — World News](https://www.wsj.com/world/wall-street-pledged-500-billion-for-nvidia-not-a-dollar-has-been-deployed-6bee9560?mod=rss_worldnews)*

**Meta — 2026-11-19**

> Meta premieres India’s First Government-Led Microdrama Series on Scams Awareness

— *[Meta AI Blog](https://about.fb.com/news/2026/11/meta-premieres-indias-first-government-led-microdrama-series-on-scams-awareness/)*

**Google — 2026-11-18**

> Introducing Gemini 4 Neon

— *[Google DeepMind Blog](https://deepmind.google/blog/introducing-gemini-4-neon/)*

**OpenAI — 2026-11-18**

> Advancing chip design with OpenAI models

— *[OpenAI Blog](https://openai.com/index/advancing-chip-design-with-our-models)*

**OpenAI — 2026-11-18**

> How Sumitomo Life’s leaders helped teams adopt ChatGPT Enterprise

— *[OpenAI Blog](https://openai.com/business/customer-stories/sumitomo-life)*

**Jensen Huang (Nvidia) — 2026-11-18**

> Mary Peltola flips Alaska's Senate seat. And, Nvidia won't reinstate Jensen Huang

— *[NPR — World](https://www.npr.org/2026/11/18/g-s1-154145/up-first-newsletter-mary-peltola-alaska-trump-asia-nvidia-tech-issues-ai)*

**Nvidia — 2026-11-18**

> Nvidia Results Show AI Demand Remains Robust

— *[WSJ — Tech](https://www.wsj.com/cio-journal/nvidia-results-show-ai-demand-remains-robust-927869f4?mod=rss_Technology)*

**Nvidia — 2026-11-18**

> Nvidia’s Strong Fundamentals Give New CEO a Much-Needed Tailwind

— *[WSJ — Tech](https://www.wsj.com/business/nvidias-strong-fundamentals-give-new-ceo-a-much-needed-tailwind-65859856?mod=rss_Technology)*

**Jensen Huang (Nvidia) — 2026-11-18**

> Nvidia Reports Faster Growth, Says Jensen Huang Won’t Return as CEO

— *[WSJ — Tech](https://www.wsj.com/tech/ai/nvidia-nvda-3q-2027-earnings-report-stock-6e642303?mod=rss_Technology)*

**Nvidia — 2026-11-18**

> Nvidia’s Interim CEO Has a Tough Challenge: Keep the Growth, Leave the Baggage

— *[WSJ — Tech](https://www.wsj.com/tech/ai/nvidias-interim-ceo-has-a-tough-challenge-keep-the-growth-leave-the-baggage-6ff55c85?mod=rss_Technology)*

**Google — 2026-11-17**

> Amazon and Google will together own nearly 30% of Anthropic after its IPO

— *[TechCrunch AI](https://techcrunch.com/2026/11/17/amazon-and-google-will-together-own-nearly-30-of-anthropic-after-its-ipo/)*

**Jensen Huang (Nvidia) — 2026-11-17**

> Nvidia says its open source AI strategy remains intact after Jensen Huang’s exit

— *[TechCrunch AI](https://techcrunch.com/2026/11/17/nvidia-says-its-open-source-ai-strategy-remains-intact-after-jensen-huangs-exit/)*

**Jensen Huang (Nvidia) — 2026-11-17**

> SEC reportedly investigating Nvidia amid Huang exit

— *[TechCrunch AI](https://techcrunch.com/2026/11/17/sec-reportedly-investigating-nvidia-amid-huang-exit/)*

**Jensen Huang (Nvidia) — 2026-11-17**

> Nvidia says it doesn’t plan to reappoint Jensen Huang as CEO

— *[TechCrunch AI](https://techcrunch.com/2026/11/17/nvidia-says-it-doesnt-plan-to-reappoint-jensen-huang-as-ceo/)*

**Jensen Huang (Nvidia) — 2026-11-17**

> Nvidia is abandoning China after Jensen Huang’s ouster

— *[TechCrunch AI](https://techcrunch.com/2026/11/17/nvidia-is-abandoning-china-after-jensen-huangs-ouster/)*

**Nvidia — 2026-11-18**

> Nvidia clarifies when it will — and won’t —keep financing neoclouds

— *[TechCrunch AI](https://techcrunch.com/2026/11/18/nvidia-clarifies-when-it-will-and-wont-keep-financing-neoclouds/)*

**Jensen Huang (Nvidia) — 2026-11-18**

> Nvidia’s startup stakes ballooned to $65B, but Huang’s exit puts future deals in doubt

— *[TechCrunch AI](https://techcrunch.com/2026/11/17/nvidias-startup-stakes-ballooned-to-65b-but-huangs-exit-puts-future-deals-in-doubt/)*

**Nvidia — 2026-11-18**

> Nvidia promises that revenue will keep soaring — for now

— *[TechCrunch AI](https://techcrunch.com/2026/11/17/nvidia-promises-that-revenue-will-keep-soaring-for-now/)*

**OpenAI — 2026-11-18**

> [AINews] GPT-6.2 Astra, the #2 Frontier Model is better and 20%-600% cheaper, but has mixed reviews; 6.2 Sol likely main workhorse

— *[Latent Space](https://latent.space/p/ainews-gpt-6-2-astra-the-2-frontier-model-is-better-and-20-600-cheaper-but-has-mixed-reviews-6-2-sol/)*

**Nvidia — 2026-11-18**

> Nvidia’s Strong Results Do Little to Settle Questions About Its Future

— *[WSJ — World News](https://www.wsj.com/world/nvidias-strong-results-do-little-to-settle-questions-about-its-future-d1ba999d?mod=rss_worldnews)*

**Jensen Huang (Nvidia) — 2026-11-18**

> Can Nvidia bounce back from Jensen Huang's scandal?

— *[CBS News — Technology](https://www.cbsnews.com/video/can-nvidia-bounce-back-from-jensen-huangs-scandal/)*

**Jensen Huang (Nvidia) — 2026-11-18**

> Jensen Huang unlikely to return to Nvidia after scandal

— *[CBS News — Technology](https://www.cbsnews.com/video/jensen-huang-unlikely-to-return-to-nvidia-after-scandal/)*

**Jensen Huang (Nvidia) — 2026-11-18**

> Nvidia rejects Huang offer to return as CEO

— *[The Hill — Policy](https://thehill.com/policy/technology/6227405-nvidia-jensen-huang-return-unlikely-affair-scandals/)*

**Meta — 2026-11-18**

> Meta Welcomes Loblaw as First Canadian Retail Partner to Muse

— *[Meta AI Blog](https://about.fb.com/news/2026/11/meta-welcomes-loblaw-as-first-canadian-retail-partner-to-muse/)*

**OpenAI — 2026-11-17**

> Introducing GPT-6.2 Astra and Sol

— *[OpenAI Blog](https://openai.com/index/introducing-gpt-6-2-astra-sol)*

**OpenAI — 2026-11-18**

> Le Groupe Figaro and OpenAI partner to bring Le Figaro journalism to ChatGPT

— *[OpenAI Blog](https://openai.com/index/le-groupe-figaro-and-openai-announce-partnership)*

**OpenAI — 2026-11-17**

> Introducing ChatGPT for Sales

— *[OpenAI Blog](https://openai.com/index/introducing-chatgpt-for-sales)*

**Jensen Huang (Nvidia) — 2026-11-17**

> Jensen Huang | AI rainmaker meets his Waterloo

— *[The Hindu — International](https://www.thehindu.com/sci-tech/technology/jensen-huang-ai-rainmaker-meets-his-waterloo/article71702817.ece)*

**Nvidia — 2026-11-17**

> U.S. blocks China’s remote access to AI chips after Nvidia scandal; China slams move

— *[The Hindu — International](https://www.thehindu.com/news/international/us-blocks-chinas-remote-access-to-ai-chips-after-nvidia-scandal-china-slams-move/article71711869.ece)*

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

- **H1 Science** — 人类能动性
- **H2 Engineering** — 认知主权
- **H3 Culture** — 心理健康和福祉
- **H4 Institutions** — 公平与可及性
- **H5 Wellbeing** — 意义与目的
- **H6 Governance** — 制度韧性

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
- **定时触发器** — 每天5批：15:00、15:15、15:30、15:45、16:00 UTC

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
- ✅ RSS + HTML收集器（60个来源：30 AI + 30 Human）
- ✅ 每周协议自动生成（Markdown，EN/RU/ZH）
- ✅ 定时触发器（每天5批：15:00-15:45 + 16:00 UTC）
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

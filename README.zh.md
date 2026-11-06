

# 🌍 人类-人工智能监测

**一个用于监测人工智能和人类发展的开放工具。**

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md) [![EN](https://img.shields.io/badge/lang-EN-blue.svg)](README.md) [![RU](https://img.shields.io/badge/lang-RU-red.svg)](README.ru.md) [![ZH](https://img.shields.io/badge/lang-ZH-yellow.svg)](README.zh.md) [![Protocol](https://img.shields.io/badge/Protocol-final%20en-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view) [![Protocol](https://img.shields.io/badge/Protocol-final%20ru-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-final%20zh-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/zh)<br>
[![Protocol](https://img.shields.io/badge/Protocol-current%20en-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view) [![Protocol](https://img.shields.io/badge/Protocol-current%20ru-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-current%20zh-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/zh)

## 📊 当前状态

**更新:** 2026年11月6日  
**基线：** 2026年11月6日更新 — 基于 716 个项目（样本量：692）。

### 🌍 人类–人工智能差距指数（成就 vs 进步）

<div align="center">

| 指标 | 数值 (11-06) | 状态 |
|:---|:---:|:---:|
| **🟢 人类得分** | 🌐 **0.574** | 当前值 |
| **🔴 人工智能得分** | 🤖 **0.853** | 当前值 |
| **⚖️ 差距指数** | ⚖️ **−0.280** | 人工智能领先 |
| **📊 CI95** | **[−0.496, −0.057]** | 显著 |
| **⚡ 阈值变化** | **13** | 检测到关键事件 |
| **📈 分析项目** | **716** | 每周样本 |
| **🔬 样本量（贝叶斯）** | **692** | 轴-信号对 |

</div>

#### 📈 得分动态 (人类 vs 人工智能)

> 📊 **图例：** 🟢 **柱状图 = 人类** | 🔴 **折线 = 人工智能**。自首个最终版协议起的历史。

```mermaid
xychart-beta
    title "🟢 人类 (柱状) vs 🔴 人工智能 (折线) | 历史"
    x-axis ["25/10", "01/11"]
    y-axis "得分" 0.400 --> 0.864
    bar [0.467, 0.679]
    line [0.614, 0.814]
```

#### 📉 差距指数动态 (人类减去人工智能)

```mermaid
xychart-beta
    title "差距指数 | 正值 = 人类领先，负值 = 人工智能领先"
    x-axis ["25/10", "01/11"]
    y-axis "差距" -0.196 --> 0.250
    line [-0.146, -0.135]
```

#### 📅 每日差距轨迹

```mermaid
xychart-beta
    title "每日差距 | 正值 = 人类领先，负值 = 人工智能领先"
    x-axis ["21/10", "22/10", "23/10", "24/10", "25/10", "27/10", "28/10", "29/10", "30/10", "31/10", "01/11", "03/11", "04/11", "05/11", "06/11"]
    y-axis "差距" -0.675 --> 0.041
    line [-0.375, -0.465, -0.533, -0.576, -0.349, -0.059, -0.125, -0.105, -0.101, -0.112, -0.139, -0.135, -0.271, -0.258, -0.280]
```

| 日期 | AI | 人类 | 差距 | CI95 | 项目 | 样本 | 类型 |
|---|---|---|---|---|---|---|---|
| 06/11 | 0.853 | 0.574 | −0.280 | [−0.496, −0.057] | 716 | 692 | 临时版 |
| 05/11 | 0.827 | 0.569 | −0.258 | [−0.489, −0.017] | 565 | 542 | 临时版 |
| 04/11 | 0.800 | 0.529 | −0.271 | [−0.516, −0.003] | 417 | 382 | 临时版 |
| 03/11 | 0.731 | 0.596 | −0.135 | [−0.433, +0.174] | 271 | 247 | 临时版 |
| 01/11 | 0.814 | 0.675 | −0.139 | [−0.357, +0.104] | 822 | 720 | 临时版 |
| 31/10 | 0.791 | 0.679 | −0.112 | [−0.340, +0.138] | 712 | 630 | 临时版 |
| 30/10 | 0.771 | 0.670 | −0.101 | [−0.342, +0.150] | 583 | 531 | 临时版 |
| 29/10 | 0.757 | 0.652 | −0.105 | [−0.353, +0.154] | 452 | 422 | 临时版 |
| 28/10 | 0.721 | 0.596 | −0.125 | [−0.409, +0.165] | 315 | 302 | 临时版 |
| 27/10 | 0.679 | 0.620 | −0.059 | [−0.370, +0.260] | 167 | 147 | 临时版 |
| 25/10 | 0.850 | 0.500 | −0.349 | [−0.667, −0.019] | 1020 | 895 | 临时版 |
| 24/10 | 0.842 | 0.267 | −0.576 | [−0.768, −0.357] | 909 | 795 | 临时版 |
| 23/10 | 0.827 | 0.293 | −0.533 | [−0.738, −0.303] | 752 | 672 | 临时版 |
| 22/10 | 0.800 | 0.335 | −0.465 | [−0.694, −0.208] | 569 | 501 | 临时版 |
| 21/10 | 0.716 | 0.341 | −0.375 | [−0.653, −0.083] | 382 | 328 | 临时版 |

#### 📚 协议历史

| 周 | AI | 人类 | 差距 | CI95 | 项目 | 样本 | 类型 |
|---|---|---|---|---|---|---|---|
| 01/11 | 0.814 | 0.679 | −0.135 | [−0.351, +0.102] | 838 | 730 | 最终版 |
| 25/10 | 0.614 | 0.467 | −0.146 | [−0.520, +0.227] | 121 | 117 | 最终版 |

> 📌 临时协议（仅供参考，不在图表上）：06/11 — AI 0.853 · 人类 0.574 · 差距 −0.280 · 716 / 692 items.
> 最后一点为临时版，将于周一替换为最终版。

---



## 声音

### 🧠 前沿实验室

**Nvidia — 2026-11-06**

> Nvidia CEO called in by lawmakers over ties to alleged Chinese spy

— *[Axios](https://www.axios.com/2026/11/05/jensen-huang-nvidia-congress-china)*

**Jensen Huang (Nvidia) — 2026-11-06**

> Nvidia CEO called in by lawmakers over ties to alleged Chinese spy

— *[Axios](https://www.axios.com/2026/11/05/jensen-huang-nvidia-congress-china)*

**OpenAI — 2026-11-05**

> OpenAI president Greg Brockman says company could be IPO ready in 2027

— *[TechCrunch AI](https://techcrunch.com/2026/11/05/openai-president-greg-brockman-says-company-could-be-ipo-ready-in-2027/)*

**Greg Brockman (OpenAI) — 2026-11-05**

> OpenAI president Greg Brockman says company could be IPO ready in 2027

— *[TechCrunch AI](https://techcrunch.com/2026/11/05/openai-president-greg-brockman-says-company-could-be-ipo-ready-in-2027/)*

**Meta — 2026-11-05**

> Meta warns that election backlash against data centers could make AI expansion harder

— *[TechCrunch AI](https://techcrunch.com/2026/11/05/metas-warns-that-election-backlash-against-data-centers-could-make-ai-expansion-harder/)*

**Meta — 2026-11-05**

> Meta, TikTok, Google sue to block California teen social media law championed by Newsom

— *[Politico — Technology](https://www.politico.com/news/2026/11/05/meta-tiktok-google-sue-to-block-california-teen-social-media-law-championed-by-newsom-01151171)*

**Google — 2026-11-05**

> Meta, TikTok, Google sue to block California teen social media law championed by Newsom

— *[Politico — Technology](https://www.politico.com/news/2026/11/05/meta-tiktok-google-sue-to-block-california-teen-social-media-law-championed-by-newsom-01151171)*

**Nvidia — 2026-11-05**

> New NVIDIA Cosmos 3 Open Models for Interactive World Simulation

— *[Hugging Face Blog](https://huggingface.co/blog/nvidia/cosmos-interactive-world-simulation)*

**Google — 2026-11-05**

> Gemini Omni 1.2 Flash: Fast and cost-effective with longer clips

— *[Google DeepMind Blog](https://deepmind.google/blog/gemini-omni-12-flash-fast-and-cost-effective-with-longer-clips/)*

**OpenAI — 2026-11-05**

> Franklin Templeton uses OpenAI to support investment research

— *[OpenAI Blog](https://openai.com/index/franklin-templeton)*

**OpenAI — 2026-11-05**

> GPT‑6 Cyber: Advancing the frontier of aligned cybersecurity agents

— *[OpenAI Blog](https://openai.com/index/introducing-gpt-6-cyber)*

**OpenAI — 2026-11-05**

> Merge builds product and business tools with OpenAI technology

— *[OpenAI Blog](https://openai.com/index/merge-builds-with-openai)*

**Google — 2026-11-04**

> Google Won’t Give Schools the One Thing They Want

— *[The Atlantic](https://www.theatlantic.com/technology/2026/11/google-schools-ai-search/689298/?utm_source=feed)*

**Google — 2026-11-04**

> Google Summaries Aren't About AI, They're About Lock-In

— *[EFF (Electronic Frontier Foundation)](https://www.eff.org/deeplinks/2026/11/google-summaries-arent-about-ai-theyre-about-lock)*

**OpenAI — 2026-11-05**

> OpenAI lays out new policy framework for data centers

— *[Politico — Technology](https://www.politico.com/news/2026/11/05/openai-new-policy-framework-data-centers-01150714)*

**Meta — 2026-11-05**

> Challenge-Aware Knowledge Recruitment with Meta-Agent Supervision for Medical Multi-Agent Reasoning

— *[arXiv cs.AI](https://arxiv.org/abs/2611.05393)*

**OpenAI — 2026-11-04**

> DevRev delivers autonomous self-service with GPT-6.1 Sol

— *[OpenAI Blog](https://openai.com/index/devrev-enterprise-self-service)*

**OpenAI — 2026-11-04**

> OpenAI to acquire Pierre Computer Company, Inc.

— *[OpenAI Blog](https://openai.com/index/openai-to-acquire-pierre)*

**Google — 2026-11-04**

> Google will cut off search access for students at schools that reject AI

— *[The Hill — Policy](https://thehill.com/policy/technology/google-search-ai-students/)*

**Microsoft — 2026-11-03**

> UEFI bootkit infected fully patched Windows machines. Is Microsoft to blame?

— *[Ars Technica — AI](https://arstechnica.com/security/2026/11/uefi-bootkit-infected-fully-patched-windows-machines-is-microsoft-to-blame/)*

**Google — 2026-11-03**

> OpenAI says ChatGPT is catching up to Google in search

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1025482/openai-says-chatgpt-is-catching-up-to-google-in-search)*

**OpenAI — 2026-11-03**

> OpenAI says ChatGPT is catching up to Google in search

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1025482/openai-says-chatgpt-is-catching-up-to-google-in-search)*

**Google — 2026-11-04**

> Google hasn’t figured out how to make AI pay like its search engine

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1024862/google-search-ai-overviews-alphabet-earnings-q3)*

**Sam Altman (OpenAI) — 2026-11-04**

> Sam Altman addresses RAM comments: people should ‘put as much as they want in their computers’

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1026292/sam-altman-ram-shortage-pcs-comments)*

**Google — 2026-11-03**

> Agentic cheminformatics with Google Antigravity

— *[Google DeepMind Blog](https://deepmind.google/blog/agentic-cheminformatics-with-google-antigravity/)*

**OpenAI — 2026-11-03**

> OpenAI appoints Jill Hazelbaker as Chief Corporate Affairs Officer

— *[OpenAI Blog](https://openai.com/index/jill-hazelbaker-chief-corporate-affairs-officer)*

**OpenAI — 2026-11-03**

> How Cisco defends at machine speed with OpenAI

— *[OpenAI Blog](https://openai.com/index/cisco-cyber)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-11-03**

> Elon Musk's next target: a major shake-up of America's wireless market

— *[Axios](https://www.axios.com/2026/11/03/elon-musk-spacex-boost-mobile-wireless-market)*

**Google — 2026-11-03**

> Google takes Dreambeans to India in bid to bring AI-generated personal stories to the masses

— *[TechCrunch AI](https://techcrunch.com/2026/11/02/google-takes-dreambeans-to-india-in-bid-to-bring-ai-generated-personal-stories-to-the-masses/)*

**OpenAI — 2026-11-02**

> OpenAI pitches data center power plants as a way to protect nearby areas

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1024604/openai-data-center-grid-protection-program)*

**Claude — 2026-11-02**

> Anthropic clamps down on Claude’s AI video game clones

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1024632/anthropic-claude-ai-video-game-clones)*

**OpenAI — 2026-11-02**

> ChatGPT as a Surveillance Assistant? An Exploratory Case Study of AI-Assisted Surveillance Risks

— *[arXiv cs.AI](https://arxiv.org/abs/2610.40890)*

**OpenAI — 2026-11-02**

> OpenAI appoints Dan Driscoll as Senior Counselor for National Security Modernization

— *[OpenAI Blog](https://openai.com/index/dan-driscoll-joins-openai)*

**OpenAI — 2026-11-02**

> Preparing our next security sprint to harden OpenAI

— *[OpenAI Blog](https://openai.com/index/preparing-our-next-security-sprint-to-harden-openai)*

**OpenAI — 2026-11-02**

> Scaling Git at OpenAI

— *[OpenAI Blog](https://openai.com/index/scaling-git-at-openai)*

**Elon Musk (xAI, Tesla, SpaceX) — 2026-11-02**

> Trump vows to protect Musk, floats pre-emptive staff pardons

— *[Axios](https://www.axios.com/2026/11/02/trump-musk-democrats)*

**OpenAI — 2026-11-01**

> OpenAI might rebrand its data centers as ‘AI compute campuses’

— *[TechCrunch AI](https://techcrunch.com/2026/11/01/openai-might-rebrand-its-data-centers-as-ai-compute-campuses/)*

**OpenAI — 2026-11-02**

> OpenAI is finally merging ChatGPT’s chat and Work tabs

— *[TechCrunch AI](https://techcrunch.com/2026/11/02/openai-is-finally-merging-chatgpts-chat-and-work-tabs/)*

**OpenAI — 2026-11-02**

> OpenAI is already pitching 2028 hopefuls on how to talk about AI

— *[Politico — Technology](https://www.politico.com/news/2026/11/02/openai-is-already-pitching-2028-hopefuls-on-how-to-talk-about-ai-01144821)*

**Microsoft — 2026-11-02**

> Cognitive Inclusivity in AI Coding Assistants: Evidence from GitHub Copilot

— *[arXiv cs.SE](https://arxiv.org/abs/2610.41192)*

**xAI — 2026-10-31**

> Judge allows NAACP lawsuit over xAI data center pollution to move forward

— *[TechCrunch AI](https://techcrunch.com/2026/10/31/judge-allows-naacp-lawsuit-over-xai-data-center-pollution-to-move-forward/)*

**OpenAI — 2026-10-31**

> OpenAI reportedly lowers funding target for new round

— *[TechCrunch AI](https://techcrunch.com/2026/10/31/openai-reportedly-lowers-funding-target-for-new-round/)*

**Meta — 2026-10-31**

> I built an AI Tamagotchi before Meta could

— *[The Verge — AI](https://www.theverge.com/gadgets/1013375/muse-charm-gadgets-preview-waveshare-esp32-claude-vibe-code)*

**xAI — 2026-10-31**

> Grok the Vote

— *[The Atlantic](https://www.theatlantic.com/technology/2026/10/x-midterm-election-ai-fact-check/689245/?utm_source=feed)*

**OpenAI — 2026-10-31**

> OpenAI Raises Less Than Half of $30 Billion Target in Latest Round

— *[WSJ — Tech](https://www.wsj.com/tech/ai/openai-raises-less-than-half-of-30-billion-target-in-latest-round-91aecdc5?mod=rss_Technology)*

**Nvidia — 2026-10-31**

> Chinese Executive Close to Nvidia CEO Suspected of Giving China Information

— *[WSJ — Tech](https://www.wsj.com/tech/chinese-executive-close-to-nvidia-ceo-suspected-of-giving-china-information-798eb6a1?mod=rss_Technology)*

**Jensen Huang (Nvidia) — 2026-10-31**

> Chinese Executive Close to Nvidia CEO Suspected of Giving China Information

— *[WSJ — Tech](https://www.wsj.com/tech/chinese-executive-close-to-nvidia-ceo-suspected-of-giving-china-information-798eb6a1?mod=rss_Technology)*

### 🧪 AI研究人员

**Stuart Russell (UC Berkeley) — 2026-11-05**

> Russell Brand found guilty of rape and sexual assault by UK court

— *[Al Jazeera](https://www.aljazeera.com/news/2026/11/5/russell-brand-found-guilty-of-rape-and-sexual-assault-by-uk-court?traffic_source=rss)*

**Stuart Russell (UC Berkeley) — 2026-11-05**

> Russell Brand found guilty of rape and sexual assault

— *[CBS News — Technology](https://www.cbsnews.com/news/russell-brand-found-guilty-rape-sexual-assault-verdict/)*

### 💼 投资人与科技领袖

**Jeff Bezos (Amazon, Blue Origin) — 2026-11-03**

> Those Jeff Bezos hair transplant photos are very fake

— *[The Verge — AI](https://www.theverge.com/tech/1025745/fake-jeff-bezos-hair-replacement-photos-debunk)*

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

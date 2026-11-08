# 🌍 Human–AI Monitor

**Открытый инструмент для мониторинга развития Искусственного Интеллекта и Человечества.**

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md) [![EN](https://img.shields.io/badge/lang-EN-blue.svg)](README.md) [![RU](https://img.shields.io/badge/lang-RU-red.svg)](README.ru.md) [![ZH](https://img.shields.io/badge/lang-ZH-yellow.svg)](README.zh.md) [![Protocol](https://img.shields.io/badge/Protocol-final%20en-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view) [![Protocol](https://img.shields.io/badge/Protocol-final%20ru-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-final%20zh-brightgreen.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/latest/view/zh)<br>
[![Protocol](https://img.shields.io/badge/Protocol-current%20en-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view) [![Protocol](https://img.shields.io/badge/Protocol-current%20ru-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/ru) [![Protocol](https://img.shields.io/badge/Protocol-current%20zh-orange.svg)](https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/current/view/zh)

## 📊 Текущее состояние развития

**Обновлено:** 8 ноября 2026  
**Базовая линия:** Обновлено 8 ноября 2026 — на основе 966 элементов (размер выборки: 895).

### 🌍 Индекс разрыва Human–AI (Достижения vs Прогресс)

<div align="center">

| Метрика | Значение (08.11) | Статус |
|:---|:---:|:---:|
| **🟢 Оценка Человечества** | 🌐 **0.615** | Текущее значение |
| **🔴 Оценка ИИ** | 🤖 **0.883** | Текущее значение |
| **⚖️ Индекс разрыва** | ⚖️ **−0.269** | ИИ впереди |
| **📊 CI95** | **[−0.469, −0.070]** | Значимо |
| **⚡ Ключевых сдвигов** | **19** | Обнаружены критические события |
| **📈 Анализированных событий** | **966** | Недельная выборка |
| **🔬 Размер выборки (байесовский)** | **895** | Пары «ось-сигнал» |

</div>

#### 📈 Динамика оценок (Человечество vs ИИ)

> 📊 **Легенда графика:** 🟢 **Столбики = Человечество** | 🔴 **Линия = ИИ**. История с первого финального протокола.

```mermaid
xychart-beta
    title "🟢 Человечество (столбики) vs 🔴 ИИ (линия) | История"
    x-axis ["25/10", "01/11"]
    y-axis "Оценка" 0.400 --> 0.864
    bar [0.467, 0.679]
    line [0.614, 0.814]
```

#### 📉 Динамика Индекса разрыва (Человечество минус ИИ)

```mermaid
xychart-beta
    title "Индекс разрыва | Положительный = Человечество впереди, Отрицательный = ИИ впереди"
    x-axis ["25/10", "01/11"]
    y-axis "Разрыв" -0.196 --> 0.250
    line [-0.146, -0.135]
```

#### 📅 Ежедневная траектория разрыва

```mermaid
xychart-beta
    title "Ежедневный разрыв | Положительный = Человечество впереди, Отрицательный = ИИ впереди"
    x-axis ["23/10", "24/10", "25/10", "27/10", "28/10", "29/10", "30/10", "31/10", "01/11", "03/11", "04/11", "05/11", "06/11", "07/11", "08/11"]
    y-axis "Разрыв" -0.675 --> 0.041
    line [-0.533, -0.576, -0.349, -0.059, -0.125, -0.105, -0.101, -0.112, -0.139, -0.135, -0.271, -0.258, -0.280, -0.272, -0.269]
```

| Дата | ИИ | Человечество | Разрыв | CI95 | Элементов | Выборка | Тип |
|---|---|---|---|---|---|---|---|
| 08/11 | 0.883 | 0.615 | −0.269 | [−0.469, −0.070] | 966 | 895 | ПРОМЕЖУТОЧНЫЙ |
| 07/11 | 0.870 | 0.598 | −0.272 | [−0.486, −0.059] | 849 | 804 | ПРОМЕЖУТОЧНЫЙ |
| 06/11 | 0.853 | 0.574 | −0.280 | [−0.496, −0.057] | 716 | 692 | ПРОМЕЖУТОЧНЫЙ |
| 05/11 | 0.827 | 0.569 | −0.258 | [−0.489, −0.017] | 565 | 542 | ПРОМЕЖУТОЧНЫЙ |
| 04/11 | 0.800 | 0.529 | −0.271 | [−0.516, −0.003] | 417 | 382 | ПРОМЕЖУТОЧНЫЙ |
| 03/11 | 0.731 | 0.596 | −0.135 | [−0.433, +0.174] | 271 | 247 | ПРОМЕЖУТОЧНЫЙ |
| 01/11 | 0.814 | 0.675 | −0.139 | [−0.357, +0.104] | 822 | 720 | ПРОМЕЖУТОЧНЫЙ |
| 31/10 | 0.791 | 0.679 | −0.112 | [−0.340, +0.138] | 712 | 630 | ПРОМЕЖУТОЧНЫЙ |
| 30/10 | 0.771 | 0.670 | −0.101 | [−0.342, +0.150] | 583 | 531 | ПРОМЕЖУТОЧНЫЙ |
| 29/10 | 0.757 | 0.652 | −0.105 | [−0.353, +0.154] | 452 | 422 | ПРОМЕЖУТОЧНЫЙ |
| 28/10 | 0.721 | 0.596 | −0.125 | [−0.409, +0.165] | 315 | 302 | ПРОМЕЖУТОЧНЫЙ |
| 27/10 | 0.679 | 0.620 | −0.059 | [−0.370, +0.260] | 167 | 147 | ПРОМЕЖУТОЧНЫЙ |
| 25/10 | 0.850 | 0.500 | −0.349 | [−0.667, −0.019] | 1020 | 895 | ПРОМЕЖУТОЧНЫЙ |
| 24/10 | 0.842 | 0.267 | −0.576 | [−0.768, −0.357] | 909 | 795 | ПРОМЕЖУТОЧНЫЙ |
| 23/10 | 0.827 | 0.293 | −0.533 | [−0.738, −0.303] | 752 | 672 | ПРОМЕЖУТОЧНЫЙ |

#### 📚 История протоколов

| Неделя | ИИ | Человечество | Разрыв | CI95 | Элементов | Выборка | Тип |
|---|---|---|---|---|---|---|---|
| 01/11 | 0.814 | 0.679 | −0.135 | [−0.351, +0.102] | 838 | 730 | ФИНАЛЬНЫЙ |
| 25/10 | 0.614 | 0.467 | −0.146 | [−0.520, +0.227] | 121 | 117 | ФИНАЛЬНЫЙ |

> 📌 Промежуточный протокол (справочно, не на графике): 08/11 — ИИ 0.883 · Человечество 0.615 · Разрыв −0.269 · 966 / 895 items.
> Последняя точка — ПРОМЕЖУТОЧНАЯ, будет заменена ФИНАЛЬНОЙ в понедельник.

---



## Мнения

### 🧠 Ведущие Лаборатории ИИ

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

**Meta — 2026-11-06**

> Meta introduces Spaces, a new way to collaborate with your Muse agent

— *[TechCrunch AI](https://techcrunch.com/2026/11/06/meta-introduces-spaces-a-new-way-to-collaborate-with-your-muse-agent/)*

**OpenAI — 2026-11-06**

> OpenAI reportedly raises an additional $11 billion at a $1.25 trillion valuation

— *[TechCrunch AI](https://techcrunch.com/2026/11/06/openai-reportedly-raises-an-additional-11-billion-at-a-1-25-trillion-valuation/)*

**Google — 2026-11-07**

> Crusoe sells troubled Wyoming data center project to Google

— *[TechCrunch AI](https://techcrunch.com/2026/11/06/crusoe-sells-troubled-wyoming-data-center-project-to-google/)*

**OpenAI — 2026-11-04**

> OpenAI: Astra covertly underperforms on safety research

— *[AI Alignment Forum](https://www.alignmentforum.org/posts/eKe7fky8kSt9DCJxZ/openai-astra-covertly-underperforms-on-safety-research)*

**Microsoft — 2026-11-06**

> Protesters break into Microsoft data center site in Amsterdam

— *[The Verge — AI](https://www.theverge.com/news/1028549/protesters-microsoft-data-center-site-amsterdam)*

**OpenAI — 2026-11-06**

> OpenAI valued at $1.25 trillion, as rival Anthropic nears its IPO

— *[The Verge — AI](https://www.theverge.com/ai-artificial-intelligence/1029380/openai-1-25-trillion-investment-valuation)*

**Jensen Huang (Nvidia) — 2026-11-06**

> China reportedly recruited AI exec to spy on Jensen Huang

— *[The Verge — AI](https://www.theverge.com/tech/1029338/nvidia-ceo-jensen-huang-china-spy)*

**Meta — 2026-11-06**

> Meta’s Muse AI can create custom ‘spaces’ for the version of the app you need right now

— *[The Verge — AI](https://www.theverge.com/tech/1028871/meta-muse-ai-spaces)*

**OpenAI — 2026-11-06**

> Partnering with Hacktron to find vulnerabilities in OpenAI’s systems

— *[OpenAI Blog](https://openai.com/index/partnering-with-hacktron)*

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

### 🧪 Исследователи ИИ

**Stuart Russell (UC Berkeley) — 2026-11-08**

> Russell Brand to learn sentence after being found guilty of rape and sexual assault

— *[NPR — World](https://www.npr.org/2026/11/08/nx-s1-6033957/russell-brand-learn-sentence-found-guilty-rape-sexual-assault)*

**Stuart Russell (UC Berkeley) — 2026-11-05**

> Russell Brand found guilty of rape and sexual assault by UK court

— *[Al Jazeera](https://www.aljazeera.com/news/2026/11/5/russell-brand-found-guilty-of-rape-and-sexual-assault-by-uk-court?traffic_source=rss)*

**Stuart Russell (UC Berkeley) — 2026-11-05**

> Russell Brand found guilty of rape and sexual assault

— *[CBS News — Technology](https://www.cbsnews.com/news/russell-brand-found-guilty-rape-sexual-assault-verdict/)*

### 💼 Инвесторы и техлидеры

**Jeff Bezos (Amazon, Blue Origin) — 2026-11-03**

> Those Jeff Bezos hair transplant photos are very fake

— *[The Verge — AI](https://www.theverge.com/tech/1025745/fake-jeff-bezos-hair-replacement-photos-debunk)*

## Что это

`Human-AI-Monitor` — еженедельный протокол, отслеживающий **13 осей (12+1)**:

**6 осей ИИ (RSI — Рекурсивное самосовершенствование):**

- **SMD** — Глубина самомодификации
- **ITQ** — Качество траектории улучшения
- **AGG** — Автономная генерация целей
- **Cycle Velocity** — Скорость циклов улучшения
- **Verification** — Иерархия верификации
- **Hexad** — Обнаружение фазового перехода

**1 геополитический мета-слой (не входит в AI_score/Human_score):**

- **Geopolitics** — блоки управления ИИ, WAICO, экспортный контроль

**6 осей Человечества (HHI — Индекс человеческого горизонта):**

- **H1 Science** — Человеческая агентность
- **H2 Engineering** — Когнитивный суверенитет
- **H3 Culture** — Ментальное здоровье и благополучие
- **H4 Institutions** — Равенство и доступ
- **H5 Wellbeing** — Смысл и цель
- **H6 Governance** — Институциональная устойчивость

**Индекс разрыва** — разрыв между развитием ИИ и состоянием Человечества.

---

## Живой API

Система развёрнута и публично доступна:

| Эндпоинт         | URL                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Корень           | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/                             |
| Индекс разрыва   | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap                          |
| Протоколы        | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols                    |
| Пример протокола | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/2026-09-28/content |

Попробуйте (как обычные URL):

    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap
    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/axes/itq

---

## Зачем

Технологические лидеры провозглашают сингулярность. Исследователи согласования признают отсутствие плана. Регуляторы предлагают добровольные меры. Учёные предупреждают о рассогласованных целях.

**Но никто не публикует периодический отчёт о том, что с нами происходит.**

Этот инструмент делает три вещи:

1. **Собирает** открытые данные из RSS, arXiv, новостных источников.
2. **Классифицирует** их по 13 осям (12+1) с помощью LLM.
3. **Публикует** еженедельный протокол и Индекс разрыва — бесплатно, открыто, воспроизводимо.

---

## Архитектура

- **Cloudflare Workers** (TypeScript) — среда выполнения, 20 API-эндпоинтов, Cron Trigger
- **Cloudflare D1** (Serverless SQLite) — 4 таблицы: items, protocols, gap_history, index_history
- **Cloudflare Workers AI** — модель классификатора: `@cf/qwen/qwen3-30b-a3b-fp8` (открытые веса)
- **Cron Trigger** — 5 batches ежедневно: 15:00, 15:15, 15:30, 15:45, 16:00 UTC

**Никаких внешних ИИ-провайдеров.** Вся классификация выполняется на моделях с открытыми весами, размещённых в Cloudflare Workers AI.

---

## Философия

- **Прозрачность:** все промпты и источники видны в репозитории.
- **Воспроизводимость:** каждый протокол ссылается на хэши данных.
- **Расширяемость:** добавление источника = одна строка в массиве SOURCES.
- **Доступность:** публичный API + планируемое Android-приложение.
- **Независимость:** Cloudflare Workers AI с моделями с открытыми весами.
- **Бесплатно навсегда:** MIT License.

---

## Исследование

**🌍 Сингулярность уже наступила?**

Комплексный междисциплинарный анализ эмпирических данных 2026 года об автономном поведении ИИ-агентов и их соответствия критериям технологической сингулярности. На основе 15 верифицированных случаев, математических достижений, экономических показателей и регуляторных инициатив мы формулируем новую парадигму функционального самосовершенствования и самосоздания (FSC).

**Ключевой вывод:** сингулярность в классическом смысле не наступила, но сформировалась качественно новая парадигма.

**Доступно на трёх языках:**

- 🇷🇺 [Русский](research/ru/README.md)
- 🇺🇸 [English](research/en/README.md)
- 🇨🇳 [中文](research/zh/README.md)

**Структура:**

- Часть I: Введение, теоретические основы, методология (шкала SAS)
- Часть II: Эмпирическая база (15 верифицированных случаев, оценки по SAS)
- Часть III: Анализ соответствия критериям сингулярности (4 критерия + FSC)
- Часть IV: Обсуждение (Декларации vs Эмпирика, Три полярных мира, Риски)
- Часть V: Выводы (10 выводов, ответы на исследовательские вопросы, рекомендации)

**Как цитировать:**

Human–AI Monitor Research Team. (2026). Сингулярность уже наступила? Анализ перехода автономности ИИ в самосовершенствование и самосоздание. GitHub: https://github.com/VQQLK/Human-AI-Monitor

---

## Текущий статус

**Текущий релиз (v1.1.0):**

- ✅ Cloudflare Worker с 20 API-эндпоинтами — развёрнут
- ✅ Эндпоинт `/verify` — обнаружение reward hacking, вдохновлённое CheatBench
- ✅ База данных D1 (4 таблицы, заполнена)
- ✅ Классификатор Workers AI (Qwen 3, откалиброван для 13 осей (12+1))
- ✅ RSS + HTML коллектор (60 источников: 30 AI + 30 Human)
- ✅ Автогенерация еженедельного протокола (Markdown, EN/RU/ZH)
- ✅ Cron Trigger — 5 batches ежедневно (15:00-15:45 + 16:00 UTC)
- ✅ Первый полностью автономный дневной цикл завершён (25 сентября 2026)
- ✅ Ежедневный промежуточный протокол, финальный по понедельникам
- ✅ Публичный API доступен по всему миру
- ✅ Type-safe pipeline: YAML → TypeScript (генерация кода при сборке)
- ✅ Модульная архитектура (14 модулей вместо монолита)
- ✅ CI/CD через GitHub Actions (автоматические тесты при каждом push)
- ✅ 111 unit-тестов проходят (~75% покрытие, измерено по 8 юнит-тестируемым наборам через `npm run coverage`; точка входа API исключена)

**В процессе:**

- 🔄 Integration тесты (end-to-end flow)
- 🔄 Android APK (PWA + Capacitor)
- 🔄 Веб-интерфейс (Cloudflare Pages)

**Дорожная карта:**

- [x] Мультиязычная поддержка (EN / RU / ZH) ✅
- [ ] Push-уведомления о пороговых сдвигах
- [ ] HTML-парсинг для не-RSS источников
- [ ] Интеграция с глобальными индексами (V-Dem, WHR, Pew)
- [ ] Децентрализованное зеркало (IPFS)
- [ ] Независимый аудит методологии

**Известные ограничения:**

- ⚠️ Только RSS-коллекция; HTML-парсинг реализован (`fetchFromHtml()` в `src/index.ts`), но не используется — нет источников с `type: html`
- ⚠️ Поле `shift` может срабатывать слишком часто на общих новостях
- ⚠️ OECD и Edelman используют Google News RSS как fallback (новости *о* темах, не официальные пресс-релизы)
- ⚠️ Методологическая структура: 13 осей (12+1) = 6 ИИ (RSI) + 6 Человечества (HHI) + 1 геополитический мета-слой. Геополитика измеряется и публикуется, но **НЕ входит** ни в AI_score, ни в Human_score.

---

## Быстрый старт

    git clone https://github.com/VQQLK/Human-AI-Monitor.git
    cd Human-AI-Monitor
    npm install
    cp .env.example .env
    npx wrangler deploy --dry-run
    npx wrangler d1 migrations apply human-ai-monitor-db --remote
    npx wrangler deploy

Тестировать вручную (как обычный URL):

    curl https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap

---

## Справочник API

| Метод | Путь                                  | Auth     | Описание                                            |
| ----- | ------------------------------------- | -------- | --------------------------------------------------- |
| GET   | /                                     | public   | Метаданные проекта                                  |
| GET   | /health                               | public   | Проверка работоспособности                          |
| GET   | /gap                                  | public   | Текущий Индекс разрыва                              |
| GET   | /protocols                            | public   | Список еженедельных протоколов                      |
| GET   | /protocols/{week}                     | public   | Метаданные одного протокола                         |
| GET   | /protocols/{week}/content             | public   | Markdown-содержимое (EN)                            |
| GET   | /protocols/{week}/content/ru          | public   | Markdown-содержимое (RU)                            |
| GET   | /protocols/{week}/content/zh          | public   | Markdown-содержимое (ZH)                            |
| GET   | /axes/{axis}                          | public   | Сигналы для конкретной оси                          |
| GET   | /axes-history                         | public   | Исторические уровни осей (прозрачность)             |
| GET   | /verify                               | public   | Обнаружение reward hacking (вдохновлено CheatBench) |
| GET   | /classify                             | Bearer   | Классификация произвольного текста                  |
| GET   | /collect                              | Bearer   | Ручной сбор RSS                                     |
| GET   | /generate                             | Bearer   | Ручная генерация протокола                          |
| GET   | /export-weekly                        | Bearer   | Массовый экспорт всех протоколов                    |
| GET   | /translate/{week}                     | Bearer   | Перевод протокола на RU + ZH                        |
| GET   | /translate-document                   | Bearer   | Перевод произвольного Markdown                      |

**Аутентификация.** Эндпоинты с пометкой **Bearer** требуют заголовок `Authorization: Bearer <token>`. Токен задан как Cloudflare Worker Secret (`ADMIN_SECRET_CURRENT`) и ротируется раз в неделю, с 24-часовым перекрытием `ADMIN_SECRET_PREVIOUS` для ротации без даунтайма. См. `.env.example` для локальной настройки. Эндпоинты с пометкой **public** — анонимные.
> **Адресация протоколов:** `{week}` в API-URL и ключ БД — **начало** недели (понедельник): протокол за 2026-09-28..10-04 — это `GET /protocols/2026-09-28/content`. Имена файлов — по **окончанию** недели (воскресенье): `2026-10-04.md`. Legacy-поле D1 `path` основано на week_start — имена файлов строит sync.

### Эндпоинт экспорта

Эндпоинт `/export-weekly` экспортирует все протоколы в двух форматах:

- **JSON** (по умолчанию): `/export-weekly` — для парсинга и анализа
- **Markdown**: `/export-weekly?format=md` — для чтения человеком

Опциональные параметры:

- `?weeks=N` — ограничить последними N протоколами (по умолчанию: 52)

**Примеры** (требуется Bearer-токен — см. «Аутентификация» выше):

    export ADMIN_TOKEN="<ваш-ADMIN_SECRET_CURRENT>"

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly?format=md" > archive.md

    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/export-weekly?weeks=10"

### Эндпоинт верификации

Эндпоинт `/verify` обнаруживает **reward hacking** в трейсах агентов, вдохновлённый [CheatBench](https://huggingface.co/datasets/steinad/CheatBench) (3870 размеченных траекторий).

**Категории:**

- `harness` — эксплуатация информации бенчмарка (скрытые тесты, файлы скоринга, git log)
- `task` — обход предназначенного пути решения (`eval()`, monkey-patching, перегрузка операторов)

**Пример:**

    curl "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/verify?trace=agent%20used%20eval()%20and%20monkey-patched%20the%20grader"

**Ответ:**

    {
      "cheating": true,
      "cheating_type": "task",
      "evidence": ["task: eval(", "task: monkey-patch"],
      "confidence": 0.67
    }

---

## Как внести вклад

Мы приветствуем:

- **Исследователей** — используйте API, верифицируйте методологию, предлагайте новые оси.
- **Разработчиков** — форкайте, улучшайте, добавляйте источники данных, пишите тесты.
- **Журналистов** — ссылайтесь, верифицируйте, распространяйте.
- **Граждан** — читайте, задавайте вопросы, участвуйте.
- **Скептиков** — находите ошибки, опровергайте, уточняйте.

См. CONTRIBUTING.md.

---

## Структура репозитория

```
├── README.md ← English
├── README.ru.md ← Русский
├── README.zh.md ← 中文
├── MANIFESTO.md ← English
├── MANIFESTO.ru.md ← Русский
├── MANIFESTO.zh.md ← 中文
├── LICENSE ← MIT (code)
├── DATA_LICENSE ← CC-BY 4.0 (data)
├── CITATION.cff ← академическое цитирование
├── CHANGELOG.md ← история версий
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
│ ├── en/ ← полное исследование (английский)
│ ├── ru/ ← полное исследование (русский)
│ └── zh/ ← полное исследование (китайский)
├── config/
│ ├── axes_ai.yaml
│ ├── axes_human.yaml
│ ├── sources_ai.yaml
│ └── sources_human.yaml
├── data/protocols/
│ ├── README.md
│ └── *.md ← еженедельные протоколы (EN/RU/ZH)
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
│ ├── index.ts ← Entry point (32 903 байт, 802 строки)
│ ├── cheat-detector.ts ← /verify endpoint
│ ├── config/ ← prompts, sources, axes (YAML → TypeScript)
│ ├── handlers/ ← export (еженедельный архив)
│ ├── services/ ← bayesian-gap (Beta-постериор + Монте-Карло), gap-computation (data-layer), translation (EN→RU/ZH)
│ └── utils/ ← parsers, rss, html, crypto, retry
├── test/
│ ├── index.spec.ts ← API тесты (8 тестов)
│ ├── parser.spec.ts ← 14 тестов
│ ├── classifier.spec.ts ← 15 тестов
│ ├── cheat-detector.spec.ts ← 7 тестов
│ ├── bayesian-gap.spec.ts ← 39 тестов (Beta-постериор, Монте-Карло)
│ ├── gap-computation.spec.ts ← 11 тестов (data-layer над bayesian-gap)
│ ├── generate-protocol.spec.ts ← 3 теста
│ └── translation.spec.ts ← 7 тестов
└── .github/
    └── workflows/
        ├── ci.yml ← CI: build + test on every push
        ├── sync-protocols.yml ← Dual-sync (collector + archive)
        └── translate-protocols.yml ← EN→RU/ZH translation
```

---

## Кодекс поведения

Проект следует [Contributor Covenant](https://www.contributor-covenant.org/) v2.0, чтобы обеспечить доброжелательную и профессиональную среду для всех участников.

**🌐 Доступно на трёх языках:**

- [🇺🇸 English](CODE_OF_CONDUCT.md)
- [🇷🇺 Русский](CODE_OF_CONDUCT.ru.md)
- [🇨🇳 中文](CODE_OF_CONDUCT.zh.md)

### Наши 5 основных принципов

1. **Уважение.** Мы спорим с идеями, а не с людьми. Критикуйте аргумент, никогда — человека.
2. **Факты важнее мнений.** Аргумент без проверяемого источника — не аргумент.
3. **Прозрачность.** Все решения и изменения обсуждаются публично.
4. **Открытость.** Мы приветствуем разнообразные точки зрения и конструктивное инакомыслие.
5. **Ответственность.** Мы несём ответственность за свои слова и свой код.

Пожалуйста, прочитайте полный Кодекс поведения перед внесением вклада.

---

## Лицензия

MIT. Используйте, форкайте, улучшайте.

---

**Приносить благо другим людям — что может быть выше этой цели!**\
**Вместе — Мы Сила! Дорогу осилит идущий.**

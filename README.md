# 🌍 Human–AI Monitor

**An open tool for monitoring the development of Artificial Intelligence 
and Humanity.**

> "Whoever wins the AI race wins everything."
> — Donald Trump, 13.09.2026
>
> "We must pace the frontier."
> — Dario Amodei, 12.09.2026
>
> **But who monitors the process itself? Who watches what is happening to 
us?**

---

## What is this

`human-ai-monitor` is a weekly protocol that tracks **12 axes of 
development**:

**6 AI axes (RSI — Recursive Self-Improvement):**
- **SMD** — Self-Modification Depth
- **ITQ** — Improvement Trajectory Quality
- **AGG** — Autonomous Goal Generation
- **Cycle Velocity** — Speed of improvement cycles
- **Verification** — Verification hierarchy
- **Hexad** — Phase transition detection

**6 Humanity axes (HHI — Human Horizon Index):**
- **H1 Agency** — Human agency
- **H2 Sovereignty** — Cognitive sovereignty
- **H3 Wellbeing** — Mental health and wellbeing
- **H4 Equity** — Equity and access
- **H5 Meaning** — Meaning and purpose
- **H6 Democracy** — Institutional resilience

**Gap Index** — the gap between AI development and Humanity's state.

---

## Why

Tech leaders proclaim singularity. Alignment researchers admit there is no 
plan. Regulators offer voluntary measures. Scientists warn about 
misaligned goals.

**But no one publishes a weekly report on what is happening to us.**

This tool does three things:
1. **Collects** open data from RSS, arXiv, news sources.
2. **Classifies** it along 12 axes using LLMs.
3. **Publishes** a weekly protocol and Gap Index — free, open, 
reproducible.

---

## Philosophy

- **Transparency**: all prompts and sources are visible in the repo.
- **Reproducibility**: every protocol links to data hashes.
- **Extensibility**: adding a source = one line in YAML.
- **Accessibility**: Android app + API for researchers.
- **Independence**: local LLM (Ollama + Qwen).
- **Free forever**: MIT License.

---

## Current status

**MVP ready:**
- ✅ Cloudflare Workers + D1 + R2 + Queues + Workers AI architecture
- ✅ 12 axes + Gap Index
- ✅ Database schema (4 tables)
- ✅ Classifier code (Python + TypeScript)
- ✅ Tests (pytest)
- ✅ First protocol (7–17.09.2026)

**In progress:**
- 🔄 Worker deployment on Cloudflare
- 🔄 R2 activation (raw data storage)
- 🔄 Ollama + Qwen 2.5:7b setup
- 🔄 Android APK build (PWA + Capacitor)

**Roadmap:**
- [ ] Public API (FastAPI on Workers)
- [ ] Multilingual support (EN / RU / ZH)
- [ ] Push notifications for threshold shifts
- [ ] Integration with global indices (V-Dem, WHR, Pew)
- [ ] Decentralized mirror (IPFS)
- [ ] Independent methodology audit

---

## Quick start

```bash
git clone https://github.com/VQQLK/Human-AI-Monitor.git
cd Human-AI-Monitor
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m src.main --dry-run
```

---

## Repository structure

```
.
├── README.md              ← English
├── README.ru.md           ← Russian
├── MANIFESTO.md           ← English
├── MANIFESTO.ru.md        ← Russian
├── LICENSE                ← MIT
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── docs/
│   ├── methodology.md
│   ├── architecture.md
│   ├── math_brief.md
│   └── PRESS_RELEASE.md
├── research/
│   ├── README.md
│   └── part1..part5.md    ← Full research paper (Russian)
├── config/
│   ├── axes_ai.yaml
│   ├── axes_human.yaml
│   ├── sources_ai.yaml
│   └── sources_human.yaml
├── data/protocols/
│   └── 2026-09-07_2026-09-17.md
├── migrations/
│   └── 0001_initial_schema.sql
├── prompts/
│   ├── classify_ai.txt
│   └── classify_human.txt
├── src/
└── test/
```

---

## How to contribute

We welcome:

- **Researchers** — use the API, verify methodology, propose new axes.
- **Developers** — fork, improve, add data sources.
- **Journalists** — reference, verify, distribute.
- **Citizens** — read, ask questions, participate.
- **Skeptics** — find errors, refute, refine.

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT. Use, fork, improve.

**To give benefit to all other people — what could be higher than this 
goal?**

---

**Together — We Are Strong. The road will be mastered by the one who walks 
it.**

# 🌍 Human–AI Monitor

**An open tool for monitoring the development of Artificial Intelligence and Humanity.**

> "Whoever wins AI, wins."
> — Donald Trump, 13.09.2026
>
> "We're leading China in AI. We're the most sophisticated country in the world, and frankly I want to keep it that way because whoever wins AI, wins."
> — Donald Trump, 13.09.2026
>
> "We Must Pace the Frontier."
> — Dario Amodei, 12.09.2026
>
> "We must slow the pace at which we improve the capabilities of AI models. Progress will still seem fast, and we must make wise use of the time we gain."
> — Dario Amodei, 12.09.2026
>
> **But who monitors the process itself? Who watches what is happening to us?**

---

## What is this

`human-ai-monitor` is a weekly protocol that tracks **12 axes of development**:

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

## Live API

| Endpoint | URL |
|----------|-----|
| Root | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/ |
| Gap Index | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap |
| Protocols | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols |
| Example | https://human-ai-monitor-collector.human-ai-monitor.workers.dev/protocols/2026-09-14/content |

---

## Architecture

- **Cloudflare Workers** (TypeScript) — runtime, 9 API endpoints, Cron Trigger
- **Cloudflare D1** (Serverless SQLite) — 4 tables
- **Cloudflare Workers AI** — classifier: `@cf/qwen/qwen3-30b-a3b-fp8` (open-weight)
- **Cron Trigger** — `0 6 * * 1` (every Monday 06:00 UTC)

**No external AI providers.**

---

## Current status

**MVP live:**
- ✅ Cloudflare Worker with 9 API endpoints — deployed
- ✅ D1 database (4 tables, populated)
- ✅ Workers AI classifier (Qwen 3, calibrated for 12 axes)
- ✅ RSS collector (12+ of 14 sources working)
- ✅ Weekly protocol auto-generation (Markdown)
- ✅ Cron Trigger (every Monday 06:00 UTC)
- ✅ Public API accessible worldwide

**In progress:**
- 🔄 Refactoring `src/index.ts` into modules
- 🔄 Real test coverage
- 🔄 Android APK (PWA + Capacitor)
- 🔄 Web interface (Cloudflare Pages)

**Known limitations:**
- ⚠️ Tests are boilerplate (Vitest template); real coverage in progress
- ⚠️ Monolithic `src/index.ts` (~420 lines) — refactoring planned
- ⚠️ RSS-only collection; HTML parsing not implemented yet
- ⚠️ `shift` field may over-trigger on general news
- ⚠️ YAML configs exist but are NOT yet read by the Worker; axes and sources are hardcoded in `src/index.ts`

---

## Quick start

    git clone https://github.com/VQQLK/Human-AI-Monitor.git
    cd Human-AI-Monitor
    npm install
    cp .env.example .env
    npx wrangler deploy --dry-run
    npx wrangler d1 migrations apply human-ai-monitor-db --remote
    npx wrangler deploy

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Project metadata |
| GET | /gap | Current Gap Index |
| GET | /protocols | List of protocols |
| GET | /protocols/{week}/content | Markdown content |
| GET | /axes/{axis} | Signals for axis |
| GET | /classify | Classify text |
| GET | /collect | Manual collection |
| GET | /generate | Manual generation |

---

## How to contribute

- Researchers — use API, verify methodology.
- Developers — fork, improve, add sources, write tests.
- Journalists — reference, verify, distribute.
- Skeptics — find errors, refute, refine.

See CONTRIBUTING.md.

---

## License

MIT.

**Together — We Are Strong. The road will be mastered by the one who walks 
it.**

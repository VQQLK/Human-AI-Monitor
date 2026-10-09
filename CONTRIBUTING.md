# Contributing to Human-AI Monitor

> **Languages:** [🇺🇸 English](CONTRIBUTING.md) • [🇷🇺 Русский](CONTRIBUTING.ru.md) • [🇨🇳 中文](CONTRIBUTING.zh.md)

Thank you for your interest in the project! We welcome any contribution — from
fixing typos to adding new data sources.

## How to help

### 1. Report a bug

Open an issue describing:
- What happened
- What was expected
- Steps to reproduce
- Environment (OS, Node.js, pnpm)

### 2. Suggest an improvement

Open an issue with the `enhancement` label:
- What you want to add
- Why the project needs it
- How it aligns with the mission

### 3. Add a data source

Edit `config/sources_ai.yaml` or `config/sources_human.yaml`:

    rss:
      - name: "Source name"
        url: "https://example.com/rss.xml"
        lang: "en"
        tier: 1

### 4. Improve the classifier

LLM prompts live in `src/config/prompts.ts`:
- `CLASSIFY_PROMPT` — single prompt for all 13 axes (12+1)
- Model: Qwen 3 (via Cloudflare Workers AI)

### 5. Write code

    git clone https://github.com/VQQLK/Human-AI-Monitor.git
    cd Human-AI-Monitor/human-ai-monitor-collector
    pnpm install
    pnpm test
    pnpm dev
    pnpm deploy

Stack:
- Runtime: Cloudflare Workers (TypeScript)
- Database: Cloudflare D1 (SQLite)
- Tests: Vitest
- AI: Cloudflare Workers AI (Qwen 3)
- Package manager: pnpm

Style:
- TypeScript: strict mode (tsconfig.json)
- Formatting: Prettier (optional)
- Commits: conventional commits (feat, fix, docs, refactor, chore)

Process:
1. Fork → branch (git checkout -b feature/amazing-idea)
2. Commit (git commit -m "feat: add amazing feature")
3. Push (git push origin feature/amazing-idea)
4. Pull Request

---

## Project structure

    human-ai-monitor-collector/
    ├── src/
    │   ├── index.ts                    # Main worker
    │   ├── services/
    │   │   └── gap-computation.ts      # Gap Index computation
    │   └── config/
    │       ├── axes.ts                 # List of 13 axes (12+1)
    │       ├── prompts.ts              # LLM prompts
    │       └── generated/              # Types from YAML
    ├── config/
    │   ├── axes_ai.yaml                # 6 AI + 1 Geo meta
    │   ├── axes_human.yaml             # 6 Human axes
    │   ├── sources_ai.yaml             # 33 AI sources
    │   └── sources_human.yaml          # 25 human sources
    ├── migrations/
    │   ├── 0001_initial_schema.sql
    │   ├── 0002_add_content_column.sql
    │   └── 0003_update_smd_level.sql
    ├── test/
    │   ├── cheat-detector.spec.ts      # 7 tests: cheat detector
    │   ├── classifier.spec.ts          # 15 tests: classifier
    │   ├── index.spec.ts               # 8 tests: API endpoints
    │   └── parser.spec.ts              # 14 tests: parser
    └── wrangler.jsonc

---

## Code of ethics

See CODE_OF_CONDUCT.md.

---

## What we do not accept

- Paid integrations — the project is fundamentally free.
- Hidden data — all sources and prompts are public.
- Advertising — no commercial content.
- Politics — the project stays out of political parties.

---

## Pre-PR audit

Run `python3 scripts/repo_audit.py` — expected: `31 ok / 0 warn / 0 FAIL`.

Checks: git sync, language navigation, cross-references, security 
(secrets, `.gitignore`, `npm audit`).

## Links

- README.md — project description (EN)
- README.ru.md — project description (RU)
- CHANGELOG.md — change history
- MANIFESTO.md — project manifesto

---

**To bring the greater good to others — what could be a higher goal!**\
**United We Stand! Only the one who walks conquers the road.**

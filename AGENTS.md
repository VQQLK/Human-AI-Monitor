# AGENTS.md

Guidance for AI coding agents working in this repository.
English-only by convention: agents read this file; humans read README.md.

## What this project is

Human–AI Monitor: a weekly-protocol system tracking AI vs. Humanity
development across 12 symmetric axes + geopolitics. Built on Cloudflare
Workers (TypeScript), D1, and Workers AI (open-weight Qwen 3).
Public API: https://human-ai-monitor-collector.human-ai-monitor.workers.dev/

## Hard rules (from the 2026-09 consistency review — each maps to a bug that shipped)

1. **Generated code is never hand-edited.** `src/config/generated/*` is
   regenerated from `config/*.yaml`. Edit YAML, regenerate, commit both.

2. **Prompts are behavior.** The few-shot glossary in
   `src/services/translation.ts` is copied verbatim into every weekly
   translated protocol (one typo there propagated into four documents
   and multiple weekly protocols). Change glossary lines only via an
   approved canon decision ("canon" in this repo always means the
   English source text; the RU/ZH glossary lines are approved
   translations of that canon — derived from it, never a second
   source of truth), then propagate the full chain: glossary →
   CHANGELOG `[Unreleased]` ×3 → **`npx wrangler deploy`** → regenerate
   affected documents. Git ≠ production: a glossary fix without a deploy
   changes nothing.

3. **EN is canon; RU/ZH are mirrors.** Structural changes to EN docs
   (headings, lists, file trees) must be mirrored into `.ru.md` /
   `.zh.md` siblings in the same change. Enforced by
   `python3 scripts/repo_audit.py`.

4. **Version lives in one place.** `package.json` is the source of
   truth; `src/index.ts` imports it; CITATION.cff and the CHANGELOG
   release date are verified against it. Never hardcode a version literal.

5. **Cron batching is invariant-checked.** Adding/removing a source in
   `config/sources_*.yaml` requires updating `CRON_BATCH_CONFIG` in
   `src/index.ts` in the same commit. `test/cron-batching.spec.ts` and
   `repo_audit.py` fail otherwise — that is intended. Constraints:
   5 cron triggers max (Cloudflare Free plan), ≤50 subrequests per
   invocation (sources × maxPerSource × 2).

6. **Weekly protocols are machine-generated.** Do not hand-edit
   `data/protocols/*` — the next sync overwrites them. Manual edits are
   allowed only as a stopgap until deploy + regeneration. Canon fixes go
   through the glossary/prompt (rule 2), then regenerate.

7. **Protocol regeneration resets translations.** Regenerating a
   protocol week nulls `content_ru`/`content_zh` in D1. After any
   protocol regeneration, trigger `translate-protocols.yml` and verify
   `length(content_zh) > 0` — otherwise `/protocols/{week}/content/{lang}`
   returns "not ready" until someone notices.

8. **Deploy after merging behavior changes.** Today's review found a
   2-day / ~20-commit gap between git and production (a glossary fix and
   the cron schedule existed only in git while the worker ran old code).
   After any change to `src/` or `wrangler.jsonc`: `npx wrangler deploy`,
   then verify live behavior (`curl` the affected endpoint).
   Enforced by the daily `live-monitor` workflow (version parity,
   batch coverage, translation persistence).

9. **Before every push:**
   `npx vitest run` (66+ tests) and `python3 scripts/repo_audit.py`
   (17+ ok / 0 FAIL). CI runs the same — keep both green.

10. **Commit discipline.** One logical change per commit; user-visible
    changes get a CHANGELOG entry under `[Unreleased]` in all three
    languages.

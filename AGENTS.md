# AGENTS.md

Guidance for AI coding agents working in this repository.
English-only by convention: agents read this file; humans read README.md.

## What this project is

Human–AI Monitor: a weekly-protocol system tracking AI vs. Humanity
development across 13 axes (12+1): 6 AI + 6 Humanity + 1 Geopolitical meta-layer. Built on Cloudflare
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
   **Scope:** top-5 documents ×3; `docs/` are EN+RU by design (ZH mirrors
   by request only); `research/` are EN+RU+ZH (en/ru/zh folders).
   (headings, lists, file trees) must be mirrored into `.ru.md` /
   `.zh.md` siblings in the same change. Enforced by
   `python3 scripts/repo_audit.py`.

4. **Version lives in one place.** `package.json` is the source of
   truth; `src/index.ts` imports it; CITATION.cff and the CHANGELOG
   release date are verified against it. Never hardcode a version literal.

5. **Cron batching is computed, not maintained.** Offsets/limits are derived
   at runtime from `SOURCES.length` by `computeBatches()`; `CRON_BATCH_META`
   holds only batch numbers, maxPerSource and the protocol flag. Adding or
   removing a source needs no manual re-check: property tests cover every N
   up to capacity (44 at the current budget), and N > capacity refuses the
   run loudly (cron_drift_events + throw). Constraints: 5 cron triggers max
   (Cloudflare Free plan), ≤50 subrequests per invocation.

6. **Weekly protocols are machine-generated.** Do not hand-edit
   `data/protocols/*` — the next sync overwrites them. Manual edits are
   allowed only as a stopgap until deploy + regeneration. Canon fixes go
   through the glossary/prompt (rule 2), then regenerate.
   **Naming (two conventions):** API URLs and the D1 key use the week's
   START (Monday, `week_start`): `GET /protocols/2026-09-14/content`
   covers 09-14..20. File names (sync/git/archive) use the week's END
   (Sunday, `week_end`): `2026-09-20.md`. The legacy D1 `path` column is
   week_start-based and does not match files — sync builds names itself;
   do not trust `path`.
   **Protocol ID in markdown title** uses `week_end` (Sunday) — human-facing
   ID that identifies the week by its end date, avoiding the "Monday =
   previous week" ambiguity. This is deliberate: API/D1 keys use
   `week_start`, but the title shown to readers uses `week_end`.

7. **Protocol regeneration makes translations stale.** Regenerating a
   protocol week overwrites `content` (EN) in D1 but preserves
   `content_ru`/`content_zh` (see UPSERT comment in
   `generateInterimProtocol`). The RU/ZH text therefore lags behind the
   new EN until translated.
   **Cron regeneration** (Mon/Fri 13:45 UTC): the Worker dispatches
   `translate-protocols.yml` automatically via GitHub API — no manual
   action needed.
   **Manual regeneration** (`/generate`): trigger translation yourself —
   `gh workflow run translate-protocols.yml`, then verify
   `length(content_zh) > 0`.

8. **Deploy after merging behavior changes.** Today's review found a
   2-day / ~20-commit gap between git and production (a glossary fix and
   the cron schedule existed only in git while the worker ran old code).
   After any change to `src/` or `wrangler.jsonc`: `npx wrangler deploy`,
   then verify live behavior (`curl` the affected endpoint).
   Enforced by the daily `live-monitor` workflow (version parity,
   batch coverage, translation persistence).

9. **Before every push:**
   `npx vitest run` (66+ tests) and `python3 scripts/repo_audit.py`
   (30+ ok / 0 FAIL). CI runs the same — keep both green.

10. **Commit discipline.** CHANGELOG policy:
    `[Unreleased]` parity ×3 is enforced; release history — EN stays
    minimalistic by design, RU/ZH depth must match (audit-enforced). One logical change per commit; user-visible
    changes get a CHANGELOG entry under `[Unreleased]` in all three
    languages.

11. **Privacy & logging.** The Worker logs denial events via
    `console.warn` — path, `CF-Connecting-IP`, and auth reason. IP is
    PII under GDPR. Logs are retained by Cloudflare per the account's
    log retention policy (default ~30 days). Never log request bodies,
    tokens, or full headers. Apply the same rule when adding new
    `console.*` calls.

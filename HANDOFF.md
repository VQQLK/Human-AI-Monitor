# Human-AI Monitor — Handoff

> Documentation for an engineer continuing this work.
> Last updated: 2026-10-03 (after re-classification).
> Languages: [English](HANDOFF.md) | [Русский](HANDOFF.ru.md)

## 1. Project overview

Cloudflare Worker that:
- Collects RSS signals from 52 sources (27 AI + 25 Human)
- Classifies items via LLM (@cf/qwen/qwen3-30b-a3b-fp8)
- Computes Bayesian Gap Index: Gap = AI_score − Human_score
- Exposes API: /gap, /axes-history, /protocols, /health, /classify

Stack: TypeScript, Cloudflare Workers, D1 (SQLite), GitHub Actions, Vitest.

Deploy: push to main → workflows → sync-protocols.yml updates README.

## 2. Key files

| Path                              | Role                                         |
| --------------------------------- | -------------------------------------------- |
| src/index.ts                      | HTTP router + cron handler                   |
| src/auth.ts                       | Bearer, isProtectedPath, timingSafeEqual     |
| src/config/sources.ts             | YAML → Source[]                              |
| src/config/axes.ts                | AI_AXES (6), HUMAN_AXES (6), META_AXES (1)   |
| src/config/weights.ts             | Axis weights (sum = 1.0, validated)          |
| src/config/prompts.ts             | LLM prompts (AI + Human)                     |
| src/services/gap-computation.ts   | Bayesian posterior + MC 10000 samples        |
| src/services/bayesian-gap.ts      | Beta sampling, RNG                           |
| config/sources_ai.yaml            | 27 AI sources                                |
| config/sources_human.yaml         | 25 Human sources                             |
| config/axes_ai.yaml               | 6 AI axes + META geopolitics                 |
| config/axes_human.yaml            | 6 Human axes                                 |
| scripts/audit.sh                  | Main audit (v4.8, 146 checks)                |
| scripts/run-audit.sh              | Launcher                                     |
| scripts/yaml-to-ts.mjs            | YAML → TS generator                          |
| scripts/update_readme.py          | Update README from live API                  |
| HANDOFF.md                        | This file                                    |

## 3. Current state

- HEAD: latest commit on main (see `git log --oneline -5`)
- Baseline: 146 PASS / 1 WARN / 0 FAIL
- Sources: 52 (27 AI + 25 Human)
- Axes: 13 (6 AI + 6 Human + 1 META)
- Source languages: en + ru (TASS) + zh (FT Chinese)
- Batch capacity: 60 (maxPerSource=2 × 5 cron slots)
- CF token: 3 permissions (Workers Scripts:Edit, D1:Edit, Workers Builds Config:Edit)
- **Items classification:** 448/448 use prompt v1 (single instrument, consistent)
- **Re-classification experiment:** attempted on 2026-10-03, then **rolled back** (see §12)

## 4. Known issues (by priority)

### 🔴 Re-classification experiment — REJECTED (rolled back)
- See §12 for the full case. Summary:
  - 2026-10-03: 292/448 items were re-classified with prompt v2 (037942d)
  - Same day: decision reversed on methodological grounds (data mixture,
    exchangeability violation, time confounding, missing provenance)
  - Rollback verified: 448/448 items restored, 0 mismatches
  - No further re-classification until §14 protocol is followed
- Backups retained for analysis: /tmp/reclass_backup/

### 🟢 h1_agency, h5_meaning coverage — RESOLVED
- Added: Aeon, Psyche (h5_meaning), Oxfam, HRW (h4_equity)
- Verify sample size on Monday after cron runs

### 🟢 Non-English sources — RESOLVED
- Added: TASS (ru), FT Chinese (zh), Al Jazeera, The Hindu (en, Global South)

### 🟢 META axis geopolitics not exposed in API
- Computed (49 items, level 0.847) but not returned to consumers
- Fix: add geopolitics_score to /gap response

### ⚠️ Snapshot not recomputed
- /gap and /axes-history still serve snapshot from 2026-10-02T13:46
- Recomputation happens automatically on Monday 14:00 UTC
  (cron sync-protocols.yml → generateProtocol: true)

## 5. Working patterns

NEVER use nano for large edits — breaks unicode, drops chunks.

Use python patch with anchor check:

    from pathlib import Path
    import sys
    p = Path('file.txt')
    c = p.read_text(encoding='utf-8')
    if "old" not in c:
        print("anchor not found"); sys.exit(1)
    c = c.replace("old", "new", 1)
    p.write_text(c, encoding='utf-8')

Always:
1. cp file file.bak_$(date +%Y%m%d) — backup
2. python3 -m py_compile /tmp/patch.py — syntax check
3. python3 /tmp/patch.py — apply
4. bash -n / npx tsc --noEmit — validate
5. npx vitest run — tests
6. bash scripts/run-audit.sh — audit
7. git commit + push

If push is rejected (! [rejected]):
    git pull --rebase origin main
    git push origin main
The bot pushed README — rebase resolves cleanly.

## 6. Quick commands

    # Full audit
    bash scripts/run-audit.sh

    # Tests only
    npx vitest run

    # Type check
    npx tsc --noEmit

    # Regenerate TS from YAML
    node scripts/yaml-to-ts.mjs

    # Probe one source
    curl -sI "https://example.com/feed.xml" | head -5

    # D1 query
    npx wrangler d1 execute human-ai-monitor-db --remote --command "SELECT ..."

    # Live API
    curl -s "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap"

## 7. Cron schedule (UTC)

| Time                          | What                              |
| ----------------------------- | --------------------------------- |
| 13:00, 13:15, 13:30, 13:45    | Daytime collection (4 batches)    |
| 23:00                         | Evening collection                |
| 14:00 Mon                     | sync-protocols.yml                |
| 08:00 Sat                     | sync-protocols.yml                |

## 8. How to add a new source

1. Probe RSS: `curl -sI "<URL>" | head -5` → must be 200

2. Add a block to config/sources_ai.yaml or config/sources_human.yaml:

    - name: Name
      url: https://...
      lang: en
      tier: 1
      axes:
      - h1_agency
      note: Description

3. `node scripts/yaml-to-ts.mjs`
4. Update test/index.spec.ts: sources_count = new total
5. `npx vitest run` + `bash scripts/run-audit.sh`
6. git commit + push

## 9. Dangerous spots

- D1 schema `items`: columns collected_at, date, event_date.
  NOT recorded_at, NOT created_at (that was a real bug).
- sources_ai.yaml does NOT control axes — the LLM does the mapping.
- weights.ts: AI and Human weights must sum to 1.0 (validated on load).
- prompts.ts: edit the AI prompt, do not touch Human (tests depend on it).

## 10. Do NOT

- Force-push to main (linear history is important)
- Delete bot commits `chore: sync latest [skip ci]` — they carry README
- Edit src/config/generated/*.ts manually — they are overwritten by yaml-to-ts.mjs
- Use 2>/dev/null in audit.sh — hides errors (real incident)
- Run `python3` without `-u` in a pipe — output is buffered, appears frozen

## 11. Links

- Repo: https://github.com/VQQLK/Human-AI-Monitor
- Worker: https://human-ai-monitor-collector.human-ai-monitor.workers.dev
- D1 database: human-ai-monitor-db
- Cloudflare dashboard: https://dash.cloudflare.com

---

## 12. Rejected experiment: re-classification (2026-10-03)

**Status: attempted and rolled back. Do not repeat without following §14.**

### What was attempted
Replace the LLM classification of 448 items using an updated prompt (037942d)
that narrowed `itq` and `geopolitics` definitions. 292 items were processed
before Cloudflare AI quota (4006) halted the run.

### Why it was rejected
Strict methodological review identified multiple independent failures:

1. **Data mixture / exchangeability violation.** 292 items measured with
   instrument M2, 156 with M1, mixed in a single `axes` column. Bayesian
   posterior assumes exchangeable observations; a mixture of two
   instruments violates this and biases posterior mean plus inflates CI
   via between-instrument variance that is not modeled.

2. **Time confound.** Items processed in chronological order — early items
   → M2, late items → M1. Any real temporal trend in world events is now
   confounded with instrument assignment.

3. **Missing provenance.** No `prompt_version` column. Consumers cannot
   distinguish which items were classified by which instrument.

4. **Unvalidated improvement.** Claim "47.6% per-item changes = improvement"
   is a logical error: confusing uniformity with validity. No Cohen's kappa,
   no criterion validity, no test-retest. A random classifier also produces
   a uniform distribution.

5. **Violated our own §13 principle.** "Publish only after validation" was
   not applied to changes of the measurement instrument itself.

### What was done
- Rollback SQL generated from `items_before.json` (the pre-change backup)
- 448 UPDATE statements applied to D1
- Verification: `Match: 448 / 448`, `Mismatch: 0` — `ROLLBACK VERIFIED`
- Axis distribution restored to pre-experiment state:
  `[]=94, itq=70, h6_democracy=51, geopolitics=47, verification=46, ...`

### What was NOT done
- `temporal_status` and `event_date` fields were not in the original
  pre-change SELECT, so those columns were not rolled back. This is a
  known minor inconsistency — likely benign (the fields did not exist for
  most items in v1 anyway), but should be verified if the change is
  reattempted.

### Backups retained (do not delete)
    /tmp/reclass_backup/
      items_before.json               — 448 items (state before experiment)
      items_new.json                  — 292 items (raw v2 responses)
      updates.sql                     — 292 forward UPDATEs (not applied)
      rollback.sql                    — 448 reverse UPDATEs (applied)
      progress.json                   — per-hash status
      items_current_before_rollback.json — state at rollback time
      gap_history_before.json
      index_history_before.json

### Correct next steps (deferred)
1. Validate prompt v2 on a **hold-out sample** with human annotation:
   - 30 items, blinded, 2 raters
   - Cohen's kappa vs human, test-retest on same items
2. Only if validation passes: introduce `axes_v2` as a **separate column**
   (never overwrite `axes`), backfill via versioned script
3. Update `gap-computation.ts` to read from one explicitly named column
4. Preregister the switch (methodology.md update + version bump)

---

*For questions — see docs/methodology.md (Gap math) and scripts/audit.sh (what is checked).*

---

## 13. Formal falsification criteria for geopolitics_score

**Status: working hypothesis, not established truth.**

Decision to expose `geopolitics_score` as a standalone observable
(not a component of AI_score) rests on **parsimony** under lack of
validation data. It is falsifiable. The following tests must be run
once sufficient history is available (≥ 8 weeks of weekly snapshots).

### Test A — discriminant validity (Campbell & Fiske, 1959)

Hypothesis H1: `geopolitics` is a distinct construct from AI capability.

    # 13x13 correlation matrix across all axes and all weeks
    corr_matrix = compute_correlations(all_axes, all_weeks)

    # H1 acceptance: |Corr(geopolitics, mean(AI_axes))| < 0.4
    # H1 rejection: |Corr| >= 0.4 → geopolitics overlaps AI latent,
    #               should be merged as a component instead of standalone

### Test B — external validation against METR doubling time

Hypothesis H2: adding `geopolitics` improves prediction of an
external capability ground truth (METR doubling time series).

    # METR doubling time per week (external, independent source)
    corr_no_g   = corr(AI_score_without_geopolitics, METR_series)
    corr_with_g = corr(AI_score_with_geopolitics,    METR_series)

    # H2 acceptance: corr_with_g > corr_no_g + 0.05 (statistically significant)
    # H2 rejection:  no significant improvement → geopolitics adds noise
    #                to AI_score, keep standalone

### Test C — predictive lag (leading indicator check)

Hypothesis H3: `geopolitics` at week t predicts AI_score at week t+1.

    # Cross-correlation with lag 1
    corr_lag1 = corr(theta_geopolitics[t], AI_score[t+1])

    # If corr_lag1 > 0.5: geopolitics is a leading indicator.
    #   → may justify inclusion as a predictive term (with appropriate lag)
    # If corr_lag1 < 0.3: geopolitics is contemporaneous / not predictive.
    #   → standalone observable confirmed

### Decision matrix

| Test A | Test B | Test C | Action |
| ------ | ------ | ------ | ------ |
| pass   | pass   | pass   | Include as leading component with lag |
| pass   | pass   | fail   | Merge as component in AI_score |
| pass   | fail   | fail   | **Keep standalone (current)** |
| fail   | —      | —      | Merge geopolitics into AI_WEIGHTS |

### Publication rule (scientific integrity)

**Do NOT expose geopolitics_score in /gap until Tests A/B/C pass.
Currently only in /axes-history.**

Rationale: N = 1 week of data. Posterior Beta(2.735, 0.5) has effective
sample size ≈ 2.2 — dominated by prior. CI95 = [0.372, 0.9998] spans
almost [0, 1]. Publishing this in /gap would create false precision and
mix validated quantities (Capability − Impact) with an unvalidated
experimental observable.

The Gap formula stays: Gap = AI_score − Human_score (6 axes each, sum
of weights = 1.0). geopolitics is exposed as a separate axis via
/axes-history only. Promotion to /gap requires all three tests to pass
first.

This rule operationalizes the project's scientific-truth principle:
**a metric is published only after it has been validated.**

### Until tests are run

- Do NOT change AI_WEIGHTS or HUMAN_WEIGHTS
- Do NOT modify the Gap formula
- DO expose geopolitics_score as a separate field in /gap
- DO record the reasoning above in any PR that touches this

*Reference: Cronbach & Meehl (1955) construct validity; Campbell & Fiske (1959)
multitrait-multimethod matrix.*


---

## 14. Measurement instrument change protocol

Any change to LLM prompts that produce `axes`, `relevance`, `shift`,
`direction`, or `reasoning` is a **change of the measurement instrument**.
It is not a code refactor. It must follow this protocol.

### Rules

1. **Never overwrite an existing measurement column.**
   `axes` (v1) stays intact. New instrument writes to `axes_v2`.
   Same for any other derived column.

2. **Record provenance for every item.**
   Add (or reuse) columns: `classified_by` (e.g. `"prompt_v1"`),
   `classified_at` (ISO timestamp). Set at classification time.

3. **Validate before switching.**
   Required, all on a hold-out set of at least 30 items:
   - **Test-retest reliability**: same prompt, two runs, Cohen's kappa ≥ 0.8
   - **Inter-rater agreement**: prompt vs human annotator, Cohen's kappa ≥ 0.6
   - **Criterion validity**: if possible, correlate with external ground truth
   - **Convergent validity**: correlate with structurally similar axes

4. **Preregister the switch.**
   Update `docs/methodology.md` (all 3 language versions) with:
   - New prompt version ID
   - Date of switch
   - Validation results (kappa, sample sizes)
   - Rationale and expected effect

5. **Backfill atomically, not incrementally.**
   Either all items are migrated to the new column or none. Avoids
   time confounds and mid-migration mixed states.

6. **Switch the reader, not the data.**
   `gap-computation.ts` reads from one explicit column name
   (`axes` → `axes_v2` in a single commit). Rollback = revert that commit.

### Anti-patterns (do not do)

- Overwriting `axes` with a new prompt's output (what was done on 2026-10-03)
- Processing items in chronological order without stratification
- Claiming improvement from distribution shifts alone
- Re-classifying "as we go" while quota or rate limits interrupt
- Applying changes without backup + verified rollback path

### Enforcement

- Any PR that modifies `src/config/prompts.ts` must cite this section
- Any DB migration touching `axes` (or successors) must follow this protocol
- Audit script (`scripts/audit.sh`) may later enforce column presence
